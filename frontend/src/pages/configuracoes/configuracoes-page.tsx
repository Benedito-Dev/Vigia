import { useState } from 'react'
import { Settings } from 'lucide-react'
import { AppLayout } from '@/components/shared/app-layout'
import { PainelCard } from '@/components/shared/painel-card'
import { projetosMock } from '@/features/dashboard/dados-mock'

export function ConfiguracoesPage() {
  const [projetoAtual, setProjetoAtual] = useState(projetosMock[0])

  return (
    <AppLayout projetoAtual={projetoAtual} onProjetoChange={setProjetoAtual}>
      <div className="mx-auto max-w-[1400px]">
        <PainelCard eyebrow="Configurações">
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Settings className="size-6 text-text-quaternario" />
            <p className="text-sm text-text-terciario">
              Em construção. Limites de segurança e conexão de conta Meta vão aparecer
              aqui.
            </p>
          </div>
        </PainelCard>
      </div>
    </AppLayout>
  )
}
