import { Megaphone } from 'lucide-react'
import { AppLayout } from '@/components/shared/app-layout'
import { PainelCard } from '@/components/shared/painel-card'

export function CampanhasPage() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-[1400px]">
        <PainelCard eyebrow="Campanhas">
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Megaphone className="size-6 text-text-quaternario" />
            <p className="text-sm text-text-terciario">
              Em construção. Criar, editar, pausar, arquivar e vincular criativos às campanhas vai
              aparecer aqui.
            </p>
          </div>
        </PainelCard>
      </div>
    </AppLayout>
  )
}
