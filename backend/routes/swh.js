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
    console.log('[SWH] lookup request — name:', name, 'origin:', origin);

    if (!originUrl) {
      console.log('[SWH] searching origins for:', name);
      const results = await searchOrigins(name);
      console.log('[SWH] search results:', JSON.stringify(results));
      if (!results || results.length === 0) {
        return res.status(404).json({ name, error: 'Not found in Software Heritage' });
      }
      originUrl = results[0].url;
      console.log('[SWH] resolved origin URL:', originUrl);
    }

    console.log('[SWH] fetching origin data for:', originUrl);
    const rawData = await fetchOriginData(originUrl);
    console.log('[SWH] origin data received — visitCount:', rawData.visits.length, 'intrinsic:', JSON.stringify(rawData.intrinsic));
    const suggestions = mapToSuggestions(rawData);
    console.log('[SWH] suggestions:', JSON.stringify(suggestions));

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
    console.error('[SWH] error — message:', err.message, 'status:', err.status, 'stack:', err.stack);
    if (err.status === 404) {
      return res.status(404).json({ name, origin, error: 'Not found in Software Heritage', detail: err.message });
    }
    return res.status(502).json({ error: 'Failed to fetch from Software Heritage', detail: err.message });
  }
});

module.exports = router;
