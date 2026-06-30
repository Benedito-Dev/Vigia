import type { EstadoStatus } from '@/components/shared/linha-status'

/**
 * Dados de exemplo para o esboço do painel (M2). Os endpoints reais de
 * série temporal ainda não existem no backend — GET /metrics/daily e
 * GET /metrics/trend estão marcados como TODO em monitoramento.controller.ts.
 * GET /projetos, GET /campaigns e GET /metrics/alerts já existem e devem
 * substituir este arquivo assim que os dois endpoints faltantes forem implementados.
 */

export type Periodo = 'hoje' | '7d' | 'mes'

export interface ProjetoResumo {
  id: string
  clienteNome: string
  nicho: string
  investidoMes: number
  roasMedio: number
  campanhasAtivas: number
  campanhasEmDesvio: number
}

export interface CampanhaResumo {
  id: string
  nome: string
  estado: EstadoStatus
  kpiPrincipal: 'CPL' | 'CPA' | 'ROAS'
  valorAtual: number
  valorBenchmark: number
  desvioPct: number
  verbaDiaria: number
  status: 'ativa' | 'aprendendo' | 'pausada_ia' | 'pausada_user'
}

export interface ResumoPeriodo {
  campanhasEmDesvio: number
  totalCampanhas: number
  campanhasPausadasIa: number
  orcamento: number
  investimento: number
  faturamento: number
  faturamentoVarPct: number
  lucroLiquido: number
  lucroLiquidoVarPct: number
  cplMedio: number
  cplMedioMeta: number
  roasMedio: number
  roasMedioMeta: number
  campanhas: CampanhaResumo[]
  tendencia: {
    investimento: number[]
    faturamento: number[]
    lucroLiquido: number[]
    cplMedio: number[]
    roasMedio: number[]
  }
}

/**
 * Gera uma serie de 7 pontos terminando em `valorFinal`, com variacao
 * proporcional deterministica (sem random) — so para alimentar o sparkline
 * visual ate o endpoint real de serie temporal (GET /metrics/trend) existir.
 */
function gerarTendencia(valorFinal: number, amplitudePct: number): number[] {
  const oscilacao = [0.62, 0.74, 0.68, 0.84, 0.79, 0.93, 1]
  return oscilacao.map((fator) => Math.max(0, valorFinal * (1 - amplitudePct + amplitudePct * fator)))
}

export const projetosMock: ProjetoResumo[] = [
  {
    id: 'proj-1',
    clienteNome: 'Loja Aurora',
    nicho: 'E-commerce · Moda',
    investidoMes: 13500,
    roasMedio: 3.1,
    campanhasAtivas: 4,
    campanhasEmDesvio: 0,
  },
  {
    id: 'proj-2',
    clienteNome: 'Studio Bella',
    nicho: 'Serviços · Beleza',
    investidoMes: 6200,
    roasMedio: 1.8,
    campanhasAtivas: 3,
    campanhasEmDesvio: 2,
  },
]

export const aprovacoesPendentesMock = 2

const baseCampanhas: CampanhaResumo[] = [
  {
    id: 'camp-1',
    nome: 'Conversão · Catálogo Verão',
    estado: 'critico',
    kpiPrincipal: 'CPL',
    valorAtual: 24.8,
    valorBenchmark: 16.0,
    desvioPct: 55,
    verbaDiaria: 180,
    status: 'ativa',
  },
  {
    id: 'camp-2',
    nome: 'Remarketing · Carrinho abandonado',
    estado: 'atencao',
    kpiPrincipal: 'ROAS',
    valorAtual: 2.1,
    valorBenchmark: 2.8,
    desvioPct: -25,
    verbaDiaria: 90,
    status: 'ativa',
  },
  {
    id: 'camp-3',
    nome: 'Reconhecimento · Lançamento Inverno',
    estado: 'bom',
    kpiPrincipal: 'ROAS',
    valorAtual: 3.6,
    valorBenchmark: 2.8,
    desvioPct: 28,
    verbaDiaria: 120,
    status: 'ativa',
  },
  {
    id: 'camp-4',
    nome: 'Leads · Formulário site',
    estado: 'neutro',
    kpiPrincipal: 'CPL',
    valorAtual: 15.4,
    valorBenchmark: 16.0,
    desvioPct: -4,
    verbaDiaria: 60,
    status: 'aprendendo',
  },
]

export const resumoPorPeriodoMock: Record<Periodo, ResumoPeriodo> = {
  hoje: {
    campanhasEmDesvio: 0,
    totalCampanhas: 4,
    campanhasPausadasIa: 0,
    orcamento: 800,
    investimento: 450,
    faturamento: 1820,
    faturamentoVarPct: 12,
    lucroLiquido: 1370,
    lucroLiquidoVarPct: 18,
    cplMedio: 18.7,
    cplMedioMeta: 16.0,
    roasMedio: 2.9,
    roasMedioMeta: 2.8,
    campanhas: baseCampanhas.map((c) => ({
      ...c,
      estado: c.status === 'aprendendo' ? 'neutro' : 'bom',
      desvioPct: Math.abs(c.desvioPct),
    })),
    tendencia: {
      investimento: gerarTendencia(450, 0.4),
      faturamento: gerarTendencia(1820, 0.5),
      lucroLiquido: gerarTendencia(1370, 0.5),
      cplMedio: gerarTendencia(18.7, 0.25),
      roasMedio: gerarTendencia(2.9, 0.3),
    },
  },
  '7d': {
    campanhasEmDesvio: 1,
    totalCampanhas: 4,
    campanhasPausadasIa: 0,
    orcamento: 4200,
    investimento: 3150,
    faturamento: 12740,
    faturamentoVarPct: 21,
    lucroLiquido: 9590,
    lucroLiquidoVarPct: 28,
    cplMedio: 17.9,
    cplMedioMeta: 16.0,
    roasMedio: 3.0,
    roasMedioMeta: 2.8,
    campanhas: baseCampanhas.map((c) => ({ ...c, estado: c.id === 'camp-2' ? 'bom' : c.estado })),
    tendencia: {
      investimento: gerarTendencia(3150, 0.45),
      faturamento: gerarTendencia(12740, 0.55),
      lucroLiquido: gerarTendencia(9590, 0.55),
      cplMedio: gerarTendencia(17.9, 0.2),
      roasMedio: gerarTendencia(3.0, 0.25),
    },
  },
  mes: {
    campanhasEmDesvio: 1,
    totalCampanhas: 4,
    campanhasPausadasIa: 0,
    orcamento: 18000,
    investimento: 13500,
    faturamento: 54600,
    faturamentoVarPct: 21,
    lucroLiquido: 41100,
    lucroLiquidoVarPct: 28,
    cplMedio: 17.2,
    cplMedioMeta: 16.0,
    roasMedio: 3.1,
    roasMedioMeta: 2.8,
    campanhas: baseCampanhas.map((c) => ({ ...c, estado: c.id === 'camp-2' ? 'bom' : c.estado })),
    tendencia: {
      investimento: gerarTendencia(13500, 0.5),
      faturamento: gerarTendencia(54600, 0.6),
      lucroLiquido: gerarTendencia(41100, 0.6),
      cplMedio: gerarTendencia(17.2, 0.18),
      roasMedio: gerarTendencia(3.1, 0.2),
    },
  },
}

export const rotuloPeriodo: Record<Periodo, string> = {
  hoje: 'Hoje',
  '7d': '7 dias',
  mes: 'Mês',
}
