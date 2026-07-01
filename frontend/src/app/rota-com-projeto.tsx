import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useProjetoAtual } from '@/app/use-projeto-atual'

/**
 * Protege as rotas da camada de projeto (dashboard, campanhas, configurações).
 * Sem um projeto selecionado, não há o que mostrar — manda o usuário escolher
 * um na lista de projetos. Evita telas com "projeto fantasma".
 */
export function RotaComProjeto({ children }: { children: ReactNode }) {
  const { projetoAtual } = useProjetoAtual()
  if (!projetoAtual) {
    return <Navigate to="/projetos" replace />
  }
  return children
}
