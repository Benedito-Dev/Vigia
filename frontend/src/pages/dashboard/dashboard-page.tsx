import { useState } from 'react'
import { ArrowDown, ArrowUp, CheckCircle2, Pause } from 'lucide-react'
import { AppLayout } from '@/components/shared/app-layout'
import { PainelCard } from '@/components/shared/painel-card'
import { KpiCard } from '@/components/shared/kpi-card'
import type { EstadoStatus } from '@/components/shared/linha-status'
import { resumoPorPeriodoMock, rotuloPeriodo, type Periodo } from '@/features/dashboard/dados-mock'
import { cn } from '@/lib/utils'
import { useProjetoAtual } from '@/app/use-projeto-atual'

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
  const { projetoAtual } = useProjetoAtual()
  const [periodo, setPeriodo] = useState<Periodo>('hoje')
  const [carregando, setCarregando] = useState(false)

  const resumo = resumoPorPeriodoMock[periodo]
  const totalSaudavel = resumo.campanhas.filter((c) => c.estado === 'bom').length
  const totalAtencao = resumo.campanhas.filter((c) => c.estado === 'atencao').length
  const totalCritico = resumo.campanhas.filter((c) => c.estado === 'critico').length
  const totalAprendendo = resumo.campanhas.filter((c) => c.status === 'aprendendo').length

  function trocarPeriodo(opcao: Periodo) {
    if (opcao === periodo) return
    setCarregando(true)
    setPeriodo(opcao)
    setTimeout(() => setCarregando(false), 220)
  }

  return (
    <AppLayout>
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
                  onClick={() => trocarPeriodo(opcao)}
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

        <div
          className={cn(
            'flex flex-col gap-4 transition-opacity duration-200',
            carregando ? 'opacity-40' : 'opacity-100',
          )}
        >
        <div className="grid grid-cols-[1fr_300px] gap-4">
          {resumo.campanhasEmDesvio > 0 ? (
            <div className="relative overflow-hidden rounded-xl border border-status-critico/40 bg-card px-8 py-7 shadow-[var(--shadow-card-lg)]">
              <span className="absolute inset-y-0 left-0 w-1 bg-status-critico" />
              <p className="text-xs font-semibold uppercase tracking-wide text-status-critico-texto">
                Precisa da sua atenção
              </p>
              <p className="mt-4 text-7xl font-bold leading-none tracking-tight text-status-critico">
                {resumo.campanhasEmDesvio}
                <span className="ml-4 text-lg font-medium text-foreground">
                  de {resumo.totalCampanhas} campanhas ativas estão fora da meta
                </span>
              </p>
              <p className="mt-5 max-w-md text-sm text-foreground">
                {resumo.campanhasPausadasIa > 0 && (
                  <>O Vigia pausou {resumo.campanhasPausadasIa} campanha automaticamente por desvio crítico. </>
                )}
                Revise as campanhas marcadas abaixo — o resto está dentro do esperado.
              </p>
              <button
                type="button"
                className="mt-6 cursor-pointer rounded-lg bg-status-critico px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-button)] transition-colors hover:opacity-90"
              >
                Revisar {resumo.campanhasEmDesvio} campanhas →
              </button>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-xl border border-status-bom/40 bg-card px-8 py-7 shadow-[var(--shadow-card-lg)]">
              <span className="absolute inset-y-0 left-0 w-1 bg-status-bom" />
              <p className="text-xs font-semibold uppercase tracking-wide text-status-bom-texto">
                Tudo sob controle
              </p>
              <div className="mt-4 flex items-center gap-4">
                <CheckCircle2 className="size-12 shrink-0 text-status-bom" strokeWidth={1.75} />
                <p className="text-2xl font-bold leading-tight tracking-tight text-foreground">
                  Todas as suas campanhas estão OK
                  <span className="mt-1 block text-sm font-medium text-foreground">
                    Nenhuma campanha está fora da meta neste período.
                  </span>
                </p>
              </div>
              <p className="mt-5 text-sm text-text-terciario">
                R$ {resumo.lucroLiquido.toLocaleString('pt-BR')} de lucro líquido
              </p>
            </div>
          )}

          <div className="rounded-xl border border-border bg-card px-5 py-5 shadow-[var(--shadow-card)]">
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
              <span className="text-marca-texto">{totalAprendendo} aprendendo</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-3">
          <KpiCard
            label="Investido"
            valor={resumo.investimento}
            tendencia={resumo.tendencia.investimento}
            corValor="text-grafico-azul"
            corSparkline="var(--color-grafico-azul)"
            formatar={(v) => `R$ ${v.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
            rodape={<>de R$ {resumo.orcamento.toLocaleString('pt-BR')} orçados</>}
          />
          <KpiCard
            label="Faturamento"
            valor={resumo.faturamento}
            tendencia={resumo.tendencia.faturamento}
            corValor="text-grafico-positivo"
            corSparkline="var(--color-grafico-positivo)"
            direcaoBoa="subir"
            formatar={(v) => `R$ ${v.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
            rodape={
              <span className="flex items-center gap-1 text-status-bom-texto">
                <ArrowUp className="size-3" /> {resumo.faturamentoVarPct}% vs. período anterior
              </span>
            }
          />
          <KpiCard
            label="Lucro líquido"
            valor={resumo.lucroLiquido}
            tendencia={resumo.tendencia.lucroLiquido}
            corValor="text-grafico-positivo"
            corSparkline="var(--color-grafico-positivo)"
            direcaoBoa="subir"
            formatar={(v) => `R$ ${v.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
            rodape={
              <span className="flex items-center gap-1 text-status-bom-texto">
                <ArrowUp className="size-3" /> {resumo.lucroLiquidoVarPct}% vs. período anterior
              </span>
            }
          />
          <KpiCard
            label="CPL médio"
            valor={resumo.cplMedio}
            tendencia={resumo.tendencia.cplMedio}
            corValor="text-grafico-atencao"
            corSparkline="var(--color-grafico-atencao)"
            direcaoBoa="descer"
            meta={resumo.cplMedioMeta}
            rotuloMeta={`meta R$ ${resumo.cplMedioMeta.toFixed(2)}`}
            formatar={(v) => `R$ ${v.toFixed(2)}`}
            rodape={<>meta R$ {resumo.cplMedioMeta.toFixed(2)}</>}
          />
          <KpiCard
            label="ROAS médio"
            valor={resumo.roasMedio}
            tendencia={resumo.tendencia.roasMedio}
            corValor="text-grafico-positivo"
            corSparkline="var(--color-grafico-positivo)"
            direcaoBoa="subir"
            meta={resumo.roasMedioMeta}
            rotuloMeta={`meta ${resumo.roasMedioMeta.toFixed(1)}x`}
            formatar={(v) => `${v.toFixed(1)}x`}
            rodape={<>meta {resumo.roasMedioMeta.toFixed(1)}x</>}
          />
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
                          <span className="text-xs text-marca-texto">calibrando</span>
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
      </div>
    </AppLayout>
  )
}
