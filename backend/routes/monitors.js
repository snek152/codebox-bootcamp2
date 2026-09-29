const express = require('express');
const auth = require('../middleware/auth');
const monitorService = require('../services/monitorService');
const { runProbe } = require('../services/probeService');
const streamHub = require('../services/streamHub');
const db = require('../db/database');

const router = express.Router();
router.use(auth);

router.get('/', (req, res) => {
  res.status(200).json(monitorService.list(req.userId));
});

router.post('/', (req, res) => {
  try {
    const monitor = monitorService.create(req.userId, req.body);
    res.status(201).json(monitor);
    streamHub.publish(req.userId, 'monitor', { type: 'created', id: monitor.id, monitor });
    // fire the first check asynchronously, don't block the response
    const row = db.prepare('SELECT * FROM monitors WHERE id = ?').get(monitor.id);
    runProbe({ id: row.id, url: row.url, method: row.method, expectedStatus: row.expected_status }).then((check) => {
      const fullMonitor = monitorService.buildMonitor(db.prepare('SELECT * FROM monitors WHERE id = ?').get(row.id));
      streamHub.publish(req.userId, 'check', { monitorId: row.id, check, monitor: fullMonitor });
    });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const monitor = monitorService.update(req.userId, req.params.id, req.body);
    res.status(200).json(monitor);
    streamHub.publish(req.userId, 'monitor', { type: 'updated', id: monitor.id, monitor });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    monitorService.remove(req.userId, id);
    res.status(204).send();
    streamHub.publish(req.userId, 'monitor', { type: 'deleted', id, monitor: null });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.get('/:id/checks', (req, res) => {
  try {
    res.status(200).json(monitorService.listChecks(req.userId, req.params.id, req.query.limit));
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.post('/:id/check', async (req, res) => {
  try {
    const check = await monitorService.checkNow(req.userId, req.params.id);
    res.status(200).json(check);
    const fullMonitor = monitorService.buildMonitor(monitorService.getOwnedRow(req.userId, req.params.id));
    streamHub.publish(req.userId, 'check', { monitorId: Number(req.params.id), check, monitor: fullMonitor });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;
