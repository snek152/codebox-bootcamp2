export default function Button({
  children,
  icon: Icon,
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}) {
  const base =
    'group inline-flex items-center gap-2 rounded-full pl-5 pr-1.5 py-1.5 text-sm font-medium transition-all duration-500 ease-fluid active:scale-[0.98] focus-ring disabled:opacity-40 disabled:pointer-events-none'
  const variants = {
    primary: 'bg-emerald-400 text-black hover:bg-emerald-300',
    ghost: 'bg-white/5 text-zinc-100 ring-1 ring-white/10 hover:bg-white/10 pl-5 pr-5',
    danger: 'bg-white/5 text-rose-300 ring-1 ring-rose-400/20 hover:bg-rose-400/10 pl-5 pr-5',
  }
  const hasIcon = !!Icon && variant === 'primary'
  return (
    <button type={type} className={`${base} ${variants[variant]} ${className}`} {...props}>
      <span>{children}</span>
      {hasIcon && (
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/10 transition-transform duration-500 ease-fluid group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105">
          <Icon size={14} weight="bold" />
        </span>
      )}
    </button>
  )
}
