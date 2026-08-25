/**
 * Gráficos SVG leves para o dashboard de analytics.
 * Zero dependências — mantém o bundle enxuto (filosofia do projeto).
 */

const ACCENT = '#8B7550'
const MUTED = '#6b6b6b'
const BORDER = '#e8e8e4'

export interface BarDatum {
  label: string
  value: number
}

function niceMax(values: number[]): number {
  const max = Math.max(1, ...values)
  const step = 10 ** Math.floor(Math.log10(max))
  const norm = max / step
  const nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10
  return nice * step
}

/** Gráfico de barras horizontais (ideal para top páginas/origens/dispositivos). */
export function BarChart({
  data,
  maxItems = 10,
  height = 260,
}: {
  data: BarDatum[]
  maxItems?: number
  height?: number
}) {
  const items = data.slice(0, maxItems)
  if (items.length === 0) {
    return <EmptyChart />
  }
  const max = niceMax(items.map((d) => d.value))
  const barH = 24
  const gap = 12
  const chartH = items.length * (barH + gap) + 8

  return (
    <div className="w-full">
      <svg viewBox={`0 0 100 ${chartH}`} width="100%" height={height} className="block">
        {items.map((d, i) => {
          const w = (d.value / max) * 100
          const y = i * (barH + gap) + gap
          return (
            <g key={d.label}>
              <text fill={MUTED} fontSize="9" dy="6">
                {truncate(d.label, 20)}
              </text>
              <rect
                x="0"
                y={y}
                width={w}
                height={barH}
                rx="3"
                fill={ACCENT}
                opacity="0.85"
              />
              <text x={w + 1} y={y + barH / 2} fill={MUTED} fontSize="9">
                {d.value}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/** Gráfico de linha/área para a evolução temporal. */
export function LineChart({
  labels,
  values,
  height = 220,
}: {
  labels: string[]
  values: number[]
  height?: number
}) {
  if (labels.length === 0 || values.length === 0) {
    return <EmptyChart />
  }
  const W = 680
  const H = height
  const padL = 34
  const padR = 12
  const padT = 10
  const padB = 24
  const innerW = W - padL - padR
  const innerH = H - padT - padB
  const maxV = niceMax(values)
  const minX = padL
  const stepX = values.length > 1 ? innerW / (values.length - 1) : 0

  const points = values.map((v, i) => {
    const x = minX + i * stepX
    const y = padT + innerH - (v / maxV) * innerH
    return { x, y }
  })

  const path = points.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const areaPath =
    path +
    ` L${(minX + (values.length - 1) * stepX).toFixed(1)},${(padT + innerH).toFixed(1)}` +
    ` L${minX.toFixed(1)},${(padT + innerH).toFixed(1)} Z`

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={height} role="img" aria-label="Evolução">
        {/* grid + labels y */}
        {[0, 0.25, 0.5, 0.75, 1].map((f) => {
          const y = padT + innerH - f * innerH
          return (
            <g key={f}>
              <line
                x1={padL}
                x2={W - padR}
                y1={y}
                y2={y}
                stroke={BORDER}
                strokeWidth="1"
              />
              <text x={padL - 6} y={y + 3} fontSize="9" fill={MUTED} textAnchor="end">
                {Math.round(maxV * f)}
              </text>
            </g>
          )
        })}
        {/* área + linha */}
        <path d={areaPath} fill={ACCENT} opacity="0.12" />
        <path d={path} fill="none" stroke={ACCENT} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {/* pontos + labels x */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3" fill="#fff" stroke={ACCENT} strokeWidth="2" />
            {(i % Math.ceil(values.length / 8) === 0 || i === values.length - 1) && (
              <text x={p.x} y={H - 6} fontSize="9" fill={MUTED} textAnchor="middle">
                {labels[i]}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  )
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value
}

function EmptyChart() {
  return (
    <div className="flex h-40 w-full items-center justify-center text-sm text-[var(--color-muted)]">
      Sem dados no período
    </div>
  )
}