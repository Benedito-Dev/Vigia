import { createContext, useContext, useState, type ReactNode } from 'react'
import type { ProjetoResumo } from '@/features/dashboard/dados-mock'

interface ProjetoAtualContextValue {
  /** Projeto selecionado, ou null quando o usuário ainda não escolheu nenhum. */
  projetoAtual: ProjetoResumo | null
  selecionarProjeto: (projeto: ProjetoResumo) => void
  atualizarProjeto: (projeto: ProjetoResumo) => void
  limparProjeto: () => void
}

const ProjetoAtualContext = createContext<ProjetoAtualContextValue | null>(null)

export function ProjetoAtualProvider({ children }: { children: ReactNode }) {
  // Começa sem projeto: o usuário escolhe um real na tela de Projetos.
  // Nada de projeto fantasma vindo de mock.
  const [projetoAtual, setProjetoAtual] = useState<ProjetoResumo | null>(null)

  return (
    <ProjetoAtualContext.Provider
      value={{
        projetoAtual,
        selecionarProjeto: setProjetoAtual,
        atualizarProjeto: setProjetoAtual,
        limparProjeto: () => setProjetoAtual(null),
      }}
    >
      {children}
    </ProjetoAtualContext.Provider>
  )
}

export function useProjetoAtual() {
  const context = useContext(ProjetoAtualContext)
  if (!context) {
    throw new Error('useProjetoAtual deve ser usado dentro de ProjetoAtualProvider')
  }
  return context
}

/**
 * Hook para telas DENTRO da camada de projeto (dashboard, campanhas, config).
 * Garante um projeto não-nulo — quem usa está sempre protegido pela
 * RotaComProjeto, então lançar aqui só aconteceria por erro de programação.
 */
export function useProjetoSelecionado(): ProjetoResumo {
  const { projetoAtual } = useProjetoAtual()
  if (!projetoAtual) {
    throw new Error('Nenhum projeto selecionado — rota deveria estar protegida por RotaComProjeto.')
  }
  return projetoAtual
}
