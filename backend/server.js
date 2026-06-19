const express = require('express');
const cors = require('cors');
const path = require('path');
const lightRoutes = require('./routes/lights');
const groupRoutes = require('./routes/groups');
const scheduleRoutes = require('./routes/schedules');
const { initializeScheduler } = require('./scheduler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/lights', lightRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/schedules', scheduleRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize scheduler on startup
initializeScheduler();

// Start server
app.listen(PORT, () => {
  console.log(`Smart Home Light Control Server running on http://localhost:${PORT}`);
  console.log(`Dashboard available at http://localhost:${PORT}`);
});
