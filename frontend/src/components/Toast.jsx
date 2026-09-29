export default function ToastStack({ toasts, dismiss }) {
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`pointer-events-auto animate-fade-up rounded-full px-5 py-2.5 text-sm font-medium shadow-[0_8px_30px_rgba(0,0,0,0.4)] ring-1 backdrop-blur-xl ${
            t.tone === 'error'
              ? 'bg-rose-400/10 text-rose-200 ring-rose-400/30'
              : 'bg-emerald-400/10 text-emerald-200 ring-emerald-400/30'
          }`}
          onClick={() => dismiss(t.id)}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}
