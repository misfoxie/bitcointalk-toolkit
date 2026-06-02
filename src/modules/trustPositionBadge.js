// trustPositionBadge.js - Shows DT/trust position badges on Bitcointalk posts.

import { getSettings, updateSetting, setModuleEnabled, storageGet, storageSet, storageRemove } from '../utils/storage.js';
import { escapeHtml } from '../utils/sanitizer.js';
import { downloadFile, showToast } from '../utils/sharedUI.js';

const DEFAULT_TRUST_URL = 'https://bitcointalk.org/index.php?action=trust;dt';
const DEFAULT_TRUST_VIEW_URL = 'https://bitcointalk.org/index.php?action=trust;dtview';
const DT_DATA_URL = 'https://raw.githubusercontent.com/misfoxie/bitcointalk-dt-data/main/bitcointalk_dt.json';
const DT_REFRESH_INTERVAL_HOURS = 6;

const CACHE_KEY = 'bitcointalk_dt_data';
const CACHE_TIMESTAMP_KEY = 'bitcointalk_dt_data_timestamp';
const LEGACY_CACHE_KEY = 'dtCache';
const STYLE_ID = 'btt-trust-position-style';
const APPLIED_ATTR = 'data-btt-trust-badge';
const PROCESSED_ATTR = 'data-btt-trust-processed';
const RESCAN_DEBOUNCE_MS = 400;
const FETCH_TIMEOUT_MS = 10000;
const CACHE_VERSION = 2;
const MIN_VALID_CACHE_USERS = 50;

const POSITIONS = {
  unavailable: { label: 'DT unavailable', className: 'btt-trust-unavailable', title: 'DT data could not be loaded.' },
  dt0: { label: 'DT0', className: 'btt-trust-dt0', title: 'DefaultTrust depth 0 according to cached DT data.' },
  dt1: { label: 'DT1', className: 'btt-trust-dt1', title: 'DefaultTrust depth 1 according to cached DT data.' },
  dt2: { label: 'DT2', className: 'btt-trust-dt2', title: 'DefaultTrust depth 2 according to cached DT data.' },
  dt: { label: 'DT', className: 'btt-trust-dt', title: 'DefaultTrust depth according to cached DT data.' },
  none: { label: 'Not in DT', className: 'btt-trust-none', title: 'This user is not in the cached DT data.' },
};

let _settings = {};
let _dtData = null;
let _loadPromise = null;
let _observer = null;
let _messageHandler = null;
let _rescanTimer = null;
let _loggedFetchFailure = false;
let _fetchStatus = 'Not loaded';

function emptyDtData(sourceUrl = '') {
  return {
    cache_version: CACHE_VERSION,
    updated_at: '',
    source_url: sourceUrl,
    sourceUrl,
    dt1Users: [],
    dt2Users: [],
    removedUsers: [],
    removed_index: {},
    fetch_status: '',
    cacheValid: false,
    stats: { total_users: 0, dt1_count: 0, dt2_count: 0 },
    users: {},
    username_index: {},
  };
}

function extractUserIdFromUrl(url) {
  if (!url) return null;
  const text = String(url);
  if (!/action=profile/i.test(text)) return null;
  const match = text.match(/[?;&]u=(\d+)/);
  return match ? match[1] : null;
}

function extractUserIdFromUserUrl(url) {
  if (!url) return null;
  const text = String(url);
  if (!/action=(?:profile|trust)/i.test(text)) return null;
  const match = text.match(/[?;&]u=(\d+)/);
  return match ? match[1] : null;
}

function extractUidFromProfileUrl(url) {
  return extractUserIdFromUrl(url);
}

function cleanUsername(username) {
  return decodeHtmlEntities(username).replace(/\s+/g, ' ').trim();
}

function normalizeUsername(username) {
  return cleanUsername(username).toLowerCase();
}

function normalizeDtLevel(value) {
  const normalized = String(value || '').trim().toUpperCase().replace(/\s+/g, '');
  const match = normalized.match(/^DT?(\d+)$/);
  if (match) return `DT${match[1]}`;
  if (['NONE', 'NODT', 'NOTINDT', 'NOT_DT'].includes(normalized)) return 'NONE';
  return '';
}

function depthToDtLevel(depth) {
  if (depth === null || depth === undefined || depth === '') return null;
  const n = Number(depth);
  if (Number.isInteger(n) && n >= 0) return `DT${n}`;
  return null;
}

function depthFromLevel(level) {
  const normalized = normalizeDtLevel(level);
  const match = normalized.match(/^DT(\d+)$/);
  if (match) return Number(match[1]);
  return null;
}

