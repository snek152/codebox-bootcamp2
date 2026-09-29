const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/database');

const SALT_ROUNDS = 10;

function levelFor(xp) {
  return Math.floor(xp / 100) + 1;
}

function toPublicUser(row) {
  return {
    id: row.id,
    username: row.username,
    xp: row.xp,
    level: levelFor(row.xp),
    streak: row.streak,
  };
}

function sign(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function signup(username, password) {
  if (!username || !password) {
    const err = new Error('username and password are required');
    err.status = 400;
    throw err;
  }

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    const err = new Error('username already taken');
    err.status = 409;
    throw err;
  }

  const passwordHash = bcrypt.hashSync(password, SALT_ROUNDS);
  const result = db
    .prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)')
    .run(username, passwordHash);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
  return { token: sign(user.id), user: toPublicUser(user) };
}

function login(username, password) {
  if (!username || !password) {
    const err = new Error('username and password are required');
    err.status = 400;
    throw err;
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    const err = new Error('invalid username or password');
    err.status = 401;
    throw err;
  }

  return { token: sign(user.id), user: toPublicUser(user) };
}

module.exports = { signup, login, toPublicUser, levelFor };
