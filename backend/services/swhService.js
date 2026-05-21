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

// Separate fetch for GitHub — uses its own error handling, never throws
async function githubGet(path) {
  try {
    const response = await fetch(`https://api.github.com${path}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'SovereigntyWebApp/1.0'
      },
      signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) {
      console.log(`[SWH] GitHub ${path} → ${response.status}`);
      return null;
    }
    return response.json();
  } catch (e) {
    console.log(`[SWH] GitHub ${path} failed: ${e.message}`);
    return null;
  }
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

// Detect license type from raw license file text
function detectLicenseFromText(text) {
  const t = (text || '').toUpperCase();
  if (/CREATIVE COMMONS[^.]*ZERO|CC0/.test(t)) return 'public_domain';
  if (/UNLICEN[SC]E|PUBLIC DOMAIN/.test(t)) return 'public_domain';
  if (/LESSER GENERAL PUBLIC LICENSE|LGPL/.test(t)) return 'lgpl';
  if (/GNU AFFERO GENERAL PUBLIC|AGPL/.test(t)) return 'copyleft';
  if (/GNU GENERAL PUBLIC LICENSE|GPL/.test(t)) return 'copyleft';
  if (/MOZILLA PUBLIC LICENSE|MPL/.test(t)) return 'copyleft';
  if (/ECLIPSE PUBLIC LICENSE|EPL/.test(t)) return 'copyleft';
  if (/EUROPEAN UNION PUBLIC LICENCE|EUPL/.test(t)) return 'copyleft';
  if (/APACHE LICENSE|APACHE-2/.test(t)) return 'permissive';
  if (/MIT LICENSE|MIT PUBLIC LICENSE/.test(t)) return 'permissive';
  if (/BSD [0-9]-CLAUSE|BERKELEY SOFTWARE DISTRIBUTION/.test(t)) return 'permissive';
  if (/BSD\b/.test(t)) return 'permissive';
  if (/ISC LICENSE/.test(t)) return 'permissive';
  if (/PYTHON SOFTWARE FOUNDATION LICENSE/.test(t)) return 'permissive';
  // BSD-style text without the word "BSD" — key clause is redistribution in binary form being permitted
  if (/REDISTRIBUTION AND USE IN SOURCE AND BINARY FORMS/.test(t) && /PERMITTED/.test(t)) return 'permissive';
  return null;
}

async function fetchGithubData(originUrl) {
  const match = (originUrl || '').match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+?)\/?$/i);
  if (!match) return null;
  const [, owner, repo] = match;

  // Fetch repo info and releases concurrently
  const [repoData, releases] = await Promise.all([
    githubGet(`/repos/${owner}/${repo}`),
    githubGet(`/repos/${owner}/${repo}/releases?per_page=10`)
  ]);

  if (!repoData) return null;

  // If GitHub couldn't identify the license (NOASSERTION), try fetching the license file text
  let resolvedLicense = repoData.license;
  if (!resolvedLicense || resolvedLicense.spdx_id === 'NOASSERTION') {
    const licenseFile = await githubGet(`/repos/${owner}/${repo}/license`);
    if (licenseFile?.content) {
      const text = Buffer.from(licenseFile.content, 'base64').toString('utf8');
      const detected = detectLicenseFromText(text);
      console.log(`[SWH] License text detection for ${owner}/${repo}: ${detected}`);
      if (detected) {
        resolvedLicense = { spdx_id: detected, _fromText: true };
      }
    }
  }

  return {
    ...repoData,
    license: resolvedLicense,
    releases: Array.isArray(releases) ? releases : []
  };
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
    ? `license=${githubData.license?.spdx_id}(text=${githubData.license?._fromText}), stars=${githubData.stargazers_count}, releases=${githubData.releases.length}`
    : 'none');

  const latestVisit = (visits || []).find(v => v.status === 'full') || null;

  return { origin, visits: visits || [], intrinsic, latestVisit, githubData };
}

// Map SPDX identifier (or our text-detected key) to SLC3/SLC34 option key
function mapLicense(license) {
  if (!license) return null;

  const ids = Array.isArray(license) ? license : [license];

  for (const id of ids) {
    if (typeof id !== 'string' || id === 'NOASSERTION' || id === 'NONE') continue;

    // If it's already one of our option keys (from text detection), return it directly
    if (['public_domain', 'permissive', 'lgpl', 'copyleft', 'proprietary'].includes(id)) return id;

    // Strip URL to get bare SPDX identifier
    const spdx = id.replace(/^https?:\/\/[^/]*\/[^/]*\//, '').replace(/\.html?$/, '').toUpperCase();

    if (/^(CC[-_]?0|UNLICEN[CS]E|0BSD)/.test(spdx)) return 'public_domain';
    if (/^LGPL/.test(spdx)) return 'lgpl';
    if (/^(A?GPL|MPL|EPL|EUPL|CDDL|OSL)/.test(spdx)) return 'copyleft';
    if (/^(MIT|BSD|APACHE|ISC|ARTISTIC|PSF|ZLIB|WTFPL|BOOST|MS-PL|PYTHON|AFL)/.test(spdx)) return 'permissive';
  }

  return null;
}

// Map release history to SLC5 option key — average interval between releases
function mapUpdateFrequency(visits, githubData) {
  const toKey = days => {
    if (days <= 30)  return '1';
    if (days <= 60)  return '2';
    if (days <= 90)  return '3';
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

  // Primary: average interval between GitHub releases (reflects actual release cadence)
  const releaseDates = (githubData?.releases || [])
    .map(r => r.published_at)
    .filter(Boolean)
    .map(d => new Date(d))
    .sort((a, b) => b - a);

  if (releaseDates.length >= 2) {
    let total = 0;
    for (let i = 0; i < releaseDates.length - 1; i++) {
      total += (releaseDates[i] - releaseDates[i + 1]) / 86400000;
    }
    const avg = total / (releaseDates.length - 1);
    console.log(`[SWH] Release interval avg: ${avg.toFixed(1)} days → SLC5 '${toKey(avg)}'`);
    return toKey(avg);
  }

  // Fallback: SWH visit intervals (average of up to 5 recent intervals)
  const full = visits
    .filter(v => v.status === 'full' && v.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (full.length >= 2) {
    const limit = Math.min(full.length - 1, 5);
    let total = 0;
    for (let i = 0; i < limit; i++) {
      total += (new Date(full[i].date) - new Date(full[i + 1].date)) / 86400000;
    }
    return toKey(total / limit);
  }

  return null;
}

// Map GitHub star count to SLC11 option key
function mapCommunitySize(githubData) {
  if (!githubData) return null;
  const stars = githubData.stargazers_count || 0;
  if (stars >= 100000) return 'huge';
  if (stars >= 10000)  return 'large';
  if (stars >= 1000)   return 'medium';
  return 'small';
}

// Map public GitHub repo to SLC17 option key
function mapDevelopmentProcesses(githubData) {
  if (!githubData || githubData.private) return null;
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

  // License (SLC3 + SLC34): GitHub (with text fallback) > intrinsic metadata
  const licenseId = gh?.license?.spdx_id ||
    (meta && (meta.license || meta['schema:license'] || meta['codemeta:license'])) ||
    null;
  const licenseMapping = mapLicense(licenseId);
  if (licenseMapping) {
    suggestions.slc3  = licenseMapping;
    suggestions.slc34 = licenseMapping;
  }

  // Update frequency (SLC5): release cadence > SWH visit interval
  const slc5 = mapUpdateFrequency(rawData.visits, gh);
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
