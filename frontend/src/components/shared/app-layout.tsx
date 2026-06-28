import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AppSidebar } from '@/components/shared/app-sidebar'
import { logout } from '@/features/auth/use-auth'
import { projetosMock, type ProjetoResumo } from '@/features/dashboard/dados-mock'

interface AppLayoutProps {
  projetoAtual: ProjetoResumo
  onProjetoChange: (projeto: ProjetoResumo) => void
  children: ReactNode
}

export function AppLayout({ projetoAtual, onProjetoChange, children }: AppLayoutProps) {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-svh">
      <AppSidebar />

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-border px-6 py-4">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              {projetoAtual.clienteNome}
              <ChevronDown className="size-3.5 text-text-terciario" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {projetosMock.map((projeto) => (
                <DropdownMenuItem
                  key={projeto.id}
                  onClick={() => onProjetoChange(projeto)}
                  className="cursor-pointer"
                >
                  {projeto.clienteNome}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            type="button"
            onClick={() => {
              logout()
              navigate('/login')
            }}
            className="cursor-pointer rounded-lg p-2 text-text-terciario transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Sair"
          >
            <LogOut className="size-4" />
          </button>
        </header>

        <main className="px-6 py-6">{children}</main>
      </div>
    </div>
  )
}
