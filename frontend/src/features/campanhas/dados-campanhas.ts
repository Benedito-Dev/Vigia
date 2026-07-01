import type { EstadoStatus } from '@/components/shared/linha-status'

/**
 * Dados de campanha para a aba de gestão (M1). Diferente de CampanhaResumo
 * (dashboard/monitoramento, M2), aqui carregamos os campos do ciclo de vida:
 * objetivo, tipo de orçamento e o status operacional completo.
 *
 * Os endpoints reais (GET/POST/PATCH/DELETE /campaigns) ainda não existem —
 * este arquivo é a fonte mock até a integração. Ver contratos de API na
 * ESPECIFICACAO_TECNICA_VIGIA.md (seção 8).
 */

export type StatusCampanha =
  | 'ativa'
  | 'aprendendo'
  | 'pausada_user'
  | 'pausada_ia'
  | 'arquivada'

export type ObjetivoCampanha = 'lead' | 'venda' | 'mensagens' | 'reconhecimento'

export type TipoOrcamento = 'CBO' | 'ABO'

export interface Campanha {
  id: string
  nome: string
  objetivo: ObjetivoCampanha
  tipoOrcamento: TipoOrcamento
  verbaDiaria: number
  status: StatusCampanha
  /** Estado de saúde derivado da comparação com benchmark (M2). */
  estado: EstadoStatus
  kpiPrincipal: 'CPL' | 'CPA' | 'ROAS'
  valorAtual: number
  valorBenchmark: number
  desvioPct: number
  /** Criativos vinculados (RF-015) — só contagem por enquanto. */
  criativosVinculados: number
}

export const rotuloObjetivo: Record<ObjetivoCampanha, string> = {
  lead: 'Leads',
  venda: 'Vendas',
  mensagens: 'Mensagens',
  reconhecimento: 'Reconhecimento',
}

export const rotuloStatus: Record<StatusCampanha, string> = {
  ativa: 'Ativa',
  aprendendo: 'Aprendendo',
  pausada_user: 'Pausada',
  pausada_ia: 'Pausada pela IA',
  arquivada: 'Arquivada',
}

export const campanhasMock: Campanha[] = [
  {
    id: 'camp-1',
    nome: 'Conversão · Catálogo Verão',
    objetivo: 'venda',
    tipoOrcamento: 'CBO',
    verbaDiaria: 180,
    status: 'ativa',
    estado: 'critico',
    kpiPrincipal: 'CPL',
    valorAtual: 24.8,
    valorBenchmark: 16.0,
    desvioPct: 55,
    criativosVinculados: 3,
  },
  {
    id: 'camp-2',
    nome: 'Remarketing · Carrinho abandonado',
    objetivo: 'venda',
    tipoOrcamento: 'ABO',
    verbaDiaria: 90,
    status: 'ativa',
    estado: 'atencao',
    kpiPrincipal: 'ROAS',
    valorAtual: 2.1,
    valorBenchmark: 2.8,
    desvioPct: -25,
    criativosVinculados: 2,
  },
  {
    id: 'camp-3',
    nome: 'Reconhecimento · Lançamento Inverno',
    objetivo: 'reconhecimento',
    tipoOrcamento: 'CBO',
    verbaDiaria: 120,
    status: 'ativa',
    estado: 'bom',
    kpiPrincipal: 'ROAS',
    valorAtual: 3.6,
    valorBenchmark: 2.8,
    desvioPct: 28,
    criativosVinculados: 4,
  },
  {
    id: 'camp-4',
    nome: 'Leads · Formulário site',
    objetivo: 'lead',
    tipoOrcamento: 'ABO',
    verbaDiaria: 60,
    status: 'aprendendo',
    estado: 'neutro',
    kpiPrincipal: 'CPL',
    valorAtual: 15.4,
    valorBenchmark: 16.0,
    desvioPct: -4,
    criativosVinculados: 1,
  },
  {
    id: 'camp-5',
    nome: 'Mensagens · Atendimento WhatsApp',
    objetivo: 'mensagens',
    tipoOrcamento: 'ABO',
    verbaDiaria: 40,
    status: 'pausada_ia',
    estado: 'critico',
    kpiPrincipal: 'CPL',
    valorAtual: 31.2,
    valorBenchmark: 16.0,
    desvioPct: 95,
    criativosVinculados: 2,
  },
  {
    id: 'camp-6',
    nome: 'Conversão · Coleção Cápsula',
    objetivo: 'venda',
    tipoOrcamento: 'CBO',
    verbaDiaria: 75,
    status: 'pausada_user',
    estado: 'neutro',
    kpiPrincipal: 'ROAS',
    valorAtual: 2.4,
    valorBenchmark: 2.8,
    desvioPct: -14,
    criativosVinculados: 3,
  },
]
