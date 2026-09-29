const db = require('../db/database');
const { runProbe, toPublicCheck } = require('./probeService');

const HISTORY_LIMIT = 40;
const UPTIME_WINDOW = 100;

function validationError(message) {
  const err = new Error(message);
  err.status = 400;
  throw err;
}

function notFoundError() {
  const err = new Error('monitor not found');
  err.status = 404;
  throw err;
}

function validateUrl(url) {
  try {
    const u = new URL(url);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') validationError('url must be http or https');
  } catch {
    validationError('url must be a valid http or https url');
  }
}

function validatePatch(patch, { partial }) {
  const out = {};

  if (!partial || patch.name !== undefined) {
    if (!patch.name || typeof patch.name !== 'string') validationError('name is required');
    out.name = patch.name;
  }
  if (!partial || patch.url !== undefined) {
    if (!patch.url || typeof patch.url !== 'string') validationError('url is required');
    validateUrl(patch.url);
    out.url = patch.url;
  }
  if (patch.method !== undefined || !partial) {
    const method = patch.method || 'GET';
    if (method !== 'GET' && method !== 'HEAD') validationError('method must be GET or HEAD');
    out.method = method;
  }
  if (patch.intervalSec !== undefined || !partial) {
    const intervalSec = patch.intervalSec === undefined ? 30 : Number(patch.intervalSec);
    if (!Number.isFinite(intervalSec) || intervalSec < 5 || intervalSec > 3600) {
      validationError('intervalSec must be between 5 and 3600');
    }
    out.intervalSec = intervalSec;
  }
  if (patch.expectedStatus !== undefined || !partial) {
    const expectedStatus = patch.expectedStatus === undefined ? 200 : Number(patch.expectedStatus);
    if (!Number.isFinite(expectedStatus) || expectedStatus < 100 || expectedStatus > 599) {
      validationError('expectedStatus must be between 100 and 599');
    }
    out.expectedStatus = expectedStatus;
  }
  if (patch.active !== undefined) {
    out.active = !!patch.active;
  }
  return out;
}

function getOwnedRow(userId, id) {
  const row = db.prepare('SELECT * FROM monitors WHERE id = ?').get(id);
  if (!row || row.user_id !== userId) notFoundError();
  return row;
}

function buildMonitor(row) {
  const checks = db
    .prepare('SELECT * FROM checks WHERE monitor_id = ? ORDER BY id DESC LIMIT ?')
    .all(row.id, UPTIME_WINDOW)
    .map(toPublicCheck);

  const lastCheck = checks[0] || null;
  const uptimeChecks = checks.slice(0, UPTIME_WINDOW);
  const uptime = uptimeChecks.length
    ? Math.round((uptimeChecks.filter((c) => c.ok).length / uptimeChecks.length) * 1000) / 10
    : null;
  const okLatencies = checks.filter((c) => c.ok && c.latencyMs != null).map((c) => c.latencyMs);
  const avgLatencyMs = okLatencies.length
    ? Math.round(okLatencies.reduce((a, b) => a + b, 0) / okLatencies.length)
    : null;

  const active = !!row.active;
  let status;
  if (!active) status = 'paused';
  else if (!lastCheck) status = 'pending';
  else status = lastCheck.ok ? 'up' : 'down';

  return {
    id: row.id,
    name: row.name,
    url: row.url,
    method: row.method,
    intervalSec: row.interval_sec,
    expectedStatus: row.expected_status,
    active,
    createdAt: row.created_at,
    status,
    lastCheck,
    uptime,
    avgLatencyMs,
    history: checks.slice(0, HISTORY_LIMIT).reverse().map((c) => ({
      latencyMs: c.latencyMs,
      ok: c.ok,
      checkedAt: c.checkedAt,
    })),
  };
}

function list(userId) {
  const rows = db
    .prepare('SELECT * FROM monitors WHERE user_id = ? ORDER BY id DESC')
    .all(userId);
  return rows.map(buildMonitor);
}

function get(userId, id) {
  return buildMonitor(getOwnedRow(userId, id));
}

function create(userId, body) {
  const v = validatePatch(body, { partial: false });
  const createdAt = new Date().toISOString();
  const result = db
    .prepare(
      `INSERT INTO monitors (user_id, name, url, method, interval_sec, expected_status, active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?)`
    )
    .run(userId, v.name, v.url, v.method, v.intervalSec, v.expectedStatus, createdAt);
  return buildMonitor(db.prepare('SELECT * FROM monitors WHERE id = ?').get(result.lastInsertRowid));
}

function update(userId, id, body) {
  const row = getOwnedRow(userId, id);
  const v = validatePatch(body, { partial: true });
  const merged = {
    name: v.name ?? row.name,
    url: v.url ?? row.url,
    method: v.method ?? row.method,
    interval_sec: v.intervalSec ?? row.interval_sec,
    expected_status: v.expectedStatus ?? row.expected_status,
    active: v.active === undefined ? row.active : (v.active ? 1 : 0),
  };
  db.prepare(
    `UPDATE monitors SET name=?, url=?, method=?, interval_sec=?, expected_status=?, active=? WHERE id=?`
  ).run(merged.name, merged.url, merged.method, merged.interval_sec, merged.expected_status, merged.active, id);
  return buildMonitor(db.prepare('SELECT * FROM monitors WHERE id = ?').get(id));
}

function remove(userId, id) {
  getOwnedRow(userId, id);
  db.prepare('DELETE FROM monitors WHERE id = ?').run(id);
}

function listChecks(userId, id, limit) {
  getOwnedRow(userId, id);
  const n = Math.min(Math.max(Number(limit) || 100, 1), 500);
  return db
    .prepare('SELECT * FROM checks WHERE monitor_id = ? ORDER BY id DESC LIMIT ?')
    .all(id, n)
    .map(toPublicCheck);
}

async function checkNow(userId, id) {
  const row = getOwnedRow(userId, id);
  const monitor = {
    id: row.id,
    url: row.url,
    method: row.method,
    expectedStatus: row.expected_status,
  };
  return runProbe(monitor);
}

module.exports = { list, get, create, update, remove, listChecks, checkNow, buildMonitor, getOwnedRow };
