import { useState } from 'react'

export default function QuestForm({ onCreate }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [difficulty, setDifficulty] = useState('easy')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    try {
      await onCreate({ title: title.trim(), description: description.trim(), difficulty })
      setTitle('')
      setDescription('')
      setDifficulty('easy')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-slate-900/70 p-5 ring-1 ring-slate-800 shadow-lg shadow-black/20"
    >
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-violet-300">New Quest</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          type="text"
          placeholder="Quest title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-xl border-none bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none ring-1 ring-slate-700 focus:ring-violet-500"
        />
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="rounded-xl border-none bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none ring-1 ring-slate-700 focus:ring-violet-500"
        >
          <option value="easy">Easy · 10 XP</option>
          <option value="medium">Medium · 25 XP</option>
          <option value="hard">Hard · 50 XP</option>
        </select>
      </div>
      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="mt-3 w-full resize-none rounded-xl border-none bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none ring-1 ring-slate-700 focus:ring-violet-500"
      />
      <button
        type="submit"
        disabled={!title.trim() || submitting}
        className="mt-3 w-full rounded-xl bg-gradient-to-r from-violet-500 to-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? 'Adding…' : 'Add Quest'}
      </button>
    </form>
  )
}
