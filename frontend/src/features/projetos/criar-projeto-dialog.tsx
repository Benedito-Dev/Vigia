import { useEffect, useState, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { nichosDisponiveis } from '@/features/projetos/catalogo-benchmark'
import type { ProjetoResumo } from '@/features/dashboard/dados-mock'

interface CriarProjetoDialogProps {
  trigger: React.ReactNode
  onCriar: (dados: { clienteNome: string; nicho: string; externalId: string; accessToken: string }) => void
  projeto?: ProjetoResumo
  /** Estado assíncrono opcional: quando fornecido, o dialog só fecha no sucesso. */
  carregando?: boolean
  erro?: string | null
  /** Sinaliza sucesso para o dialog fechar (muda de false→true). */
  concluido?: boolean
}

const camposIniciais = { clienteNome: '', nicho: '', externalId: '', accessToken: '' }

export function CriarProjetoDialog({
  trigger,
  onCriar,
  projeto,
  carregando = false,
  erro = null,
  concluido,
}: CriarProjetoDialogProps) {
  const modoEdicao = Boolean(projeto)
  const [open, setOpen] = useState(false)
  const assincrono = carregando !== undefined || erro !== undefined
  const [campos, setCampos] = useState(
    projeto
      ? { clienteNome: projeto.clienteNome, nicho: projeto.nicho, externalId: projeto.conexaoMeta.externalId, accessToken: '' }
      : camposIniciais,
  )

  function handleOpenChange(novoEstado: boolean) {
    setOpen(novoEstado)
    if (novoEstado) {
      setCampos(
        projeto
          ? { clienteNome: projeto.clienteNome, nicho: projeto.nicho, externalId: projeto.conexaoMeta.externalId, accessToken: '' }
          : camposIniciais,
      )
    }
  }

  // Modo assíncrono: o dialog fecha só quando `concluido` vira true (sucesso).
  useEffect(() => {
    if (concluido) {
      if (!modoEdicao) setCampos(camposIniciais)
      setOpen(false)
    }
  }, [concluido, modoEdicao])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onCriar(campos)
    if (!assincrono) {
      if (!modoEdicao) setCampos(camposIniciais)
      setOpen(false)
    }
  }

  // Em reconexão, sinaliza quando o usuário aponta o projeto para outra conta.
  const idOriginal = projeto?.conexaoMeta.externalId ?? ''
  const contaTrocada =
    modoEdicao && campos.externalId.trim() !== '' && campos.externalId.trim() !== idOriginal
  const idAtualMascarado =
    idOriginal.length > 6 ? `${idOriginal.slice(0, 7)}••••${idOriginal.slice(-4)}` : idOriginal

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{modoEdicao ? 'Reconectar conta Meta' : 'Criar projeto'}</DialogTitle>
          <DialogDescription>
            {modoEdicao
              ? 'Renove o token para restabelecer a conexão — ou informe outra conta de anúncios, caso o cliente tenha trocado.'
              : 'Cada projeto representa um cliente com uma conta de anúncios conectada.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="clienteNome">Nome do cliente</Label>
            <Input
              id="clienteNome"
              placeholder="Ex: Loja Aurora"
              value={campos.clienteNome}
              onChange={(e) => setCampos({ ...campos, clienteNome: e.target.value })}
              disabled={modoEdicao}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Nicho</Label>
            <Select
              items={nichosDisponiveis}
              value={campos.nicho}
              onValueChange={(valor) => setCampos({ ...campos, nicho: valor as string })}
              disabled={modoEdicao}
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
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="externalId">Ad Account ID (Meta Ads)</Label>
            <Input
              id="externalId"
              placeholder="Ex: act_1234567890"
              value={campos.externalId}
              onChange={(e) => setCampos({ ...campos, externalId: e.target.value })}
              aria-invalid={contaTrocada}
              required
            />
            {modoEdicao && !contaTrocada && (
              <p className="text-[11px] text-text-quaternario">
                Mude este ID apenas se o cliente trocou de conta de anúncios.
              </p>
            )}
            {contaTrocada && (
              <p className="text-[11px] font-medium text-status-atencao">
                Você está apontando este projeto para outra conta. O histórico já registrado era da
                conta {idAtualMascarado} e permanece no projeto.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="accessToken">Access Token</Label>
            <Input
              id="accessToken"
              type="password"
              placeholder="Token de acesso da conta"
              value={campos.accessToken}
              onChange={(e) => setCampos({ ...campos, accessToken: e.target.value })}
              required
            />
          </div>

          {erro && (
            <p className="rounded-lg bg-status-critico/10 px-3.5 py-2.5 text-xs text-status-critico-texto">
              {erro}
            </p>
          )}

          <DialogFooter>
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={carregando}
              className="cursor-pointer rounded-lg px-3.5 py-2 text-sm font-medium text-text-terciario transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={carregando}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-marca px-3.5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {carregando && <Loader2 className="size-4 animate-spin" />}
              {carregando
                ? 'Validando na Meta…'
                : contaTrocada
                  ? 'Trocar conta'
                  : modoEdicao
                    ? 'Reconectar'
                    : 'Conectar e criar'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
