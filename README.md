# Signal

Live API uptime monitor. The server probes your endpoints on a schedule and streams every check to the dashboard over SSE. React + Express + SQLite + JWT.

## Run
```bash
npm install && npm run install:all
cp backend/.env.example backend/.env   # then set JWT_SECRET to a random string
npm run dev                            # backend :3000, frontend :5173 (strict port)
```

Open http://localhost:5173, sign up, click **Add monitor** -> **Add demo target**.

Set `ALLOW_PRIVATE_TARGETS=false` in any deployment (SSRF guard); `true` only for the local demo target.

Structure and API: see [ARCHITECTURE.md](ARCHITECTURE.md).
