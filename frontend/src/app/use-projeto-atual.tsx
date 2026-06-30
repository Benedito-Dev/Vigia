import { createContext, useContext, useState, type ReactNode } from 'react'
import { projetosMock, type ProjetoResumo } from '@/features/dashboard/dados-mock'

interface ProjetoAtualContextValue {
  projetoAtual: ProjetoResumo
  selecionarProjeto: (projeto: ProjetoResumo) => void
  atualizarProjeto: (projeto: ProjetoResumo) => void
}

const ProjetoAtualContext = createContext<ProjetoAtualContextValue | null>(null)

export function ProjetoAtualProvider({ children }: { children: ReactNode }) {
  const [projetoAtual, setProjetoAtual] = useState<ProjetoResumo>(projetosMock[0])

  return (
    <ProjetoAtualContext.Provider
      value={{ projetoAtual, selecionarProjeto: setProjetoAtual, atualizarProjeto: setProjetoAtual }}
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
