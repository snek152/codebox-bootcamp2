const express = require('express');
const jwt = require('jsonwebtoken');
const streamHub = require('../services/streamHub');

const router = express.Router();

router.get('/', (req, res) => {
  let userId;
  try {
    const payload = jwt.verify(req.query.token, process.env.JWT_SECRET);
    userId = payload.userId;
  } catch {
    return res.status(401).json({ error: 'invalid or expired token' });
  }

  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders();

  res.write('event: ready\ndata: {}\n\n');
  streamHub.subscribe(userId, res);
});

module.exports = router;
