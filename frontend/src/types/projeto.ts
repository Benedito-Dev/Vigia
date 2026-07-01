/**
 * Contratos que espelham o backend real (não o mock).
 * O backend hoje entrega identidade do projeto e leitura de campanhas ao vivo
 * do Meta. Agregados do dashboard (investido do mês, ROAS médio, tendências)
 * ainda dependem da ingestão diária — continuam mock até esse bloco existir.
 */

/** Status vindo do enum StatusProjeto do backend. */
export type StatusProjetoApi = 'conectado' | 'aviso_cobranca' | 'desconectado'

export interface ProjetoApi {
  id: string
  clienteNome: string
  nicho: string
  ticketMedio: number
  metaExternalId: string
  status: StatusProjetoApi
  createdAt: string
}

export interface ConectarProjetoInput {
  clienteNome: string
  nicho: string
  externalId: string
  accessToken: string
}

/**
 * Campanha lida ao vivo do Meta. Campos que dependem de dado ausente na conta
 * (sem pixel → sem receita) vêm `null` — a UI mostra "—", nunca um número falso.
 */
export interface CampanhaApi {
  externalId: string
  nome: string
  objetivo: string
  status: string
  verbaDiaria: number | null
  investido: number
  impressoes: number
  cliques: number
  leads: number | null
  compras: number | null
  receita: number | null
  cpl: number | null
  cpa: number | null
  roas: number | null
  ctr: number | null
}
