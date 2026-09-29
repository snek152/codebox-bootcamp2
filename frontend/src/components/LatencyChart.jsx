// Larger hand-written SVG latency chart with gridlines and gradient fill.
export default function LatencyChart({ history = [], height = 220 }) {
  const width = 640
  const pts = history.filter((h) => h.latencyMs != null)

  if (pts.length < 2) {
    return (
      <div
        className="flex items-center justify-center text-sm text-zinc-500"
        style={{ height }}
      >
        Waiting for enough checks to draw a trace…
      </div>
    )
  }

  const max = Math.max(...pts.map((p) => p.latencyMs), 1)
  const min = Math.min(...pts.map((p) => p.latencyMs), 0)
  const range = Math.max(max - min, 1)
  const step = width / (pts.length - 1)
  const padY = 16
  const coords = pts.map((p, i) => {
    const x = i * step
    const y = height - padY - ((p.latencyMs - min) / range) * (height - padY * 2)
    return [x, y, p.ok]
  })
  const line = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = `${line} L${width},${height} L0,${height} Z`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible" preserveAspectRatio="none">
      <defs>
        <linearGradient id="latencyFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line
          key={f}
          x1="0"
          x2={width}
          y1={height * f}
          y2={height * f}
          stroke="white"
          strokeOpacity="0.06"
        />
      ))}
      <path d={area} fill="url(#latencyFill)" className="transition-all duration-700 ease-fluid" />
      <path
        d={line}
        fill="none"
        stroke="#34d399"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-all duration-700 ease-fluid"
      />
      {coords.map(([x, y, ok], i) =>
        ok ? null : <circle key={i} cx={x} cy={y} r="3" fill="#fb7185" />,
      )}
    </svg>
  )
}
