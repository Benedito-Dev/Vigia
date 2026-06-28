import { useState } from 'react'
import { ArrowDown, ArrowUp, Pause } from 'lucide-react'
import { AppLayout } from '@/components/shared/app-layout'
import { PainelCard } from '@/components/shared/painel-card'
import type { EstadoStatus } from '@/components/shared/linha-status'
import {
  projetosMock,
  resumoPorPeriodoMock,
  rotuloPeriodo,
  type Periodo,
} from '@/features/dashboard/dados-mock'
import { cn } from '@/lib/utils'

const periodos: Periodo[] = ['hoje', '7d', 'mes']

const corBarraPorEstado: Record<EstadoStatus, string> = {
  critico: 'bg-status-critico',
  atencao: 'bg-status-atencao',
  bom: 'bg-status-bom',
  neutro: 'bg-status-neutro',
}

const corTextoPorEstado: Record<EstadoStatus, string> = {
  critico: 'text-status-critico-texto',
  atencao: 'text-status-atencao',
  bom: 'text-status-bom-texto',
  neutro: 'text-text-terciario',
}

export function DashboardPage() {
  const [projetoAtual, setProjetoAtual] = useState(projetosMock[0])
  const [periodo, setPeriodo] = useState<Periodo>('hoje')

  const resumo = resumoPorPeriodoMock[periodo]
  const totalSaudavel = resumo.campanhas.filter((c) => c.estado === 'bom').length
  const totalAtencao = resumo.campanhas.filter((c) => c.estado === 'atencao').length
  const totalCritico = resumo.campanhas.filter((c) => c.estado === 'critico').length
  const totalAprendendo = resumo.campanhas.filter((c) => c.status === 'aprendendo').length

  return (
    <AppLayout projetoAtual={projetoAtual} onProjetoChange={setProjetoAtual}>
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{projetoAtual.clienteNome}</h1>
          <div className="mt-1.5 flex items-center gap-3">
            <p className="text-sm text-text-terciario">
              {resumo.totalCampanhas} campanhas ativas · {resumo.campanhasEmDesvio} precisam de atenção
            </p>
            <div className="flex gap-0.5 rounded-lg border border-border p-0.5">
              {periodos.map((opcao) => (
                <button
                  key={opcao}
                  type="button"
                  onClick={() => setPeriodo(opcao)}
                  className={cn(
                    'cursor-pointer rounded-md px-3 py-1 text-xs font-medium transition-colors',
                    periodo === opcao
                      ? 'bg-muted text-foreground'
                      : 'text-text-terciario hover:text-foreground',
                  )}
                >
                  {rotuloPeriodo[opcao]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_320px] gap-4">
          {resumo.campanhasEmDesvio > 0 ? (
            <div className="rounded-xl border border-status-critico/25 bg-status-critico/[0.05] px-7 py-6">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-status-critico-texto">
                <span className="size-1.5 rounded-full bg-status-critico" />
                Precisa da sua atenção
              </p>
              <p className="mt-3 text-5xl font-semibold leading-none tracking-tight text-foreground">
                {resumo.campanhasEmDesvio}
                <span className="ml-3 text-lg font-medium text-text-terciario">
                  de {resumo.totalCampanhas} campanhas ativas estão fora da meta
                </span>
              </p>
              <p className="mt-4 max-w-md text-sm text-text-terciario">
                {resumo.campanhasPausadasIa > 0 && (
                  <>O Vigia pausou {resumo.campanhasPausadasIa} campanha automaticamente por desvio crítico. </>
                )}
                Revise as campanhas marcadas abaixo — o resto está dentro do esperado.
              </p>
              <button
                type="button"
                className="mt-5 cursor-pointer rounded-lg bg-marca px-4 py-2 text-sm font-semibold text-[#031716] transition-colors hover:bg-marca-hover"
              >
                Revisar {resumo.campanhasEmDesvio} campanhas →
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-status-bom/25 bg-status-bom/[0.05] px-7 py-6">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-status-bom-texto">
                <span className="size-1.5 rounded-full bg-status-bom" />
                Tudo sob controle
              </p>
              <p className="mt-3 text-5xl font-semibold leading-none tracking-tight text-foreground">
                R$ {resumo.lucroLiquido.toLocaleString('pt-BR')}
                <span className="ml-3 text-lg font-medium text-text-terciario">de lucro líquido</span>
              </p>
              <p className="mt-4 max-w-md text-sm text-text-terciario">
                Nenhuma campanha está fora da meta neste período.
              </p>
            </div>
          )}

          <div className="rounded-xl border border-border bg-card px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-quaternario">
              Saúde das campanhas
            </p>
            <div className="mt-4 flex gap-1">
              {resumo.campanhas.map((c) => (
                <span key={c.id} className={cn('h-1.5 flex-1 rounded-full', corBarraPorEstado[c.estado])} />
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-y-2 text-sm">
              <span className="text-status-critico-texto">{totalCritico} críticas</span>
              <span className="text-status-atencao">{totalAtencao} em atenção</span>
              <span className="text-status-bom-texto">{totalSaudavel} saudáveis</span>
              <span className="text-marca">{totalAprendendo} aprendendo</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-3">
          <div className="rounded-lg border border-border-subtle bg-card px-4 py-3.5">
            <p className="text-xs text-text-terciario">Investido</p>
            <p className="mt-1.5 text-xl font-semibold text-foreground">
              R$ {resumo.investimento.toLocaleString('pt-BR')}
            </p>
            <p className="mt-1 text-xs text-text-quaternario">de R$ {resumo.orcamento.toLocaleString('pt-BR')} orçados</p>
          </div>
          <div className="rounded-lg border border-border-subtle bg-card px-4 py-3.5">
            <p className="text-xs text-text-terciario">Faturamento</p>
            <p className="mt-1.5 text-xl font-semibold text-marca">
              R$ {resumo.faturamento.toLocaleString('pt-BR')}
            </p>
            <p className="mt-1 flex items-center gap-1 text-xs text-status-bom-texto">
              <ArrowUp className="size-3" /> {resumo.faturamentoVarPct}% vs. período anterior
            </p>
          </div>
          <div className="rounded-lg border border-border-subtle bg-card px-4 py-3.5">
            <p className="text-xs text-text-terciario">Lucro líquido</p>
            <p className="mt-1.5 text-xl font-semibold text-foreground">
              R$ {resumo.lucroLiquido.toLocaleString('pt-BR')}
            </p>
            <p className="mt-1 flex items-center gap-1 text-xs text-status-bom-texto">
              <ArrowUp className="size-3" /> {resumo.lucroLiquidoVarPct}% vs. período anterior
            </p>
          </div>
          <div className="rounded-lg border border-border-subtle bg-card px-4 py-3.5">
            <p className="text-xs text-text-terciario">CPL médio</p>
            <p className="mt-1.5 text-xl font-semibold text-status-atencao">R$ {resumo.cplMedio.toFixed(2)}</p>
            <p className="mt-1 text-xs text-text-quaternario">meta R$ {resumo.cplMedioMeta.toFixed(2)}</p>
          </div>
          <div className="rounded-lg border border-border-subtle bg-card px-4 py-3.5">
            <p className="text-xs text-text-terciario">ROAS médio</p>
            <p className="mt-1.5 text-xl font-semibold text-status-bom-texto">{resumo.roasMedio.toFixed(1)}x</p>
            <p className="mt-1 text-xs text-text-quaternario">meta {resumo.roasMedioMeta.toFixed(1)}x</p>
          </div>
        </div>

        <PainelCard eyebrow={`Campanhas · ${resumo.totalCampanhas} ativas`}>
          <div className="grid grid-cols-[1fr_160px_200px_100px] gap-4 border-b border-border-subtle pb-2.5 text-xs font-medium uppercase tracking-wide text-text-quaternario">
            <span>Campanha</span>
            <span>KPI principal</span>
            <span>vs. benchmark</span>
            <span className="text-right">Investido</span>
          </div>

          <div className="flex flex-col">
            {resumo.campanhas.length === 0 ? (
              <p className="py-6 text-sm text-text-terciario">Nenhuma campanha conectada ainda</p>
            ) : (
              resumo.campanhas.map((campanha) => {
                const desvioAbs = Math.min(Math.abs(campanha.desvioPct), 100)
                return (
                  <div
                    key={campanha.id}
                    className="grid grid-cols-[1fr_160px_200px_100px] items-center gap-4 border-b border-border-subtle py-3.5 last:border-b-0"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={cn('h-7 w-[3px] shrink-0 rounded-none', corBarraPorEstado[campanha.estado])} />
                      <div>
                        <p className="text-[15px] font-medium text-foreground">{campanha.nome}</p>
                        {campanha.status === 'aprendendo' && (
                          <span className="text-xs text-marca">calibrando</span>
                        )}
                        {campanha.status === 'pausada_ia' && (
                          <span className="flex items-center gap-1 text-xs text-status-critico-texto">
                            <Pause className="size-3" /> pausada pela IA
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-[15px] font-medium text-foreground">
                        {campanha.kpiPrincipal === 'ROAS' ? `${campanha.valorAtual.toFixed(1)}x` : `R$ ${campanha.valorAtual.toFixed(2)}`}
                      </p>
                      <p className="text-xs text-text-quaternario">
                        {campanha.kpiPrincipal === 'CPL' ? 'custo por lead' : 'retorno sobre investimento'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="h-1.5 flex-1 rounded-full bg-muted">
                        <div
                          className={cn('h-1.5 rounded-full', corBarraPorEstado[campanha.estado])}
                          style={{ width: `${desvioAbs}%` }}
                        />
                      </div>
                      <span className={cn('flex items-center gap-0.5 text-xs font-medium', corTextoPorEstado[campanha.estado])}>
                        {campanha.desvioPct > 0 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
                        {Math.abs(campanha.desvioPct)}%
                      </span>
                    </div>

                    <p className="text-right text-sm text-text-terciario">
                      R$ {campanha.verbaDiaria.toLocaleString('pt-BR')}
                    </p>
                  </div>
                )
              })
            )}
          </div>
        </PainelCard>
      </div>
    </AppLayout>
  )
}
