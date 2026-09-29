import { useEffect, useState } from 'react'
import { Play, Pause, PencilSimple, Trash, ArrowClockwise } from '@phosphor-icons/react'
import Bezel from './Bezel.jsx'
import Button from './Button.jsx'
import StatusDot from './StatusDot.jsx'
import LatencyChart from './LatencyChart.jsx'
import { listChecks, checkNow, updateMonitor, deleteMonitor } from '../api/client.js'

export default function MonitorDetail({ monitor, onEdit, onDeleted, onChanged, pulseKey }) {
  const [checks, setChecks] = useState([])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    listChecks(monitor.id, 40).then((data) => {
      if (!cancelled) setChecks(data)
    })
    return () => {
      cancelled = true
    }
  }, [monitor.id, pulseKey])

  async function handleCheckNow() {
    setBusy(true)
    try {
      await checkNow(monitor.id)
    } finally {
      setBusy(false)
    }
  }

  async function handleToggle() {
    setBusy(true)
    try {
      const updated = await updateMonitor(monitor.id, { active: !monitor.active })
      onChanged?.(updated)
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    setBusy(true)
    try {
      await deleteMonitor(monitor.id)
      onDeleted?.(monitor.id)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Bezel innerClassName="p-6 md:p-8" className="col-span-1 md:col-span-12">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <StatusDot status={monitor.status} pulse={pulseKey} size={10} />
            <h3 className="text-xl font-semibold text-zinc-50">{monitor.name}</h3>
          </div>
          <div className="mt-1 font-mono text-sm text-zinc-500">{monitor.url}</div>
          <div className="mt-2 flex gap-3 text-xs text-zinc-500">
            <span>{monitor.method}</span>
            <span>every {monitor.intervalSec}s</span>
            <span>expects {monitor.expectedStatus}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" icon={ArrowClockwise} onClick={handleCheckNow} disabled={busy}>
            Check now
          </Button>
          <Button variant="ghost" icon={monitor.active ? Pause : Play} onClick={handleToggle} disabled={busy}>
            {monitor.active ? 'Pause' : 'Resume'}
          </Button>
          <Button variant="ghost" icon={PencilSimple} onClick={() => onEdit(monitor)}>
            Edit
          </Button>
          <Button variant="danger" icon={Trash} onClick={handleDelete} disabled={busy}>
            Delete
          </Button>
        </div>
      </div>

      <LatencyChart history={monitor.history} />

      <div className="mt-6">
        <div className="mb-2 text-xs uppercase tracking-[0.2em] text-zinc-500">Recent checks</div>
        <div className="max-h-64 overflow-y-auto rounded-2xl bg-black/20 ring-1 ring-white/5">
          {checks.length === 0 && <div className="p-4 text-sm text-zinc-500">No checks yet.</div>}
          {checks.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between gap-3 border-b border-white/5 px-4 py-2 text-sm last:border-0"
            >
              <span className="flex items-center gap-2">
                <StatusDot status={c.ok ? 'up' : 'down'} size={6} />
                <span className="font-mono text-xs text-zinc-500">
                  {new Date(c.checkedAt).toLocaleTimeString()}
                </span>
              </span>
              <span className="font-mono text-xs tabular-nums text-zinc-300">
                {c.statusCode ?? '—'} · {c.latencyMs != null ? `${c.latencyMs}ms` : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Bezel>
  )
}
