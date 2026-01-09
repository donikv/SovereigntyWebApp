const express = require('express');
const router = express.Router();
const { calculateScore } = require('../services/scoringService');
const { DatabaseFactory } = require('../database');

// POST endpoint to calculate sovereignty score and save to database
router.post('/calculate-score', async (req, res) => {
  try {
    const { technologyName, description, criteria, selectedSC, mitigations, mitigationDescriptions, saveToDb = true } = req.body;
    
    if (!criteria) {
      return res.status(400).json({ error: 'Criteria data is required' });
    }

    // Use thresholds from server configuration
    const thresholds = req.app.locals.thresholds || {};

    const result = calculateScore(criteria, selectedSC || {}, mitigations || {}, thresholds);
    
    const evaluationData = {
      technologyName,
      description,
      criteria,
      selectedSC: selectedSC || {},
      mitigations: mitigations || {},
      mitigationDescriptions: mitigationDescriptions || {},
      results: result,
      thresholds
    };

    // Save to database if enabled and database is connected
    let savedEvaluation = null;
    if (saveToDb) {
      try {
        const db = DatabaseFactory.getAdapter();
        if (db && db.isConnected()) {
          savedEvaluation = await db.saveEvaluation(evaluationData);
        }
      } catch (dbError) {
        console.error('Database save error:', dbError);
        // Continue even if database save fails
      }
    }
    
    res.json({
      ...evaluationData,
      id: savedEvaluation?.id,
      saved: !!savedEvaluation
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all evaluations
router.get('/evaluations', async (req, res) => {
  try {
    const db = DatabaseFactory.getAdapter();
    if (!db || !db.isConnected()) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { limit = 100, skip = 0, sort = 'createdAt', order = 'desc' } = req.query;
    
    const options = {
      limit: parseInt(limit),
      skip: parseInt(skip),
      sort: { [sort]: order === 'desc' ? -1 : 1 }
    };

    const evaluations = await db.getEvaluations({}, options);
    const statistics = await db.getStatistics();

    res.json({
      evaluations,
      statistics,
      total: statistics.total,
      limit: options.limit,
      skip: options.skip
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single evaluation by ID
router.get('/evaluations/:id', async (req, res) => {
  try {
    const db = DatabaseFactory.getAdapter();
    if (!db || !db.isConnected()) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const evaluation = await db.getEvaluationById(req.params.id);
    
    if (!evaluation) {
      return res.status(404).json({ error: 'Evaluation not found' });
    }

    res.json(evaluation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE evaluation
router.delete('/evaluations/:id', async (req, res) => {
  try {
    const db = DatabaseFactory.getAdapter();
    if (!db || !db.isConnected()) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const deleted = await db.deleteEvaluation(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Evaluation not found' });
    }

    res.json({ success: true, message: 'Evaluation deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET evaluation statistics
router.get('/statistics', async (req, res) => {
  try {
    const db = DatabaseFactory.getAdapter();
    if (!db || !db.isConnected()) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const statistics = await db.getStatistics();
    res.json(statistics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST search evaluations
router.post('/evaluations/search', async (req, res) => {
  try {
    const db = DatabaseFactory.getAdapter();
    if (!db || !db.isConnected()) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { searchTerm, limit = 100, skip = 0 } = req.body;
    
    if (!searchTerm) {
      return res.status(400).json({ error: 'Search term is required' });
    }

    const options = {
      limit: parseInt(limit),
      skip: parseInt(skip)
    };

    const evaluations = await db.searchEvaluations(searchTerm, options);
    res.json({ evaluations, total: evaluations.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET export evaluations to JSON
router.get('/export/json', async (req, res) => {
  try {
    const db = DatabaseFactory.getAdapter();
    if (!db || !db.isConnected()) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { startDate, endDate } = req.query;
    let evaluations;

    if (startDate && endDate) {
      evaluations = await db.getEvaluationsByDateRange(
        new Date(startDate),
        new Date(endDate)
      );
    } else {
      evaluations = await db.exportEvaluations();
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=evaluations-export.json');
    res.json(evaluations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET export evaluations to CSV
router.get('/export/csv', async (req, res) => {
  try {
    const db = DatabaseFactory.getAdapter();
    if (!db || !db.isConnected()) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { startDate, endDate } = req.query;
    let evaluations;

    if (startDate && endDate) {
      evaluations = await db.getEvaluationsByDateRange(
        new Date(startDate),
        new Date(endDate)
      );
    } else {
      evaluations = await db.exportEvaluations();
    }

    // Convert to CSV
    const csv = convertToCSV(evaluations);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=evaluations-export.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to convert evaluations to CSV
function convertToCSV(evaluations) {
  if (evaluations.length === 0) {
    return '';
  }

  const headers = [
    'ID',
    'Technology Name',
    'Description',
    'Created At',
    'Overall Score',
    'SLC Score',
    'SC Score',
    'Final Score',
    'Classification'
  ];

  const rows = evaluations.map(evaluation => [
    evaluation.id,
    `"${(evaluation.technologyName || '').replace(/"/g, '""')}"`,
    `"${(evaluation.description || '').replace(/"/g, '""')}"`,
    evaluation.createdAt,
    evaluation.results?.overallScore || 0,
    evaluation.results?.slcScore || 0,
    evaluation.results?.scScore || 0,
    evaluation.results?.finalScore || 0,
    `"${evaluation.results?.classification || ''}"`
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csvContent;
}

module.exports = router;
