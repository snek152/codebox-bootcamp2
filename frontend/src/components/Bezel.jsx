export default function Bezel({ children, className = '', innerClassName = '', as: As = 'div' }) {
  return (
    <As className={`rounded-[2rem] bg-white/[0.03] ring-1 ring-white/10 p-1.5 ${className}`}>
      <div
        className={`rounded-[calc(2rem-0.375rem)] bg-[#0a0a0c] shadow-[inset_0_1px_1px_rgba(255,255,255,0.10)] ${innerClassName}`}
      >
        {children}
      </div>
    </As>
  )
}
