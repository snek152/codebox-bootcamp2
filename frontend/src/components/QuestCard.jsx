const DIFFICULTY_STYLES = {
  easy: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/40',
  medium: 'bg-amber-500/15 text-amber-300 ring-amber-500/40',
  hard: 'bg-rose-500/15 text-rose-300 ring-rose-500/40',
}

export default function QuestCard({ quest, onComplete, onDelete }) {
  const badgeStyle = DIFFICULTY_STYLES[quest.difficulty] || DIFFICULTY_STYLES.easy

  return (
    <div className="animate-card-in rounded-2xl bg-slate-900/70 p-5 ring-1 ring-slate-800 shadow-lg shadow-black/20 transition-transform hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3
            className={`text-lg font-semibold text-slate-100 ${
              quest.completed ? 'line-through text-slate-500' : ''
            }`}
          >
            {quest.completed && <span className="mr-1.5 text-emerald-400">✓</span>}
            {quest.title}
          </h3>
          {quest.description && (
            <p className={`mt-1 text-sm text-slate-400 ${quest.completed ? 'line-through' : ''}`}>
              {quest.description}
            </p>
          )}
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${badgeStyle}`}>
          {quest.difficulty}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm font-medium text-violet-300">+{quest.xpValue} XP</span>
        <div className="flex gap-2">
          <button
            onClick={() => onComplete(quest)}
            disabled={quest.completed}
            className="rounded-xl bg-emerald-500 px-3 py-1.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {quest.completed ? 'Completed' : 'Complete'}
          </button>
          <button
            onClick={() => onDelete(quest)}
            className="rounded-xl bg-slate-800 px-3 py-1.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-rose-500/20 hover:text-rose-300"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
