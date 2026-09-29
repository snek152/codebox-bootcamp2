const express = require('express');
const authService = require('../services/authService');

const router = express.Router();

router.post('/signup', (req, res) => {
  try {
    const { username, password } = req.body;
    const { token, user } = authService.signup(username, password);
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    const { token, user } = authService.login(username, password);
    res.status(200).json({ token, user });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;
