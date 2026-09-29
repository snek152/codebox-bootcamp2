import { useEffect, useMemo, useState, useCallback } from 'react'
import { Plus, ArrowClockwise } from '@phosphor-icons/react'
import Nav from '../components/Nav.jsx'
import HealthHero from '../components/HealthHero.jsx'
import MonitorCard from '../components/MonitorCard.jsx'
import MonitorDetail from '../components/MonitorDetail.jsx'
import MonitorModal from '../components/MonitorModal.jsx'
import ToastStack from '../components/Toast.jsx'
import Button from '../components/Button.jsx'
import { useMonitorStream } from '../hooks/useMonitorStream.js'
import { createMonitor, updateMonitor, ApiError } from '../api/client.js'

const SPANS = ['md:col-span-6', 'md:col-span-6', 'md:col-span-4', 'md:col-span-4', 'md:col-span-4']

export default function Dashboard({ token, user, onLogout }) {
  const { monitors, setMonitors, connected, loaded, sessionChecks, lastEvent, refetch } = useMonitorStream(token)
  const [selectedId, setSelectedId] = useState(null)
  const [modal, setModal] = useState(null) // null | 'create' | monitor object (edit)
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    // reflect fleet health into ambient background custom property
    const down = monitors.filter((m) => m.status === 'down').length
    const mix = monitors.length ? Math.min(down / monitors.length, 1) : 0
    document.documentElement.style.setProperty('--ambient-mix', String(mix))
  }, [monitors])

  const pushToast = useCallback((message, tone = 'ok') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, message, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])

  const selected = useMemo(() => monitors.find((m) => m.id === selectedId) || null, [monitors, selectedId])

  async function handleCreate(payload) {
    try {
      const created = await createMonitor(payload)
      setMonitors((prev) => [created, ...prev])
      setModal(null)
      pushToast(`${created.name} is now being watched.`)
    } catch (err) {
      throw err instanceof ApiError ? err : new Error('Could not create monitor.')
    }
  }

  async function handleUpdate(payload) {
    try {
      const updated = await updateMonitor(modal.id, payload)
      setMonitors((prev) => prev.map((m) => (m.id === updated.id ? updated : m)))
      setModal(null)
      pushToast(`${updated.name} updated.`)
    } catch (err) {
      throw err instanceof ApiError ? err : new Error('Could not update monitor.')
    }
  }

  function handleDeleted(id) {
    setMonitors((prev) => prev.filter((m) => m.id !== id))
    if (selectedId === id) setSelectedId(null)
    pushToast('Monitor deleted.')
  }

  return (
    <div className="relative min-h-[100dvh] px-4 pb-24 md:px-8">
      <Nav username={user?.username} connected={connected} onLogout={onLogout} />

      <div className="mx-auto mt-12 max-w-6xl">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full bg-white/5 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-400">
              Dashboard
            </span>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50 md:text-4xl">
              Fleet overview
            </h1>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" icon={ArrowClockwise} onClick={refetch}>
              Refresh
            </Button>
            <Button icon={Plus} onClick={() => setModal('create')}>
              Add monitor
            </Button>
          </div>
        </div>

        <HealthHero monitors={monitors} sessionChecks={sessionChecks} />

        <div aria-live="polite" className="sr-only">
          {lastEvent && `Monitor ${lastEvent.monitorId} check ${lastEvent.ok ? 'succeeded' : 'failed'}`}
        </div>

        <div className="mt-10">
          {!loaded ? (
            <LoadingSkeleton />
          ) : monitors.length === 0 ? (
            <EmptyState onAdd={() => setModal('create')} />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
              {monitors.map((m, i) => (
                <MonitorCard
                  key={m.id}
                  monitor={m}
                  selected={selectedId === m.id}
                  onSelect={(id) => setSelectedId((cur) => (cur === id ? null : id))}
                  pulseKey={lastEvent?.monitorId === m.id ? lastEvent.at : null}
                  span={SPANS[i % SPANS.length]}
                />
              ))}
              {selected && (
                <MonitorDetail
                  monitor={selected}
                  onEdit={(m) => setModal(m)}
                  onDeleted={handleDeleted}
                  onChanged={(m) => setMonitors((prev) => prev.map((x) => (x.id === m.id ? m : x)))}
                  pulseKey={lastEvent?.monitorId === selected.id ? lastEvent.at : null}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {modal && (
        <MonitorModal
          initial={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSubmit={modal === 'create' ? handleCreate : handleUpdate}
        />
      )}

      <ToastStack toasts={toasts} dismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-12" aria-hidden="true">
      {SPANS.map((span, i) => (
        <div key={i} className={`${span} h-40 animate-pulse rounded-[2rem] bg-white/[0.03] ring-1 ring-white/10`} />
      ))}
    </div>
  )
}

function EmptyState({ onAdd }) {
  const path = 'M0,30 L20,30 L28,8 L36,45 L44,30 L80,30 L88,15 L96,38 L104,30 L140,30'
  return (
    <div className="flex flex-col items-center gap-6 rounded-[2rem] bg-white/[0.02] py-24 text-center ring-1 ring-white/5">
      <svg width="280" height="60" viewBox="0 0 280 60" className="opacity-50" aria-hidden="true">
        <path d={path} fill="none" stroke="#a78bfa" strokeWidth="1.5" />
      </svg>
      <div>
        <h3 className="text-xl font-semibold text-zinc-100">Nothing to watch yet</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-500">
          Add your first monitor to start streaming live uptime and latency checks.
        </p>
      </div>
      <Button icon={Plus} onClick={onAdd}>
        Add demo target
      </Button>
    </div>
  )
}
