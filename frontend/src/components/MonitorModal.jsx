import { useEffect, useState } from 'react'
import { X, Lightning } from '@phosphor-icons/react'
import Bezel from './Bezel.jsx'
import Button from './Button.jsx'

const DEMO = {
  name: 'Demo: flaky service',
  url: 'http://localhost:3000/api/demo/flaky',
  intervalSec: 5,
}

export default function MonitorModal({ initial, onClose, onSubmit }) {
  const isEdit = !!initial
  const [form, setForm] = useState({
    name: initial?.name || '',
    url: initial?.url || '',
    method: initial?.method || 'GET',
    intervalSec: initial?.intervalSec ?? 30,
    expectedStatus: initial?.expectedStatus ?? 200,
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return setError('Name is required.')
    if (!/^https?:\/\//.test(form.url)) return setError('URL must start with http:// or https://')
    setError('')
    setBusy(true)
    try {
      await onSubmit({
        ...form,
        intervalSec: Number(form.intervalSec),
        expectedStatus: Number(form.expectedStatus),
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const fields = [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'url', label: 'URL', type: 'text' },
    { key: 'method', label: 'Method', type: 'select', options: ['GET', 'HEAD'] },
    { key: 'intervalSec', label: 'Interval (sec)', type: 'number' },
    { key: 'expectedStatus', label: 'Expected status', type: 'number' },
  ]

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? 'Edit monitor' : 'Add monitor'}
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md">
        <Bezel innerClassName="p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-50">{isEdit ? 'Edit monitor' : 'Add monitor'}</h2>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="focus-ring flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-zinc-400 hover:bg-white/10"
            >
              <X size={16} weight="light" />
            </button>
          </div>

          {!isEdit && (
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, ...DEMO }))}
              className="focus-ring mb-5 inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-4 py-2 text-xs font-medium text-emerald-300 ring-1 ring-emerald-400/20 transition-colors duration-300 hover:bg-emerald-400/20"
            >
              <Lightning size={14} weight="light" />
              Add demo target
            </button>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {fields.map((f, i) => (
              <div
                key={f.key}
                className="animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <label className="mb-1.5 block text-xs uppercase tracking-[0.15em] text-zinc-500">
                  {f.label}
                </label>
                {f.type === 'select' ? (
                  <select
                    value={form[f.key]}
                    onChange={(e) => set(f.key, e.target.value)}
                    className="focus-ring w-full rounded-xl bg-black/30 px-3 py-2.5 text-sm text-zinc-100 ring-1 ring-white/10"
                  >
                    {f.options.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={f.type}
                    value={form[f.key]}
                    onChange={(e) => set(f.key, e.target.value)}
                    className="focus-ring w-full rounded-xl bg-black/30 px-3 py-2.5 font-mono text-sm text-zinc-100 ring-1 ring-white/10"
                  />
                )}
              </div>
            ))}

            {error && (
              <div className="rounded-xl bg-rose-400/10 px-3 py-2 text-xs text-rose-300 ring-1 ring-rose-400/20">
                {error}
              </div>
            )}

            <div className="mt-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? 'Saving…' : isEdit ? 'Save changes' : 'Create monitor'}
              </Button>
            </div>
          </form>
        </Bezel>
      </div>
    </div>
  )
}
