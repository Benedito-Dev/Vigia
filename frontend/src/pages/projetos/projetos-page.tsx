import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { logout } from '@/features/auth/use-auth'
import { CriarProjetoDialog } from '@/features/projetos/criar-projeto-dialog'
import { projetosMock as projetosMockIniciais, type ProjetoResumo } from '@/features/dashboard/dados-mock'
import { useProjetoAtual } from '@/app/use-projeto-atual'
import { VigiaLogo } from '@/components/shared/vigia-logo'

export function ProjetosPage() {
  const navigate = useNavigate()
  const { selecionarProjeto } = useProjetoAtual()
  const [projetos, setProjetos] = useState<ProjetoResumo[]>(projetosMockIniciais)

  function abrirProjeto(projeto: ProjetoResumo) {
    selecionarProjeto(projeto)
    navigate('/')
  }

  function criarProjeto(dados: { clienteNome: string; nicho: string }) {
    const novoProjeto: ProjetoResumo = {
      id: `proj-${Date.now()}`,
      clienteNome: dados.clienteNome,
      nicho: dados.nicho,
      investidoMes: 0,
      roasMedio: 0,
      campanhasAtivas: 0,
      campanhasEmDesvio: 0,
    }
    setProjetos((atuais) => [...atuais, novoProjeto])
    abrirProjeto(novoProjeto)
  }

  return (
    <div className="min-h-svh bg-background px-12 py-8">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between">
        <div className="flex items-center gap-2 text-lg font-semibold tracking-wide text-marca-texto">
          <VigiaLogo className="size-6" />
          VIGIA
        </div>
        <div className="flex items-center gap-4 text-sm text-text-terciario">
          <button
            type="button"
            onClick={() => {
              logout()
              navigate('/login')
            }}
            className="cursor-pointer rounded-lg px-2.5 py-1.5 transition-colors hover:bg-muted hover:text-foreground"
          >
            Sair
          </button>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-[1200px]">
        {projetos.length > 0 ? (
          <>
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-xl font-semibold text-foreground">Meus projetos</h1>
                <p className="mt-1 text-sm text-text-terciario">
                  {projetos.length} {projetos.length === 1 ? 'projeto' : 'projetos'} · cada um com sua
                  própria conta de anúncios conectada
                </p>
              </div>
              <CriarProjetoDialog
                onCriar={criarProjeto}
                trigger={
                  <button
                    type="button"
                    className="cursor-pointer rounded-lg bg-marca px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    + Criar projeto
                  </button>
                }
              />
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              {projetos.map((projeto) => (
                <ProjetoCard key={projeto.id} projeto={projeto} onClick={() => abrirProjeto(projeto)} />
              ))}

              <CriarProjetoDialog
                onCriar={criarProjeto}
                trigger={
                  <button
                    type="button"
                    className="flex min-h-[164px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-text-terciario transition-colors hover:border-marca/40 hover:text-marca-texto"
                  >
                    <Plus className="size-5" />
                    <span className="text-sm font-medium">Criar novo projeto</span>
                  </button>
                }
              />
            </div>
          </>
        ) : (
          <div className="mt-16 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-xl bg-marca-fundo text-marca-texto">
              <VigiaLogo className="size-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-foreground">Crie seu primeiro projeto</h2>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-text-terciario">
              Cada projeto representa um cliente com uma conta de anúncios conectada (ex: Meta Ads).
              Conecte uma conta para começar a monitorar campanhas.
            </p>
            <div className="mt-5 flex justify-center">
              <CriarProjetoDialog
                onCriar={criarProjeto}
                trigger={
                  <button
                    type="button"
                    className="cursor-pointer rounded-lg bg-marca px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    + Criar projeto
                  </button>
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ProjetoCard({ projeto, onClick }: { projeto: ProjetoResumo; onClick: () => void }) {
  const saudavel = projeto.campanhasEmDesvio === 0

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative cursor-pointer overflow-hidden rounded-xl border border-border bg-card px-5 py-5 text-left shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5"
    >
      <span className={saudavel ? 'absolute inset-y-0 left-0 w-1 bg-status-bom' : 'absolute inset-y-0 left-0 w-1 bg-status-critico'} />
      <p className="text-base font-bold text-foreground">{projeto.clienteNome}</p>
      <p className="mt-0.5 text-xs text-text-terciario">{projeto.nicho}</p>

      <div className="mt-4 flex gap-6">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-text-quaternario">
            Investido (mês)
          </p>
          <p className="mt-0.5 text-sm font-bold text-foreground">
            R$ {projeto.investidoMes.toLocaleString('pt-BR')}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-text-quaternario">
            ROAS médio
          </p>
          <p className="mt-0.5 text-sm font-bold text-foreground">{projeto.roasMedio.toFixed(1)}x</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-text-terciario">
        <span>{projeto.campanhasAtivas} campanhas ativas</span>
        {saudavel ? (
          <span className="rounded-full bg-status-bom/10 px-2 py-0.5 font-semibold text-status-bom-texto">
            tudo ok
          </span>
        ) : (
          <span className="rounded-full bg-status-critico/10 px-2 py-0.5 font-semibold text-status-critico-texto">
            {projeto.campanhasEmDesvio} {projeto.campanhasEmDesvio === 1 ? 'precisa' : 'precisam'} atenção
          </span>
        )}
      </div>
    </button>
  )
}
