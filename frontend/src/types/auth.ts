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

export interface ApiErrorBody {
  error: {
    code: number
    message: string
    details: unknown
  }
}
