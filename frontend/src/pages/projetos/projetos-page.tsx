import { useNavigate } from 'react-router-dom'
import { ArrowRight, Loader2, LogOut, Moon, Plus, Sun, TriangleAlert } from 'lucide-react'
import { logout } from '@/features/auth/use-auth'
import { CriarProjetoDialog } from '@/features/projetos/criar-projeto-dialog'
import { useProjetos, useConectarProjeto } from '@/features/projetos/use-projetos'
import { mapearProjeto } from '@/features/projetos/mapear-projeto'
import { extrairMensagemDeErro } from '@/features/auth/use-login'
import type { ProjetoResumo } from '@/features/dashboard/dados-mock'
import { useProjetoAtual } from '@/app/use-projeto-atual'
import { useTheme } from '@/app/use-theme'
import { VigiaLogo } from '@/components/shared/vigia-logo'

export function ProjetosPage() {
  const navigate = useNavigate()
  const { tema, alternarTema } = useTheme()
  const { selecionarProjeto } = useProjetoAtual()
  const { data, isLoading, isError, error, refetch } = useProjetos()
  const conectar = useConectarProjeto()

  const projetos = (data ?? []).map(mapearProjeto)

  function abrirProjeto(projeto: ProjetoResumo) {
    selecionarProjeto(projeto)
    navigate('/')
  }

  function criarProjeto(dados: {
    clienteNome: string
    nicho: string
    externalId: string
    accessToken: string
  }) {
    conectar.mutate(
      {
        clienteNome: dados.clienteNome,
        nicho: dados.nicho,
        externalId: dados.externalId,
        accessToken: dados.accessToken,
      },
      {
        onSuccess: (novo) => abrirProjeto(mapearProjeto(novo)),
      },
    )
  }

  if (isLoading) {
    return (
      <div className="flex-1">
        <div className="flex h-svh items-center justify-center text-text-terciario">
          <Loader2 className="size-5 animate-spin" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex-1">
        <div className="mx-auto mt-24 flex max-w-md flex-col items-center gap-3 text-center">
          <TriangleAlert className="size-6 text-status-critico-texto" />
          <p className="text-sm text-text-terciario">{extrairMensagemDeErro(error)}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="cursor-pointer rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

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
                  carregando={conectar.isPending}
                  erro={conectar.isError ? extrairMensagemDeErro(conectar.error) : null}
                  concluido={conectar.isSuccess}
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

              <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(450px,1fr))] gap-4">
                {projetos.map((projeto) => (
                  <ProjetoCard key={projeto.id} projeto={projeto} onClick={() => abrirProjeto(projeto)} />
                ))}

                <CriarProjetoDialog
                  onCriar={criarProjeto}
                  carregando={conectar.isPending}
                  erro={conectar.isError ? extrairMensagemDeErro(conectar.error) : null}
                  concluido={conectar.isSuccess}
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
                  carregando={conectar.isPending}
                  erro={conectar.isError ? extrairMensagemDeErro(conectar.error) : null}
                  concluido={conectar.isSuccess}
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
        </main>
    </div>
  )
}

const CORES_AVATAR = [
  'bg-marca text-white',
  'bg-status-bom text-white',
  'bg-status-critico text-white',
  'bg-status-atencao text-white',
  'bg-violet-500 text-white',
  'bg-pink-500 text-white',
  'bg-teal-500 text-white',
]

function corAvatar(nome: string) {
  let hash = 0
  for (let i = 0; i < nome.length; i++) {
    hash = nome.charCodeAt(i) + ((hash << 5) - hash)
  }
  return CORES_AVATAR[Math.abs(hash) % CORES_AVATAR.length]
}

function ProjetoCard({ projeto, onClick }: { projeto: ProjetoResumo; onClick: () => void }) {
  const saudavel = projeto.campanhasEmDesvio === 0

  return (
    <div
      onClick={onClick}
      className="relative cursor-pointer overflow-hidden rounded-xl border border-border bg-card px-5 py-5 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5"
    >
      <span className={saudavel ? 'absolute inset-y-0 left-0 w-1 bg-status-bom' : 'absolute inset-y-0 left-0 w-1 bg-status-critico'} />

      <div className="flex items-center gap-3">
        <div
          className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${corAvatar(projeto.clienteNome)}`}
        >
          {projeto.clienteNome.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-base font-bold text-foreground">{projeto.clienteNome}</p>
          <p className="text-xs text-text-terciario">{projeto.nicho}</p>
        </div>
      </div>

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

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3 text-xs text-text-terciario">
        <span className="shrink-0">{projeto.campanhasAtivas} campanhas ativas</span>
        {saudavel ? (
          <span className="shrink-0 rounded-full bg-status-bom/10 px-2 py-0.5 font-semibold whitespace-nowrap text-status-bom-texto">
            tudo ok
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-status-critico/10 px-2 py-0.5 font-semibold whitespace-nowrap text-status-critico-texto">
            {projeto.campanhasEmDesvio} {projeto.campanhasEmDesvio === 1 ? 'precisa' : 'precisam'} atenção
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
        className="mt-4 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        abrir
        <ArrowRight className="size-3.5" />
      </button>
    </div>
  )
}
