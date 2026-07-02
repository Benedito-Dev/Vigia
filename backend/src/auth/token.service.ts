import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { Usuario } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditoriaService } from '../auditoria/auditoria.service';

/**
 * Serviço de sessão (refresh token JWT). Concentra emissão, hash, rotação e
 * detecção de reúso — a lógica pura, sem HTTP/cookie (isso fica no controller).
 * Ver workspace/plans/refresh-token-jwt.md.
 *
 * Princípios:
 *  - o refresh token cru NUNCA toca o banco: guardamos só o hash SHA-256;
 *  - a cada /refresh o token antigo é revogado e um novo emitido (rotação);
 *  - reapresentar um refresh já revogado é sinal de roubo → revoga a família
 *    inteira (todos os refresh daquela cadeia de rotações).
 */

/** Payload assinado no access token (JWT). */
export interface PayloadAcesso {
  sub: string;
  organizacaoId: string;
  papel: string;
}

/** Par de tokens emitido numa sessão. O refresh volta CRU só aqui — para ir ao cookie. */
export interface Sessao {
  accessToken: string;
  refreshTokenCru: string;
  refreshExpiraEm: Date;
}

/** Dono identificado por um refresh token — usado para auditar quem encerrou a sessão. */
export interface DonoSessao {
  usuarioId: string;
  organizacaoId: string;
}

@Injectable()
export class TokenService {
  /** Vida do access token. Curto de propósito — o refresh cobre a continuidade. */
  private readonly ttlAcesso = process.env.ACCESS_TOKEN_TTL ?? '15m';
  /** Vida do refresh token, em dias. */
  private readonly ttlRefreshDias = Number(process.env.REFRESH_TOKEN_TTL_DIAS ?? '30');

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly auditoria: AuditoriaService,
  ) {}

  /**
   * Abre uma sessão nova (login): gera access + refresh e persiste o hash do
   * refresh numa família nova. `familiaId` só é passado internamente pela rotação.
   */
  async emitirSessao(usuario: Usuario, opcoes?: { familiaId?: string; userAgent?: string }): Promise<Sessao> {
    const familiaId = opcoes?.familiaId ?? randomUUID();

    const accessToken = await this.assinarAcesso(usuario);

    const refreshTokenCru = randomBytes(32).toString('base64url');
    const refreshExpiraEm = new Date(Date.now() + this.ttlRefreshDias * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: {
        usuarioId: usuario.id,
        tokenHash: this.hash(refreshTokenCru),
        familiaId,
        expiraEm: refreshExpiraEm,
        userAgent: opcoes?.userAgent,
      },
    });

    return { accessToken, refreshTokenCru, refreshExpiraEm };
  }

  /**
   * Rotaciona um refresh (endpoint /refresh): valida o token cru, revoga o
   * registro atual e emite uma sessão nova na MESMA família. Reúso de token
   * já revogado revoga a família inteira e lança 401.
   */
  async rotacionar(refreshTokenCru: string): Promise<{ sessao: Sessao; dono: DonoSessao }> {
    const tokenHash = this.hash(refreshTokenCru);
    const registro = await this.prisma.refreshToken.findFirst({ where: { tokenHash } });

    // Desconhecido → sessão inválida (nunca existiu ou já foi purgado).
    if (!registro) {
      throw new UnauthorizedException('Sessão inválida.');
    }

    // Reúso de um token já revogado → indício de roubo: derruba a família toda
    // e registra o evento de segurança antes de recusar.
    if (registro.revogadoEm) {
      await this.revogarFamilia(registro.familiaId);
      const dono = await this.prisma.usuario.findUnique({
        where: { id: registro.usuarioId },
        select: { id: true, organizacaoId: true },
      });
      if (dono) {
        await this.auditoria.registrar({
          organizacaoId: dono.organizacaoId,
          ator: dono.id,
          acao: 'sessao.reuso_suspeito',
          gatilho: { familiaId: registro.familiaId },
        });
      }
      throw new UnauthorizedException('Sessão revogada.');
    }

    // Expirado → precisa de login novo.
    if (registro.expiraEm.getTime() <= Date.now()) {
      throw new UnauthorizedException('Sessão expirada. Faça login novamente.');
    }

    const usuario = await this.prisma.usuario.findUnique({ where: { id: registro.usuarioId } });
    if (!usuario) {
      // Usuário sumiu (removido) — invalida a cadeia por segurança.
      await this.revogarFamilia(registro.familiaId);
      throw new UnauthorizedException('Sessão inválida.');
    }

    // Emite a nova sessão ANTES de fechar a antiga, para encadear substituidoPor.
    const nova = await this.emitirSessao(usuario, {
      familiaId: registro.familiaId,
      userAgent: registro.userAgent ?? undefined,
    });

    const sucessor = await this.prisma.refreshToken.findFirst({
      where: { tokenHash: this.hash(nova.refreshTokenCru) },
      select: { id: true },
    });

    await this.prisma.refreshToken.update({
      where: { id: registro.id },
      data: { revogadoEm: new Date(), substituidoPor: sucessor?.id },
    });

    return {
      sessao: nova,
      dono: { usuarioId: usuario.id, organizacaoId: usuario.organizacaoId },
    };
  }

  /**
   * Revoga um refresh específico (logout). Idempotente: sem token ou token
   * já revogado não é erro — o objetivo (sessão encerrada) já foi atingido.
   * Devolve o dono do token (se identificado) para o controller auditar quem
   * encerrou; `null` quando não há cookie ou o token é desconhecido.
   */
  async revogar(refreshTokenCru: string | undefined): Promise<DonoSessao | null> {
    if (!refreshTokenCru) return null;
    const tokenHash = this.hash(refreshTokenCru);
    const registro = await this.prisma.refreshToken.findFirst({
      where: { tokenHash },
      select: { usuario: { select: { id: true, organizacaoId: true } } },
    });
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revogadoEm: null },
      data: { revogadoEm: new Date() },
    });
    if (!registro) return null;
    return { usuarioId: registro.usuario.id, organizacaoId: registro.usuario.organizacaoId };
  }

  /** Revoga todos os refresh ainda ativos de uma família (rotação/reúso). */
  private async revogarFamilia(familiaId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { familiaId, revogadoEm: null },
      data: { revogadoEm: new Date() },
    });
  }

  private assinarAcesso(usuario: Usuario): Promise<string> {
    const payload: PayloadAcesso = {
      sub: usuario.id,
      organizacaoId: usuario.organizacaoId,
      papel: usuario.papel,
    };
    // `expiresIn` do @nestjs/jwt exige o tipo estreito StringValue (lib `ms`);
    // o TTL vem de env como string ampla, daí o cast localizado nas opções.
    const opcoes = { expiresIn: this.ttlAcesso } as JwtSignOptions;
    return this.jwtService.signAsync(payload, opcoes);
  }

  /** SHA-256 do token cru — o que vai para o banco. Determinístico p/ busca por hash. */
  private hash(tokenCru: string): string {
    return createHash('sha256').update(tokenCru).digest('hex');
  }

  /** Dias de validade do refresh — usado pelo controller para o maxAge do cookie. */
  get refreshTtlDias(): number {
    return this.ttlRefreshDias;
  }
}
