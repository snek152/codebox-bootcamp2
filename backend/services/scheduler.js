const db = require('../db/database');
const { runProbe } = require('./probeService');
const monitorService = require('./monitorService');
const streamHub = require('./streamHub');

const TICK_MS = 1000;
const MAX_CONCURRENT = 20;

const inFlight = new Set();
let timer = null;

function dueMonitors() {
  // last check time (or createdAt if none yet) vs interval_sec, active only
  return db
    .prepare(
      `SELECT m.*, (SELECT checked_at FROM checks WHERE monitor_id = m.id ORDER BY id DESC LIMIT 1) AS last_checked_at
       FROM monitors m WHERE m.active = 1`
    )
    .all()
    .filter((m) => {
      const since = m.last_checked_at || m.created_at;
      const elapsedSec = (Date.now() - new Date(since).getTime()) / 1000;
      return elapsedSec >= m.interval_sec;
    });
}

async function probeAndPublish(row) {
  inFlight.add(row.id);
  try {
    const monitor = {
      id: row.id,
      url: row.url,
      method: row.method,
      expectedStatus: row.expected_status,
    };
    const check = await runProbe(monitor);
    const stillExists = db.prepare('SELECT id FROM monitors WHERE id = ?').get(row.id);
    if (!stillExists) return;
    const fullMonitor = monitorService.buildMonitor(db.prepare('SELECT * FROM monitors WHERE id = ?').get(row.id));
    streamHub.publish(row.user_id, 'check', { monitorId: row.id, check, monitor: fullMonitor });
  } finally {
    inFlight.delete(row.id);
  }
}

function tick() {
  if (inFlight.size >= MAX_CONCURRENT) return;
  for (const row of dueMonitors()) {
    if (inFlight.size >= MAX_CONCURRENT) break;
    if (inFlight.has(row.id)) continue;
    probeAndPublish(row); // fire and forget; guarded by inFlight
  }
}

function start() {
  if (timer) return;
  timer = setInterval(tick, TICK_MS);
  process.on('SIGINT', () => {
    stop();
    process.exit(0);
  });
}
function stop() {
  clearInterval(timer);
  timer = null;
}

module.exports = { start, stop };
