const express = require('express');
const auth = require('../middleware/auth');
const questService = require('../services/questService');

const router = express.Router();
router.use(auth);

router.get('/', (req, res) => {
  res.status(200).json(questService.listQuests(req.userId));
});

router.post('/', (req, res) => {
  try {
    const { title, description, difficulty } = req.body;
    const quest = questService.createQuest(req.userId, { title, description, difficulty });
    res.status(201).json(quest);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const quest = questService.updateQuest(req.userId, req.params.id, req.body);
    res.status(200).json(quest);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    questService.deleteQuest(req.userId, req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;
