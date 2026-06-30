import { useId, useRef, useState } from 'react'

interface SparklineProps {
  pontos: number[]
  cor: string
  className?: string
  formatarValor?: (valor: number) => string
  rotulos?: string[]
  meta?: number
  rotuloMeta?: string
  /** Se a metrica e "melhor" subindo (ROAS, faturamento) ou descendo (CPL). Omitir para cor neutra fixa. */
  direcaoBoa?: 'subir' | 'descer'
}

const LARGURA = 240
const ALTURA = 64
const PADDING_Y = 6

const corBoa = 'var(--color-grafico-positivo)'
const corMa = 'var(--color-grafico-negativo)'

/** Calcula a cor de tendencia (boa/ma) ou retorna a cor fixa, para uso fora do componente (ex: glow do card). */
export function calcularCorTendencia(pontos: number[], cor: string, direcaoBoa?: 'subir' | 'descer') {
  if (!direcaoBoa || pontos.length < 2) return cor
  const variacao = pontos[pontos.length - 1] - pontos[0]
  return direcaoBoa === 'subir'
    ? variacao >= 0 ? corBoa : corMa
    : variacao <= 0 ? corBoa : corMa
}

/** Grafico de tendencia em area, com linha de meta, cor por direcao e tooltip interativo. */
export function Sparkline({
  pontos,
  cor,
  className,
  formatarValor,
  rotulos,
  meta,
  rotuloMeta,
  direcaoBoa,
}: SparklineProps) {
  const gradientId = useId()
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  if (pontos.length < 2) return null

  const corTendencia = calcularCorTendencia(pontos, cor, direcaoBoa)

  const valoresConsiderados = meta !== undefined ? [...pontos, meta] : pontos
  const min = Math.min(...valoresConsiderados)
  const max = Math.max(...valoresConsiderados)
  const amplitude = max - min || 1

  const paraY = (valor: number) => PADDING_Y + (ALTURA - 2 * PADDING_Y) * (1 - (valor - min) / amplitude)

  const coordenadas = pontos.map((valor, i) => {
    const x = (i / (pontos.length - 1)) * LARGURA
    return [x, paraY(valor)] as const
  })

  const linhaPath = coordenadas
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ')

  const [primeiroX] = coordenadas[0]
  const [ultimoX, ultimoY] = coordenadas[coordenadas.length - 1]
  const areaPath = `${linhaPath} L${ultimoX.toFixed(1)},${ALTURA} L${primeiroX.toFixed(1)},${ALTURA} Z`

  const linhasGrid = [0.25, 0.5, 0.75].map((fracao) => PADDING_Y + (ALTURA - 2 * PADDING_Y) * fracao)
  const yMeta = meta !== undefined ? paraY(meta) : null

  function localizarIndice(clientX: number) {
    const svg = svgRef.current
    if (!svg) return null
    const rect = svg.getBoundingClientRect()
    const xRelativo = ((clientX - rect.left) / rect.width) * LARGURA
    const passo = LARGURA / (pontos.length - 1)
    const indice = Math.round(xRelativo / passo)
    return Math.min(Math.max(indice, 0), pontos.length - 1)
  }

  const indiceAtivo = hoverIndex
  const pontoAtivo = indiceAtivo !== null ? coordenadas[indiceAtivo] : null

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${LARGURA} ${ALTURA}`}
        preserveAspectRatio="none"
        className={className}
        onMouseMove={(e) => setHoverIndex(localizarIndice(e.clientX))}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={corTendencia} stopOpacity={0.55} />
            <stop offset="100%" stopColor={corTendencia} stopOpacity={0.04} />
          </linearGradient>
        </defs>

        {linhasGrid.map((y) => (
          <line
            key={y}
            x1={0}
            y1={y}
            x2={LARGURA}
            y2={y}
            stroke="currentColor"
            className="text-border-subtle"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {yMeta !== null && (
          <line
            x1={0}
            y1={yMeta}
            x2={LARGURA}
            y2={yMeta}
            stroke="var(--color-text-quaternario)"
            strokeWidth={1}
            strokeDasharray="3,3"
            opacity={0.7}
            vectorEffect="non-scaling-stroke"
          />
        )}

        <path
          d={areaPath}
          fill={`url(#${gradientId})`}
          stroke="none"
          className="transition-[fill] duration-300"
        />
        <path
          d={linhaPath}
          fill="none"
          stroke={corTendencia}
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          className="transition-[stroke] duration-300"
        />

        {coordenadas.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={i === coordenadas.length - 1 && indiceAtivo === null ? 2.5 : 0}
            fill={corTendencia}
            className="transition-opacity duration-200"
            opacity={i === coordenadas.length - 1 && indiceAtivo === null ? 1 : 0}
          />
        ))}

        {pontoAtivo && (
          <>
            <line
              x1={pontoAtivo[0]}
              y1={0}
              x2={pontoAtivo[0]}
              y2={ALTURA}
              stroke={corTendencia}
              strokeWidth={1}
              strokeDasharray="2,2"
              opacity={0.5}
              vectorEffect="non-scaling-stroke"
            />
            <circle
              cx={pontoAtivo[0]}
              cy={pontoAtivo[1]}
              r={3}
              fill={corTendencia}
              stroke="var(--color-card)"
              strokeWidth={1.5}
              className="transition-[cx,cy] duration-100 ease-out"
            />
          </>
        )}

        <rect
          x={0}
          y={0}
          width={LARGURA}
          height={ALTURA}
          fill="transparent"
          onMouseMove={(e) => setHoverIndex(localizarIndice(e.clientX))}
        />
      </svg>

      {yMeta !== null && rotuloMeta && (
        <span
          className="pointer-events-none absolute right-0 -translate-y-1/2 whitespace-nowrap rounded-sm bg-card px-1 text-[10px] font-medium text-text-quaternario"
          style={{ top: `${(yMeta / ALTURA) * 100}%` }}
        >
          {rotuloMeta}
        </span>
      )}

      <div
        className="pointer-events-none absolute z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs font-medium text-foreground shadow-lg transition-opacity duration-150"
        style={{
          opacity: pontoAtivo ? 1 : 0,
          left: pontoAtivo ? `${(pontoAtivo[0] / LARGURA) * 100}%` : '50%',
          top: pontoAtivo && pontoAtivo[1] < ALTURA / 2 ? '100%' : 0,
          transform: `translate(-50%, ${pontoAtivo && pontoAtivo[1] < ALTURA / 2 ? '4px' : 'calc(-100% - 4px)'})`,
        }}
      >
        {pontoAtivo && indiceAtivo !== null && (
          <>
            {formatarValor ? formatarValor(pontos[indiceAtivo]) : pontos[indiceAtivo]}
            {rotulos?.[indiceAtivo] && (
              <span className="ml-1 text-text-quaternario">{rotulos[indiceAtivo]}</span>
            )}
          </>
        )}
      </div>
    </div>
  )
}
