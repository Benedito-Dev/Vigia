import { useEffect, useRef, useState } from 'react'

const DURACAO_MS = 1400

function easeOutExpo(t: number) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

/** Anima um numero de 0 até `valor` quando `valor` muda. */
export function useCountUp(valor: number) {
  const [valorAnimado, setValorAnimado] = useState(0)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const inicio = performance.now()
    const valorInicial = 0

    function tick(agora: number) {
      const progresso = Math.min((agora - inicio) / DURACAO_MS, 1)
      const eased = easeOutExpo(progresso)
      setValorAnimado(valorInicial + (valor - valorInicial) * eased)

      if (progresso < 1) {
        frameRef.current = requestAnimationFrame(tick)
      }
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [valor])

  return valorAnimado
}
