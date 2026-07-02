import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Folder, LogOut, Moon, Sun } from 'lucide-react'
import { logout } from '@/features/auth/use-auth'
import { useTheme } from '@/app/use-theme'
import { useProjetoSelecionado } from '@/app/use-projeto-atual'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate()
  const { tema, alternarTema } = useTheme()
  const projetoAtual = useProjetoSelecionado()

  return (
    <div className="flex-1">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium text-foreground">
          <Folder className="size-3.5 text-marca-texto" />
          {projetoAtual.clienteNome}
        </div>

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
              void logout()
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
  )
}
