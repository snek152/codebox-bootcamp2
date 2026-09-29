export default function LevelBar({ xp, level, pulse }) {
  const progress = xp % 100

  return (
    <div className={`w-full ${pulse ? 'animate-level-up-pulse' : ''}`}>
      <div className="flex items-center justify-between mb-1 text-sm">
        <span className="font-semibold text-violet-300">Level {level}</span>
        <span className="text-slate-400">{progress} / 100 XP</span>
      </div>
      <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden ring-1 ring-slate-700">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-400 transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
