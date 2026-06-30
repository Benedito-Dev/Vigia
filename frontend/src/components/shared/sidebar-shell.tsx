import { useLocation } from 'react-router-dom'
import { AppSidebar } from '@/components/shared/app-sidebar'
import { GlobalSidebar } from '@/components/shared/global-sidebar'
import { cn } from '@/lib/utils'

const SIDEBAR_WIDTH = 256

export function SidebarShell() {
  const location = useLocation()
  const nivelGlobal = location.pathname.startsWith('/projetos') || location.pathname.startsWith('/equipe')

  return (
    <div className="relative h-svh w-64 shrink-0 overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 flex transition-transform duration-300 ease-out"
        style={{
          width: SIDEBAR_WIDTH * 2,
          transform: nivelGlobal ? 'translateX(0)' : `translateX(-${SIDEBAR_WIDTH}px)`,
        }}
      >
        <div className={cn('w-64 shrink-0 transition-opacity duration-300', nivelGlobal ? 'opacity-100' : 'opacity-0')}>
          <GlobalSidebar />
        </div>
        <div className={cn('w-64 shrink-0 transition-opacity duration-300', nivelGlobal ? 'opacity-0' : 'opacity-100')}>
          <AppSidebar />
        </div>
      </div>
    </div>
  )
}
