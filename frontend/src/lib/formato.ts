/**
 * Formatação de métricas com a regra do produto: dado ausente (null) vira "—",
 * nunca 0 nem número inventado. Usar em TODA métrica que pode não existir
 * (ROAS/CPL/CPA sem pixel etc.).
 */

const TRACO = '—'

export function formatarReais(valor: number | null | undefined): string {
  if (valor == null) return TRACO
  return `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatarReaisCurto(valor: number | null | undefined): string {
  if (valor == null) return TRACO
  return `R$ ${valor.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`
}

export function formatarRoas(valor: number | null | undefined): string {
  if (valor == null) return TRACO
  return `${valor.toFixed(1)}x`
}

export function formatarPct(valor: number | null | undefined): string {
  if (valor == null) return TRACO
  return `${(valor * 100).toFixed(1)}%`
}
