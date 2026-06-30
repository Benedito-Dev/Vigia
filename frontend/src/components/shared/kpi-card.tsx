import type { ReactNode } from 'react'
import { Sparkline } from '@/components/shared/sparkline'
import { useCountUp } from '@/lib/use-count-up'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  label: string
  valor: number
  tendencia: number[]
  corValor?: string
  corSparkline: string
  formatar: (valor: number) => string
  rodape: ReactNode
  meta?: number
  rotuloMeta?: string
  direcaoBoa?: 'subir' | 'descer'
}

/** Card de KPI com numero animado (count-up) e tendencia em sparkline. */
export function KpiCard({
  label,
  valor,
  tendencia,
  corValor,
  corSparkline,
  formatar,
  rodape,
  meta,
  rotuloMeta,
  direcaoBoa,
}: KpiCardProps) {
  const valorAnimado = useCountUp(valor)

  return (
    <div className="flex flex-col rounded-lg border border-border bg-card px-4 py-4 shadow-[var(--shadow-card)]">
      <p className="text-xs font-medium text-text-terciario">{label}</p>
      <p className={cn('mt-2 text-2xl font-bold tabular-nums', corValor ?? 'text-foreground')}>
        {formatar(valorAnimado)}
      </p>
      <div className="mt-1 text-xs text-text-quaternario">{rodape}</div>
      <Sparkline
        pontos={tendencia}
        cor={corSparkline}
        formatarValor={formatar}
        meta={meta}
        rotuloMeta={rotuloMeta}
        direcaoBoa={direcaoBoa}
        className="mt-3 h-12 w-full overflow-visible"
      />
    </div>
  )
}
