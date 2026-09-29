import Bezel from './Bezel.jsx'
import LatencyChart from './LatencyChart.jsx'
import { useReveal } from '../hooks/useReveal.js'

export default function HealthHero({ monitors, sessionChecks }) {
  const { ref: revealRef, visible } = useReveal()
  const up = monitors.filter((m) => m.status === 'up').length
  const down = monitors.filter((m) => m.status === 'down').length
  const paused = monitors.filter((m) => m.status === 'paused').length

  const uptimes = monitors.map((m) => m.uptime).filter((v) => v != null)
  const fleetUptime = uptimes.length ? uptimes.reduce((a, b) => a + b, 0) / uptimes.length : null

  const latencies = monitors.map((m) => m.avgLatencyMs).filter((v) => v != null)
  const avgLatency = latencies.length ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : null

  // Aggregate a synthetic combined trace from the most recent monitor histories.
  const combined = monitors
    .flatMap((m) => m.history || [])
    .filter((h) => h.checkedAt)
    .sort((a, b) => new Date(a.checkedAt) - new Date(b.checkedAt))
    .slice(-60)

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
      <div ref={revealRef} className={`md:col-span-8 reveal ${visible ? 'is-visible' : ''}`}>
        <Bezel innerClassName="p-6 md:p-8">
          <div className="mb-1 inline-flex rounded-full bg-white/5 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-400">
            Fleet health
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <div className="font-mono text-6xl font-medium tabular-nums text-zinc-50 md:text-7xl">
              {fleetUptime != null ? fleetUptime.toFixed(1) : '—'}
              <span className="text-2xl text-zinc-500">%</span>
            </div>
            <div className="mb-2 flex gap-4 text-xs text-zinc-400">
              <span><span className="text-emerald-400">{up}</span> up</span>
              <span><span className="text-rose-400">{down}</span> down</span>
              <span><span className="text-amber-300">{paused}</span> paused</span>
            </div>
          </div>
          <div className="mt-6">
            <LatencyChart history={combined} height={200} />
          </div>
        </Bezel>
      </div>

      <div className="flex flex-col gap-4 md:col-span-4">
        <Bezel innerClassName="p-6" as="div">
          <div className="mb-1 inline-flex rounded-full bg-white/5 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-400">
            Avg latency
          </div>
          <div className="font-mono text-4xl font-medium tabular-nums text-zinc-50">
            {avgLatency != null ? avgLatency : '—'}
            <span className="text-lg text-zinc-500">ms</span>
          </div>
        </Bezel>
        <Bezel innerClassName="p-6" as="div">
          <div className="mb-1 inline-flex rounded-full bg-white/5 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-400">
            Checks this session
          </div>
          <div className="font-mono text-4xl font-medium tabular-nums text-zinc-50">{sessionChecks}</div>
        </Bezel>
      </div>
    </div>
  )
}
