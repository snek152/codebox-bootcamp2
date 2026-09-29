# Questly

Gamified quest board: complete quests, earn XP, level up, keep your streak. React + Express + SQLite + JWT.

## Run
```bash
npm install && npm run install:all
cp backend/.env.example backend/.env   # then set JWT_SECRET to a random string
npm run dev                            # backend :3000, frontend :5173
```

Open http://localhost:5173, sign up, add quests.

Structure and API: see [ARCHITECTURE.md](ARCHITECTURE.md).
