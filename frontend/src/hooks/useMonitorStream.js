import { useEffect, useRef, useState, useCallback } from 'react'
import { streamUrl, listMonitors } from '../api/client.js'

export function useMonitorStream(token) {
  const [monitors, setMonitors] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [connected, setConnected] = useState(false)
  const [sessionChecks, setSessionChecks] = useState(0)
  const [lastEvent, setLastEvent] = useState(null) // { monitorId, ok } for pulse triggers
  const monitorsRef = useRef(monitors)
  const loadedRef = useRef(loaded)
  monitorsRef.current = monitors
  loadedRef.current = loaded

  const refetch = useCallback(async () => {
    try {
      const list = await listMonitors()
      // Guard against a stray background refetch (e.g. triggered by an SSE
      // reconnect) clobbering a known-good list with a transient empty
      // response: only trust an empty list on the very first load.
      if (list.length === 0 && loadedRef.current && monitorsRef.current.length > 0) {
        return
      }
      setMonitors(list)
    } catch {
      // ignore; auth handler covers 401
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!token) return undefined
    refetch()

    const es = new EventSource(streamUrl(token))
    let disconnectTimer = null

    const markConnected = () => {
      clearTimeout(disconnectTimer)
      disconnectTimer = null
      setConnected(true)
    }

    es.onopen = markConnected

    es.addEventListener('ready', () => {
      markConnected()
      refetch()
    })

    es.addEventListener('check', (evt) => {
      const data = JSON.parse(evt.data)
      setSessionChecks((c) => c + 1)
      setLastEvent({ monitorId: data.monitorId, ok: data.check?.ok, at: Date.now() })
      if (data.monitor) {
        setMonitors((prev) => {
          const idx = prev.findIndex((m) => m.id === data.monitor.id)
          if (idx === -1) return prev
          const next = prev.slice()
          next[idx] = data.monitor
          return next
        })
      }
    })

    es.addEventListener('monitor', (evt) => {
      const data = JSON.parse(evt.data)
      setMonitors((prev) => {
        if (data.type === 'deleted') return prev.filter((m) => m.id !== data.id)
        if (data.type === 'created') {
          if (prev.some((m) => m.id === data.id)) return prev
          return [data.monitor, ...prev]
        }
        if (data.type === 'updated') {
          const idx = prev.findIndex((m) => m.id === data.id)
          if (idx === -1) return prev
          const next = prev.slice()
          next[idx] = data.monitor
          return next
        }
        return prev
      })
    })

    es.onerror = () => {
      // EventSource retries connections natively; debounce the disconnected
      // indicator so a brief, self-healing blip doesn't flash "RECONNECTING".
      if (disconnectTimer) return
      disconnectTimer = setTimeout(() => {
        setConnected(false)
        disconnectTimer = null
      }, 1500)
    }

    return () => {
      clearTimeout(disconnectTimer)
      es.close()
    }
  }, [token, refetch])

  return { monitors, setMonitors, connected, loaded, sessionChecks, lastEvent, refetch }
}
