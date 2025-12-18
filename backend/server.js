const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const scoringRoutes = require('./routes/scoring');

const app = express();
const PORT = process.env.PORT || 3000;
const SERVER_ADDRESS = process.env.SERVER_ADDRESS ? `http://${process.env.SERVER_ADDRESS}:${PORT}` : `http://localhost:${PORT}`;

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
  res.json({ 
    serverAddress: SERVER_ADDRESS,
    thresholds: thresholdsConfig 
  });
});

// Routes
app.use('/api', scoringRoutes);

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on ${SERVER_ADDRESS}`);
});
