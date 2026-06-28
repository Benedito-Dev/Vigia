import { Inbox, LayoutGrid, Settings } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { VigiaLogo } from '@/components/shared/vigia-logo'
import { cn } from '@/lib/utils'

const itensNavegacao = [
  { to: '/', label: 'Painel', icone: LayoutGrid },
  { to: '/aprovacoes', label: 'Aprovações', icone: Inbox },
  { to: '/configuracoes', label: 'Configurações', icone: Settings },
]

export function AppSidebar() {
  return (
    <aside className="relative flex h-svh w-64 shrink-0 flex-col overflow-hidden border-r border-border px-4 py-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-64"
        style={{
          backgroundImage: 'radial-gradient(circle at 30% 0%, rgba(0,224,219,0.18), transparent 60%)',
        }}
      />

      <div className="relative flex items-center gap-3 px-2">
        <div className="relative flex size-9 items-center justify-center rounded-xl bg-marca/10">
          <VigiaLogo className="size-5 text-marca" />
        </div>
        <div className="h-6 w-px bg-border" />
        <span className="text-lg font-semibold tracking-wide text-foreground">VIGIA</span>
      </div>

      <nav className="relative mt-10 flex flex-col gap-1">
        {itensNavegacao.map(({ to, label, icone: Icone }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              cn(
                'relative flex items-center gap-3 rounded-lg border-l-2 border-transparent px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'border-marca bg-marca/10 text-foreground shadow-[inset_0_0_24px_-12px_rgba(0,224,219,0.6)]'
                  : 'text-text-terciario hover:bg-muted/50 hover:text-foreground',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icone className={cn('size-[18px]', isActive ? 'text-marca' : 'text-text-terciario')} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="relative mt-auto rounded-xl border border-marca/20 bg-marca/5 px-4 py-3.5">
        <p className="text-xs font-medium text-text-terciario">Monitorando 24h</p>
        <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-marca">
          <span className="size-1.5 animate-pulse rounded-full bg-marca" />
          Tudo sob vigilância
        </p>
      </div>
    </aside>
  )
}