function decodeHtmlEntities(value) {
  const text = String(value || '')
    .replace(/&#(\d+);/g, (_, code) => {
      const n = Number(code);
      return Number.isFinite(n) ? String.fromCodePoint(n) : _;
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => {
      const n = Number.parseInt(code, 16);
      return Number.isFinite(n) ? String.fromCodePoint(n) : _;
    })
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  if (typeof document === 'undefined') return text;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

function normalizeDtData(raw, sourceUrl = '') {
  const source = raw && typeof raw === 'object' ? raw : {};
  const normalized = emptyDtData(source.source_url || source.sourceUrl || sourceUrl);
  normalized.cache_version = CACHE_VERSION;
  normalized.updated_at = source.updated_at || source.updatedAt || '';
  normalized.sourceUrl = normalized.source_url;
  normalized.fetch_status = source.fetch_status || source.fetchStatus || '';
  normalized.removedUsers = Array.isArray(source.removedUsers) ? source.removedUsers.map(user => ({
    userId: user.userId || user.user_id || null,
    user_id: user.user_id || user.userId || null,
    username: cleanUsername(user.username || ''),
    depth: Number(user.depth) || null,
    removed: true,
    reason: user.reason || 'strikethrough',
    profileUrl: user.profileUrl || user.profile_url || '',
  })) : [];
  normalized.removed_index = {};
  normalized.removedUsers.forEach(user => {
    const key = user.userId || user.user_id || (user.username ? `user:${normalizeUsername(user.username)}` : '');
    if (key) normalized.removed_index[key] = true;
    if (user.username) normalized.removed_index[normalizeUsername(user.username)] = true;
  });

  const sourceUsers = source.users && typeof source.users === 'object' ? source.users : {};
  const arrayUsers = [
    ...(Array.isArray(source.dt1Users) ? source.dt1Users : []),
    ...(Array.isArray(source.dt2Users) ? source.dt2Users : []),
  ];
  arrayUsers.forEach(user => {
    const item = user && typeof user === 'object' ? user : {};
    const key = item.userId || item.user_id || item.username || '';
    if (key) sourceUsers[key] = item;
  });

  for (const [key, user] of Object.entries(sourceUsers)) {
    const item = user && typeof user === 'object' ? user : { dt_level: user };
    const userId = String(item.user_id || item.userId || (/^\d+$/.test(key) ? key : '')).trim();
    const usernameFromKey = String(key).startsWith('user:') ? String(key).slice(5) : '';
    const username = cleanUsername(item.username || usernameFromKey);
    const rawDepth = Number(item.depth);
    const dtLevel = normalizeDtLevel(item.dt_level || item.dtLevel || item.status || item.position || item.level) || depthToDtLevel(rawDepth);
    const depth = Number.isFinite(rawDepth) ? rawDepth : depthFromLevel(dtLevel);
    const cacheKey = userId || (username ? `user:${normalizeUsername(username)}` : `user:${normalizeUsername(key)}`);
    if (!cacheKey || !/^DT[1-9]\d*$/.test(dtLevel)) continue;
    if (normalized.removed_index[cacheKey] || normalized.removed_index[normalizeUsername(username)]) continue;

    normalized.users[cacheKey] = {
      user_id: userId || null,
      userId: userId || null,
      username: username || null,
      status: dtLevel,
      dt_level: dtLevel,
      depth,
      profileUrl: item.profileUrl || item.profile_url || (userId ? `https://bitcointalk.org/index.php?action=profile;u=${userId}` : ''),
    };

    if (userId) normalized.username_index[userId] = cacheKey;
    if (username) {
      normalized.username_index[username] = cacheKey;
      normalized.username_index[normalizeUsername(username)] = cacheKey;
    }
  }

  const sourceIndex = source.username_index || source.usernameIndex || {};
  if (sourceIndex && typeof sourceIndex === 'object') {
    for (const [username, key] of Object.entries(sourceIndex)) {
      if (normalized.users[String(key)]) {
        normalized.username_index[cleanUsername(username)] = String(key);
        normalized.username_index[normalizeUsername(username)] = String(key);
      }
    }
  }

  recomputeStats(normalized);
  normalized.dt1Users = Object.values(normalized.users).filter(user => user.dt_level === 'DT1').map(toPublicTrustUser);
  normalized.dt2Users = Object.values(normalized.users).filter(user => user.dt_level === 'DT2').map(toPublicTrustUser);
  return normalized;
}

function toPublicTrustUser(user) {
  return {
    userId: user.userId || user.user_id || null,
    user_id: user.user_id || user.userId || null,
    username: user.username || null,
    depth: user.depth,
    status: user.dt_level,
    dt_level: user.dt_level,
    profileUrl: user.profileUrl || '',
  };
}

function recomputeStats(data) {
  const users = Object.values(data.users || {});
  const removedUsers = data.removedUsers || [];
  data.stats = {
    total_users: users.length,
    dt1_count: users.filter(u => u.dt_level === 'DT1').length,
    dt2_count: users.filter(u => u.dt_level === 'DT2').length,
    removed_count: removedUsers.length,
  };
  data.cacheValid = isCacheValidForBadges(data);
}

function hasRequiredSources(source = []) {
  const sources = Array.isArray(source) ? source : String(source || '').split(/\s*,\s*/);
  return sources.includes(DEFAULT_TRUST_URL) && sources.includes(DEFAULT_TRUST_VIEW_URL);
}

function isCacheValidForBadges(data) {
  const users = data?.users && typeof data.users === 'object' ? data.users : {};
  const userEntries = Object.entries(users);
  const updatedAt = data?.updated_at || data?.updatedAt;
  const sourceText = String(data?.source || data?.source_url || data?.sourceUrl || '');
  const sourceIsGitHub = sourceText.includes(DT_DATA_URL);
  const numericUidKeys = userEntries.every(([uid, user]) => /^\d+$/.test(String(uid)) && String(user?.user_id || user?.userId || user?.uid || uid) === String(uid));
  return Boolean(updatedAt)
    && isCacheFresh({ updated_at: updatedAt })
    && (sourceText.includes(DEFAULT_TRUST_URL) || sourceText.includes(DT_DATA_URL))
    && userEntries.length >= MIN_VALID_CACHE_USERS
    && (sourceIsGitHub || numericUidKeys)
    && (data?.stats?.dt1_count || 0) > 0
    && (data?.stats?.dt2_count || 0) > 0;
}

function createDtCache(users = {}) {
  return {
    updatedAt: new Date().toISOString(),
    source: [DEFAULT_TRUST_URL, DEFAULT_TRUST_VIEW_URL],
    partial: false,
    warning: '',
    users,
  };
}

function isFinalDtCache(cache) {
  return !!cache
    && typeof cache === 'object'
    && typeof cache.updatedAt === 'string'
    && Array.isArray(cache.source)
    && cache.users
    && typeof cache.users === 'object';
}

function isParsedDtCacheLarge(cache) {
  if (!isFinalDtCache(cache) || !hasRequiredSources(cache.source)) return false;
  const users = Object.entries(cache.users || {});
  const active = users.filter(([uid, user]) => /^\d+$/.test(String(uid)) && user?.removed !== true);
  const dt1 = active.filter(([, user]) => Number(user.depth) === 1).length;
  const dt2 = active.filter(([, user]) => Number(user.depth) === 2).length;
  return active.length >= MIN_VALID_CACHE_USERS && dt1 > 0 && dt2 > 0;
}

function hasUsablePartialDtCache(cache) {
  if (!isFinalDtCache(cache) || !Array.isArray(cache.source) || !cache.source.includes(DEFAULT_TRUST_URL)) return false;
  const users = Object.entries(cache.users || {});
  const active = users.filter(([uid, user]) => /^\d+$/.test(String(uid)) && user?.removed !== true);
  const dt1 = active.filter(([, user]) => Number(user.depth) === 1).length;
  const dt2 = active.filter(([, user]) => Number(user.depth) === 2).length;
  return active.length >= MIN_VALID_CACHE_USERS && dt1 > 0 && dt2 > 0;
}

function normalizeCacheUser(user, fallbackUid = '') {
  const uid = String(user?.uid || user?.user_id || user?.userId || fallbackUid || '').trim();
  const depth = Number(user?.depth);
  const label = user?.label || user?.dt_level || user?.status || depthToDtLevel(depth);
  const username = cleanUsername(user?.username || '');
  if (!uid || !username || !Number.isFinite(depth) || !label) return null;
  return {
    username,
    uid,
    depth,
    label: String(label).toUpperCase(),
    removed: Boolean(user.removed),
    sources: Array.isArray(user.sources) ? [...new Set(user.sources)] : [],
  };
}

function normalizeFinalDtCache(cache) {
  const normalized = emptyDtData(Array.isArray(cache?.source) ? cache.source.join(', ') : '');
  normalized.updated_at = cache?.updatedAt || '';
  normalized.updatedAt = normalized.updated_at;
  normalized.source = Array.isArray(cache?.source) ? cache.source : [DEFAULT_TRUST_URL, DEFAULT_TRUST_VIEW_URL];
  normalized.source_url = normalized.source.join(', ');
  normalized.sourceUrl = normalized.source_url;
  normalized.partial = Boolean(cache?.partial);
  normalized.warning = cache?.warning || '';
  normalized.fetch_status = normalized.warning || normalized.fetch_status;

  for (const [uid, rawUser] of Object.entries(cache?.users || {})) {
    const user = normalizeCacheUser(rawUser, uid);
    if (!user) continue;
    if (user.removed) {
      normalized.removedUsers.push({
        userId: user.uid,
        user_id: user.uid,
        username: user.username,
        depth: user.depth,
        removed: true,
        reason: 'excluded',
        sources: user.sources,
        profileUrl: `https://bitcointalk.org/index.php?action=profile;u=${user.uid}`,
      });
      normalized.removed_index[user.uid] = true;
      normalized.removed_index[normalizeUsername(user.username)] = true;
      continue;
    }

    normalized.users[user.uid] = {
      user_id: user.uid,
      userId: user.uid,
      uid: user.uid,
      username: user.username,
      status: user.label,
      dt_level: user.label,
      label: user.label,
      depth: user.depth,
      sources: user.sources,
      profileUrl: `https://bitcointalk.org/index.php?action=profile;u=${user.uid}`,
    };
    normalized.username_index[user.uid] = user.uid;
    normalized.username_index[user.username] = user.uid;
    normalized.username_index[normalizeUsername(user.username)] = user.uid;
  }

  recomputeStats(normalized);
  normalized.dt1Users = Object.values(normalized.users).filter(user => user.dt_level === 'DT1').map(toPublicTrustUser);
  normalized.dt2Users = Object.values(normalized.users).filter(user => user.dt_level === 'DT2').map(toPublicTrustUser);
  return normalized;
}

function legacyDataToDtCache(data) {
  const users = {};
  Object.values(data?.users || {}).forEach(user => {
    const uid = String(user.user_id || user.userId || '').trim();
    const depth = Number(user.depth || depthFromLevel(user.dt_level || user.status));
    if (!uid || !Number.isFinite(depth)) return;
    users[uid] = {
      username: cleanUsername(user.username || ''),
      uid,
      depth,
      label: depthToDtLevel(depth),
      removed: false,
      sources: Array.isArray(user.sources) ? user.sources : [data.source_url || DEFAULT_TRUST_URL],
    };
  });
  (data?.removedUsers || []).forEach(user => {
    const uid = String(user.user_id || user.userId || '').trim();
    const depth = Number(user.depth);
    if (!uid || !Number.isFinite(depth)) return;
    users[uid] = {
      username: cleanUsername(user.username || ''),
      uid,
      depth,
      label: depthToDtLevel(depth),
      removed: true,
      sources: Array.isArray(user.sources) ? user.sources : [data.source_url || DEFAULT_TRUST_URL],
    };
  });
  const cache = createDtCache(users);
  cache.updatedAt = data.updated_at || new Date().toISOString();
  return cache;
}

function absolutizeBitcointalkUrl(url) {
  try {
    return new URL(String(url || ''), 'https://bitcointalk.org/').href;
  } catch {
    return String(url || '');
  }
}

function ownText(element) {
  return Array.from(element.childNodes || [])
    .filter(node => node.nodeType === Node.TEXT_NODE)
    .map(node => node.textContent || '')
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseDepthLabel(text) {
  const match = String(text || '').match(/\bDepth\s*([0-9]+)\b/i);
  if (!match) return null;
  const depth = Number(match[1]);
  return Number.isInteger(depth) && depth > 0 ? depth : 0;
}

function normalizeTrustRoot(username) {
  return normalizeUsername(username).replace(/^~/, '');
}

function parseTrustListLine(line) {
  const text = cleanUsername(line);
  const match = text.match(/^(.+?)(->|-\/>)(.+)$/);
  if (!match) return null;
  const source = cleanUsername(match[1]);
  const target = cleanUsername(match[3]);
  if (!source || !target) return null;
  return {
    source,
    target,
    excluded: match[2] === '-/>',
  };
}

function parseRawTrustLines(text) {
  const entries = String(text || '')
    .split(/\r?\n/)
    .map(parseTrustListLine)
    .filter(Boolean);
  if (!entries.length) return null;

  const data = emptyDtData(DEFAULT_TRUST_URL);
  data.updated_at = new Date().toISOString();
  data.sourceUrl = DEFAULT_TRUST_URL;
  data.source_url = DEFAULT_TRUST_URL;

  const excludedBySource = new Map();
  const includedBySource = new Map();
  entries.forEach(entry => {
    const sourceKey = normalizeTrustRoot(entry.source);
    const targetKey = normalizeTrustRoot(entry.target);
    const map = entry.excluded ? excludedBySource : includedBySource;
    if (!map.has(sourceKey)) map.set(sourceKey, new Map());
    map.get(sourceKey).set(targetKey, entry.target);
  });

  const addParsedUser = (username, depth, includedBy) => {
    const dtLevel = depthToDtLevel(depth);
    const clean = cleanUsername(username);
    if (!dtLevel || !clean) return;
    const key = `user:${normalizeUsername(clean)}`;
    const existing = data.users[key];
    if (existing?.dt_level === 'DT1') return;
    if (existing?.dt_level === 'DT2' && dtLevel !== 'DT1') return;
    data.users[key] = {
      user_id: null,
      userId: null,
      username: clean,
      status: dtLevel,
      dt_level: dtLevel,
      depth,
      included_by: includedBy ? [includedBy] : [],
      profileUrl: '',
    };
    data.username_index[clean] = key;
    data.username_index[normalizeUsername(clean)] = key;
  };

  const rootIncludes = includedBySource.get('defaulttrust') || includedBySource.get('~defaulttrust') || new Map();
  const rootExcludes = excludedBySource.get('defaulttrust') || excludedBySource.get('~defaulttrust') || new Map();
  const dt1 = new Map();

  for (const [targetKey, username] of rootIncludes.entries()) {
    if (rootExcludes.has(targetKey)) {
      addRemovedUser(data, username, 1, '~DefaultTrust');
      continue;
    }
    dt1.set(targetKey, username);
    addParsedUser(username, 1, '~DefaultTrust');
  }

  const dt2Excluded = new Set();
  for (const dt1Key of dt1.keys()) {
    const excludes = excludedBySource.get(dt1Key);
    if (!excludes) continue;
    for (const [targetKey, username] of excludes.entries()) {
      dt2Excluded.add(targetKey);
      addRemovedUser(data, username, 2, dt1.get(dt1Key));
    }
  }

  for (const [dt1Key, included] of includedBySource.entries()) {
    if (!dt1.has(dt1Key)) continue;
    for (const [targetKey, username] of included.entries()) {
      if (dt1.has(targetKey) || dt2Excluded.has(targetKey)) continue;
      addParsedUser(username, 2, dt1.get(dt1Key));
    }
  }

  recomputeStats(data);
  data.dt1Users = Object.values(data.users).filter(user => user.dt_level === 'DT1').map(toPublicTrustUser);
  data.dt2Users = Object.values(data.users).filter(user => user.dt_level === 'DT2').map(toPublicTrustUser);
  return data;
}

function addRemovedUser(data, username, depth, includedBy = '') {
  const clean = cleanUsername(username);
  if (!clean) return;
  const key = `user:${normalizeUsername(clean)}`;
  const removedUser = {
    userId: null,
    user_id: null,
    username: clean,
    depth,
    removed: true,
    reason: 'excluded',
    included_by: includedBy ? [includedBy] : [],
    profileUrl: '',
  };
  data.removedUsers.push(removedUser);
  data.removed_index[key] = true;
  data.removed_index[normalizeUsername(clean)] = true;
  delete data.users[key];
}

function parseDefaultTrustPage(html) {
  const doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
  const bodyText = cleanUsername(doc.body?.textContent || '');
  if (/Only registered members are allowed to access this section/i.test(bodyText) || doc.querySelector('#frmLogin')) {
    throw new Error('Official DefaultTrust page requires a logged-in Bitcointalk session.');
  }

  const data = emptyDtData(DEFAULT_TRUST_URL);
  data.updated_at = new Date().toISOString();
  data.sourceUrl = DEFAULT_TRUST_URL;
  data.source_url = DEFAULT_TRUST_URL;
  const sectionFound = { 1: false, 2: false };

  const addUser = (rawUser, depth, removed = false) => {
    const dtLevel = depthToDtLevel(depth);
    if (!dtLevel) return;
    const userId = rawUser.userId || null;
    const username = cleanUsername(rawUser.username || '');
    if (!userId && !username) return;

    const key = userId || `user:${normalizeUsername(username)}`;
    if (removed) {
      const removedUser = {
        userId,
        user_id: userId,
        username: username || null,
        depth,
        removed: true,
        reason: 'strikethrough',
        profileUrl: rawUser.profileUrl || (userId ? `https://bitcointalk.org/index.php?action=profile;u=${userId}` : ''),
      };
      data.removedUsers.push(removedUser);
      data.removed_index[key] = true;
      if (username) data.removed_index[normalizeUsername(username)] = true;
      delete data.users[key];
      return;
    }

    if (data.removed_index[key] || data.removed_index[normalizeUsername(username)]) return;
    const existing = data.users[key];
    if (existing?.dt_level === 'DT1') return;
    if (existing?.dt_level === 'DT2' && dtLevel !== 'DT1') return;

    data.users[key] = {
      user_id: userId,
      userId,
      username: username || null,
      status: dtLevel,
      dt_level: dtLevel,
      depth,
      profileUrl: rawUser.profileUrl || (userId ? `https://bitcointalk.org/index.php?action=profile;u=${userId}` : ''),
    };
    if (userId) data.username_index[userId] = key;
    if (username) {
      data.username_index[username] = key;
      data.username_index[normalizeUsername(username)] = key;
    }
  };

  // The Bitcointalk DefaultTrust page is an SMF page where user profile links
  // appear under textual section headers such as "Depth 1" and "Depth 2".
  // Walk elements in document order, updating the active section when a Depth
  // label is encountered, then collect profile/trust user links inside it.
  let currentDepth = null;
  const walker = doc.createTreeWalker(doc.body || doc, NodeFilter.SHOW_ELEMENT);
  while (walker.nextNode()) {
    const el = walker.currentNode;
    const depth = parseDepthLabel(ownText(el));
    if (depth !== null) {
      currentDepth = depth || null;
      if (currentDepth) sectionFound[currentDepth] = true;
    }

    const tag = (el.tagName || '').toLowerCase();
    if ((tag === 's' || tag === 'strike' || tag === 'del') && currentDepth) {
      const removedName = cleanUsername(el.textContent || '');
      if (removedName && !el.querySelector('a[href*="u="]')) {
        addUser({ username: removedName, profileUrl: '' }, currentDepth, true);
      }
      continue;
    }
    if (tag !== 'a' || !currentDepth) continue;
    const href = el.getAttribute('href') || '';
    if (!/[?;&]u=\d+/.test(href) || !/action=profile/i.test(href)) continue;
    addUser({
      userId: extractUserIdFromUrl(href),
      username: el.textContent,
      profileUrl: absolutizeBitcointalkUrl(href.replace(/action=trust/i, 'action=profile')),
    }, currentDepth, isStruckThrough(el));
  }

  recomputeStats(data);
  data.dt1Users = Object.values(data.users).filter(user => user.dt_level === 'DT1').map(toPublicTrustUser);
  data.dt2Users = Object.values(data.users).filter(user => user.dt_level === 'DT2').map(toPublicTrustUser);
  if (_settings.trustPositionBadgeDebug) {
    console.info('[BTT trustPositionBadge] parser result', {
      depth1SectionFound: sectionFound[1],
      depth2SectionFound: sectionFound[2],
      dt1Users: data.dt1Users.length,
      dt2Users: data.dt2Users.length,
      removedUsers: data.removedUsers.length,
    });
  }
  if (!data.dt1Users.length || !data.dt2Users.length) {
    const rawData = parseRawTrustLines(doc.body?.textContent || html);
    if (rawData?.dt1Users?.length && rawData?.dt2Users?.length) return rawData;
  }
  if (!data.dt1Users.length) throw new Error('Official DefaultTrust page structure changed: Depth 1 users not found.');
  if (!data.dt2Users.length) throw new Error('Official DefaultTrust page structure changed: Depth 2 users not found.');
  return data;
}

function isStruckThrough(node) {
  let current = node;
  while (current && current.nodeType === Node.ELEMENT_NODE) {
    const tag = current.tagName.toLowerCase();
    if (tag === 's' || tag === 'strike' || tag === 'del') return true;
    current = current.parentElement;
  }
  return false;
}

function toParsedTrustRecord(user, sourcePage, removed = false) {
  const uid = String(user?.uid || user?.user_id || user?.userId || '').trim();
  const username = cleanUsername(user?.username || '');
  const depth = Number(user?.depth);
  const label = user?.label || user?.dt_level || user?.status || depthToDtLevel(depth);
  if (!username || !Number.isFinite(depth) || depth < 1) return null;
  return {
    username,
    uid: uid || null,
    depth,
    label: label || depthToDtLevel(depth),
    removed: Boolean(removed || user.removed),
    sources: [sourcePage],
  };
}

function legacyDataToParsedRecords(data, sourcePage) {
  const records = [];
  Object.values(data?.users || {}).forEach(user => {
    const record = toParsedTrustRecord(user, sourcePage, false);
    if (record) records.push(record);
  });
  (data?.removedUsers || []).forEach(user => {
    const record = toParsedTrustRecord(user, sourcePage, true);
    if (record) records.push(record);
  });
  return records;
}

function parseTrustDtPage(html) {
  if (looksLikeUnavailableTrustPage(html)) {
    throw new Error('DT list unavailable. Please login to Bitcointalk and refresh DT cache.');
  }
  const parsed = parseDefaultTrustPage(html);
  const records = legacyDataToParsedRecords(parsed, DEFAULT_TRUST_URL);
  if (_settings.trustPositionBadgeDebug) {
    console.debug('[BTT trustPositionBadge] parsed dt page', {
      users: records.filter(record => !record.removed).length,
      removed: records.filter(record => record.removed).length,
    });
  }
  return {
    source: DEFAULT_TRUST_URL,
    records,
  };
}

function parseTrustViewUsers(html) {
  const doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
  const index = {};
  Array.from(doc.querySelectorAll('a[href*="u="]')).forEach(link => {
    const href = link.getAttribute('href') || '';
    if (!/action=profile/i.test(href)) return;
    const userId = extractUserIdFromUrl(href);
    const username = cleanUsername(link.textContent || '');
    if (!userId || !username) return;
    index[normalizeUsername(username)] = {
      userId,
      user_id: userId,
      username,
      profileUrl: absolutizeBitcointalkUrl(href.replace(/action=trust/i, 'action=profile')),
    };
  });
  return index;
}

function parseTrustDtViewPage(html) {
  const doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
  if (looksLikeUnavailableTrustPage(html)) {
    throw new Error('DT list unavailable. Please login to Bitcointalk and refresh DT cache.');
  }

  const records = [];
  let currentDepth = null;
  const walker = doc.createTreeWalker(doc.body || doc, NodeFilter.SHOW_ELEMENT);
  while (walker.nextNode()) {
    const el = walker.currentNode;
    const depth = parseDepthLabel(ownText(el));
    if (depth !== null) currentDepth = depth || null;

    const tag = (el.tagName || '').toLowerCase();
    if (tag !== 'a' || !currentDepth) continue;
    const href = el.getAttribute('href') || '';
    if (!/[?;&]u=\d+/.test(href) || !/action=profile/i.test(href)) continue;

    const uid = extractUidFromProfileUrl(href);
    const username = cleanUsername(el.textContent || '');
    if (!uid || !username) continue;
    records.push({
      username,
      uid,
      depth: currentDepth,
      label: depthToDtLevel(currentDepth),
      removed: isStruckThrough(el),
      exactDepth: true,
      sources: [DEFAULT_TRUST_VIEW_URL],
    });
  }

  if (!records.length) {
    for (const user of Object.values(parseTrustViewUsers(html))) {
      records.push({
        username: user.username,
        uid: user.userId,
        depth: 1,
        label: 'DT1',
        removed: false,
        exactDepth: false,
        sources: [DEFAULT_TRUST_VIEW_URL],
      });
    }
  }

  if (_settings.trustPositionBadgeDebug) {
    console.debug('[BTT trustPositionBadge] parsed dtview page', {
      users: records.filter(record => !record.removed).length,
      removed: records.filter(record => record.removed).length,
    });
  }
  return { source: DEFAULT_TRUST_VIEW_URL, records };
}

function mergeDtData(dtData, dtViewData) {
  const dtRecords = Array.isArray(dtData?.records) ? dtData.records : [];
  const viewRecords = Array.isArray(dtViewData?.records) ? dtViewData.records : [];
  const viewByName = new Map();
  viewRecords.forEach(record => {
    if (record.username && record.uid) viewByName.set(normalizeUsername(record.username), record);
  });

  const users = {};
  const mergeRecord = (record, preferDepth = false) => {
    if (!record?.username) return;
    const enriched = record.uid ? record : { ...record, uid: viewByName.get(normalizeUsername(record.username))?.uid || null };
    if (!enriched.uid) return;
    const uid = String(enriched.uid);
    const existing = users[uid];
    const depth = preferDepth || !existing ? Number(enriched.depth) : Number(existing.depth);
    const username = cleanUsername(enriched.username || existing?.username || '');
    const sources = [...new Set([...(existing?.sources || []), ...(enriched.sources || [])])];
    users[uid] = {
      username,
      uid,
      depth,
      label: depthToDtLevel(depth),
      removed: Boolean(existing?.removed || enriched.removed),
      sources,
    };
  };

  dtRecords.forEach(record => mergeRecord(record, false));
  viewRecords.forEach(record => mergeRecord(record, record.exactDepth === true));

  for (const [uid, user] of Object.entries(users)) {
    if (!user.label) delete users[uid];
  }

  const cache = createDtCache(users);
  cache.source = [DEFAULT_TRUST_URL];
  if (viewRecords.length) cache.source.push(DEFAULT_TRUST_VIEW_URL);
  cache.partial = !viewRecords.length;
  cache.warning = cache.partial ? 'DT cache refreshed partially. dtview was unavailable.' : '';
  if (_settings.trustPositionBadgeDebug) {
    console.debug('[BTT trustPositionBadge] merged dt cache', {
      users: Object.keys(cache.users).length,
      partial: cache.partial,
    });
  }
  return cache;
}

function enrichDataWithTrustView(data, trustViewUsers) {
  if (!data?.users || !trustViewUsers || !Object.keys(trustViewUsers).length) return data;
  const users = {};
  const usernameIndex = { ...(data.username_index || {}) };

  for (const [key, user] of Object.entries(data.users)) {
    const match = trustViewUsers[normalizeUsername(user.username)];
    if (!match || user.user_id) {
      users[key] = user;
      continue;
    }

    const numericKey = match.userId;
    const enriched = {
      ...user,
      user_id: numericKey,
      userId: numericKey,
      username: user.username || match.username,
      profileUrl: match.profileUrl,
    };
    users[numericKey] = enriched;
    usernameIndex[numericKey] = numericKey;
    if (enriched.username) {
      usernameIndex[enriched.username] = numericKey;
      usernameIndex[normalizeUsername(enriched.username)] = numericKey;
    }
  }

  data.users = users;
  data.username_index = usernameIndex;
  data.dt1Users = Object.values(data.users).filter(user => user.dt_level === 'DT1').map(toPublicTrustUser);
  data.dt2Users = Object.values(data.users).filter(user => user.dt_level === 'DT2').map(toPublicTrustUser);
  recomputeStats(data);
  return data;
}

function isCacheFresh(data) {
  if (!data?.updated_at) return false;
  const updatedAt = Date.parse(data.updated_at);
  if (!Number.isFinite(updatedAt)) return false;
  return Date.now() - updatedAt < DT_REFRESH_INTERVAL_HOURS * 60 * 60 * 1000;
}

function buildDtMaps(records) {
  const byUsername = new Map();
  const byUid = new Map();

  for (const item of records) {
    if (!item || !item.username) continue;

    const usernameKey = item.username.trim().toLowerCase();
    byUsername.set(usernameKey, item);

    if (item.uid !== null && item.uid !== undefined) {
      byUid.set(String(item.uid), item);
    }
  }

  return { byUsername, byUid };
}

async function loadDtData() {
  const response = await fetch(DT_DATA_URL, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error('Failed to load DT data: ' + response.status);
  }

  const json = await response.json();

  if (!json || !Array.isArray(json.data)) {
    throw new Error('Invalid DT data format');
  }

  return json.data;
}

function normalizeGitHubDtRecords(records = [], timestamp = Date.now(), fetchStatus = '') {
  const normalized = emptyDtData(DT_DATA_URL);
  const updatedAt = Number(timestamp) || Date.now();
  normalized.updated_at = new Date(updatedAt).toISOString();
  normalized.updatedAt = normalized.updated_at;
  normalized.source = [DT_DATA_URL];
  normalized.source_url = DT_DATA_URL;
  normalized.sourceUrl = DT_DATA_URL;
  normalized.fetch_status = fetchStatus || 'Using GitHub DT data';
  normalized.rawRecords = records;

  buildDtMaps(records);
  normalized.byUsername = new Map();
  normalized.byUid = new Map();

  for (const item of records) {
    if (!item || !item.username) continue;

    const username = cleanUsername(item.username);
    const usernameKey = normalizeUsername(username);
    const uid = item.uid !== null && item.uid !== undefined ? String(item.uid).trim() : '';
    const rawDepth = item.depth !== null && item.depth !== undefined ? Number(item.depth) : NaN;
    const depth = Number.isFinite(rawDepth) ? rawDepth : null;
    const label = normalizeDtLevel(item.label || item.dt_level || item.status) || depthToDtLevel(depth);
    if (!username || !label) continue;

    const key = uid || `user:${usernameKey}`;
    const excluded = item.excluded === true || item.relation === 'excluded' || Number(item.strength) < 0;
    const removed = item.removed === true;
    const user = {
      user_id: uid || null,
      userId: uid || null,
      uid: uid || null,
      username,
      status: label,
      dt_level: label,
      label,
      depth,
      strength: item.strength !== undefined && item.strength !== null ? Number(item.strength) : null,
      excluded,
      removed,
      active: item.active !== false && !excluded && !removed,
      relation: excluded ? 'excluded' : 'included',
      source: DT_DATA_URL,
      sources: [DT_DATA_URL],
      profileUrl: uid ? `https://bitcointalk.org/index.php?action=profile;u=${encodeURIComponent(uid)}` : '',
    };

    const existing = normalized.users[key];
    if (existing && Number.isFinite(Number(existing.depth)) && Number.isFinite(Number(user.depth)) && Number(existing.depth) <= Number(user.depth)) {
      continue;
    }

    normalized.users[key] = user;
    normalized.username_index[username] = key;
    normalized.username_index[usernameKey] = key;
    if (uid) {
      normalized.username_index[uid] = key;
      normalized.byUid.set(uid, user);
    }
    normalized.byUsername.set(usernameKey, user);
  }

  recomputeStats(normalized);
  normalized.dt1Users = Object.values(normalized.users).filter(user => user.dt_level === 'DT1').map(toPublicTrustUser);
  normalized.dt2Users = Object.values(normalized.users).filter(user => user.dt_level === 'DT2').map(toPublicTrustUser);
  return normalized;
}

async function loadDtCache({ allowStale = false } = {}) {
  const result = await storageGet([CACHE_KEY, CACHE_TIMESTAMP_KEY]);
  const records = result[CACHE_KEY];
  const timestamp = Number(result[CACHE_TIMESTAMP_KEY] || 0);
  if (!Array.isArray(records) || !timestamp) return null;

  const fresh = Date.now() - timestamp < DT_REFRESH_INTERVAL_HOURS * 60 * 60 * 1000;
  if (!allowStale && !fresh) return null;
  return { records, timestamp, fresh };
}

async function saveDtCache(records) {
  if (!Array.isArray(records) || records.length === 0) {
    throw new Error('DT cache is empty or invalid.');
  }

  const timestamp = Date.now();
  await storageSet({
    [CACHE_KEY]: records,
    [CACHE_TIMESTAMP_KEY]: timestamp,
  });
  return { records, timestamp, fresh: true };
}

async function loadCachedDtData({ allowStale = true } = {}) {
  const cache = await loadDtCache({ allowStale });
  return cache
    ? normalizeGitHubDtRecords(cache.records, cache.timestamp, cache.fresh ? 'Using cached GitHub DT data' : 'Using stale cached GitHub DT data')
    : emptyDtData(DT_DATA_URL);
}

async function saveDtData(data) {
  const records = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
  const cache = await saveDtCache(records);
  return normalizeGitHubDtRecords(cache.records, cache.timestamp, 'GitHub DT data refreshed');
}

function isValidDtData(data) {
  return data?.cache_version === CACHE_VERSION
    && data?.cacheValid === true
    && data?.stats?.total_users >= MIN_VALID_CACHE_USERS
    && Object.keys(data.users || {}).length > 0
    && Array.isArray(data.dt1Users)
    && Array.isArray(data.dt2Users);
}

async function clearDtCache() {
  await storageRemove([CACHE_KEY, CACHE_TIMESTAMP_KEY, LEGACY_CACHE_KEY]);
  _dtData = null;
  _loadPromise = null;
}

function looksLikeLoginPage(html) {
  const text = String(html || '');
  const visibleText = cleanUsername(text.replace(/<script[\s\S]*?<\/script>/gi, ' '));
  return /Only registered members are allowed to access this section/i.test(visibleText)
    || /action=login/i.test(text)
    || /<form[^>]+id=["']frmLogin["']/i.test(text)
    || /<title>\s*Login\s*<\/title>/i.test(text)
    || (/\bLogin\b/i.test(visibleText) && /\bpassword\b/i.test(visibleText))
    || /please login/i.test(visibleText)
    || /you are not allowed/i.test(visibleText);
}

function looksLikeUnavailableTrustPage(html) {
  if (!String(html || '').trim()) return true;
  const text = cleanUsername(String(html || '').replace(/<script[\s\S]*?<\/script>/gi, ' ')).slice(0, 3000);
  return looksLikeLoginPage(html)
    || /captcha|verify you are human|cloudflare|checking your browser/i.test(text)
    || /403|forbidden|not allowed|access denied/i.test(text)
    || /DT list unavailable|DefaultTrust unavailable|trust list unavailable/i.test(text);
}

function sendRuntimeMessage(message) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('DefaultTrust page fetch timed out.')), FETCH_TIMEOUT_MS);
    if (typeof chrome === 'undefined' || !chrome.runtime?.sendMessage) {
      clearTimeout(timer);
      reject(new Error('Extension runtime is unavailable.'));
      return;
    }

    chrome.runtime.sendMessage(message, response => {
      clearTimeout(timer);
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(response);
    });
  });
}

