import { Check, ChevronDown, Folder, Inbox, LayoutGrid, Megaphone, Settings } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { VigiaLogo } from '@/components/shared/vigia-logo'
import { useProjetos } from '@/features/projetos/use-projetos'
import { mapearProjeto } from '@/features/projetos/mapear-projeto'
import { useProjetoAtual } from '@/app/use-projeto-atual'
import { cn } from '@/lib/utils'

const itensNavegacao = [
  { to: '/', label: 'Painel', icone: LayoutGrid },
  { to: '/campanhas', label: 'Campanhas', icone: Megaphone },
  { to: '/aprovacoes', label: 'Aprovações', icone: Inbox },
  { to: '/configuracoes', label: 'Configurações', icone: Settings },
]

export function AppSidebar() {
  const navigate = useNavigate()
  const { projetoAtual, selecionarProjeto } = useProjetoAtual()
  const { data: projetosApi } = useProjetos()
  const projetos = (projetosApi ?? []).map(mapearProjeto)

  // A SidebarShell monta esta sidebar mesmo na camada Global (fora de tela).
  // Sem projeto selecionado, não há o que mostrar aqui.
  if (!projetoAtual) return null

  return (
    <aside className="relative flex h-svh w-64 shrink-0 flex-col overflow-hidden border-r border-border px-4 py-6">
      <div className="relative flex items-center gap-3 px-2">
        <div className="relative flex size-9 items-center justify-center rounded-xl bg-secondary">
          <VigiaLogo className="size-5 text-marca-texto" />
        </div>
        <div className="h-6 w-px bg-border" />
        <span className="text-lg font-semibold tracking-wide text-marca-texto">VIGIA</span>
      </div>

      <div className="relative mt-5 px-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-border bg-secondary px-2.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            <Folder className="size-[17px] shrink-0 text-marca-texto" />
            <span className="truncate">{projetoAtual.clienteNome}</span>
            <ChevronDown className="ml-auto size-3.5 shrink-0 text-text-terciario" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 p-1.5">
            {projetos.map((projeto) => {
              const ativo = projeto.id === projetoAtual.id
              return (
                <DropdownMenuItem
                  key={projeto.id}
                  onClick={() => selecionarProjeto(projeto)}
                  className="cursor-pointer justify-between rounded-md px-2.5 py-2 text-sm"
                >
                  {projeto.clienteNome}
                  {ativo && <Check className="size-3.5 text-marca-texto" />}
                </DropdownMenuItem>
              )
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate('/projetos')}
              className="cursor-pointer gap-2 rounded-md px-2.5 py-2 text-sm text-text-terciario"
            >
              <Folder className="size-3.5" />
              Ver todos os projetos
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="relative mt-5 h-px bg-border" />

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
        <p className="text-xs font-medium text-text-terciario">Monitorando 24h</p>
        <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <span className="size-1.5 rounded-full bg-marca-texto" />
          Tudo sob vigilância
        </p>
      </div>
    </aside>
  )
}
