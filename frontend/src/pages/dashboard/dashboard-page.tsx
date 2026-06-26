import { LinhaStatus } from '@/components/shared/linha-status'

export function DashboardPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <p className="text-xs font-normal uppercase tracking-wide text-muted-foreground">
        Visão geral · hoje
      </p>
      <p className="mt-2 text-[44px] font-medium leading-none">0 campanhas em desvio</p>

      <div className="mt-10 flex flex-col gap-1">
        <LinhaStatus estado="neutro">
          <span className="text-sm">Nenhuma campanha conectada ainda</span>
        </LinhaStatus>
      </div>
    </div>
  )
}