async function fetchDirectFromContentPage(url = DEFAULT_TRUST_URL) {
  if (location.hostname !== 'bitcointalk.org') {
    throw new Error('Current page is not Bitcointalk.');
  }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const response = await fetch(url, { credentials: 'include', cache: 'no-store', signal: controller.signal });
      const html = await response.text();
      if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
      if (_settings.trustPositionBadgeDebug) {
        console.debug('[BTT trustPositionBadge] DT fetch', {
          method: 'content-direct',
          url,
          status: response.status,
          htmlLength: html.length,
          loginDetected: looksLikeLoginPage(html),
        });
      }
      return { success: true, html, method: 'content-direct', status: response.status };
  } finally {
    clearTimeout(timer);
  }
}

async function fetchOfficialBitcointalkPage(url = DEFAULT_TRUST_URL) {
  const attempts = [];
  const tryAttempt = async (label, fn) => {
    try {
      const result = await fn();
      if (!result?.success) throw new Error(result?.error || `${label} failed.`);
      if (looksLikeUnavailableTrustPage(result.html)) throw new Error(`${label} returned an unavailable Bitcointalk trust page.`);
      _fetchStatus = `Fetched via ${result.method || label}`;
      if (_settings.trustPositionBadgeDebug) {
        console.debug('[BTT trustPositionBadge] DT fetch', {
          method: result.method || label,
          url,
          status: result.status || 'ok',
          htmlLength: String(result.html || '').length,
          loginDetected: looksLikeLoginPage(result.html),
        });
      }
      return result.html;
    } catch (err) {
      attempts.push(`${label}: ${err.message}`);
      if (_settings.trustPositionBadgeDebug) console.warn('[BTT trustPositionBadge] DT fetch failed', { method: label, reason: err.message });
      return null;
    }
  };

  const background = await tryAttempt('background', async () => {
    const response = await sendRuntimeMessage({ action: 'fetchUrl', url });
    return { ...response, method: 'background' };
  });
  if (background) return background;

  const direct = await tryAttempt('content-direct', () => fetchDirectFromContentPage(url));
  if (direct) return direct;

  const tab = await tryAttempt('content-tab', async () => {
    const response = await sendRuntimeMessage({ action: 'fetchOfficialDTViaTab', url });
    return { ...response, method: 'content-tab' };
  });
  if (tab) return tab;

  throw new Error(`${attempts.join(' | ')}. Open Bitcointalk in a logged-in tab, then refresh DT cache.`);
}

