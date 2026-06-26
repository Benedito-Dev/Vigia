import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type EstadoStatus = 'critico' | 'atencao' | 'bom' | 'neutro'

const corPorEstado: Record<EstadoStatus, string> = {
  critico: 'bg-status-critico',
  atencao: 'bg-status-atencao',
  bom: 'bg-status-bom',
  neutro: 'bg-status-neutro',
}

interface LinhaStatusProps {
  estado: EstadoStatus
  children: ReactNode
  className?: string
}

/**
 * Indicador de status do Design System V2 (secao 1, regra 3): uma barra
 * vertical de 3px, nunca bolinha ou badge com fundo colorido.
 */
export function LinhaStatus({ estado, children, className }: LinhaStatusProps) {
  return (
    <div className={cn('flex items-stretch gap-3', className)}>
      <span className={cn('w-[3px] shrink-0 rounded-none', corPorEstado[estado])} />
      <div className="flex flex-1 items-center justify-between py-1">{children}</div>
    </div>
  )
}
