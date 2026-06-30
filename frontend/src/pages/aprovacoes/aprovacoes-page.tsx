import { Inbox } from 'lucide-react'
import { AppLayout } from '@/components/shared/app-layout'
import { PainelCard } from '@/components/shared/painel-card'

export function AprovacoesPage() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-[1400px]">
        <PainelCard eyebrow="Aprovações">
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Inbox className="size-6 text-text-quaternario" />
            <p className="text-sm text-text-terciario">
              Em construção. A fila de aprovação (ações com dinheiro ou publicação) vai aparecer
              aqui.
            </p>
          </div>
        </PainelCard>
      </div>
    </AppLayout>
  )
}
