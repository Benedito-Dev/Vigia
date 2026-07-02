import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { LoginDto } from './dto/login.dto';
import {
  NOME_COOKIE_REFRESH,
  limparCookieRefresh,
  setCookieRefresh,
} from './cookie-refresh';

/**
 * Endpoints de sessão. O refresh token cru só trafega no cookie httpOnly
 * `vigia_refresh` — nunca no corpo. O corpo devolve só o access token.
 * Ver workspace/plans/refresh-token-jwt.md §5.
 */
@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
    private readonly auditoria: AuditoriaService,
  ) {}

  /**
   * Login: valida credenciais, seta o cookie httpOnly de refresh e devolve o
   * access token + usuário. O refresh cru fica só no cookie (nunca no corpo).
   */
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req.get('user-agent') ?? undefined;
    const { sessao, organizacaoId, ...resposta } = await this.authService.login(dto, userAgent);

    setCookieRefresh(res, sessao.refreshTokenCru, this.tokenService.refreshTtlDias);

    await this.auditoria.registrar({
      organizacaoId,
      ator: resposta.usuario.id,
      acao: 'sessao.login',
    });

    return resposta;
  }

  /**
   * Refresh: lê o cookie, rotaciona (revoga o antigo, emite novo na mesma
   * família), re-seta o cookie e devolve um access token novo. Reúso de token
   * revogado derruba a família e devolve 401 (tratado no TokenService).
   */
  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshCru = req.cookies?.[NOME_COOKIE_REFRESH] as string | undefined;
    if (!refreshCru) {
      throw new UnauthorizedException('Sessão ausente.');
    }

    const { sessao, dono } = await this.tokenService.rotacionar(refreshCru);

    setCookieRefresh(res, sessao.refreshTokenCru, this.tokenService.refreshTtlDias);

    await this.auditoria.registrar({
      organizacaoId: dono.organizacaoId,
      ator: dono.usuarioId,
      acao: 'sessao.refresh',
    });

    return { access_token: sessao.accessToken };
  }

  /**
   * Logout: revoga o refresh atual e limpa o cookie. Idempotente — sem cookie
   * ou token já revogado, encerra do mesmo jeito (204).
   */
  @Post('logout')
  @HttpCode(204)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshCru = req.cookies?.[NOME_COOKIE_REFRESH] as string | undefined;
    const dono = await this.tokenService.revogar(refreshCru);

    limparCookieRefresh(res);

    if (dono) {
      await this.auditoria.registrar({
        organizacaoId: dono.organizacaoId,
        ator: dono.usuarioId,
        acao: 'sessao.logout',
      });
    }
  }
}
