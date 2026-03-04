const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const scoringRoutes = require('./routes/scoring');
const { DatabaseFactory } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const SERVER_ADDRESS = process.env.SERVER_ADDRESS ? `http://${process.env.SERVER_ADDRESS}:${PORT}` : `http://localhost:${PORT}`;

// Database configuration
const DB_TYPE = process.env.DB_TYPE || 'mongodb';
const DB_ENABLED = process.env.DB_ENABLED !== 'false'; // Enabled by default

// Load thresholds configuration
let thresholdsConfig = {};
const thresholdsPath = path.join(__dirname, '../thresholds.json');
try {
  if (fs.existsSync(thresholdsPath)) {
    const data = fs.readFileSync(thresholdsPath, 'utf8');
    thresholdsConfig = JSON.parse(data);
    console.log('Loaded thresholds configuration from thresholds.json');
  } else {
    console.log('No thresholds.json found, using empty thresholds');
  }
} catch (err) {
  console.error('Error loading thresholds configuration:', err.message);
}

// Make thresholds available to routes
app.locals.thresholds = thresholdsConfig;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Configuration endpoint
app.get('/api/config', (req, res) => {
  const db = DatabaseFactory.getAdapter();
  res.json({ 
    serverAddress: SERVER_ADDRESS,
    thresholds: thresholdsConfig,
    database: {
      enabled: DB_ENABLED,
      connected: db ? db.isConnected() : false,
      type: DB_TYPE
    }
  });
});

// Routes
app.use('/api', scoringRoutes);

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Initialize database and start server
async function startServer() {
  // Initialize database if enabled
  if (DB_ENABLED) {
    try {
      console.log(`Initializing ${DB_TYPE} database...`);
      await DatabaseFactory.createAdapter(DB_TYPE);
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Failed to connect to database:', error.message);
      console.log('Server will continue without database functionality');
    }
  } else {
    console.log('Database is disabled. Set DB_ENABLED=true to enable.');
  }

  // Start server
  app.listen(PORT, () => {
    console.log(`Server running on ${SERVER_ADDRESS}`);
    console.log(`Database: ${DB_ENABLED ? (DatabaseFactory.getAdapter()?.isConnected() ? 'Connected' : 'Disconnected') : 'Disabled'}`);
  });
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await DatabaseFactory.closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  await DatabaseFactory.closeConnection();
  process.exit(0);
});

// Start the server
startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
