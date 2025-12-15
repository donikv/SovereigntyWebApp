const express = require('express');
const router = express.Router();
const { calculateScore } = require('../services/scoringService');

// POST endpoint to calculate sovereignty score
router.post('/calculate-score', (req, res) => {
  try {
    const { technologyName, description, criteria } = req.body;
    
    if (!criteria) {
      return res.status(400).json({ error: 'Criteria data is required' });
    }

    const result = calculateScore(criteria);
    
    res.json({
      technologyName,
      description,
      ...result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Future: Database integration endpoints can be added here
// router.get('/evaluations', ...)
// router.post('/evaluations', ...)

module.exports = router;
