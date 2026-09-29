const express = require('express');
const auth = require('../middleware/auth');
const db = require('../db/database');
const { toPublicUser } = require('../services/authService');

const router = express.Router();

router.get('/', auth, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
  if (!user) return res.status(401).json({ error: 'user not found' });
  res.status(200).json(toPublicUser(user));
});

module.exports = router;
