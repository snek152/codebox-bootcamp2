import { useEffect, useState, useCallback } from 'react'
import Auth from './pages/Auth.jsx'
import Dashboard from './pages/Dashboard.jsx'
import { me, setUnauthorizedHandler, ApiError } from './api/client.js'

const TOKEN_KEY = 'signal_token'

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(true)
  const [bootError, setBootError] = useState('')

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(logout)
  }, [logout])

  useEffect(() => {
    if (!token) {
      setChecking(false)
      return
    }
    let cancelled = false
    me()
      .then((u) => {
        if (!cancelled) setUser(u)
      })
      .catch((err) => {
        if (cancelled) return
        if (err instanceof ApiError && err.status === 401) {
          logout()
        } else {
          setBootError('Cannot reach the Signal API. Is the backend running?')
        }
      })
      .finally(() => {
        if (!cancelled) setChecking(false)
      })
    return () => {
      cancelled = true
    }
  }, [token, logout])

  function handleAuthed(newToken, newUser) {
    localStorage.setItem(TOKEN_KEY, newToken)
    setToken(newToken)
    setUser(newUser)
    setBootError('')
  }

  return (
    <div className="relative min-h-[100dvh] bg-[#050505] text-zinc-100 transition-colors duration-1000">
      <AmbientBackground />
      <div className="grain-overlay pointer-events-none fixed inset-0 z-40" aria-hidden="true" />
      <div className="relative z-10">
        {checking ? (
          <div className="flex min-h-[100dvh] items-center justify-center text-sm text-zinc-500">
            Loading Signal…
          </div>
        ) : bootError && !token ? (
          <ErrorBanner message={bootError} onRetry={() => window.location.reload()} />
        ) : token && user ? (
          <Dashboard token={token} user={user} onLogout={logout} />
        ) : (
          <Auth onAuthed={handleAuthed} />
        )}
      </div>
    </div>
  )
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm text-rose-300">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="focus-ring rounded-full bg-white/5 px-5 py-2 text-sm text-zinc-200 ring-1 ring-white/10 hover:bg-white/10"
      >
        Retry
      </button>
    </div>
  )
}

function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute -left-1/4 top-[-10%] h-[60vh] w-[60vh] animate-orb-drift rounded-full blur-[110px]"
        style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.22), transparent 70%)' }}
      />
      <div
        className="absolute right-[-15%] top-[20%] h-[50vh] w-[50vh] animate-orb-drift-slow rounded-full blur-[110px]"
        style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.18), transparent 70%)' }}
      />
      <div
        className="absolute bottom-[-15%] left-[20%] h-[55vh] w-[55vh] animate-orb-drift rounded-full blur-[120px] transition-opacity duration-1000"
        style={{
          background: 'radial-gradient(circle, rgba(251,113,133,0.28), transparent 70%)',
          opacity: 'var(--ambient-mix, 0)',
        }}
      />
    </div>
  )
}
