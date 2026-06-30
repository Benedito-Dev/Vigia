import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PainelCardProps {
  eyebrow?: string
  acao?: ReactNode
  children: ReactNode
  className?: string
}

/** Card sutil do painel interno. */
export function PainelCard({ eyebrow, acao, children, className }: PainelCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-border bg-card px-6 py-5 shadow-[var(--shadow-card)]',
        className,
      )}
    >
      {eyebrow && (
        <div className="relative mb-5 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-quaternario">{eyebrow}</p>
          {acao}
        </div>
      )}
      <div className="relative">{children}</div>
    </div>
  )
}
