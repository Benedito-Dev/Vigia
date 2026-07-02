export type Papel = 'dono' | 'gestor' | 'cliente'

export interface Usuario {
  id: string
  nome: string
  email: string
  papel: Papel
}

export interface LoginResponse {
  access_token: string
  usuario: Usuario
}

/** Corpo de POST /auth/refresh — só o access token novo; o refresh volta no cookie. */
export interface RefreshResponse {
  access_token: string
}

export interface ApiErrorBody {
  error: {
    code: number
    message: string
    details: unknown
  }
}
