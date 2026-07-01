import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { ConectarProjetoInput, ProjetoApi } from '@/types/projeto'

export function useProjetos() {
  return useQuery({
    queryKey: ['projetos'],
    queryFn: async () => {
      const { data } = await apiClient.get<ProjetoApi[]>('/projetos')
      return data
    },
  })
}

export function useConectarProjeto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: ConectarProjetoInput) => {
      const { data } = await apiClient.post<ProjetoApi>('/projetos/connect', input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projetos'] })
    },
  })
}
