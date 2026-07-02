import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { TokenService, Sessao } from './token.service';

/**
 * Resultado do login. `sessao` carrega o refresh CRU + validade, que o
 * controller usa para setar o cookie httpOnly (F4) — nunca vai no corpo da
 * resposta. O corpo devolve só `access_token` + `usuario`.
 */
export interface ResultadoLogin {
  access_token: string;
  usuario: { id: string; nome: string; email: string; papel: string };
  /** Fora do corpo da resposta — usado pelo controller para auditar o login. */
  organizacaoId: string;
  sessao: Sessao;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  async login({ email, senha }: LoginDto, userAgent?: string): Promise<ResultadoLogin> {
    const usuario = await this.prisma.usuario.findUnique({ where: { email } });
    if (!usuario || !(await argon2.verify(usuario.senhaHash, senha))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const sessao = await this.tokenService.emitirSessao(usuario, { userAgent });

    return {
      access_token: sessao.accessToken,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        papel: usuario.papel,
      },
      organizacaoId: usuario.organizacaoId,
      sessao,
    };
  }
}
