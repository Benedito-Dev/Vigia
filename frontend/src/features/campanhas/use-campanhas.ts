import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { CampanhaApi } from '@/types/projeto'

/** Leitura ao vivo das campanhas de um projeto (GET /campaigns?projeto_id=). */
export function useCampanhas(projetoId: string | undefined) {
  return useQuery({
    queryKey: ['campanhas', projetoId],
    enabled: Boolean(projetoId),
    queryFn: async () => {
      const { data } = await apiClient.get<CampanhaApi[]>('/campaigns', {
        params: { projeto_id: projetoId },
      })
      return data
    },
  })
}
