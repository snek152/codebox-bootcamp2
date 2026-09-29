const dns = require('dns');
const net = require('net');
const db = require('../db/database');

const MAX_CHECKS_PER_MONITOR = 500;

function isPrivateAddress(address, family) {
  if (family === 6) {
    const a = address.toLowerCase();
    return a === '::1' || a.startsWith('fe80:') || a.startsWith('fc') || a.startsWith('fd');
  }
  const parts = address.split('.').map(Number);
  const [a, b] = parts;
  if (a === 127) return true; // loopback
  if (a === 10) return true; // private
  if (a === 172 && b >= 16 && b <= 31) return true; // private
  if (a === 192 && b === 168) return true; // private
  if (a === 169 && b === 254) return true; // link-local (covers cloud metadata 169.254.169.254)
  if (a === 0) return true;
  return false;
}

// SSRF guard: monitor URLs are user-supplied and probed server-side, so without this
// check a user could point a monitor at internal services / cloud metadata endpoints.
// Skippable via ALLOW_PRIVATE_TARGETS=true for local demo use only (the built-in
// /api/demo/flaky target is loopback).
async function isBlockedTarget(urlObj) {
  if (process.env.ALLOW_PRIVATE_TARGETS === 'true') return false;
  const hostname = urlObj.hostname;
  if (net.isIP(hostname)) {
    return isPrivateAddress(hostname, net.isIP(hostname));
  }
  try {
    const { address, family } = await dns.promises.lookup(hostname);
    return isPrivateAddress(address, family);
  } catch {
    return false; // unresolvable host — let the fetch itself fail naturally
  }
}

function insertCheck(monitorId, check) {
  db.prepare(
    `INSERT INTO checks (monitor_id, status_code, latency_ms, ok, error, checked_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(monitorId, check.statusCode, check.latencyMs, check.ok ? 1 : 0, check.error, check.checkedAt);

  const result = db
    .prepare('SELECT id FROM checks WHERE monitor_id = ? ORDER BY id DESC LIMIT 1')
    .get(monitorId);
  db.prepare(
    `DELETE FROM checks WHERE monitor_id = ? AND id NOT IN (
       SELECT id FROM checks WHERE monitor_id = ? ORDER BY id DESC LIMIT ?
     )`
  ).run(monitorId, monitorId, MAX_CHECKS_PER_MONITOR);

  const row = db.prepare('SELECT * FROM checks WHERE id = ?').get(result.id);
  return toPublicCheck(row);
}

function toPublicCheck(row) {
  return {
    id: row.id,
    statusCode: row.status_code,
    latencyMs: row.latency_ms,
    ok: !!row.ok,
    error: row.error,
    checkedAt: row.checked_at,
  };
}

async function runProbe(monitor) {
  const checkedAt = new Date().toISOString();
  let urlObj;
  try {
    urlObj = new URL(monitor.url);
  } catch {
    return insertCheck(monitor.id, {
      statusCode: null,
      latencyMs: null,
      ok: false,
      error: 'invalid url',
      checkedAt,
    });
  }

  if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
    return insertCheck(monitor.id, {
      statusCode: null,
      latencyMs: null,
      ok: false,
      error: 'invalid url',
      checkedAt,
    });
  }

  if (await isBlockedTarget(urlObj)) {
    return insertCheck(monitor.id, {
      statusCode: null,
      latencyMs: null,
      ok: false,
      error: 'blocked: private address',
      checkedAt,
    });
  }

  const start = performance.now();
  try {
    const res = await fetch(urlObj.toString(), {
      method: monitor.method || 'GET',
      redirect: 'follow',
      signal: AbortSignal.timeout(8000),
    });
    const latencyMs = Math.round(performance.now() - start);
    const ok = res.status === monitor.expectedStatus;
    return insertCheck(monitor.id, {
      statusCode: res.status,
      latencyMs,
      ok,
      error: null,
      checkedAt,
    });
  } catch (err) {
    const latencyMs = Math.round(performance.now() - start);
    const message = err.name === 'TimeoutError' || err.name === 'AbortError' ? 'timeout' : (err.message || 'network error').slice(0, 200);
    return insertCheck(monitor.id, {
      statusCode: null,
      latencyMs,
      ok: false,
      error: message,
      checkedAt,
    });
  }
}

module.exports = { runProbe, toPublicCheck };
