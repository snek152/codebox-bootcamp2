require('dotenv').config();
const express = require('express');
const cors = require('cors');

require('./db/database');

const authRoutes = require('./routes/auth');
const meRoutes = require('./routes/me');
const monitorRoutes = require('./routes/monitors');
const streamRoutes = require('./routes/stream');
const demoRoutes = require('./routes/demo');
const scheduler = require('./services/scheduler');

const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/me', meRoutes);
app.use('/api/monitors', monitorRoutes);
app.use('/api/stream', streamRoutes);
app.use('/api/demo', demoRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Signal backend listening on port ${PORT}`);
  scheduler.start();
});

module.exports = app;
