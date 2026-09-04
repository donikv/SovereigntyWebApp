const SWH_BASE = 'https://archive.softwareheritage.org/api/1';
const GITHUB_RAW = 'https://raw.githubusercontent.com';
const RECENT_DAYS = 90;
const DEP_FILES = ['requirements.txt', 'pyproject.toml', 'setup.py'];
const DEP_BRANCHES = ['main', 'master'];

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

// Separate fetch for GitHub API — never throws, returns null on any failure
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

// Fetch raw file from GitHub — never throws, returns null on failure
async function githubRaw(owner, repo, branch, file) {
  try {
    const response = await fetch(
      `${GITHUB_RAW}/${owner}/${repo}/${branch}/${file}`,
      { headers: { 'User-Agent': 'SovereigntyWebApp/1.0' }, signal: AbortSignal.timeout(8000) }
    );
    if (!response.ok) return null;
    const text = await response.text();
    return text.trim() ? text : null;
  } catch (_) {
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
    const orgName  = segments[segments.length - 2] || '';
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

// --------------------------------------------------------------------------
// License detection
// --------------------------------------------------------------------------

// Detect license category from raw license file text (handles missing "BSD" keyword)
function detectLicenseFromText(text) {
  const t = (text || '').toUpperCase();
  if (/CREATIVE COMMONS[^.]*ZERO|\bCC0\b/.test(t))              return 'public_domain';
  if (/UNLICEN[SC]E|PUBLIC DOMAIN/.test(t))                     return 'public_domain';
  if (/LESSER GENERAL PUBLIC LICENSE|\bLGPL\b/.test(t))         return 'lgpl';
  if (/GNU AFFERO GENERAL PUBLIC|\bAGPL\b/.test(t))             return 'copyleft';
  if (/GNU GENERAL PUBLIC LICENSE|\bGPL\b/.test(t))             return 'copyleft';
  if (/MOZILLA PUBLIC LICENSE|\bMPL\b/.test(t))                 return 'copyleft';  // \b prevents matching "implied"
  if (/ECLIPSE PUBLIC LICENSE|\bEPL\b/.test(t))                 return 'copyleft';
  if (/EUROPEAN UNION PUBLIC LICENCE|\bEUPL\b/.test(t))         return 'copyleft';
  if (/APACHE LICENSE|APACHE-2/.test(t))                        return 'permissive';
  if (/MIT LICENSE|MIT PUBLIC LICENSE/.test(t))                 return 'permissive';
  if (/BSD [0-9]-CLAUSE|BERKELEY SOFTWARE DISTRIBUTION/.test(t)) return 'permissive';
  if (/BSD\b/.test(t))                                          return 'permissive';
  if (/ISC LICENSE/.test(t))                                    return 'permissive';
  if (/PYTHON SOFTWARE FOUNDATION LICENSE/.test(t))             return 'permissive';
  // BSD template without the word "BSD" (numpy, pytorch, etc.)
  if (/REDISTRIBUTION AND USE IN SOURCE AND BINARY FORMS/.test(t) && /PERMITTED/.test(t))
    return 'permissive';
  return null;
}

// Map SPDX identifier or URL to SLC3/SLC34 option key
function mapLicense(license) {
  if (!license) return null;
  const ids = Array.isArray(license) ? license : [license];
  for (const id of ids) {
    if (typeof id !== 'string' || id === 'NOASSERTION' || id === 'NONE') continue;
    // Already one of our option keys (from text detection or LicensingCategories)
    if (['public_domain', 'permissive', 'lgpl', 'copyleft', 'proprietary'].includes(id)) return id;
    // Strip URL prefix to bare SPDX ID
    const spdx = id.replace(/^https?:\/\/[^/]*\/[^/]*\//, '').replace(/\.html?$/, '').toUpperCase();
    if (/^(CC[-_]?0|UNLICEN[CS]E|0BSD)/.test(spdx))                                       return 'public_domain';
    if (/^LGPL/.test(spdx))                                                                return 'lgpl';
    if (/^(A?GPL|MPL|EPL|EUPL|CDDL|OSL)/.test(spdx))                                     return 'copyleft';
    if (/^(MIT|BSD|APACHE|ISC|ARTISTIC|PSF|ZLIB|WTFPL|BOOST|MS-PL|PYTHON|AFL)/.test(spdx)) return 'permissive';
  }
  return null;
}

// --------------------------------------------------------------------------
// GitHub data fetching
// --------------------------------------------------------------------------

async function fetchGithubData(originUrl) {
  const match = (originUrl || '').match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+?)\/?$/i);
  if (!match) return null;
  const [, owner, repo] = match;

  const [repoData, releases] = await Promise.all([
    githubGet(`/repos/${owner}/${repo}`),
    githubGet(`/repos/${owner}/${repo}/releases?per_page=10`)
  ]);
  if (!repoData) return null;

  // If GitHub can't identify the license, try fetching and parsing the license file text
  let resolvedLicense = repoData.license;
  if (!resolvedLicense || resolvedLicense.spdx_id === 'NOASSERTION') {
    const licenseFile = await githubGet(`/repos/${owner}/${repo}/license`);
    if (licenseFile?.content) {
      const text = Buffer.from(licenseFile.content, 'base64').toString('utf8');
      const detected = detectLicenseFromText(text);
      console.log(`[SWH] License text detection for ${owner}/${repo}: ${detected}`);
      if (detected) resolvedLicense = { spdx_id: detected, _fromText: true };
    }
  }

  return { ...repoData, license: resolvedLicense, releases: Array.isArray(releases) ? releases : [] };
}

// --------------------------------------------------------------------------
// Python dependency fetching (mirrors Python script's fetch_python_deps)
// --------------------------------------------------------------------------

async function fetchPythonDeps(originUrl) {
  const match = (originUrl || '').match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+?)\/?$/i);
  if (!match) return null;
  const [, owner, repo] = match;

  for (const file of DEP_FILES) {
    for (const branch of DEP_BRANCHES) {
      const text = await githubRaw(owner, repo, branch, file);
      if (text) {
        console.log(`[SWH] Found deps file: ${file} on ${branch}`);
        return { source: file, branch, url: `${GITHUB_RAW}/${owner}/${repo}/${branch}/${file}`, raw: text.slice(0, 2000) };
      }
    }
  }
  return null;
}

