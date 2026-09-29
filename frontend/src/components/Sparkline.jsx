// Hand-written SVG sparkline. history: [{latencyMs, ok, checkedAt}] oldest first.
export default function Sparkline({ history = [], width = 160, height = 36, ok = true }) {
  const pts = history.filter((h) => h.latencyMs != null)
  if (pts.length < 2) {
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="currentColor"
          strokeOpacity="0.15"
          strokeDasharray="2 4"
        />
      </svg>
    )
  }
  const max = Math.max(...pts.map((p) => p.latencyMs), 1)
  const min = Math.min(...pts.map((p) => p.latencyMs), 0)
  const range = Math.max(max - min, 1)
  const step = width / (pts.length - 1)
  const coords = pts.map((p, i) => {
    const x = i * step
    const y = height - ((p.latencyMs - min) / range) * (height - 6) - 3
    return [x, y]
  })
  const d = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const color = ok ? '#34d399' : '#fb7185'
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <g className="transition-transform duration-500 ease-fluid">
        <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={coords[coords.length - 1][0]} cy={coords[coords.length - 1][1]} r="2" fill={color} />
      </g>
    </svg>
  )
}
