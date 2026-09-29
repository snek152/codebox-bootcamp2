import { useEffect, useState } from 'react'
import Bezel from './Bezel.jsx'
import StatusDot from './StatusDot.jsx'
import Sparkline from './Sparkline.jsx'
import { useReveal } from '../hooks/useReveal.js'

export default function MonitorCard({ monitor, onSelect, selected, pulseKey, span }) {
  const { ref: revealRef, visible } = useReveal()
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    if (!pulseKey) return undefined
    if (monitor.lastCheck && monitor.lastCheck.ok === false) {
      setFlash(true)
      const t = setTimeout(() => setFlash(false), 700)
      return () => clearTimeout(t)
    }
    return undefined
  }, [pulseKey, monitor.lastCheck])

  return (
    <button
      type="button"
      ref={revealRef}
      onClick={() => onSelect(monitor.id)}
      className={`reveal text-left ${visible ? 'is-visible' : ''} ${span || ''}`}
      aria-pressed={selected}
    >
      <Bezel
        className={`h-full transition-all duration-500 ease-fluid hover:bg-white/[0.05] ${
          selected ? 'ring-emerald-400/40' : ''
        } ${flash ? '!ring-rose-400/60' : ''}`}
        innerClassName="p-5 h-full flex flex-col justify-between gap-4"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <StatusDot status={monitor.status} pulse={pulseKey} />
              <span className="truncate text-sm font-medium text-zinc-100">{monitor.name}</span>
            </div>
            <div className="mt-1 truncate font-mono text-xs text-zinc-500">{monitor.url}</div>
          </div>
          <span className="shrink-0 font-mono text-lg tabular-nums text-zinc-200">
            {monitor.lastCheck?.latencyMs != null ? `${monitor.lastCheck.latencyMs}ms` : '—'}
          </span>
        </div>
        <div className="flex items-end justify-between gap-3">
          <Sparkline history={monitor.history} ok={monitor.lastCheck?.ok !== false} />
          <div className="text-right text-xs text-zinc-500">
            <div className="font-mono tabular-nums text-zinc-300">
              {monitor.uptime != null ? `${monitor.uptime.toFixed(1)}%` : '—'}
            </div>
            uptime
          </div>
        </div>
      </Bezel>
    </button>
  )
}
