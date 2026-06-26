import { useMutation } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { apiClient } from '@/lib/api-client'
import type { ApiErrorBody, LoginResponse } from '@/types/auth'

interface LoginInput {
  email: string
  senha: string
}

export function useLogin() {
  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const { data } = await apiClient.post<LoginResponse>('/auth/login', input)
      return data
    },
    onSuccess: (data) => {
      localStorage.setItem('vigia_token', data.access_token)
    },
  })
}

export function extrairMensagemDeErro(error: unknown): string {
  if (isAxiosError<ApiErrorBody>(error) && error.response?.data?.error?.message) {
    return error.response.data.error.message
  }
  return 'Não foi possível completar a ação. Tente novamente.'
}
