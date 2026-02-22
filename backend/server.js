const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ─── Middleware ───────────────────────────────────────
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// ─── Routes ───────────────────────────────────────────
app.use('/api/auth',   require('./routes/auth'));
app.use('/api/resume', require('./routes/resume'));
app.use('/api/jobs',   require('./routes/jobs'));

// ─── Test Route ───────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: '🚀 Resume Analyzer API is running!' });
});

// ─── Database Connection ──────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.log('❌ DB Error:', err));

// ─── Start Server ─────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});