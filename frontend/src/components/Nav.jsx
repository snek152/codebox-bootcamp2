import { SignOut } from '@phosphor-icons/react'

export default function Nav({ username, connected, onLogout }) {
  return (
    <nav className="mx-auto mt-6 flex w-max max-w-[92vw] items-center gap-4 rounded-full bg-white/[0.04] px-5 py-2.5 ring-1 ring-white/10 backdrop-blur-2xl">
      <span className="text-sm font-semibold tracking-tight text-zinc-50">Signal</span>
      <span className="hidden h-4 w-px bg-white/10 sm:block" />
      <span className="flex items-center gap-2 text-xs text-zinc-400" role="status" aria-live="polite">
        <span className="relative flex h-2 w-2 shrink-0">
          {connected && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          )}
          <span
            className={`relative inline-flex h-2 w-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-amber-300'}`}
          />
        </span>
        <span className="hidden sm:inline">{connected ? 'LIVE' : 'RECONNECTING'}</span>
      </span>
      <span className="h-4 w-px bg-white/10" />
      <span className="max-w-[8rem] truncate text-xs font-medium text-zinc-300">{username}</span>
      <button
        type="button"
        aria-label="Log out"
        onClick={onLogout}
        className="focus-ring flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-zinc-300 transition-colors duration-300 hover:bg-white/10 hover:text-rose-300"
      >
        <SignOut size={14} weight="light" />
      </button>
    </nav>
  )
}
