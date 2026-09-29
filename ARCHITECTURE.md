# Signal — Architecture & Demo Brief (feed this to Claude to build the slides)

> **Slide-generation instructions for Claude:** Build a 2-slide deck for a 1.5-minute pitch at CodeBox Bootcamp Demo Day. Audience: developers deciding who they want to work with, so the deck must show engineering skill. **Slide 1 = Architecture** (diagram + stack + 3-4 callouts). **Slide 2 = Demo** (live/prerecorded video placeholder + the demo script). Match the app's look: OLED black `#050505`, emerald `#34d399` accent, violet secondary, rose `#fb7185` for failures, Geist + Geist Mono type, double-bezel glass cards with hairline borders. Minimal text; the diagram carries slide 1.

## One-liner
**Signal** — a live API uptime monitor. Register an endpoint; the server probes it on a schedule, stores every check, and **streams results to your browser in real time**. No refresh, no polling.

## Requirements checklist
| Bootcamp requirement | How Signal meets it |
|---|---|
| Routes | Express routers: `/api/auth`, `/api/me`, `/api/monitors`, `/api/stream`, `/api/demo` |
| Connected to a DB | SQLite (`better-sqlite3`), 3 related tables, WAL mode, foreign keys + cascade deletes |
| CRUD | Monitors: POST create, GET read, PUT update (incl. pause/resume), DELETE remove |
| User authentication | bcrypt password hashes, JWT (HS256, 7d), per-user data isolation |
| Secrets not in GitHub | `.env` git-ignored, `.env.example` committed |
| Clean structure | routes -> services -> db, plus middleware; frontend split into pages/components/hooks/api |

## Slide 1 — Architecture

```
 BROWSER (React + Vite + Tailwind, :5173)                 SERVER (Node + Express, :3000)
┌───────────────────────────────┐   REST + Bearer JWT   ┌──────────────────────────────────────┐
│ pages/Auth, Dashboard         │ ────────────────────▶ │ middleware/auth  (verify JWT)        │
│ components/MonitorCard,       │                       │        │                             │
│   LatencyChart, HealthHero    │ ◀──────────────────── │ routes/  monitors · auth · demo      │
│ hooks/useMonitorStream        │        JSON           │        │ HTTP in/out only            │
│ api/client.js                 │                       │ services/monitorService  (rules)     │
│                               │   SSE  /api/stream    │          probeService    (HTTP probe)│
│   EventSource  ◀──────────────┼───────────────────────┤          streamHub       (pub/sub)   │
└───────────────────────────────┘   `check` events      │          scheduler ─ 1s tick ──┐     │
                                                        │ db/database.js  (better-sqlite3)│    │
                                                        └──────────────┬──────────────────┼────┘
                                                                       ▼                  ▼
                                                            SQLite: users, monitors,   Target APIs
                                                                    checks (history)   (probed over HTTP)
```

### Stack
- **Frontend:** React 18, Vite, Tailwind CSS, hand-written SVG charts (no chart lib), Geist fonts, Phosphor Light icons.
- **Backend:** Node 22, Express, `jsonwebtoken`, `bcrypt`, `better-sqlite3`, `cors`, `dotenv`.
- **Realtime:** Server-Sent Events (plain HTTP, auto-reconnect built into `EventSource`).
- **Tooling:** one `npm run dev` runs both via `concurrently`.

### Callouts (pick 3-4)
1. **Server does work on its own.** A single 1-second scheduler tick finds due monitors, probes them with an in-flight guard and concurrency cap, and stores each result. The browser never asks; it is told.
2. **Live push over SSE.** Each finished check is published through an in-memory per-user hub straight to the owner's open dashboards. Chosen over WebSockets: one-way, plain HTTP, auto-reconnect for free.
3. **Layered backend.** Routes handle HTTP only, services own rules (validation, ownership, uptime math), the db layer owns SQL. Swap SQLite for Postgres by touching only the db layer.
4. **Security-minded.** bcrypt hashes, JWT verified in middleware, ownership checks on every monitor query (404 for someone else's), and an **SSRF guard**: the server resolves each target's DNS and refuses loopback/private/link-local addresses unless explicitly allowed for local demo.
5. **Resilient UI.** Loading skeletons, error banners with retry, designed empty state, debounced LIVE/RECONNECTING indicator; the list never blanks on a reconnect.

## Data model
```
users    (id PK, username UNIQUE, password_hash)
monitors (id PK, user_id FK, name, url, method, interval_sec, expected_status, active, created_at)
checks   (id PK, monitor_id FK ON DELETE CASCADE, status_code, latency_ms, ok, error, checked_at)
           -- pruned to the newest 500 per monitor
```

## API surface
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/signup` | - | Create account -> `201 {token,user}` (`409` duplicate) |
| POST | `/api/auth/login` | - | Log in -> `200 {token,user}` (`401` bad creds) |
| GET | `/api/me` | JWT | Current user |
| GET | `/api/monitors` | JWT | List my monitors with status, uptime %, latency, history |
| POST | `/api/monitors` | JWT | Create monitor (`400` on invalid); first probe fires immediately |
| PUT | `/api/monitors/:id` | JWT | Edit / pause / resume |
| DELETE | `/api/monitors/:id` | JWT | Delete monitor and its checks -> `204` |
| GET | `/api/monitors/:id/checks` | JWT | Check history (newest first) |
| POST | `/api/monitors/:id/check` | JWT | Probe now |
| GET | `/api/stream?token=` | JWT (query) | SSE: `ready`, `check`, `monitor` events |
| GET | `/api/demo/flaky` | - | Built-in flaky target (random latency, ~10% 500s) so the demo works offline |

Errors are always `{ "error": "message" }`.

## Slide 2 — Demo script (about 60 s of 90)
1. **Sign up** (auth + DB write). *(8 s)*
2. **Add monitor** -> click **Add demo target** -> Create (Create). Point out the LIVE pill. *(12 s)*
3. **Watch it live**: sparkline slides in a new point and the status dot pulses every 5 s with no refresh; a failed check flashes rose and the ambient background bleeds warm (Read + realtime). *(20 s)*
4. **Open a monitor**: big latency chart, check history; **Pause** it (Update). *(10 s)*
5. **Delete** a monitor (Delete). *(5 s)*
6. Optional flourish: open a second browser window, add a monitor in one, watch it appear in the other instantly. *(5 s)*
7. Close: "Scheduler, SSE, layered backend, JWT, SSRF guard. Come build with me."

## 90-second pitch outline
- 0:00-0:10 Hook: "Todo lists wait for you. Signal watches your APIs while you sleep."
- 0:10-0:35 Slide 1: walk the diagram (scheduler -> DB -> SSE -> browser), hit the strongest 2 callouts.
- 0:35-1:20 Slide 2: run the demo.
- 1:20-1:30 Close + next: alert channels (Slack/email), status pages, Postgres + deploy.

## Roadmap (optional one-liner)
Alerts (Slack/email), public status pages, rate limiting on auth routes, OAuth 2.0 login, Postgres, deploy (Vercel frontend, Render/Railway backend).
