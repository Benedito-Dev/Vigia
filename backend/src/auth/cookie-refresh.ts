import { CookieOptions, Response } from 'express';

/**
 * Ponto único da configuração do cookie de refresh token. Setar e limpar o
 * cookie sempre pelas mesmas flags — divergência aqui vira bug sutil de sessão
 * (ex.: `path` diferente entre set e clear faz o clear não apagar nada).
 * Ver workspace/plans/refresh-token-jwt.md §5.
 */

/** Nome do cookie httpOnly que carrega o refresh token cru. */
export const NOME_COOKIE_REFRESH = 'vigia_refresh';

/**
 * Flags do cookie. `path` restrito às rotas de auth: o refresh só trafega em
 * /api/v1/auth/* (login/refresh/logout), não em toda request da app.
 * `secure` só em produção — em dev (http/localhost) o browser recusaria o cookie.
 * `sameSite: 'lax'` protege contra CSRF sem quebrar a navegação normal.
 */
function opcoesBase(): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/v1/auth',
  };
}

/** Seta o cookie de refresh com validade `ttlDias`. */
export function setCookieRefresh(res: Response, refreshTokenCru: string, ttlDias: number): void {
  res.cookie(NOME_COOKIE_REFRESH, refreshTokenCru, {
    ...opcoesBase(),
    maxAge: ttlDias * 24 * 60 * 60 * 1000,
  });
}

/** Limpa o cookie de refresh (logout). Mesmas flags do set, sem maxAge. */
export function limparCookieRefresh(res: Response): void {
  res.clearCookie(NOME_COOKIE_REFRESH, opcoesBase());
}