function countDeps(depData) {
  if (!depData?.raw) return 0;
  const { source, raw } = depData;

  if (source === 'requirements.txt') {
    return raw.split('\n').filter(l => {
      const t = l.trim();
      return t && !t.startsWith('#') && !t.startsWith('-r') && !t.startsWith('--');
    }).length;
  }

  if (source === 'pyproject.toml') {
    // Find the [project] dependencies array
    const m = raw.match(/dependencies\s*=\s*\[([\s\S]*?)\]/);
    if (m) return m[1].split('\n').filter(l => l.includes('"') && !l.trim().startsWith('#')).length;
    return 0;
  }

  return 0;
}

function mapDepCount(depData) {
  const count = countDeps(depData);
  if (count === 0) return null;
  if (count === 1)  return 'one';
  if (count <= 4)   return 'few';
  if (count <= 9)   return 'some';
  return 'many';
}

// --------------------------------------------------------------------------
// Defense fields (mirrors Python script's derive_defense_fields)
// --------------------------------------------------------------------------

function computeDefenseFields(visits, githubData, intrinsic, depData) {
  const fullVisits = visits.filter(v => v.status === 'full');

  let latestFullDate = null;
  for (const v of fullVisits) {
    const dt = v.date ? new Date(v.date) : null;
    if (dt && (!latestFullDate || dt > latestFullDate)) latestFullDate = dt;
  }

  let ageDays = null;
  let recentlyArchived = false;
  if (latestFullDate) {
    ageDays = Math.floor((Date.now() - latestFullDate) / 86400000);
    recentlyArchived = ageDays < RECENT_DAYS;
  }

  const hasHistory = fullVisits.length > 0;

  // LicensingStatus: best available SPDX ID (NOASSERTION is treated as unknown)
  const rawSpdx = githubData?.license?.spdx_id;
  const LicensingStatus = (rawSpdx && rawSpdx !== 'NOASSERTION') ? rawSpdx : null;

  // LicensingCategories: our SLC option key derived from the best license source
  const LicensingCategories = mapLicense(githubData?.license?.spdx_id) || null;

  return {
    longTermAvailability:    hasHistory && recentlyArchived,
    swhFullVisitCount:       fullVisits.length,
    latestFullVisitDate:     latestFullDate?.toISOString() || null,
    latestFullVisitAgeDays:  ageDays,
    Traceability:            hasHistory,
    auditability:            hasHistory,
    pythonDependenciesRequired: depData,
    LicensingStatus,
    LicensingCategories,
    benchmarkingAvailable:        null,
    compromisingAccessibility:    null,
    _intrinsicMetadataPresent:    Boolean(intrinsic)
  };
}

// --------------------------------------------------------------------------
// SWH origin fetching
// --------------------------------------------------------------------------

