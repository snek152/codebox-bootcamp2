const COLORS = {
  up: 'bg-emerald-400',
  down: 'bg-rose-400',
  pending: 'bg-zinc-400',
  paused: 'bg-amber-300',
}

export default function StatusDot({ status, pulse = false, size = 8 }) {
  const color = COLORS[status] || COLORS.pending
  return (
    <span className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      {pulse && (
        <span
          key={pulse}
          className={`absolute inline-flex rounded-full ${color} animate-ring-pulse`}
          style={{ width: size, height: size }}
        />
      )}
      <span className={`relative inline-flex rounded-full ${color}`} style={{ width: size, height: size }} />
    </span>
  )
}
