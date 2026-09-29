const express = require('express');

const router = express.Router();

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

router.get('/flaky', async (req, res) => {
  await delay(40 + Math.random() * 660);
  if (Math.random() < 0.1) {
    return res.status(500).json({ error: 'simulated failure' });
  }
  res.status(200).json({ ok: true });
});

module.exports = router;
