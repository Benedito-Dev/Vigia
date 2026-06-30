import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Tema = 'light' | 'dark'

interface ThemeContextValue {
  tema: Tema
  alternarTema: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const CHAVE_STORAGE = 'vigia-tema'

function temaInicial(): Tema {
  const salvo = localStorage.getItem(CHAVE_STORAGE)
  return salvo === 'light' ? 'light' : 'dark'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>(temaInicial)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', tema === 'dark')
    localStorage.setItem(CHAVE_STORAGE, tema)
  }, [tema])

  function alternarTema() {
    setTema((atual) => (atual === 'dark' ? 'light' : 'dark'))
  }

  return <ThemeContext.Provider value={{ tema, alternarTema }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider')
  }
  return context
}