async function fetchTrustPage(url) {
  try {
    return await fetchOfficialBitcointalkPage(url);
  } catch (err) {
    if (url === DEFAULT_TRUST_VIEW_URL || /login|403|forbidden|not allowed/i.test(err.message)) {
      throw new Error('DT list unavailable. Please login to Bitcointalk and refresh DT cache.');
    }
    throw err;
  }
}

async function fetchOfficialDTForMessage(url = DEFAULT_TRUST_URL) {
  try {
    const result = await fetchDirectFromContentPage(url);
    if (looksLikeUnavailableTrustPage(result.html)) {
      return { success: false, error: 'DT list unavailable. Please login to Bitcointalk and refresh DT cache.', method: 'content-direct' };
    }
    return result;
  } catch (err) {
    return { success: false, error: err.message, method: 'content-direct' };
  }
}

function getDisplayFetchStatus(data) {
  if (data?.fetch_status) return data.fetch_status;
  if (data?.cacheValid) return 'Using valid cached DT data';
  if (data?.stats?.total_users > 0) return 'DT cache is stale or incomplete. Refresh DT Cache before showing Not in DT.';
  return 'DT data unavailable. Refresh DT cache later.';
}

async function loadTrustBadgeData({ forceRefresh = false } = {}) {
  if (_loadPromise && !forceRefresh) return _loadPromise;

  _loadPromise = (async () => {
    const cached = forceRefresh ? emptyDtData(DT_DATA_URL) : await loadCachedDtData({ allowStale: false });
    if (!forceRefresh && cached.stats.total_users > 0 && isCacheFresh(cached)) {
      _dtData = cached;
      return cached;
    }

    let refreshError = '';
    try {
      const records = await loadDtData();
      const cache = await saveDtCache(records);
      const loaded = normalizeGitHubDtRecords(cache.records, cache.timestamp, 'GitHub DT data refreshed');
      if (!isValidDtData(loaded)) throw new Error('invalid or empty GitHub DT data');
      _dtData = loaded;
      runDiagnosticCheck(_dtData);
      return _dtData;
    } catch (err) {
      refreshError = err.message || String(err);
      logFetchFailure(err.message);
    }

    const staleCached = await loadCachedDtData({ allowStale: true });
    if (staleCached.stats.total_users > 0) {
      _dtData = {
        ...staleCached,
        fetch_status: `Using cached GitHub DT data after refresh failed. Last updated: ${staleCached.updated_at ? new Date(staleCached.updated_at).toLocaleString() : 'unknown'}`,
      };
      return _dtData;
    }

    _dtData = emptyDtData(DT_DATA_URL);
    _dtData.fetch_status = refreshError || 'DT data unavailable. Refresh DT cache later.';
    return _dtData;
  })();

  return _loadPromise;
}