async function fetchOriginData(originUrl) {
  const encoded = encodeURIComponent(originUrl);

  const [origin, visits] = await Promise.all([
    getJson(`${SWH_BASE}/origin/${encoded}/get/`),
    getJson(`${SWH_BASE}/origin/${encoded}/visits/`)
  ]);

  let intrinsic = null;
  try {
    const raw = await getJson(`${SWH_BASE}/intrinsic-metadata/origin/?origin_url=${encoded}`);
    intrinsic = Array.isArray(raw) ? null : raw;
  } catch (_) {}

  // GitHub data and Python deps fetched concurrently
  const [githubData, depData] = await Promise.all([
    fetchGithubData(originUrl),
    fetchPythonDeps(originUrl)
  ]);

  console.log('[SWH] GitHub:', githubData
    ? `license=${githubData.license?.spdx_id}(textDetect=${githubData.license?._fromText}), stars=${githubData.stargazers_count}, releases=${githubData.releases.length}`
    : 'none');
  console.log('[SWH] Deps:', depData ? `${depData.source} on ${depData.branch} (${countDeps(depData)} deps)` : 'none');

  const latestVisit = (visits || []).find(v => v.status === 'full') || null;
  const defenseFields = computeDefenseFields(visits || [], githubData, intrinsic, depData);

  return { origin, visits: visits || [], intrinsic, latestVisit, githubData, defenseFields };
}

// --------------------------------------------------------------------------
// SLC mappings
// --------------------------------------------------------------------------

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

  // Primary: average interval between GitHub releases
  const releaseDates = (githubData?.releases || [])
    .map(r => r.published_at).filter(Boolean).map(d => new Date(d)).sort((a, b) => b - a);

  if (releaseDates.length >= 2) {
    let total = 0;
    for (let i = 0; i < releaseDates.length - 1; i++)
      total += (releaseDates[i] - releaseDates[i + 1]) / 86400000;
    const avg = total / (releaseDates.length - 1);
    console.log(`[SWH] Release interval avg: ${avg.toFixed(1)} days → SLC5 '${toKey(avg)}'`);
    return toKey(avg);
  }

  // Fallback: average of up to 5 recent SWH visit intervals
  const full = visits
    .filter(v => v.status === 'full' && v.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (full.length >= 2) {
    const limit = Math.min(full.length - 1, 5);
    let total = 0;
    for (let i = 0; i < limit; i++)
      total += (new Date(full[i].date) - new Date(full[i + 1].date)) / 86400000;
    return toKey(total / limit);
  }

  return null;
}

function mapCommunitySize(githubData) {
  if (!githubData) return null;
  const stars = githubData.stargazers_count || 0;
  if (stars >= 100000) return 'huge';
  if (stars >= 10000)  return 'large';
  if (stars >= 1000)   return 'medium';
  return 'small';
}

function mapDevelopmentProcesses(githubData, defenseFields) {
  if (!githubData || githubData.private) return null;
  // Traceability + auditability from SWH confirm full history is archived
  const fullyTraced = defenseFields?.Traceability && defenseFields?.auditability;
  const hasLicense   = Boolean(defenseFields?.LicensingCategories);
  if (fullyTraced && hasLicense) return 'all_known';
  return 'most_known';
}

function mapToSuggestions(rawData) {
  const suggestions = {};
  const meta = rawData.intrinsic;
  const gh   = rawData.githubData;
  const df   = rawData.defenseFields;

  // Description: GitHub > intrinsic
  const description = gh?.description || meta?.description || null;
  if (description) suggestions.description = description;

  // License (SLC3 + SLC34): defense LicensingCategories (best source) > intrinsic
  const licenseMapping = df?.LicensingCategories ||
    mapLicense(meta && (meta.license || meta['schema:license'] || meta['codemeta:license']));
  if (licenseMapping) {
    suggestions.slc3  = licenseMapping;
    suggestions.slc34 = licenseMapping;
  }

  // Update frequency (SLC5)
  const slc5 = mapUpdateFrequency(rawData.visits, gh);
  if (slc5) suggestions.slc5 = slc5;

  // Community size (SLC11)
  const slc11 = mapCommunitySize(gh);
  if (slc11) suggestions.slc11 = slc11;

  // Development processes (SLC17): reinforced by SWH Traceability
  const slc17 = mapDevelopmentProcesses(gh, df);
  if (slc17) suggestions.slc17 = slc17;

  // External dependencies (SLC24): from Python dependency file
  const slc24 = mapDepCount(df?.pythonDependenciesRequired);
  if (slc24) suggestions.slc24 = slc24;

  return suggestions;
}

module.exports = { searchOrigins, fetchOriginData, mapToSuggestions };
