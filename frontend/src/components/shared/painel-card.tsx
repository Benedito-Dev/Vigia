import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PainelCardProps {
  eyebrow?: string
  acao?: ReactNode
  children: ReactNode
  className?: string
  glow?: boolean
}

/** Card sutil do painel interno — Design System V2, seção 5.6. */
export function PainelCard({ eyebrow, acao, children, className, glow }: PainelCardProps) {
  return (
    <div className={cn('relative overflow-hidden rounded-xl border border-border bg-card px-6 py-5', className)}>
      {glow && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 0% 0%, rgba(0,224,219,0.16), transparent 55%), radial-gradient(circle at 100% 100%, rgba(0,224,219,0.08), transparent 50%)',
          }}
        />
      )}

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
