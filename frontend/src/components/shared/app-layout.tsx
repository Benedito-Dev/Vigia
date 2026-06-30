import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut, Moon, Sun, LayoutList } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AppSidebar } from '@/components/shared/app-sidebar'
import { logout } from '@/features/auth/use-auth'
import { projetosMock } from '@/features/dashboard/dados-mock'
import { useTheme } from '@/app/use-theme'
import { useProjetoAtual } from '@/app/use-projeto-atual'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate()
  const { tema, alternarTema } = useTheme()
  const { projetoAtual, selecionarProjeto } = useProjetoAtual()

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
                  onClick={() => selecionarProjeto(projeto)}
                  className="cursor-pointer"
                >
                  {projeto.clienteNome}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/projetos')} className="cursor-pointer">
                <LayoutList className="size-3.5" />
                Ver todos os projetos
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={alternarTema}
              className="cursor-pointer rounded-lg p-2 text-text-terciario transition-colors hover:bg-muted hover:text-foreground"
              aria-label={tema === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
            >
              {tema === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>

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
          </div>
        </header>

        <main className="px-6 py-6">{children}</main>
      </div>
    </div>
  )
}
