const db = require('../db/database');

const XP_VALUES = { easy: 10, medium: 25, hard: 50 };

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a, b) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((new Date(b) - new Date(a)) / msPerDay);
}

function toPublicQuest(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    difficulty: row.difficulty,
    xpValue: row.xp_value,
    completed: !!row.completed,
    createdAt: row.created_at,
  };
}

function validationError(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}

function notFoundError() {
  const err = new Error('quest not found');
  err.status = 404;
  return err;
}

function listQuests(userId) {
  const rows = db
    .prepare('SELECT * FROM quests WHERE user_id = ? ORDER BY created_at DESC, id DESC')
    .all(userId);
  return rows.map(toPublicQuest);
}

function createQuest(userId, { title, description, difficulty }) {
  if (!title || !title.trim()) throw validationError('title is required');
  if (!XP_VALUES[difficulty]) throw validationError('difficulty must be easy, medium, or hard');

  const createdAt = new Date().toISOString();
  const result = db
    .prepare(
      `INSERT INTO quests (user_id, title, description, difficulty, xp_value, completed, created_at)
       VALUES (?, ?, ?, ?, ?, 0, ?)`
    )
    .run(userId, title, description || '', difficulty, XP_VALUES[difficulty], createdAt);

  const row = db.prepare('SELECT * FROM quests WHERE id = ?').get(result.lastInsertRowid);
  return toPublicQuest(row);
}

function getOwnedQuest(userId, id) {
  const row = db.prepare('SELECT * FROM quests WHERE id = ? AND user_id = ?').get(id, userId);
  if (!row) throw notFoundError();
  return row;
}

function applyCompletion(userId) {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  const today = todayStr();

  let streak = user.streak;
  if (user.last_completed_date === today) {
    // already completed something today; streak unchanged
  } else if (!user.last_completed_date || daysBetween(user.last_completed_date, today) === 1) {
    streak = streak + 1;
  } else {
    streak = 1;
  }

  return { streak, lastCompletedDate: today };
}

function updateQuest(userId, id, patch) {
  const quest = getOwnedQuest(userId, id);

  if (patch.difficulty !== undefined && !XP_VALUES[patch.difficulty]) {
    throw validationError('difficulty must be easy, medium, or hard');
  }
  if (patch.title !== undefined && !patch.title.trim()) {
    throw validationError('title is required');
  }

  const nextTitle = patch.title !== undefined ? patch.title : quest.title;
  const nextDescription = patch.description !== undefined ? patch.description : quest.description;
  const nextDifficulty = patch.difficulty !== undefined ? patch.difficulty : quest.difficulty;
  const nextXpValue = patch.difficulty !== undefined ? XP_VALUES[patch.difficulty] : quest.xp_value;
  const nextCompleted = patch.completed !== undefined ? !!patch.completed : !!quest.completed;
  const isNewCompletion = !quest.completed && nextCompleted;

  db.prepare(
    `UPDATE quests SET title = ?, description = ?, difficulty = ?, xp_value = ?, completed = ?
     WHERE id = ?`
  ).run(nextTitle, nextDescription, nextDifficulty, nextXpValue, nextCompleted ? 1 : 0, id);

  if (isNewCompletion) {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    const { streak, lastCompletedDate } = applyCompletion(userId);
    const newXp = user.xp + nextXpValue;
    db.prepare('UPDATE users SET xp = ?, streak = ?, last_completed_date = ? WHERE id = ?').run(
      newXp,
      streak,
      lastCompletedDate,
      userId
    );
  }

  const updated = db.prepare('SELECT * FROM quests WHERE id = ?').get(id);
  return toPublicQuest(updated);
}

function deleteQuest(userId, id) {
  getOwnedQuest(userId, id);
  db.prepare('DELETE FROM quests WHERE id = ? AND user_id = ?').run(id, userId);
}

module.exports = { listQuests, createQuest, updateQuest, deleteQuest };
