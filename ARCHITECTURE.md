# Questly — Architecture & Demo Brief (feed this to Claude to build the slides)

> **Slide-generation instructions for Claude:** Build a 2-slide deck for a 1.5-minute demo-day pitch at CodeBox Bootcamp (Demo Day, Baker Center). Audience: developers deciding who they want to work with, so the deck should show engineering skill. **Slide 1 = Architecture** (diagram + stack + 3–4 callouts). **Slide 2 = Demo** (a placeholder for a live/prerecorded demo plus the 5-step demo script below). Dark theme matching the app: near-black navy background, violet → emerald gradient accents, rounded cards. Minimal text; the diagram carries the slide.

## One-liner
**Questly** — a gamified quest board. Turn real-life tasks into quests, earn XP by difficulty, level up, and keep a daily streak alive. Not a todo list: server-side game rules (XP, levels, streaks) live in the backend.

## Requirements checklist (what the bootcamp asked for)
| Requirement | How Questly meets it |
|---|---|
| Routes | Express routers: `/api/auth`, `/api/quests`, `/api/me` |
| Connected to a DB | SQLite via `better-sqlite3`, schema created on boot |
| CRUD | Quests: Create (POST), Read (GET), Update (PUT), Delete (DELETE) |
| User authentication | Signup/login, bcrypt-hashed passwords, JWT (HS256, 7-day expiry) |
| Secrets out of GitHub | `.env` git-ignored, `.env.example` committed |
| Clean structure | routes → services → db, separate middleware |

## Slide 1 — Architecture

### Diagram (redraw this cleanly)
```
┌──────────────────────────┐        fetch() + JWT         ┌────────────────────────────────────────┐
│  FRONTEND  (Vite :5173)  │ ───────────────────────────▶ │  BACKEND  (Express :3000)              │
│  React + Tailwind CSS    │   Authorization: Bearer …    │                                        │
│                          │ ◀─────────────────────────── │  middleware/auth.js   verify JWT       │
│  pages/Auth, Dashboard   │          JSON                │        │                               │
│  components/LevelBar,    │                              │        ▼                               │
│   StreakBadge, QuestCard │                              │  routes/   auth · quests · me          │
│  api/client.js (token)   │                              │        │  HTTP in / out only           │
└──────────────────────────┘                              │        ▼                               │
                                                          │  services/ authService · questService  │
                                                          │        │  business rules (XP, level,   │
                                                          │        │  streak, ownership, validation)│
                                                          │        ▼                               │
                                                          │  db/database.js  (better-sqlite3)      │
                                                          └───────────────────┬────────────────────┘
                                                                              ▼
                                                                  SQLite  (users, quests)
```

### Stack
- **Frontend:** React 18, Vite, Tailwind CSS (no UI kit, no animation lib — CSS keyframes only)
- **Backend:** Node.js, Express, JWT (`jsonwebtoken`), `bcrypt`, `cors`, `dotenv`
- **Database:** SQLite (`better-sqlite3`), file-based, zero setup, one persistent connection opened at startup
- **Tooling:** npm scripts, `concurrently` runs both apps with one `npm run dev`

### Callouts (pick 3–4 for the slide)
1. **Separation of concerns:** routes handle HTTP, services own business logic, db layer owns SQL. Swap SQLite for Postgres by touching only `db/` and the services' queries.
2. **Server-authoritative game logic:** the client never sends XP. Completing a quest flips `completed`; the server awards XP by difficulty (easy 10 / medium 25 / hard 50), recomputes `level = floor(xp / 100) + 1`, and updates the streak.
3. **Auth done right:** bcrypt password hashes, HS256 JWT verified in middleware, `401` on missing/invalid/expired tokens, per-user ownership checks (`404` on someone else's quest).
4. **Resilient UI:** explicit loading / error / success states everywhere; backend down → friendly banner + retry, never a blank screen.
5. **Secrets hygiene:** `JWT_SECRET` only in git-ignored `.env`.

## Data model
```
users  (id PK, username UNIQUE, password_hash, xp, streak, last_completed_date)
quests (id PK, user_id FK→users, title, description, difficulty, xp_value, completed, created_at)
```

## API surface
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/signup` | – | Create account → `201 {token, user}` (`409` duplicate) |
| POST | `/api/auth/login` | – | Log in → `200 {token, user}` (`401` bad creds) |
| GET | `/api/me` | JWT | Current user stats (xp, level, streak) |
| GET | `/api/quests` | JWT | List my quests, newest first |
| POST | `/api/quests` | JWT | Create quest (`400` on bad input) |
| PUT | `/api/quests/:id` | JWT | Edit / complete quest (awards XP on false→true) |
| DELETE | `/api/quests/:id` | JWT | Delete quest → `204` |

Errors are always `{ "error": "human readable message" }`.

## Slide 2 — Demo script (≈60 s of the 90 s)
1. **Sign up** a new adventurer (shows auth + DB write). *(10 s)*
2. **Create 3 quests** — easy, medium, hard (Create). *(15 s)*
3. **Complete the hard quest** → XP bar animates, streak flame lights up (Update, server-side game logic). *(15 s)*
4. **Refresh the page / log out and back in** → data persists (Read from DB, JWT flow). *(10 s)*
5. **Delete a quest** (Delete). *(5 s)*
6. Closing line: "Routes → services → DB, JWT auth, server-authoritative game rules. Built in a week — come build with me."

## 90-second pitch outline
- 0:00–0:10 Hook: "Todo lists are boring. Questly turns your day into an RPG."
- 0:10–0:35 Slide 1: walk the diagram left → right, hit the 2 strongest callouts (separation of concerns, server-authoritative logic).
- 0:35–1:20 Slide 2: run the demo script above.
- 1:20–1:30 Close + what's next (leaderboards / friends, Postgres + deploy to Vercel/Render).

## Roadmap / "what I'd build next" (optional one-liner on a slide)
Friends & leaderboards, quest categories/due dates, rate limiting on auth routes, OAuth 2.0 login, deploy (Vercel frontend, Render/Railway backend, Postgres).
