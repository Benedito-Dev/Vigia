import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronDown, Folder, LogOut, Moon, Sun } from 'lucide-react'
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
            <DropdownMenuContent className="w-56 p-1.5">
              {projetosMock.map((projeto) => {
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
