import { FolderKanban, Users } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { VigiaLogo } from '@/components/shared/vigia-logo'
import { cn } from '@/lib/utils'

const itensNavegacao = [
  { to: '/projetos', label: 'Projetos', icone: FolderKanban },
  { to: '/equipe', label: 'Equipe', icone: Users },
]

export function GlobalSidebar() {
  return (
    <aside className="relative flex h-svh w-64 shrink-0 flex-col overflow-hidden border-r border-border px-4 py-6">
      <div className="relative flex items-center gap-3 px-2">
        <div className="relative flex size-9 items-center justify-center rounded-xl bg-secondary">
          <VigiaLogo className="size-5 text-marca-texto" />
        </div>
        <div className="h-6 w-px bg-border" />
        <span className="text-lg font-semibold tracking-wide text-marca-texto">VIGIA</span>
      </div>

      <div className="relative mt-6 h-px bg-border" />

      <nav className="relative mt-6 flex flex-col gap-1">
        {itensNavegacao.map(({ to, label, icone: Icone }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              cn(
                'relative flex items-center gap-3 rounded-lg border-l-2 border-transparent px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'border-marca bg-secondary text-foreground'
                  : 'text-text-terciario hover:bg-muted/50 hover:text-foreground',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icone className={cn('size-[18px]', isActive ? 'text-marca-texto' : 'text-text-terciario')} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="relative mt-auto rounded-xl border border-border bg-secondary px-4 py-3.5">
        <p className="text-xs font-medium text-text-terciario">Conta</p>
        <p className="mt-1 text-sm font-semibold text-foreground">Camada global</p>
      </div>
    </aside>
  )
}
