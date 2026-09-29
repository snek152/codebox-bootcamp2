# Design: Signal

World: ethereal dark glass. A developer glancing at a status board on a dark monitor at night.

## Color
- Ground: OLED black `#050505`; card cores `#0a0a0c`.
- Healthy accent: emerald `#34d399`. Secondary: violet (ambient orb only). Failure: rose `#fb7185`, which also bleeds into the ambient background via `--ambient-mix` as monitors go down.
- Hairlines: white at 10% opacity. No solid gray borders, no hard shadows.

## Type
- Geist Variable for UI and display (tight tracking on headlines); Geist Mono Variable for all numbers, latency, and URLs (tabular figures).
- Eyebrow tags: 10px uppercase, `tracking-[0.2em]`, pill.

## Components
- Bezel: outer shell (`bg-white/[0.03]`, hairline ring, `p-1.5`, `rounded-[2rem]`) around an inner core with inset top highlight and concentric radius.
- Button: full pill with a nested circular trailing icon that shifts diagonally on hover; `scale-[0.98]` on press.
- Nav: floating glass pill, detached from the top; blur only on nav and modal overlay.
- Icons: Phosphor, light weight only.

## Layout
Asymmetrical bento: 8/4 hero row (fleet health + latency trace, stacked stats), mixed-span monitor cards, selected monitor expands to a detail card. Single column under 768px.

## Motion
Easing `cubic-bezier(0.32, 0.72, 0, 1)` only; transform and opacity only; staggered blur-fade-up reveals with a visibility safety timeout; signature: status-dot ring pulse and sparkline slide on each live `check` event; failures flash the card hairline rose. `prefers-reduced-motion` respected.
