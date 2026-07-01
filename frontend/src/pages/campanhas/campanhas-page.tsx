import { useMemo, useState } from 'react'
import { Loader2, Megaphone, TriangleAlert } from 'lucide-react'
import { AppLayout } from '@/components/shared/app-layout'
import { PainelCard } from '@/components/shared/painel-card'
import { useCampanhas } from '@/features/campanhas/use-campanhas'
import { extrairMensagemDeErro } from '@/features/auth/use-login'
import { useProjetoSelecionado } from '@/app/use-projeto-atual'
import { formatarReais, formatarReaisCurto, formatarRoas } from '@/lib/formato'
import type { CampanhaApi } from '@/types/projeto'
import { cn } from '@/lib/utils'

type FiltroStatus = 'todas' | 'ativas' | 'pausadas'

const filtros: { id: FiltroStatus; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'ativas', label: 'Ativas' },
  { id: 'pausadas', label: 'Pausadas' },
]

// Objetivos vêm em inglês da Meta (OUTCOME_LEADS etc.) — rótulo amigável.
const rotuloObjetivo: Record<string, string> = {
  OUTCOME_LEADS: 'Leads',
  OUTCOME_SALES: 'Vendas',
  OUTCOME_ENGAGEMENT: 'Engajamento',
  OUTCOME_AWARENESS: 'Reconhecimento',
  OUTCOME_TRAFFIC: 'Tráfego',
  OUTCOME_APP_PROMOTION: 'App',
}

function ativa(status: string) {
  return status.toUpperCase() === 'ACTIVE'
}

function casaNoFiltro(campanha: CampanhaApi, filtro: FiltroStatus) {
  if (filtro === 'todas') return true
  if (filtro === 'ativas') return ativa(campanha.status)
  return !ativa(campanha.status)
}

export function CampanhasPage() {
  const projetoAtual = useProjetoSelecionado()
  const { data, isLoading, isError, error, refetch } = useCampanhas(projetoAtual.id)
  const [filtro, setFiltro] = useState<FiltroStatus>('todas')

  const campanhas = data ?? []
  const visiveis = useMemo(() => campanhas.filter((c) => casaNoFiltro(c, filtro)), [campanhas, filtro])
  const totalAtivas = campanhas.filter((c) => ativa(c.status)).length

  return (
    <AppLayout>
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Campanhas</h1>
          <p className="mt-1 text-sm text-text-terciario">
            {totalAtivas} ativas · {campanhas.length} no total · dados ao vivo da conta conectada
          </p>
        </div>

        <div className="flex gap-0.5 self-start rounded-lg border border-border p-0.5">
          {filtros.map((opcao) => {
            const qtd = campanhas.filter((c) => casaNoFiltro(c, opcao.id)).length
            return (
              <button
                key={opcao.id}
                type="button"
                onClick={() => setFiltro(opcao.id)}
                className={cn(
                  'cursor-pointer rounded-md px-3 py-1 text-xs font-medium transition-colors',
                  filtro === opcao.id
                    ? 'bg-muted text-foreground'
                    : 'text-text-terciario hover:text-foreground',
                )}
              >
                {opcao.label}
                <span className="ml-1.5 text-text-quaternario">{qtd}</span>
              </button>
            )
          })}
        </div>

        <PainelCard eyebrow={`Campanhas · ${filtros.find((f) => f.id === filtro)?.label}`}>
          <div className="grid grid-cols-[1fr_140px_110px_110px_110px_120px] gap-4 border-b border-border pb-2.5 text-xs font-medium uppercase tracking-wide text-text-quaternario">
            <span>Campanha</span>
            <span>Objetivo</span>
            <span className="text-right">Investido</span>
            <span className="text-right">CPL</span>
            <span className="text-right">ROAS</span>
            <span className="text-right">Verba/dia</span>
          </div>

          <div className="flex flex-col">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-14 text-sm text-text-terciario">
                <Loader2 className="size-4 animate-spin" /> Carregando campanhas…
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center gap-2 py-14 text-center">
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
            ) : visiveis.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-14 text-center">
                <Megaphone className="size-6 text-text-quaternario" />
                <p className="text-sm text-text-terciario">Nenhuma campanha neste filtro.</p>
              </div>
            ) : (
              visiveis.map((campanha) => (
                <div
                  key={campanha.externalId}
                  className="grid grid-cols-[1fr_140px_110px_110px_110px_120px] items-center gap-4 border-b border-border py-3.5 last:border-b-0"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        'h-7 w-[3px] shrink-0 rounded-none',
                        ativa(campanha.status) ? 'bg-status-bom' : 'bg-status-neutro',
                      )}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-medium text-foreground">{campanha.nome}</p>
                      <p className="mt-0.5 text-xs text-text-quaternario">
                        {ativa(campanha.status) ? 'Ativa' : 'Pausada'}
                      </p>
                    </div>
                  </div>

                  <span className="text-sm text-text-terciario">
                    {rotuloObjetivo[campanha.objetivo] ?? campanha.objetivo}
                  </span>

                  <span className="text-right text-sm font-medium text-foreground">
                    {formatarReaisCurto(campanha.investido)}
                  </span>

                  <span className="text-right text-sm text-text-terciario">
                    {formatarReais(campanha.cpl)}
                  </span>

                  <span className="text-right text-sm text-text-terciario">
                    {formatarRoas(campanha.roas)}
                  </span>

                  <span className="text-right text-sm text-text-terciario">
                    {formatarReaisCurto(campanha.verbaDiaria)}
                  </span>
                </div>
              ))
            )}
          </div>
        </PainelCard>

        <p className="text-xs text-text-quaternario">
          "—" indica dado que a conta não fornece (ex.: ROAS sem pixel de conversão instalado). Ações de
          gestão (pausar, editar, criar) entram num próximo passo.
        </p>
      </div>
    </AppLayout>
  )
}
