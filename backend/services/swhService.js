const SWH_BASE = 'https://archive.softwareheritage.org/api/1';

async function getJson(url, extraHeaders = {}) {
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json', ...extraHeaders },
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

function scoreOrigin(url, name) {
  const lower = url.toLowerCase();
  const term = name.toLowerCase();
  let score = 0;

  try {
    const segments = new URL(url).pathname.replace(/^\/|\/$/g, '').split('/');
    const repoName = segments[segments.length - 1];
    const orgName = segments[segments.length - 2] || '';

    if (repoName === term) score += 10;
    else if (repoName.startsWith(term)) score += 5;

    if (orgName === term) score += 4;

    if (repoName === term && orgName === term) score += 8;

    if (segments.length === 2) score += 2;
  } catch (_) {
    if (lower.includes(`/${term}`)) score += 1;
  }

  return score;
}

async function searchOrigins(name) {
  const encoded = encodeURIComponent(name);
  const results = await getJson(`${SWH_BASE}/origin/search/${encoded}/?limit=10`);
  if (!results || results.length === 0) return results;
  const scored = results.map(r => ({ ...r, _score: scoreOrigin(r.url, name) }));
  console.log('[SWH] scored origins:\n' + scored.map(r => `  ${r._score}\t${r.url}`).join('\n'));
  return scored.sort((a, b) => b._score - a._score);
}

async function fetchGithubData(originUrl) {
  const match = (originUrl || '').match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+?)\/?$/i);
  if (!match) return null;
  try {
    const [, owner, repo] = match;
    const data = await getJson(
      `https://api.github.com/repos/${owner}/${repo}`,
      { 'User-Agent': 'SovereigntyWebApp/1.0', 'Accept': 'application/vnd.github.v3+json' }
    );
    return data;
  } catch (_) {
    return null;
  }
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

  const githubData = await fetchGithubData(originUrl);
  console.log('[SWH] GitHub data:', githubData
    ? `license=${githubData.license?.spdx_id}, stars=${githubData.stargazers_count}, pushed=${githubData.pushed_at}`
    : 'none');

  const latestVisit = (visits || []).find(v => v.status === 'full') || null;

  return { origin, visits: visits || [], intrinsic, latestVisit, githubData };
}

// Map SPDX license identifier or URL to SLC3/SLC34 option key
function mapLicense(license) {
  if (!license) return null;

  const ids = Array.isArray(license) ? license : [license];

  for (const id of ids) {
    if (typeof id !== 'string' || id === 'NOASSERTION' || id === 'NONE') continue;

    // Strip URL prefix to get just the SPDX identifier (e.g. https://spdx.org/licenses/MIT.html → MIT)
    const spdx = id.replace(/^https?:\/\/[^/]*\/[^/]*\//, '').replace(/\.html?$/, '').toUpperCase();

    if (/^(CC[-_]?0|UNLICEN[CS]E|0BSD)/.test(spdx)) return 'public_domain';
    if (/^LGPL/.test(spdx)) return 'lgpl';
    if (/^(A?GPL|MPL|EPL|EUPL|CDDL|OSL)/.test(spdx)) return 'copyleft';
    if (/^(MIT|BSD|APACHE|ISC|ARTISTIC|PSF|ZLIB|WTFPL|BOOST|MS-PL|PYTHON|AFL|EUPL)/.test(spdx)) return 'permissive';
  }

  return null;
}

// Map days since last push to SLC5 option key
function mapUpdateFrequency(visits, pushedAt) {
  const toKey = days => {
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
  };

  // Primary: GitHub pushed_at (actual code activity)
  if (pushedAt) {
    const days = (Date.now() - new Date(pushedAt)) / 86400000;
    return toKey(days);
  }

  // Fallback: average interval between recent SWH full visits
  const full = visits
    .filter(v => v.status === 'full' && v.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (full.length < 2) return null;

  const limit = Math.min(full.length - 1, 5);
  let total = 0;
  for (let i = 0; i < limit; i++) {
    total += (new Date(full[i].date) - new Date(full[i + 1].date)) / 86400000;
  }
  return toKey(total / limit);
}

// Map GitHub star count to SLC11 option key
function mapCommunitySize(githubData) {
  if (!githubData) return null;
  const stars = githubData.stargazers_count || 0;
  if (stars >= 100000) return 'huge';
  if (stars >= 10000) return 'large';
  if (stars >= 1000) return 'medium';
  return 'small';
}

// Map public GitHub repo to SLC17 option key
function mapDevelopmentProcesses(githubData) {
  if (!githubData || githubData.private) return null;
  // Public open-source repo: code, history, issues, CI all visible
  const hasOpenLicense = githubData.license &&
    githubData.license.spdx_id &&
    githubData.license.spdx_id !== 'NOASSERTION';
  return hasOpenLicense ? 'all_known' : 'most_known';
}

function mapToSuggestions(rawData) {
  const suggestions = {};
  const meta = rawData.intrinsic;
  const gh = rawData.githubData;

  // Description: GitHub > intrinsic metadata
  const description = gh?.description || meta?.description || null;
  if (description) suggestions.description = description;

  // License (SLC3 + SLC34): GitHub API > intrinsic metadata
  const licenseId = gh?.license?.spdx_id ||
    (meta && (meta.license || meta['schema:license'] || meta['codemeta:license'])) ||
    null;
  const licenseMapping = mapLicense(licenseId);
  if (licenseMapping) {
    suggestions.slc3 = licenseMapping;
    suggestions.slc34 = licenseMapping;
  }

  // Update frequency (SLC5)
  const slc5 = mapUpdateFrequency(rawData.visits, gh?.pushed_at);
  if (slc5) suggestions.slc5 = slc5;

  // Community size (SLC11)
  const slc11 = mapCommunitySize(gh);
  if (slc11) suggestions.slc11 = slc11;

  // Development processes (SLC17)
  const slc17 = mapDevelopmentProcesses(gh);
  if (slc17) suggestions.slc17 = slc17;

  return suggestions;
}

module.exports = { searchOrigins, fetchOriginData, mapToSuggestions };
