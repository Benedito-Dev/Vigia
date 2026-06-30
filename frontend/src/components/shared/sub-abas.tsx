import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface SubAba<T extends string> {
  id: T
  label: string
  icone?: ReactNode
  /** Sinaliza atenção na aba (ex.: conexão expirada). */
  alerta?: boolean
}

interface SubAbasProps<T extends string> {
  abas: SubAba<T>[]
  ativa: T
  onSelecionar: (id: T) => void
}

/**
 * Navegação interna de uma página (sub-abas no topo do conteúdo).
 * Linha única, indicador por borda inferior — não compete com a sidebar.
 */
export function SubAbas<T extends string>({ abas, ativa, onSelecionar }: SubAbasProps<T>) {
  return (
    <div className="relative flex gap-1 border-b border-border">
      {abas.map((aba) => {
        const selecionada = aba.id === ativa
        return (
          <button
            key={aba.id}
            type="button"
            onClick={() => onSelecionar(aba.id)}
            className={cn(
              'relative -mb-px flex cursor-pointer items-center gap-2 border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors',
              selecionada
                ? 'border-marca text-foreground'
                : 'border-transparent text-text-terciario hover:text-foreground',
            )}
          >
            {aba.icone}
            {aba.label}
            {aba.alerta && <span className="size-1.5 rounded-full bg-status-critico" />}
          </button>
        )
      })}
    </div>
  )
}
