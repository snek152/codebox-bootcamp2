import { useEffect, useState } from 'react'
import { getMe, getQuests, createQuest, updateQuest, deleteQuest } from '../api/client.js'
import LevelBar from '../components/LevelBar.jsx'
import StreakBadge from '../components/StreakBadge.jsx'
import QuestForm from '../components/QuestForm.jsx'
import QuestCard from '../components/QuestCard.jsx'

export default function Dashboard({ onLogout }) {
  const [me, setMe] = useState(null)
  const [quests, setQuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pulse, setPulse] = useState(false)
  const [toast, setToast] = useState('')

  async function loadAll() {
    setLoading(true)
    setError('')
    try {
      const [meData, questData] = await Promise.all([getMe(), getQuests()])
      setMe(meData)
      setQuests(questData)
    } catch (err) {
      setError(err.message || 'Failed to load your dashboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  async function handleCreate(payload) {
    const quest = await createQuest(payload)
    setQuests((prev) => [quest, ...prev])
  }

  async function handleComplete(quest) {
    const previousLevel = me?.level ?? 1
    const updated = await updateQuest(quest.id, { completed: true })
    setQuests((prev) => prev.map((q) => (q.id === updated.id ? updated : q)))

    const freshMe = await getMe()
    setMe(freshMe)

    if (freshMe.level > previousLevel) {
      setPulse(true)
      setToast(`Level up! You're now level ${freshMe.level} 🎉`)
      setTimeout(() => setPulse(false), 700)
      setTimeout(() => setToast(''), 3000)
    }
  }

  async function handleDelete(quest) {
    await deleteQuest(quest.id)
    setQuests((prev) => prev.filter((q) => q.id !== quest.id))
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-violet-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="max-w-sm rounded-2xl bg-slate-900/70 p-6 text-center ring-1 ring-slate-800">
          <p className="mb-4 text-rose-300">{error}</p>
          <button
            onClick={loadAll}
            className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-violet-400"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.12),_transparent_60%)] pb-16">
      {toast && (
        <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2 rounded-xl bg-gradient-to-r from-violet-500 to-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg animate-card-in">
          {toast}
        </div>
      )}

      <header className="mx-auto max-w-3xl px-4 pt-10">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-3xl font-extrabold text-transparent">
              Questly
            </h1>
            <p className="mt-1 text-sm text-slate-400">Level up your real life.</p>
          </div>
          <button
            onClick={onLogout}
            className="rounded-xl bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-slate-700"
          >
            Log out
          </button>
        </div>

        <div className="mt-6 rounded-2xl bg-slate-900/70 p-5 ring-1 ring-slate-800 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between gap-4">
            <span className="text-lg font-semibold text-slate-100">
              {me?.username ? `Welcome, ${me.username}` : 'Welcome'}
            </span>
            <StreakBadge streak={me?.streak ?? 0} />
          </div>
          <div className="mt-4">
            <LevelBar xp={me?.xp ?? 0} level={me?.level ?? 1} pulse={pulse} />
          </div>
        </div>
      </header>

      <main className="mx-auto mt-8 max-w-3xl space-y-6 px-4">
        <QuestForm onCreate={handleCreate} />

        {quests.length === 0 ? (
          <p className="text-center text-sm text-slate-500">
            No quests yet — add your first one above and start earning XP.
          </p>
        ) : (
          <div className="space-y-4">
            {quests.map((quest) => (
              <QuestCard key={quest.id} quest={quest} onComplete={handleComplete} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
