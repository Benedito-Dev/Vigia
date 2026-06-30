import { useNavigate } from 'react-router-dom'
import { LogOut, Moon, Sun, Users } from 'lucide-react'
import { logout } from '@/features/auth/use-auth'
import { useTheme } from '@/app/use-theme'
import { PainelCard } from '@/components/shared/painel-card'

export function EquipePage() {
  const navigate = useNavigate()
  const { tema, alternarTema } = useTheme()

  return (
    <div className="flex-1">
      <header className="flex items-center justify-end gap-1 border-b border-border px-6 py-4">
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
      </header>

      <main className="px-6 py-6">
        <div className="mx-auto max-w-[1400px]">
          <PainelCard eyebrow="Equipe">
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Users className="size-6 text-text-quaternario" />
              <p className="text-sm text-text-terciario">
                Em construção. Gestão de usuários da organização e papéis (dono, operador,
                visualizador) vai aparecer aqui.
              </p>
            </div>
          </PainelCard>
        </div>
      </main>
    </div>
  )
}
