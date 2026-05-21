const SWH_BASE = 'https://archive.softwareheritage.org/api/1';

async function getJson(url) {
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    signal: AbortSignal.timeout(30000)
  });
  if (!response.ok) {
    let body = '';
    try { body = await response.text(); } catch (_) {}
    const err = new Error(`SWH API error ${response.status}: ${body || response.statusText}`);
    err.status = response.status;
    throw err;
  }
  return response.json();
}

async function searchOrigins(name) {
  const encoded = encodeURIComponent(name);
  return getJson(`${SWH_BASE}/origin/search/${encoded}/?limit=5`);
}

async function fetchOriginData(originUrl) {
  const encoded = encodeURIComponent(originUrl);

  const [origin, visits] = await Promise.all([
    getJson(`${SWH_BASE}/origin/${encoded}/get/`),
    getJson(`${SWH_BASE}/origin/${encoded}/visits/`)
  ]);

  let intrinsic = null;
  try {
    const raw = await getJson(
      `${SWH_BASE}/intrinsic-metadata/origin/?origin_url=${encoded}`
    );
    intrinsic = Array.isArray(raw) ? null : raw;
  } catch (_) {
    // Intrinsic metadata is optional — not all origins have it
  }

  const latestVisit = (visits || []).find(v => v.status === 'full') || null;

  return { origin, visits: visits || [], intrinsic, latestVisit };
}

// Map SPDX license identifier(s) to SLC3 option key
function mapLicense(license) {
  if (!license) return null;

  const ids = Array.isArray(license) ? license : [license];
  const id = ids[0];
  if (typeof id !== 'string') return null;

  const upper = id.toUpperCase();

  if (/^(CC0|UNLICENSE|0BSD)/i.test(upper)) return 'public_domain';
  if (/^LGPL/i.test(upper)) return 'lgpl';
  if (/^(GPL|AGPL|MPL|EPL|EUPL|CDDL|OSL)/i.test(upper)) return 'copyleft';
  if (/^(MIT|BSD|APACHE|ISC|ARTISTIC|PSF|ZLIB|WTFPL|BOOST|MS-PL|PYTHON)/i.test(upper))
    return 'permissive';

  return null;
}

// Map visit history to SLC5 option key (string month count)
function mapUpdateFrequency(visits) {
  const full = visits
    .filter(v => v.status === 'full' && v.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (full.length < 2) return null;

  const days = (new Date(full[0].date) - new Date(full[1].date)) / (1000 * 60 * 60 * 24);

  if (days <= 30) return '1';
  if (days <= 60) return '2';
  if (days <= 90) return '3';
  if (days <= 120) return '4';
  if (days <= 150) return '5';
  if (days <= 180) return '6';
  if (days <= 210) return '7';
  if (days <= 240) return '8';
  if (days <= 270) return '9';
  if (days <= 300) return '10';
  if (days <= 330) return '11';
  return '12+';
}

function mapToSuggestions(rawData) {
  const suggestions = {};
  const meta = rawData.intrinsic;

  if (meta) {
    if (meta.description) suggestions.description = meta.description;

    const licenseField = meta.license || meta['schema:license'] || null;
    const slc3 = mapLicense(licenseField);
    if (slc3) suggestions.slc3 = slc3;
  }

  const slc5 = mapUpdateFrequency(rawData.visits);
  if (slc5) suggestions.slc5 = slc5;

  return suggestions;
}

module.exports = { searchOrigins, fetchOriginData, mapToSuggestions };
