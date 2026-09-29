import { useState } from 'react'
import { signup, login } from '../api/client.js'

export default function Auth({ initialMode = 'login', onAuthed }) {
  const [mode, setMode] = useState(initialMode)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const passwordTooShort = mode === 'signup' && password.length > 0 && password.length < 8

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!username.trim() || !password) {
      setError('Username and password are required.')
      return
    }
    if (mode === 'signup' && password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    try {
      const action = mode === 'signup' ? signup : login
      await action(username.trim(), password)
      onAuthed()
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  function retry() {
    setError('')
    handleSubmit({ preventDefault() {} })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.15),_transparent_60%)] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-4xl font-extrabold text-transparent">
            Questly
          </h1>
          <p className="mt-2 text-sm text-slate-400">Level up your real life.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-slate-900/70 p-6 ring-1 ring-slate-800 shadow-xl shadow-black/30"
        >
          <h2 className="mb-4 text-lg font-semibold text-slate-100">
            {mode === 'signup' ? 'Create your hero' : 'Welcome back, adventurer'}
          </h2>

          {error && (
            <div className="mb-4 rounded-xl bg-rose-500/10 p-3 text-sm text-rose-300 ring-1 ring-rose-500/30">
              <p>{error}</p>
              <button
                type="button"
                onClick={retry}
                className="mt-2 text-xs font-semibold text-rose-200 underline underline-offset-2"
              >
                Retry
              </button>
            </div>
          )}

          <label className="mb-3 block">
            <span className="mb-1 block text-xs font-medium text-slate-400">Username</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border-none bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none ring-1 ring-slate-700 focus:ring-violet-500"
            />
          </label>

          <label className="mb-1 block">
            <span className="mb-1 block text-xs font-medium text-slate-400">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border-none bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none ring-1 ring-slate-700 focus:ring-violet-500"
            />
          </label>
          {passwordTooShort && (
            <p className="mb-3 text-xs text-amber-400">Password should be at least 8 characters.</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/40 border-t-slate-950" />
            )}
            {loading ? 'Please wait…' : mode === 'signup' ? 'Sign up' : 'Log in'}
          </button>

          <p className="mt-4 text-center text-sm text-slate-400">
            {mode === 'signup' ? 'Already have an account?' : 'New here?'}{' '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signup' ? 'login' : 'signup')
                setError('')
              }}
              className="font-semibold text-violet-300 hover:text-violet-200"
            >
              {mode === 'signup' ? 'Log in' : 'Sign up'}
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
