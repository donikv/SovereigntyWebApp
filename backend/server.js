const express = require('express');
const cors = require('cors');
const path = require('path');
const scoringRoutes = require('./routes/scoring');

const app = express();
const PORT = process.env.PORT || 3000;
const SERVER_ADDRESS = process.env.SERVER_ADDRESS ? `http://${process.env.SERVER_ADDRESS}:${PORT}` : `http://localhost:${PORT}`;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Configuration endpoint
app.get('/api/config', (req, res) => {
  res.json({ serverAddress: SERVER_ADDRESS });
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
