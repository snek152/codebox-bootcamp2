import { useState } from 'react'
import { ArrowRight } from '@phosphor-icons/react'
import Bezel from '../components/Bezel.jsx'
import Button from '../components/Button.jsx'
import { signup, login, ApiError } from '../api/client.js'

function SignalTrace() {
  const path =
    'M0,40 L20,40 L28,10 L36,60 L44,40 L60,40 L68,20 L76,50 L84,40 L120,40 L128,10 L136,60 L144,40 L160,40 ' +
    'L168,20 L176,50 L184,40 L220,40 L228,10 L236,60 L244,40 L260,40'
  return (
    <div className="mt-10 h-16 w-full max-w-md overflow-hidden opacity-60" aria-hidden="true">
      <svg width="520" height="64" viewBox="0 0 520 64" className="animate-trace-scroll">
        <path d={path} fill="none" stroke="#34d399" strokeWidth="1.5" />
        <path d={path} fill="none" stroke="#34d399" strokeWidth="1.5" transform="translate(260,0)" />
      </svg>
    </div>
  )
}

export default function Auth({ onAuthed }) {
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const fn = mode === 'login' ? login : signup
      const data = await fn(username, password)
      onAuthed(data.token, data.user)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-[100dvh] overflow-hidden px-4 py-16 md:py-0">
      <div className="mx-auto flex min-h-[100dvh] max-w-6xl flex-col items-center justify-center gap-12 md:flex-row md:gap-20">
        <div className="w-full max-w-lg animate-fade-up">
          <span className="inline-flex rounded-full bg-white/5 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-400">
            Uptime, live
          </span>
          <h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-tight text-zinc-50 md:text-6xl">
            Know before they do.
          </h1>
          <p className="mt-5 max-w-md text-base text-zinc-400">
            Signal watches your endpoints around the clock and streams every check to you the instant it
            happens — no refresh, no polling, no surprises.
          </p>
          <SignalTrace />
        </div>

        <div className="w-full max-w-sm animate-fade-up" style={{ animationDelay: '120ms' }}>
          <Bezel innerClassName="p-7">
            <div className="mb-6 flex gap-1 rounded-full bg-black/30 p-1">
              {['login', 'signup'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMode(m)
                    setError('')
                  }}
                  className={`focus-ring flex-1 rounded-full py-2 text-sm font-medium capitalize transition-colors duration-300 ${
                    mode === m ? 'bg-emerald-400 text-black' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {m === 'login' ? 'Log in' : 'Sign up'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-[0.15em] text-zinc-500">
                  Username
                </label>
                <input
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="focus-ring w-full rounded-xl bg-black/30 px-3 py-2.5 text-sm text-zinc-100 ring-1 ring-white/10"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-[0.15em] text-zinc-500">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus-ring w-full rounded-xl bg-black/30 px-3 py-2.5 text-sm text-zinc-100 ring-1 ring-white/10"
                  minLength={8}
                  required
                />
                {mode === 'signup' && (
                  <p className="mt-1.5 text-xs text-zinc-500">At least 8 characters.</p>
                )}
              </div>

              {error && (
                <div className="rounded-xl bg-rose-400/10 px-3 py-2 text-sm text-rose-300 ring-1 ring-rose-400/20">
                  {error}
                </div>
              )}

              <Button type="submit" icon={ArrowRight} disabled={loading} className="mt-2 justify-center">
                {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
              </Button>
            </form>
          </Bezel>
        </div>
      </div>
    </div>
  )
}
