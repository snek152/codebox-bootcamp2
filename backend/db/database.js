const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbDir = __dirname;
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(path.join(dbDir, 'signal.sqlite'));

db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS monitors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    method TEXT NOT NULL DEFAULT 'GET',
    interval_sec INTEGER NOT NULL DEFAULT 30,
    expected_status INTEGER NOT NULL DEFAULT 200,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    monitor_id INTEGER NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
    status_code INTEGER,
    latency_ms INTEGER,
    ok INTEGER NOT NULL,
    error TEXT,
    checked_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_checks_monitor_id ON checks(monitor_id, id);
`);

module.exports = db;
