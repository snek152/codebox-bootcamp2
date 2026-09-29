export default function StreakBadge({ streak }) {
  const active = streak > 0

  return (
    <div
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ring-1 transition-shadow ${
        active
          ? 'bg-orange-500/10 text-orange-300 ring-orange-500/40 shadow-[0_0_12px_rgba(249,115,22,0.35)]'
          : 'bg-slate-800/60 text-slate-400 ring-slate-700'
      }`}
    >
      <span className={active ? 'drop-shadow-[0_0_4px_rgba(249,115,22,0.8)]' : ''}>🔥</span>
      <span>{streak} day{streak === 1 ? '' : 's'}</span>
    </div>
  )
}
