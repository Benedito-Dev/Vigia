import { apiClient } from '@/lib/api-client'

export function estaAutenticado(): boolean {
  return Boolean(localStorage.getItem('vigia_token'))
}

/**
 * Encerra a sessão. Limpa o token local IMEDIATAMENTE (para a UI refletir na
 * hora) e avisa o backend para revogar o refresh + limpar o cookie httpOnly.
 * A chamada de rede é best-effort: se falhar (offline), a sessão local já foi
 * encerrada; o refresh remanescente expira sozinho.
 */
export async function logout(): Promise<void> {
  localStorage.removeItem('vigia_token')
  try {
    await apiClient.post('/auth/logout')
  } catch {
    // silencioso: o logout local é o que importa para o usuário.
  }
}
