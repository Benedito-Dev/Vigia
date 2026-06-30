/**
 * Catálogo dos nichos e faixas de ticket que têm benchmark cadastrado.
 * Espelha as colunas `nicho` e `ticket_range` da tabela BENCHMARK do banco.
 *
 * Por que isto existe: o campo "nicho" era texto livre, então um valor que
 * não batesse exatamente com a tabela de comparação caía silenciosamente em
 * "sem dado de comparação" (RF-019). Restringir a seleção a este catálogo
 * garante que todo projeto aponte para um benchmark real.
 *
 * O valor gravado é o próprio rótulo (ex.: "E-commerce · Moda") enquanto não
 * há backend — bate com os dados de projetosMock. Quando o backend existir,
 * GET /benchmarks/nichos deve substituir esta lista e pode introduzir um
 * código canônico separado do rótulo.
 */

export const nichosDisponiveis: string[] = [
  'E-commerce · Moda',
  'E-commerce · Geral',
  'Serviços · Beleza',
  'Serviços · Saúde e bem-estar',
  'Serviços · Educação e cursos',
  'Infoproduto · Cursos e mentorias',
  'Imobiliário',
  'Automotivo',
  'Alimentação · Restaurantes e delivery',
  'Negócio local · Loja física',
]

export interface OpcaoTicket {
  /** Bate com BENCHMARK.ticket_range. */
  valor: 'ate_100' | '100_500' | 'acima_500'
  rotulo: string
}

export const faixasDeTicket: OpcaoTicket[] = [
  { valor: 'ate_100', rotulo: 'Até R$ 100' },
  { valor: '100_500', rotulo: 'De R$ 100 a R$ 500' },
  { valor: 'acima_500', rotulo: 'Acima de R$ 500' },
]

/** Deriva a faixa de ticket a partir do valor numérico em BRL. */
export function faixaDeTicketPara(valor: number): OpcaoTicket['valor'] {
  if (valor <= 100) return 'ate_100'
  if (valor <= 500) return '100_500'
  return 'acima_500'
}

export function rotuloDaFaixaDeTicket(valor: number): string {
  const faixa = faixaDeTicketPara(valor)
  return faixasDeTicket.find((f) => f.valor === faixa)?.rotulo ?? ''
}
