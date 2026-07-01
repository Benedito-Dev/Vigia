import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  PlugZap,
  RefreshCw,
  Settings,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  TriangleAlert,
} from 'lucide-react'
import { AppLayout } from '@/components/shared/app-layout'
import { PainelCard } from '@/components/shared/painel-card'
import { SubAbas, type SubAba } from '@/components/shared/sub-abas'
import { CriarProjetoDialog } from '@/features/projetos/criar-projeto-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useProjetoAtual, useProjetoSelecionado } from '@/app/use-projeto-atual'
import { nichosDisponiveis, rotuloDaFaixaDeTicket } from '@/features/projetos/catalogo-benchmark'
import { resumoPorPeriodoMock } from '@/features/dashboard/dados-mock'
import { cn } from '@/lib/utils'

type SecaoConfig = 'geral' | 'limites' | 'conexao' | 'perigo'

function mascararExternalId(externalId: string) {
  if (externalId.length <= 6) return externalId
  return `${externalId.slice(0, 7)}••••${externalId.slice(-4)}`
}

function formatarData(data: string) {
  return new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR')
}

function formatarHora(data: Date) {
  return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

/**
 * Janela de ingestão diária de métricas (RF-017 — "horário configurável,
 * ex.: 6h da manhã"). Sem backend, derivamos a última e a próxima execução
 * a partir desse horário fixo. GET /projetos/{id}/sync substitui isto depois.
 */
const HORA_INGESTAO = 6

function rotuloSync(referencia: Date, agora = new Date()) {
  const ehHoje = referencia.toDateString() === agora.toDateString()
  const amanha = new Date(agora)
  amanha.setDate(agora.getDate() + 1)
  const ehAmanha = referencia.toDateString() === amanha.toDateString()
  const ontem = new Date(agora)
  ontem.setDate(agora.getDate() - 1)
  const ehOntem = referencia.toDateString() === ontem.toDateString()

  const prefixo = ehHoje ? 'Hoje' : ehAmanha ? 'Amanhã' : ehOntem ? 'Ontem' : formatarData(referencia.toISOString().slice(0, 10))
  return `${prefixo} às ${formatarHora(referencia)}`
}

export function ConfiguracoesPage() {
  const navigate = useNavigate()
  const projetoAtual = useProjetoSelecionado()
  const { atualizarProjeto } = useProjetoAtual()
  const { conexaoMeta } = projetoAtual
  const conectado = conexaoMeta.status === 'conectado'

  // Métricas reais da operação no mês, para comparar com os limites configurados.
  const operacaoMes = resumoPorPeriodoMock.mes

  const [secao, setSecao] = useState<SecaoConfig>('geral')

  const [geral, setGeral] = useState({
    clienteNome: projetoAtual.clienteNome,
    nicho: projetoAtual.nicho,
    ticketMedio: String(projetoAtual.ticketMedio),
  })
  const [salvoGeralEm, setSalvoGeralEm] = useState<Date | null>(null)

  const [limites, setLimites] = useState({
    tetoVerbaDiaria: String(projetoAtual.limiteSeguranca.tetoVerbaDiaria),
    cplMaximo: String(projetoAtual.limiteSeguranca.cplMaximo),
    escalaMaxPctDia: String(projetoAtual.limiteSeguranca.escalaMaxPctDia),
  })
  const [salvoLimitesEm, setSalvoLimitesEm] = useState<Date | null>(null)
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false)
  const [desconectarAberto, setDesconectarAberto] = useState(false)
  const [arquivarAberto, setArquivarAberto] = useState(false)
  const [textoArquivar, setTextoArquivar] = useState('')
  const [idCopiado, setIdCopiado] = useState(false)

  async function copiarId() {
    try {
      await navigator.clipboard.writeText(conexaoMeta.externalId)
      setIdCopiado(true)
      setTimeout(() => setIdCopiado(false), 1800)
    } catch {
      // Clipboard indisponível (ex.: contexto sem HTTPS) — silencioso.
    }
  }

  useEffect(() => {
    setGeral({
      clienteNome: projetoAtual.clienteNome,
      nicho: projetoAtual.nicho,
      ticketMedio: String(projetoAtual.ticketMedio),
    })
    setLimites({
      tetoVerbaDiaria: String(projetoAtual.limiteSeguranca.tetoVerbaDiaria),
      cplMaximo: String(projetoAtual.limiteSeguranca.cplMaximo),
      escalaMaxPctDia: String(projetoAtual.limiteSeguranca.escalaMaxPctDia),
    })
    setSalvoGeralEm(null)
    setSalvoLimitesEm(null)
    // Reagir apenas à troca de projeto — depender do objeto inteiro reapagaria
    // o feedback "Salvo" no instante em que atualizarProjeto() é chamado.
  }, [projetoAtual.id])

  function salvarGeral(event: FormEvent) {
    event.preventDefault()
    atualizarProjeto({
      ...projetoAtual,
      clienteNome: geral.clienteNome,
      nicho: geral.nicho,
      ticketMedio: Number(geral.ticketMedio) || 0,
    })
    setSalvoGeralEm(new Date())
  }

  function pedirConfirmacaoLimites(event: FormEvent) {
    event.preventDefault()
    setConfirmacaoAberta(true)
  }

  function confirmarLimites() {
    const hoje = new Date().toISOString().slice(0, 10)
    atualizarProjeto({
      ...projetoAtual,
      limiteSeguranca: {
        tetoVerbaDiaria: Number(limites.tetoVerbaDiaria) || 0,
        cplMaximo: Number(limites.cplMaximo) || 0,
        escalaMaxPctDia: Number(limites.escalaMaxPctDia) || 0,
        atualizadoEm: hoje,
      },
    })
    setConfirmacaoAberta(false)
    setSalvoLimitesEm(new Date())
  }

  function reconectar(dados: { clienteNome: string; nicho: string; externalId: string; accessToken: string }) {
    atualizarProjeto({
      ...projetoAtual,
      conexaoMeta: {
        status: 'conectado',
        externalId: dados.externalId,
        conectadoEm: new Date().toISOString().slice(0, 10),
      },
    })
  }

  function confirmarDesconectar() {
    atualizarProjeto({
      ...projetoAtual,
      conexaoMeta: { ...conexaoMeta, status: 'expirado' },
    })
    setDesconectarAberto(false)
    setSecao('conexao')
  }

  function confirmarArquivar() {
    setArquivarAberto(false)
    // Sem backend ainda: volta para a camada global. O endpoint real
    // (DELETE /projetos/{id} → arquiva) substitui isto na integração.
    navigate('/projetos')
  }

  const novoCplMaximo = Number(limites.cplMaximo) || 0
  const cplAbaixoDoAtual = novoCplMaximo > 0 && novoCplMaximo < operacaoMes.cplMedio
  const novoTeto = Number(limites.tetoVerbaDiaria) || 0
  const tetoAbaixoDoInvestido = novoTeto > 0 && novoTeto < operacaoMes.investimento / 30

  const confirmacaoArquivarValida = textoArquivar.trim() === projetoAtual.clienteNome

  // Janela de sincronização derivada do horário de ingestão (ver HORA_INGESTAO).
  const agora = new Date()
  const proximaSync = new Date(agora)
  proximaSync.setHours(HORA_INGESTAO, 0, 0, 0)
  if (proximaSync <= agora) proximaSync.setDate(proximaSync.getDate() + 1)
  const ultimaSync = new Date(proximaSync)
  ultimaSync.setDate(proximaSync.getDate() - 1)

  const abas: SubAba<SecaoConfig>[] = [
    { id: 'geral', label: 'Geral', icone: <Settings className="size-4" /> },
    { id: 'limites', label: 'Limites de segurança', icone: <ShieldCheck className="size-4" /> },
    { id: 'conexao', label: 'Conexão Meta', icone: <PlugZap className="size-4" />, alerta: !conectado },
    { id: 'perigo', label: 'Zona de perigo', icone: <TriangleAlert className="size-4" /> },
  ]

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-foreground">Configurações</h1>
          <p className="text-sm text-text-terciario">
            Ajustes do projeto <span className="font-medium text-foreground">{projetoAtual.clienteNome}</span>.
            Valem somente para este projeto.
          </p>
        </header>

        {!conectado && (
          <div className="relative flex items-center justify-between gap-4 rounded-xl border border-status-critico/30 bg-status-critico/10 px-5 py-4">
            <div className="flex items-center gap-3">
              <ShieldAlert className="size-5 shrink-0 text-status-critico-texto" />
              <div>
                <p className="text-sm font-semibold text-status-critico-texto">Conexão com a Meta expirada</p>
                <p className="mt-0.5 text-xs text-status-critico-texto/80">
                  Nenhuma ação de gestão será executada até reconectar.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSecao('conexao')}
              className="shrink-0 cursor-pointer rounded-lg bg-status-critico px-3.5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Ir para conexão
            </button>
          </div>
        )}

        <SubAbas abas={abas} ativa={secao} onSelecionar={setSecao} />

        {secao === 'geral' && (
          <PainelCard eyebrow="Geral">
            <form onSubmit={salvarGeral} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="clienteNome">Nome do cliente</Label>
                  <Input
                    id="clienteNome"
                    value={geral.clienteNome}
                    onChange={(e) => setGeral({ ...geral, clienteNome: e.target.value })}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Nicho</Label>
                  <Select
                    items={nichosDisponiveis}
                    value={geral.nicho}
                    onValueChange={(valor) => setGeral({ ...geral, nicho: valor as string })}
                  >
                    <SelectTrigger aria-label="Nicho">
                      <SelectValue placeholder="Selecione o nicho" />
                    </SelectTrigger>
                    <SelectContent>
                      {nichosDisponiveis.map((nicho) => (
                        <SelectItem key={nicho} value={nicho}>
                          {nicho}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-text-quaternario">
                    Define o benchmark de mercado usado para comparar suas campanhas.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ticketMedio">Ticket médio (R$)</Label>
                <Input
                  id="ticketMedio"
                  type="number"
                  min="0"
                  step="0.01"
                  className="max-w-[200px]"
                  value={geral.ticketMedio}
                  onChange={(e) => setGeral({ ...geral, ticketMedio: e.target.value })}
                />
                <p className="text-[11px] text-text-quaternario">
                  Faixa de comparação:{' '}
                  <span className="font-medium text-text-terciario">
                    {rotuloDaFaixaDeTicket(Number(geral.ticketMedio) || 0)}
                  </span>{' '}
                  — o benchmark varia conforme a faixa de preço do seu produto.
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
                {salvoGeralEm && (
                  <p className="text-[11px] font-medium text-status-bom-texto">
                    Salvo às {formatarHora(salvoGeralEm)}
                  </p>
                )}
                <button
                  type="submit"
                  className="ml-auto cursor-pointer rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  Salvar
                </button>
              </div>
            </form>
          </PainelCard>
        )}

        {secao === 'limites' && (
          <PainelCard
            eyebrow="Limites de segurança"
            className="border-marca/25 bg-marca-fundo/30"
            acao={<SlidersHorizontal className="size-4.5 text-marca-texto" />}
          >
            <form onSubmit={pedirConfirmacaoLimites} className="flex flex-col gap-5">
              <p className="text-xs text-text-terciario">
                Tetos absolutos. A automação nunca ultrapassa esses valores, mesmo após uma ação ser
                aprovada — alterar um limite exige confirmação.
              </p>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="tetoVerbaDiaria">Teto de verba diária (R$)</Label>
                  <Input
                    id="tetoVerbaDiaria"
                    type="number"
                    min="0"
                    step="0.01"
                    value={limites.tetoVerbaDiaria}
                    onChange={(e) => setLimites({ ...limites, tetoVerbaDiaria: e.target.value })}
                    aria-invalid={tetoAbaixoDoInvestido}
                    required
                  />
                  <p className="text-[11px] text-text-quaternario">
                    Investimento médio/dia este mês: R$ {(operacaoMes.investimento / 30).toFixed(2)}
                  </p>
                  {tetoAbaixoDoInvestido && (
                    <p className="text-[11px] font-medium text-status-critico-texto">
                      Abaixo do investimento médio atual — campanhas podem ser pausadas automaticamente.
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cplMaximo">CPL máximo (R$)</Label>
                  <Input
                    id="cplMaximo"
                    type="number"
                    min="0"
                    step="0.01"
                    value={limites.cplMaximo}
                    onChange={(e) => setLimites({ ...limites, cplMaximo: e.target.value })}
                    aria-invalid={cplAbaixoDoAtual}
                    required
                  />
                  <p className="text-[11px] text-text-quaternario">
                    CPL médio atual: R$ {operacaoMes.cplMedio.toFixed(2)}
                  </p>
                  {cplAbaixoDoAtual && (
                    <p className="text-[11px] font-medium text-status-critico-texto">
                      Abaixo do CPL médio atual — pode travar campanhas em operação agora.
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="escalaMaxPctDia">Escala máx. por dia (%)</Label>
                  <Input
                    id="escalaMaxPctDia"
                    type="number"
                    min="0"
                    step="1"
                    value={limites.escalaMaxPctDia}
                    onChange={(e) => setLimites({ ...limites, escalaMaxPctDia: e.target.value })}
                    required
                  />
                  <p className="text-[11px] text-text-quaternario">
                    Quanto a verba de uma campanha pode subir em 24h.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
                <p className="text-[11px] text-text-quaternario">
                  Última alteração: {formatarData(projetoAtual.limiteSeguranca.atualizadoEm)}
                  {salvoLimitesEm && (
                    <span className="ml-2 font-medium text-status-bom-texto">
                      Salvo às {formatarHora(salvoLimitesEm)}
                    </span>
                  )}
                </p>
                <button
                  type="submit"
                  className="cursor-pointer rounded-lg bg-marca px-3.5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Salvar limites
                </button>
              </div>
            </form>
          </PainelCard>
        )}

        {secao === 'conexao' && (
          <PainelCard eyebrow="Conexão Meta Ads">
            {/* Ficha de status — uma única conta por projeto, então ela ganha destaque. */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div
                  className={cn(
                    'flex size-11 shrink-0 items-center justify-center rounded-xl',
                    conectado
                      ? 'bg-status-bom/10 text-status-bom-texto'
                      : 'bg-status-critico/10 text-status-critico-texto',
                  )}
                >
                  {conectado ? <CheckCircle2 className="size-5.5" /> : <ShieldAlert className="size-5.5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'size-2 rounded-full',
                        conectado ? 'bg-status-bom' : 'bg-status-critico',
                      )}
                    />
                    <p className="text-base font-semibold text-foreground">
                      {conectado ? 'Conectado' : 'Conexão expirada'}
                    </p>
                  </div>
                  <p className="mt-0.5 text-xs text-text-terciario">
                    {conectado
                      ? 'Monitorando a conta de anúncios deste projeto.'
                      : 'O monitoramento está parado até você reconectar.'}
                  </p>
                </div>
              </div>

              <CriarProjetoDialog
                projeto={projetoAtual}
                onCriar={reconectar}
                trigger={
                  <button
                    type="button"
                    className={cn(
                      'shrink-0 cursor-pointer rounded-lg px-3.5 py-2 text-sm font-semibold transition-opacity hover:opacity-90',
                      conectado
                        ? 'border border-border font-medium text-foreground transition-colors hover:bg-muted hover:opacity-100'
                        : 'bg-status-critico text-white',
                    )}
                  >
                    {conectado ? 'Reconectar conta' : 'Reconectar agora'}
                  </button>
                }
              />
            </div>

            {/* Grid de detalhes da conexão. */}
            <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-border pt-5 sm:grid-cols-4">
              <div className="flex flex-col gap-1">
                <p className="text-[11px] font-medium uppercase tracking-wide text-text-quaternario">
                  Ad Account ID
                </p>
                <button
                  type="button"
                  onClick={copiarId}
                  className="group flex items-center gap-1.5 text-left text-sm font-medium text-foreground"
                  aria-label="Copiar Ad Account ID"
                >
                  <span className="font-mono">{mascararExternalId(conexaoMeta.externalId)}</span>
                  {idCopiado ? (
                    <Check className="size-3.5 text-status-bom-texto" />
                  ) : (
                    <Copy className="size-3.5 text-text-quaternario transition-colors group-hover:text-text-terciario" />
                  )}
                </button>
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-[11px] font-medium uppercase tracking-wide text-text-quaternario">
                  Conectado em
                </p>
                <p className="text-sm font-medium text-foreground">
                  {formatarData(conexaoMeta.conectadoEm)}
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-text-quaternario">
                  <RefreshCw className="size-3" /> Última sincronização
                </p>
                <p className="text-sm font-medium text-foreground">
                  {conectado ? rotuloSync(ultimaSync, agora) : '—'}
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-text-quaternario">
                  <Clock className="size-3" /> Próxima sincronização
                </p>
                <p className="text-sm font-medium text-foreground">
                  {conectado ? rotuloSync(proximaSync, agora) : 'Pausada'}
                </p>
              </div>
            </div>
          </PainelCard>
        )}

        {secao === 'perigo' && (
          <PainelCard
            eyebrow="Zona de perigo"
            className="border-status-critico/25"
            acao={<TriangleAlert className="size-4.5 text-status-critico-texto" />}
          >
            <div className="flex flex-col divide-y divide-border">
              <div className="flex items-center justify-between gap-4 pb-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Desconectar conta Meta</p>
                  <p className="mt-0.5 text-xs text-text-terciario">
                    Interrompe o monitoramento e qualquer ação de gestão. O histórico é preservado e você
                    pode reconectar depois.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={!conectado}
                  onClick={() => setDesconectarAberto(true)}
                  className="shrink-0 cursor-pointer rounded-lg border border-status-critico/40 px-3.5 py-2 text-sm font-medium text-status-critico-texto transition-colors hover:bg-status-critico/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Desconectar
                </button>
              </div>

              <div className="flex items-center justify-between gap-4 pt-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Arquivar projeto</p>
                  <p className="mt-0.5 text-xs text-text-terciario">
                    Remove o projeto da sua lista e encerra todo o monitoramento. Os dados históricos
                    continuam acessíveis, mas o projeto sai de operação.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTextoArquivar('')
                    setArquivarAberto(true)
                  }}
                  className="flex shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-status-critico px-3.5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  <Trash2 className="size-4" />
                  Arquivar projeto
                </button>
              </div>
            </div>
          </PainelCard>
        )}
      </div>

      <Dialog open={confirmacaoAberta} onOpenChange={setConfirmacaoAberta}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar novo limite de segurança</DialogTitle>
            <DialogDescription>
              Esses valores são absolutos — a automação nunca os ultrapassa, mesmo após uma ação ser
              aprovada por você.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2 rounded-lg border border-border bg-secondary px-4 py-3 text-sm">
            <div className="flex justify-between">
              <span className="text-text-terciario">Teto de verba diária</span>
              <span className="font-semibold text-foreground">R$ {novoTeto.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-terciario">CPL máximo</span>
              <span className="font-semibold text-foreground">R$ {novoCplMaximo.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-terciario">Escala máx. por dia</span>
              <span className="font-semibold text-foreground">{limites.escalaMaxPctDia}%</span>
            </div>
          </div>

          {(cplAbaixoDoAtual || tetoAbaixoDoInvestido) && (
            <p className="mt-3 rounded-lg bg-status-critico/10 px-3.5 py-2.5 text-xs text-status-critico-texto">
              Atenção: este valor está abaixo do que a operação já está gastando hoje. Campanhas em
              andamento podem ser pausadas automaticamente.
            </p>
          )}

          <DialogFooter>
            <button
              type="button"
              onClick={() => setConfirmacaoAberta(false)}
              className="cursor-pointer rounded-lg px-3.5 py-2 text-sm font-medium text-text-terciario transition-colors hover:bg-muted hover:text-foreground"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmarLimites}
              className="cursor-pointer rounded-lg bg-marca px-3.5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Confirmar e aplicar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={desconectarAberto} onOpenChange={setDesconectarAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desconectar conta Meta?</DialogTitle>
            <DialogDescription>
              O monitoramento de <span className="font-medium text-foreground">{projetoAtual.clienteNome}</span>{' '}
              será interrompido até você reconectar. Nenhuma campanha é alterada na Meta por esta ação.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setDesconectarAberto(false)}
              className="cursor-pointer rounded-lg px-3.5 py-2 text-sm font-medium text-text-terciario transition-colors hover:bg-muted hover:text-foreground"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmarDesconectar}
              className="cursor-pointer rounded-lg border border-status-critico/40 px-3.5 py-2 text-sm font-semibold text-status-critico-texto transition-colors hover:bg-status-critico/10"
            >
              Desconectar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={arquivarAberto} onOpenChange={setArquivarAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Arquivar este projeto?</DialogTitle>
            <DialogDescription>
              Esta ação encerra o monitoramento e remove o projeto da sua lista. Para confirmar, digite o
              nome do cliente exatamente como aparece abaixo.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <p className="rounded-lg border border-border bg-secondary px-3.5 py-2 text-sm font-semibold text-foreground">
              {projetoAtual.clienteNome}
            </p>
            <Input
              value={textoArquivar}
              onChange={(e) => setTextoArquivar(e.target.value)}
              placeholder="Digite o nome do cliente"
              aria-label="Confirmação do nome do projeto"
            />
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setArquivarAberto(false)}
              className="cursor-pointer rounded-lg px-3.5 py-2 text-sm font-medium text-text-terciario transition-colors hover:bg-muted hover:text-foreground"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={!confirmacaoArquivarValida}
              onClick={confirmarArquivar}
              className="cursor-pointer rounded-lg bg-status-critico px-3.5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Arquivar projeto
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
