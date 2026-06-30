import { useState, type FormEvent } from 'react'
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

interface CriarProjetoDialogProps {
  trigger: React.ReactNode
  onCriar: (dados: { clienteNome: string; nicho: string; externalId: string; accessToken: string }) => void
}

const camposIniciais = { clienteNome: '', nicho: '', externalId: '', accessToken: '' }

export function CriarProjetoDialog({ trigger, onCriar }: CriarProjetoDialogProps) {
  const [open, setOpen] = useState(false)
  const [campos, setCampos] = useState(camposIniciais)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onCriar(campos)
    setCampos(camposIniciais)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar projeto</DialogTitle>
          <DialogDescription>
            Cada projeto representa um cliente com uma conta de anúncios conectada.
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
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nicho">Nicho</Label>
            <Input
              id="nicho"
              placeholder="Ex: E-commerce · Moda"
              value={campos.nicho}
              onChange={(e) => setCampos({ ...campos, nicho: e.target.value })}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="externalId">Ad Account ID (Meta Ads)</Label>
            <Input
              id="externalId"
              placeholder="Ex: act_1234567890"
              value={campos.externalId}
              onChange={(e) => setCampos({ ...campos, externalId: e.target.value })}
              required
            />
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

          <DialogFooter>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="cursor-pointer rounded-lg px-3.5 py-2 text-sm font-medium text-text-terciario transition-colors hover:bg-muted hover:text-foreground"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="cursor-pointer rounded-lg bg-marca px-3.5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Conectar e criar
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
