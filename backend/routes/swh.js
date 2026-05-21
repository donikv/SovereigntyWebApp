const express = require('express');
const { searchOrigins, fetchOriginData, mapToSuggestions } = require('../services/swhService');

const router = express.Router();

router.get('/swh-metadata', async (req, res) => {
  const { name, origin } = req.query;

  if (!name && !origin) {
    return res.status(400).json({ error: 'Provide either "name" or "origin" query parameter' });
  }

  try {
    let originUrl = origin || null;

    if (!originUrl) {
      const results = await searchOrigins(name);
      if (!results || results.length === 0) {
        return res.status(404).json({ name, error: 'Not found in Software Heritage' });
      }
      originUrl = results[0].url;
    }

    const rawData = await fetchOriginData(originUrl);
    const suggestions = mapToSuggestions(rawData);

    return res.json({
      name: name || null,
      originUrl,
      rawData: {
        origin: rawData.origin,
        latestVisit: rawData.latestVisit,
        visitCount: rawData.visits.length,
        intrinsic: rawData.intrinsic
      },
      suggestions
    });
  } catch (err) {
    if (err.status === 404) {
      return res.status(404).json({ name, origin, error: 'Not found in Software Heritage' });
    }
    console.error('SWH metadata error:', err.message);
    return res.status(502).json({ error: 'Failed to fetch from Software Heritage', detail: err.message });
  }
});

module.exports = router;
