// In-memory pub/sub for SSE: one Set of open responses per user.
const subscribers = new Map(); // userId -> Set<res>

function subscribe(userId, res) {
  if (!subscribers.has(userId)) subscribers.set(userId, new Set());
  subscribers.get(userId).add(res);

  const ping = setInterval(() => {
    res.write(': ping\n\n');
  }, 25000);

  res.on('close', () => {
    clearInterval(ping);
    const set = subscribers.get(userId);
    if (set) {
      set.delete(res);
      if (set.size === 0) subscribers.delete(userId);
    }
  });
}

function publish(userId, event, data) {
  const set = subscribers.get(userId);
  if (!set || set.size === 0) return;
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of set) res.write(payload);
}

module.exports = { subscribe, publish };
