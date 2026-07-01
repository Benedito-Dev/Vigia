import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MetaAdsClient } from '../integracoes/meta-ads/meta-ads.client';
import { CofreService } from '../common/cofre/cofre.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { StatusProjeto } from '@prisma/client';
import { ConectarProjetoDto } from './dto/conectar-projeto.dto';

@Injectable()
export class ProjetosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly metaAdsClient: MetaAdsClient,
    private readonly cofre: CofreService,
    private readonly auditoria: AuditoriaService,
  ) {}

  async listarPorOrganizacao(organizacaoId: string) {
    const projetos = await this.prisma.projeto.findMany({
      where: { organizacaoId },
      orderBy: { createdAt: 'asc' },
    });
    // Nunca devolver o tokenRef ao cliente.
    return projetos.map((p) => this.semSegredo(p));
  }

  /**
   * RF-005 / RF-006: conecta uma conta Meta a um novo projeto.
   *  1. valida a conta na Graph API (se inválida, lança e NÃO cria nada);
   *  2. cifra o Access Token (RF-004 — nunca em texto puro);
   *  3. persiste o projeto com o token cifrado em tokenRef;
   *  4. registra em auditoria (append-only).
   */
  async conectar(organizacaoId: string, ator: string, dto: ConectarProjetoDto) {
    // 1. Valida — se o token/ID forem inválidos, isto lança antes de gravar (RF-006).
    const conta = await this.metaAdsClient.validarConta(dto.externalId, dto.accessToken);

    // Billing recusado etc. entra como aviso, mas não impede a conexão (RF-007).
    const status = conta.accountStatus === 1 ? StatusProjeto.conectado : StatusProjeto.aviso_cobranca;

    // 2. Cifra o token — o valor cru nunca toca o banco.
    const tokenRef = this.cofre.cifrar(dto.accessToken);

    // 3. Persiste.
    const projeto = await this.prisma.projeto.create({
      data: {
        organizacaoId,
        clienteNome: dto.clienteNome,
        nicho: dto.nicho,
        ticketMedio: 0,
        metaExternalId: conta.externalId,
        tokenRef,
        status,
      },
    });

    // 4. Auditoria — sem nenhum dado sensível no registro.
    await this.auditoria.registrar({
      organizacaoId,
      ator,
      acao: 'projeto.conectado',
      alvoRef: projeto.id,
      dadosDepois: {
        clienteNome: projeto.clienteNome,
        metaExternalId: projeto.metaExternalId,
        status: projeto.status,
      },
    });

    return this.semSegredo(projeto);
  }

  /** Remove o tokenRef antes de devolver o projeto para fora do backend. */
  private semSegredo<T extends { tokenRef: string }>(projeto: T): Omit<T, 'tokenRef'> {
    const { tokenRef: _descartado, ...resto } = projeto;
    return resto;
  }

  // TODO (RF-008): definirLimitesSeguranca(projetoId, dto) — PUT /:id/safety-limits
}
