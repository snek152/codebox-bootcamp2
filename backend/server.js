require('dotenv').config();
const express = require('express');
const cors = require('cors');

require('./db/database');

const authRoutes = require('./routes/auth');
const questRoutes = require('./routes/quests');
const meRoutes = require('./routes/me');

const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/me', meRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Questly backend listening on port ${PORT}`);
});

module.exports = app;
