import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { RefreshResponse } from '@/types/auth'

const CHAVE_TOKEN = 'vigia_token'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // Envia/aceita o cookie httpOnly de refresh (cross-origin front↔back).
  // Exige CORS com credentials no backend (já configurado no main.ts).
  withCredentials: true,
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(CHAVE_TOKEN)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// --- Refresh transparente no 401 -------------------------------------------
// Quando o access token expira (401), tentamos UMA vez rotacionar via
// /auth/refresh (que usa o cookie) e refazemos a request original. Um refresh
// concorrente é compartilhado por todas as requests que falharem ao mesmo
// tempo (fila), para não disparar N refreshes em paralelo (estampede).

/** Rotas que NÃO devem acionar o fluxo de refresh (evita laço infinito). */
const ROTAS_SEM_REFRESH = ['/auth/login', '/auth/refresh', '/auth/logout']

/** Promise do refresh em andamento — compartilhada entre requests concorrentes. */
let refreshEmAndamento: Promise<string> | null = null

/** Marca uma request que já passou pelo retry, para não tentar de novo. */
interface ConfigComRetry extends InternalAxiosRequestConfig {
  _jaTentouRefresh?: boolean
}

async function rotacionarToken(): Promise<string> {
  const { data } = await apiClient.post<RefreshResponse>('/auth/refresh')
  localStorage.setItem(CHAVE_TOKEN, data.access_token)
  return data.access_token
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as ConfigComRetry | undefined
    const url = original?.url ?? ''
    const ehRotaDeAuth = ROTAS_SEM_REFRESH.some((rota) => url.includes(rota))

    // Só tratamos 401 de rotas normais que ainda não tentaram refresh.
    if (
      error.response?.status !== 401 ||
      !original ||
      original._jaTentouRefresh ||
      ehRotaDeAuth
    ) {
      // 401 definitivo (inclusive do próprio /refresh) → sessão encerrada.
      if (error.response?.status === 401 && ehRotaDeAuth) {
        localStorage.removeItem(CHAVE_TOKEN)
      }
      return Promise.reject(error)
    }

    original._jaTentouRefresh = true

    try {
      // Reaproveita o refresh em andamento, se houver; senão inicia um.
      refreshEmAndamento ??= rotacionarToken().finally(() => {
        refreshEmAndamento = null
      })
      const novoToken = await refreshEmAndamento

      original.headers.Authorization = `Bearer ${novoToken}`
      return apiClient(original)
    } catch (erroRefresh) {
      // Refresh falhou (cookie ausente/expirado/reúso) → limpa e propaga.
      localStorage.removeItem(CHAVE_TOKEN)
      return Promise.reject(erroRefresh)
    }
  },
)