function runDiagnosticCheck(data) {
  if (_settings.trustPositionBadgeDebug) {
    console.debug('[BTT trustPositionBadge] DT cache loaded', {
      total: data.stats.total_users,
      dt1: data.stats.dt1_count,
      dt2: data.stats.dt2_count,
      removed: data.stats.removed_count || 0,
      finalDtCacheUserCount: Object.keys(data.users || {}).length,
      partial: Boolean(data.partial),
    });
  }
}

function logFetchFailure(reason) {
  if (_loggedFetchFailure) return;
  _loggedFetchFailure = true;
  console.warn('[Bitcointalk DT] Failed to load DT data', reason);
}

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
.bct-dt-badge,
.btt-trust-badge {
  display:inline-block;
  margin-top:4px;
  padding:2px 6px;
  border-radius:4px;
  font-size:9px;
  font-weight:bold;
  color:#fff;
  line-height:1.3;
  white-space:nowrap;
  cursor:help;
}
.btt-trust-dt0 { background:#111827; }
.btt-trust-dt1 { background:#15803d; }
.btt-trust-dt2 { background:#2563eb; }
.btt-trust-dt { background:#6b7280; }
.btt-trust-none { background:#6b7280; }
.btt-trust-unavailable { background:#991b1b; }
`;
  document.head.appendChild(style);
}

function getAuthors() {
  const authors = [];
  const seen = new Set();
  const params = new URLSearchParams(location.search);
  const action = params.get('action') || '';
  const isTopicPage = params.has('topic');
  const isProfilePage = action === 'profile' || /^profile(?:;|$)/i.test(action) || /[?;&]action=profile(?:[;&]|$)/i.test(location.href);

  const addAuthor = (posterCell, link = null) => {
    if (!posterCell || seen.has(posterCell)) return;
    if (posterCell.querySelector('.bct-dt-badge, .btt-trust-badge')) return;

    const profileLink = link
      || posterCell.querySelector('b > a[href*="action=profile"][href*="u="]')
      || posterCell.querySelector('a[href*="action=profile"][href*="u="]')
      || posterCell.querySelector('a[href*="action=trust"][href*="u="]');
    const usernameNode = posterCell.querySelector('b > a[href*="action=profile"]')
      || posterCell.querySelector('b')
      || profileLink;
    const username = cleanUsername(usernameNode?.textContent || profileLink?.textContent || '');
    const uidLink = posterCell.querySelector('a[href*="action=profile"][href*="u="]') || profileLink;
    const profileUrl = uidLink?.getAttribute('href') || uidLink?.href || profileLink?.getAttribute('href') || profileLink?.href || '';
    const userId = extractUserIdFromUserUrl(profileUrl);
    const key = `${userId || normalizeUsername(username)}:${authors.length}`;
    if (!username && !userId) return;
    seen.add(posterCell);
    authors.push({ posterCell, anchor: usernameNode || profileLink, username, profileUrl, userId, key });
  };

  if (isTopicPage) {
    Array.from(document.querySelectorAll('td.poster_info, .poster_info')).forEach(posterCell => {
      addAuthor(posterCell);
    });
  }

  if (isProfilePage) {
    const profileUid = getProfileUid() || params.get('u') || '';
    const profileBlocks = Array.from(document.querySelectorAll('td.windowbg, td.windowbg2, .windowbg, .windowbg2, #bodyarea table, #bodyarea'))
      .filter(el => /Name\s*:|Posts\s*:|Activity\s*:|Merit\s*:|Trust\s*:|Position\s*:|Date Registered\s*:|Last Active\s*:/i.test(el.textContent || ''));

    const profileBlock = profileBlocks.find(el => el.querySelector('img.avatar, img[src*="avatar"], a[href*="action=trust"][href*="u="]'))
      || profileBlocks[0]
      || document.querySelector('#bodyarea')
      || document.body;
    if (profileBlock) {
      const profileName = getProfileUsername(profileBlock);
      const usernameText = profileName.text;
      authors.push({
        posterCell: profileBlock,
        anchor: profileName.element || profileBlock.querySelector('b a[href*="action=profile"], b, img.avatar, img[src*="avatar"]'),
        username: usernameText,
        profileUrl: location.href,
        userId: profileUid,
        isProfile: true,
        key: `${profileUid || normalizeUsername(usernameText)}:profile`,
      });
    }
  }

  return authors;
}

function findRankStarInsertionPoint(posterCell) {
  const starImages = Array.from(posterCell.querySelectorAll('img[alt="*"], img[src*="star"], img[src*="Star"]'))
    .filter(img => !/avatar/i.test(img.className || '') && !/avatar/i.test(img.src || ''));
  const lastStar = starImages[starImages.length - 1];
  if (lastStar) {
    let node = lastStar.nextSibling;
    while (node && node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) node = node.nextSibling;
    if (node?.nodeName === 'BR') return { reference: node, position: 'afterend', addBreakAfter: true };
    return { reference: lastStar, position: 'afterend', addBreakBefore: true, addBreakAfter: true };
  }

  const rankTextNode = document.createTreeWalker(posterCell, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const text = cleanUsername(node.textContent || '');
      if (!text || text.length > 80) return NodeFilter.FILTER_REJECT;
      return /^(Position\s*:\s*)?(Brand new|Newbie|Jr\. Member|Member|Full Member|Sr\. Member|Hero Member|Legendary|Administrator|Global Moderator|Staff)$/i.test(text)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    }
  }).nextNode();

  if (rankTextNode?.parentElement) {
    let node = rankTextNode.nextSibling;
    while (node && node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) node = node.nextSibling;
    if (node?.nodeName === 'BR') return { reference: node, position: 'afterend', addBreakAfter: true };
    return { reference: rankTextNode.parentElement, position: 'afterend', addBreakBefore: true, addBreakAfter: true };
  }

  return null;
}

function findProfileUsernameInsertionPoint(posterCell) {
  const textNode = document.createTreeWalker(posterCell, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return /Name\s*:/i.test(node.textContent || '')
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    }
  }).nextNode();

  if (!textNode) return null;

  const container = textNode.parentElement;
  if (!container) return null;

  const row = container.closest('tr');
  if (row) {
    const cells = Array.from(row.children || []);
    const labelCellIndex = cells.findIndex(cell => /Name\s*:/i.test(cell.textContent || ''));
    const valueCell = labelCellIndex >= 0 ? cells[labelCellIndex + 1] : null;
    if (valueCell) return { reference: valueCell, position: 'beforeend', inline: true };
  }

  let node = textNode.nextSibling;
  while (node && node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) node = node.nextSibling;
  if (node && node.nodeName !== 'BR') return { reference: node, position: 'afterend', inline: true };

  return { reference: container, position: 'beforeend', inline: true };
}

function textWithoutTrustBadges(element) {
  if (!element) return '';
  const clone = element.cloneNode(true);
  clone.querySelectorAll?.('.bct-dt-badge, .btt-trust-badge').forEach(badge => badge.remove());
  return cleanUsername(clone.textContent || '');
}

function cleanProfileNameValue(value) {
  return cleanUsername(value).replace(/\s+(Posts|Activity|Merit|Trust|Position|Date Registered|Last Active)\s*:.*$/i, '').trim();
}

function getProfileLabelValue(root, labelPattern) {
  const rows = Array.from(root.querySelectorAll?.('tr') || []);
  for (const row of rows) {
    const cells = Array.from(row.children || []);
    const labelIndex = cells.findIndex(cell => /Name\s*:/i.test(textWithoutTrustBadges(cell)));
    if (labelIndex < 0) continue;

    const valueCell = cells[labelIndex + 1];
    if (valueCell) {
      const value = cleanProfileNameValue(textWithoutTrustBadges(valueCell));
      if (value) return { text: value, element: valueCell };
    }

    const rowText = textWithoutTrustBadges(row);
    const match = rowText.match(labelPattern);
    if (match?.[1]) return { text: cleanProfileNameValue(match[1]), element: row };
  }

  const bodyText = textWithoutTrustBadges(root);
  const match = bodyText.match(labelPattern);
  return match?.[1] ? { text: cleanProfileNameValue(match[1]), element: root } : null;
}

function getProfileUsername(profileBlock) {
  const name = getProfileLabelValue(profileBlock, /Name\s*:\s*([^\n\r]+)/i)
    || getProfileLabelValue(document.body, /Name\s*:\s*([^\n\r]+)/i);
  if (name?.text) return name;

  const fallback = profileBlock.querySelector('b a[href*="action=profile"], b')
    || document.querySelector('#bodyarea b a[href*="action=profile"], #bodyarea b');
  const text = textWithoutTrustBadges(fallback);
  return text ? { text, element: fallback } : { text: '', element: null };
}

function getProfileUid() {
  const candidates = [
    location.href,
    document.querySelector('link[rel="canonical"]')?.href,
    document.querySelector('a[href*="action=profile"][href*="u="]')?.href,
    document.querySelector('a[href*="action=profile"][href*="u="]')?.getAttribute('href'),
    document.querySelector('a[href*="action=trust"][href*="u="]')?.href,
    document.querySelector('a[href*="action=trust"][href*="u="]')?.getAttribute('href'),
  ];
  for (const candidate of candidates) {
    const uid = extractUserIdFromUserUrl(candidate);
    if (uid) return uid;
  }
  return '';
}

function findUserForAuthor(author, data) {
  const users = data?.users || {};
  const uid = String(author.userId || '').trim();
  if (uid) {
    const uidMatch = data?.byUid instanceof Map ? data.byUid.get(uid) : null;
    if (uidMatch || users[uid]) return uidMatch || users[uid];
  }

  const username = normalizeUsername(author.username || '');
  if (!username) return null;
  const usernameMatch = data?.byUsername instanceof Map ? data.byUsername.get(username) : null;
  return usernameMatch
    || users[cleanUsername(author.username || '')]
    || users[username]
    || users[data?.username_index?.[author.username]]
    || users[data?.username_index?.[username]]
    || users[`user:${username}`]
    || null;
}

function getDTStatus(userIdOrUsername, data = _dtData) {
  const key = String(userIdOrUsername || '');
  const user = data?.users?.[key]
    || data?.users?.[data?.username_index?.[key]]
    || data?.users?.[data?.username_index?.[normalizeUsername(key)]]
    || data?.users?.[`user:${normalizeUsername(key)}`];
  return getDtBadgeLabel(user) || '';
}

function getDTDetails(userIdOrUsername, data = _dtData) {
  const key = String(userIdOrUsername || '');
  return data?.users?.[key]
    || data?.users?.[data?.username_index?.[key]]
    || data?.users?.[data?.username_index?.[normalizeUsername(key)]]
    || data?.users?.[`user:${normalizeUsername(key)}`]
    || null;
}

function getDtBadgeLabel(user) {
  if (!user) return null;

  if (user.dt_level) {
    const label = String(user.dt_level).trim().toUpperCase().replace(/\s+/g, '');
    if (/^DT\d+$/.test(label)) return label;
  }

  const mapped = depthToDtLevel(user.depth);
  return mapped;
}

function logTrustDebug(author, data, user, renderedLabel) {
  if (!_settings.trustPositionBadgeDebug) return;
  const uid = String(author.userId || '').trim();
  const users = data?.users || {};
  console.debug('[BTT trustPositionBadge] badge lookup', {
    detected_username: author.username || user?.username || null,
    detected_uid: uid || null,
    uid_exists: Boolean(uid && users[uid]),
    cache_user_count: Object.keys(users).length,
    cache_updatedAt: data?.updated_at || data?.updatedAt || null,
    cacheValid: Boolean(data?.cacheValid),
    raw_dt_level: user?.dt_level || null,
    raw_depth: user?.depth || null,
    rendered_label: renderedLabel,
  });
}

function lookupAuthor(author, data) {
  if (!data?.cacheValid) {
    logTrustDebug(author, data, null, null);
    return { status: 'none', cacheValid: false };
  }
  const user = findUserForAuthor(author, data);
  if (!user) {
    logTrustDebug(author, data, null, null);
    return { status: 'none', cacheValid: true };
  }
  if (user.removed) {
    logTrustDebug(author, data, user, null);
    return { status: 'none', cacheValid: true };
  }
  const label = getDtBadgeLabel(user);
  logTrustDebug(author, data, user, label);
  if (label === 'DT0') return { status: 'dt0', user, cacheValid: true };
  if (label === 'DT1') return { status: 'dt1', user, cacheValid: true };
  if (label === 'DT2') return { status: 'dt2', user, cacheValid: true };
  if (/^DT\d+$/.test(label || '')) return { status: 'dt', user, label, cacheValid: true };
  return { status: 'none', user, cacheValid: true };
}

function shouldShow(status, cacheValid = false) {
  if (status === 'none') {
    const showNotInDt = _settings.showNotInDt === true || _settings.trustPositionBadgeShowNoDt === true;
    return cacheValid && showNotInDt;
  }
  if (status === 'unavailable' || status === 'loading') return false;
  return true;
}

function upsertBadge(author, status, user = null, label = '', cacheValid = false) {
  const existing = author.posterCell.querySelector('.bct-dt-badge, .btt-trust-badge');
  if (!shouldShow(status, cacheValid)) {
    existing?.remove();
    author.posterCell.removeAttribute(APPLIED_ATTR);
    author.posterCell.setAttribute(PROCESSED_ATTR, '1');
    return;
  }

  const meta = POSITIONS[status] || POSITIONS.unavailable;
  const badge = existing || document.createElement('span');
  badge.className = `bct-dt-badge btt-trust-badge ${meta.className}`;
  const displayLabel = label || getDtBadgeLabel(user) || meta.label;
  badge.textContent = displayLabel;
  badge.dataset.position = status;
  badge.title = [
    user ? `Username: ${user.username || author.username || 'unknown'}` : meta.title,
    user ? `UID: ${user.uid || user.user_id || user.userId || author.userId || 'unknown'}` : '',
    user ? `Depth: ${user.depth ?? 'unknown'}` : '',
  ].filter(Boolean).join('\n');

  if (!existing) {
    const rankStarPoint = author.isProfile
      ? findProfileUsernameInsertionPoint(author.posterCell)
      : findRankStarInsertionPoint(author.posterCell);
    if (rankStarPoint?.reference) {
      if (rankStarPoint.inline) badge.style.marginLeft = '4px';
      if (rankStarPoint.addBreakBefore) {
        const beforeBreak = document.createElement('br');
        rankStarPoint.reference.insertAdjacentElement(rankStarPoint.position, beforeBreak);
        beforeBreak.insertAdjacentElement('afterend', badge);
      } else {
        rankStarPoint.reference.insertAdjacentElement(rankStarPoint.position, badge);
      }
      if (rankStarPoint.addBreakAfter) badge.insertAdjacentElement('afterend', document.createElement('br'));
    } else {
      const anchor = author.anchor?.closest?.('b') || author.anchor || author.posterCell.querySelector('b') || author.posterCell.firstElementChild;
      if (anchor && author.posterCell.contains(anchor)) {
        anchor.insertAdjacentElement('afterend', badge);
        if (author.posterCell.matches('td.poster_info, .poster_info')) badge.insertAdjacentElement('afterend', document.createElement('br'));
      } else {
        author.posterCell.insertBefore(badge, author.posterCell.firstChild);
      }
    }
  }
  author.posterCell.setAttribute(APPLIED_ATTR, '1');
  author.posterCell.setAttribute(PROCESSED_ATTR, '1');
}

function applyBadges(data = _dtData) {
  if (_settings.trustPositionBadgeEnabled === false) return;
  injectStyles();
  for (const author of getAuthors()) {
    const { status, user, label, cacheValid } = lookupAuthor(author, data);
    upsertBadge(author, status, user, label, cacheValid);
  }
}

function renderDtBadges(data = _dtData) {
  applyBadges(data);
}

function showLoadingBadges() {
  if (_settings.trustPositionBadgeEnabled === false) return;
  injectStyles();
  for (const author of getAuthors()) {
    if (author.posterCell.getAttribute(PROCESSED_ATTR) === '1') continue;
    upsertBadge(author, 'loading');
  }
}

function scheduleApplyBadges() {
  clearTimeout(_rescanTimer);
  _rescanTimer = setTimeout(() => {
    _rescanTimer = null;
    applyBadges();
  }, RESCAN_DEBOUNCE_MS);
}

function removeBadges() {
  document.querySelectorAll('.bct-dt-badge, .btt-trust-badge').forEach(badge => {
    const next = badge.nextSibling;
    if (next?.nodeName === 'BR') next.remove();
    badge.remove();
  });
  document.querySelectorAll(`[${APPLIED_ATTR}]`).forEach(el => el.removeAttribute(APPLIED_ATTR));
  document.querySelectorAll(`[${PROCESSED_ATTR}]`).forEach(el => el.removeAttribute(PROCESSED_ATTR));
  document.getElementById(STYLE_ID)?.remove();
}

function getTrustRows(data, { query = '', filter = 'all' } = {}) {
  const q = normalizeUsername(query);
  const activeRows = Object.entries(data.users || {})
    .map(([key, user]) => ({ key, ...user, rendered_label: getDtBadgeLabel(user), removed: false }));
  const removedRows = (data.removedUsers || []).map(user => ({
    key: user.userId || user.user_id || `removed:${normalizeUsername(user.username)}`,
    ...user,
    rendered_label: 'Removed',
    removed: true,
  }));

  return [...activeRows, ...removedRows]
    .filter(user => {
      if (filter === 'dt1') return user.rendered_label === 'DT1';
      if (filter === 'dt2') return user.rendered_label === 'DT2';
      if (filter === 'removed') return user.removed;
      return true;
    })
    .filter(user => !q
      || normalizeUsername(user.username).includes(q)
      || String(user.user_id || user.userId || '').includes(q)
      || normalizeUsername(user.key).includes(q))
    .sort((a, b) => {
      if (a.removed !== b.removed) return a.removed ? 1 : -1;
      if (a.depth !== b.depth) return Number(a.depth || 999) - Number(b.depth || 999);
      return normalizeUsername(a.username).localeCompare(normalizeUsername(b.username));
    });
}

function referenceLinks(user) {
  const uid = user.user_id || user.userId;
  const links = [];
  if (uid) links.push(`<a href="https://bitcointalk.org/index.php?action=trust;u=${encodeURIComponent(uid)}" target="_blank" rel="noopener">Trust</a>`);
  if (uid) links.push(`<a href="https://bitcointalk.org/index.php?action=profile;u=${encodeURIComponent(uid)}" target="_blank" rel="noopener">Profile</a>`);
  return links.join(' / ') || '<span style="color:var(--text-secondary,#9ca3af)">Username only</span>';
}

function renderAnalyzerRows(container, data) {
  const query = container.querySelector('#btt-tpb-search')?.value || '';
  const filter = container.querySelector('#btt-tpb-filter')?.value || 'all';
  const rows = getTrustRows(data, { query, filter });
  const table = container.querySelector('#btt-tpb-results');
  const count = container.querySelector('#btt-tpb-result-count');
  if (count) count.textContent = `${rows.length} shown`;
  if (!table) return rows;

  table.innerHTML = rows.slice(0, 250).map(user => `
    <tr>
      <td><strong>${escapeHtml(user.username || user.key)}</strong></td>
      <td>${escapeHtml(user.rendered_label)}</td>
      <td>${escapeHtml(user.depth || '')}</td>
      <td>${escapeHtml(user.user_id || user.userId || '')}</td>
      <td>${user.removed ? 'Removed from displayed depth; reason: strikethrough' : referenceLinks(user)}</td>
    </tr>
  `).join('') || '<tr><td colspan="5" style="color:var(--text-secondary,#9ca3af)">No matching trust users.</td></tr>';
  return rows;
}

export default {
  id:             'trustPositionBadge',
  name:           'Trust Position Badge',
  description:    'Shows DT position badges beside post authors.',
  category:       'User/Profile Tools',
  defaultEnabled: true,

  async init() {
    _settings = await getSettings();
    _messageHandler = (message, sender, sendResponse) => {
      if (message?.action === 'fetchOfficialDTPage') {
        fetchOfficialDTForMessage(message.url || DEFAULT_TRUST_URL).then(sendResponse);
        return true;
      }
      if (message?.action !== 'settingsChanged') return false;
      Promise.all([getSettings(), loadCachedDtData()]).then(([settings, data]) => {
        _settings = settings;
        _dtData = data;
        document.querySelectorAll(`[${PROCESSED_ATTR}]`).forEach(el => el.removeAttribute(PROCESSED_ATTR));
        if (_settings.trustPositionBadgeEnabled === false) removeBadges();
        else applyBadges();
      });
      return false;
    };
    if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
      chrome.runtime.onMessage.addListener(_messageHandler);
    }

    if (_settings.trustPositionBadgeEnabled === false) return;
    _loggedFetchFailure = false;
    loadTrustBadgeData().then(data => {
      _dtData = data;
      document.querySelectorAll(`[${PROCESSED_ATTR}]`).forEach(el => el.removeAttribute(PROCESSED_ATTR));
      applyBadges(data);
    });

    _observer = new MutationObserver(mutations => {
      const relevant = mutations.some(mutation =>
        Array.from(mutation.addedNodes || []).some(node =>
          node.nodeType === Node.ELEMENT_NODE
          && !node.classList?.contains('bct-dt-badge')
          && !node.classList?.contains('btt-trust-badge')
          && node.id !== STYLE_ID
        )
      );
      if (relevant) scheduleApplyBadges();
    });
    _observer.observe(document.body, { childList: true, subtree: true });
  },

  destroy() {
    _observer?.disconnect();
    _observer = null;
    if (_messageHandler && typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
      chrome.runtime.onMessage.removeListener(_messageHandler);
    }
    _messageHandler = null;
    clearTimeout(_rescanTimer);
    _rescanTimer = null;
    removeBadges();
  },

  async renderDashboardPanel(container) {
    const settings = await getSettings();
    const data = await loadCachedDtData();
    const enabled = (settings.enabledModules || []).includes('trustPositionBadge') && settings.trustPositionBadgeEnabled !== false;
    const source = data.source_url || DEFAULT_TRUST_URL;
    const updated = data.updated_at ? new Date(data.updated_at).toLocaleString() : 'Never';
    const fetchStatus = getDisplayFetchStatus(data);

    container.innerHTML = `
      <div class="btt-panel">
        <p style="font-size:13px;color:var(--text-secondary,#9ca3af)">
          Shows DT badges using the GitHub DT JSON feed (<code>${DT_DATA_URL}</code>). Cached locally under <code>${CACHE_KEY}</code> and refreshed every ${DT_REFRESH_INTERVAL_HOURS} hours.
        </p>
        <label style="display:flex;align-items:center;gap:8px;margin-top:10px;font-size:13px">
          <input type="checkbox" id="btt-tpb-enabled" ${enabled ? 'checked' : ''}>
          Enable badges
        </label>
        <label style="display:flex;align-items:center;gap:8px;margin-top:8px;font-size:13px">
          <input type="checkbox" id="btt-tpb-show-none" ${(settings.showNotInDt === true || settings.trustPositionBadgeShowNoDt === true) ? 'checked' : ''}>
          Show "Not in DT" badges
        </label>
        <label style="display:flex;align-items:center;gap:8px;margin-top:8px;font-size:13px">
          <input type="checkbox" id="btt-tpb-debug" ${settings.trustPositionBadgeDebug ? 'checked' : ''}>
          Enable debug logging
        </label>
        <div style="margin-top:12px;font-size:12px;color:var(--text-secondary,#9ca3af);line-height:1.7">
          Cache key: <strong>${CACHE_KEY}</strong><br>
          Data source: <strong>${escapeHtml(source)}</strong><br>
          Last update: <strong>${escapeHtml(updated)}</strong><br>
          Fetch status: <strong>${escapeHtml(fetchStatus)}</strong><br>
          Parsed users: <strong>${data.stats.total_users}</strong><br>
          Displayable DT1: <strong>${data.stats.dt1_count}</strong> / Displayable DT2: <strong>${data.stats.dt2_count}</strong><br>
          Removed/skipped: <strong>${(data.removedUsers || []).length}</strong>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">
          <button id="btt-tpb-refresh" class="btt-btn btt-btn-sm btt-btn-secondary">Refresh DT Cache</button>
          <button id="btt-tpb-clear" class="btt-btn btt-btn-sm" style="background:#7f1d1d;color:#fff">Clear DT cache</button>
        </div>
        <div id="btt-tpb-refresh-status" style="margin-top:8px;font-size:12px;color:var(--text-secondary,#9ca3af)"></div>
        <div style="margin-top:18px">
          <h3 style="font-size:15px;margin:0 0 10px">DefaultTrust</h3>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">
            <input id="btt-tpb-search" type="search" placeholder="Search username or UID" style="flex:1;min-width:180px;padding:7px 10px;border-radius:6px;border:1px solid var(--border,#374151);background:var(--bg-secondary,#111827);color:var(--text,#e5e7eb);font-size:13px">
            <select id="btt-tpb-filter" style="padding:7px 10px;border-radius:6px;border:1px solid var(--border,#374151);background:var(--bg-secondary,#111827);color:var(--text,#e5e7eb);font-size:13px">
              <option value="all">All trusted</option>
              <option value="dt1">DT1 only</option>
              <option value="dt2">DT2 only</option>
              <option value="removed">Removed only</option>
            </select>
            <button id="btt-tpb-export-json" class="btt-btn btt-btn-sm btt-btn-secondary">Export JSON</button>
          </div>
          <div id="btt-tpb-result-count" style="font-size:12px;color:var(--text-secondary,#9ca3af);margin-bottom:8px"></div>
          <div style="overflow:auto;max-height:460px;border:1px solid var(--border,#374151);border-radius:6px">
            <table style="width:100%;border-collapse:collapse;font-size:12px">
              <thead style="position:sticky;top:0;background:var(--bg-secondary,#111827)">
                <tr>
                  <th style="text-align:left;padding:7px">User</th>
                  <th style="text-align:left;padding:7px">Status</th>
                  <th style="text-align:left;padding:7px">Depth</th>
                  <th style="text-align:left;padding:7px">User ID</th>
                  <th style="text-align:left;padding:7px">Links</th>
                </tr>
              </thead>
              <tbody id="btt-tpb-results"></tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    const notifyTabs = () => {
      if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
        chrome.runtime.sendMessage({ action: 'relayToTab', data: { action: 'settingsChanged' } });
      }
    };

    container.querySelector('#btt-tpb-enabled').addEventListener('change', async e => {
      await setModuleEnabled('trustPositionBadge', e.target.checked);
      await updateSetting('trustPositionBadgeEnabled', e.target.checked);
      notifyTabs();
    });

    container.querySelector('#btt-tpb-show-none').addEventListener('change', async e => {
      await updateSetting('trustPositionBadgeShowNoDt', e.target.checked);
      await updateSetting('showNotInDt', e.target.checked);
      notifyTabs();
    });

    container.querySelector('#btt-tpb-debug').addEventListener('change', async e => {
      await updateSetting('trustPositionBadgeDebug', e.target.checked);
      notifyTabs();
    });

    container.querySelector('#btt-tpb-refresh').addEventListener('click', async e => {
      const btn = e.currentTarget;
      const statusEl = container.querySelector('#btt-tpb-refresh-status');
      const originalText = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Refreshing...';
      if (statusEl) statusEl.textContent = 'Fetching GitHub DT JSON...';

      try {
        _loggedFetchFailure = false;
        _loadPromise = null;
        _dtData = await loadTrustBadgeData({ forceRefresh: true });
        if (_dtData.stats.total_users > 0) {
          if (statusEl) statusEl.textContent = `DT cache refreshed: ${_dtData.stats.total_users} users.`;
          showToast(`DT cache refreshed: ${_dtData.stats.total_users} users.`, 'success');
        } else {
          const message = _dtData.fetch_status || 'DT data unavailable. Refresh DT cache later.';
          if (statusEl) statusEl.textContent = message;
          showToast(message, 'error');
        }
        notifyTabs();
        renderAnalyzerRows(container, _dtData);
      } catch (err) {
        const message = err.message || 'Refresh DT cache failed.';
        if (statusEl) statusEl.textContent = message;
        showToast(message, 'error');
      } finally {
        btn.disabled = false;
        btn.textContent = originalText;
      }
    });

    container.querySelector('#btt-tpb-clear').addEventListener('click', async () => {
      await clearDtCache();
      showToast('DT cache cleared.', 'success');
      notifyTabs();
      renderAnalyzerRows(container, emptyDtData(''));
    });

    const rerenderAnalyzer = () => renderAnalyzerRows(container, _dtData || data);
    container.querySelector('#btt-tpb-search').addEventListener('input', rerenderAnalyzer);
    container.querySelector('#btt-tpb-filter').addEventListener('change', rerenderAnalyzer);
    container.querySelector('#btt-tpb-export-json').addEventListener('click', () => {
      const rows = renderAnalyzerRows(container, _dtData || data);
      downloadFile('btt-trust-list.json', JSON.stringify(rows, null, 2), 'application/json');
    });
    renderAnalyzerRows(container, data);
  },
};
