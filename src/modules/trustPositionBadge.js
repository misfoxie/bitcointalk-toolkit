// trustPositionBadge.js - Shows DT/trust position badges on Bitcointalk posts.

import { getSettings, updateSetting, setModuleEnabled, storageGet, storageSet, storageRemove } from '../utils/storage.js';
import { escapeHtml } from '../utils/sanitizer.js';
import { downloadFile, showToast } from '../utils/sharedUI.js';

const DEFAULT_TRUST_URL = 'https://bitcointalk.org/index.php?action=trust;dt';
const DEFAULT_TRUST_VIEW_URL = 'https://bitcointalk.org/index.php?action=trust;dtview';
const DT_REFRESH_INTERVAL_HOURS = 6;

const CACHE_KEY = 'bitcointalk_dt_data';
const CACHE_TIMESTAMP_KEY = 'bitcointalk_dt_data_timestamp';
const LEGACY_CACHE_KEY = 'dtCache';
const NORMALIZED_CACHE_KEY = 'btt_dt_normalized_cache';
const STYLE_ID = 'btt-trust-position-style';
const APPLIED_ATTR = 'data-btt-trust-badge';
const PROCESSED_ATTR = 'data-btt-trust-processed';
const RESCAN_DEBOUNCE_MS = 400;
const FETCH_TIMEOUT_MS = 10000;
const CACHE_VERSION = 2;
const MIN_VALID_CACHE_USERS = 50;
const CUSTOM_DT_MARKER = 'BTT_TOOLKIT_DT_DATA_V1';
const CUSTOM_DT_FETCH_DELAY_MS = 400;

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
  normalized.source_msg_id = source.source_msg_id || source.sourceMsgId || '';
  normalized.source_topic_id = source.source_topic_id || source.sourceTopicId || '';
  normalized.source_author = source.source_author || source.sourceAuthor || '';
  normalized.source_author_uid = source.source_author_uid || source.sourceAuthorUid || '';
  normalized.source_post_url = source.source_post_url || source.sourcePostUrl || '';
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
  const sourceIsBitcointalk = /https:\/\/bitcointalk\.org\//i.test(sourceText);
  const numericUidKeys = userEntries.every(([uid, user]) => /^\d+$/.test(String(uid)) && String(user?.user_id || user?.userId || user?.uid || uid) === String(uid));
  return Boolean(updatedAt)
    && isCacheFresh({ updated_at: updatedAt })
    && (sourceText.includes(DEFAULT_TRUST_URL) || sourceIsBitcointalk)
    && userEntries.length >= MIN_VALID_CACHE_USERS
    && (sourceIsBitcointalk || numericUidKeys)
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

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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

function isBitcointalkUrl(url) {
  try {
    return new URL(String(url || '')).hostname === 'bitcointalk.org';
  } catch {
    return false;
  }
}

function extractTopicIdFromUrl(url) {
  const text = String(url || '');
  const match = text.match(/[?;&]topic=(\d+)/i);
  return match ? match[1] : '';
}

function normalizeTopicUrl(url) {
  const text = String(url || '').trim();
  if (!text) return '';
  const parsed = new URL(text, 'https://bitcointalk.org/');
  if (parsed.hostname !== 'bitcointalk.org') throw new Error('Custom DT source must be a bitcointalk.org thread URL.');
  const topicId = extractTopicIdFromUrl(parsed.href);
  if (!topicId) throw new Error('Custom DT source must include a topic id.');
  return `https://bitcointalk.org/index.php?topic=${topicId}.0`;
}

function normalizeCustomTopicUrl(url) {
  const text = String(url || '').trim();
  if (!text) return '';
  const parsed = new URL(text, 'https://bitcointalk.org/');
  if (parsed.hostname !== 'bitcointalk.org') throw new Error('Custom DT source must be a bitcointalk.org thread URL.');
  if (!extractTopicIdFromUrl(parsed.href)) throw new Error('Custom DT source must include a topic id.');
  return parsed.href;
}

function getCustomTopicSourceInfo(url) {
  const sourceUrl = normalizeCustomTopicUrl(url);
  const topicId = extractTopicIdFromUrl(sourceUrl);
  return {
    sourceUrl,
    topicId,
    topicUrl: makeTopicPageUrl(topicId, 0),
  };
}

function makeTopicPageUrl(topicId, start) {
  return `https://bitcointalk.org/index.php?topic=${topicId}.${Math.max(0, Number(start) || 0)}`;
}

function discoverTopicPageUrls(html, threadUrl) {
  const topicId = extractTopicIdFromUrl(threadUrl);
  if (!topicId) return [threadUrl];
  const starts = new Set([0]);
  const re = new RegExp(`[?;&]topic=${topicId}\\.(\\d+)`, 'gi');
  let match;
  while ((match = re.exec(String(html || '')))) {
    starts.add(Number(match[1]) || 0);
  }

  // Bitcointalk topic pages use topic=THREAD_ID.START_NUMBER. Pagination links
  // are the best source of truth, but long threads may display a shortened page
  // range, so fill missing 20-post offsets up to the highest detected page.
  const sorted = [...starts].filter(Number.isFinite).sort((a, b) => a - b);
  const positiveDiffs = sorted
    .map((start, index) => index ? start - sorted[index - 1] : 0)
    .filter(diff => diff > 0);
  const detectedStep = positiveDiffs.length ? Math.min(...positiveDiffs) : 20;
  const step = detectedStep > 20 ? 20 : detectedStep;
  const maxStart = sorted[sorted.length - 1] || 0;

  for (let start = 0; step > 0 && start <= maxStart; start += step) {
    starts.add(start);
  }

  return [...starts]
    .filter(Number.isFinite)
    .sort((a, b) => a - b)
    .map(start => makeTopicPageUrl(topicId, start));
}

function makeMsgUrl(topicId, msgId) {
  if (!topicId || !msgId) return '';
  return `https://bitcointalk.org/index.php?topic=${topicId}.msg${msgId}#msg${msgId}`;
}

function extractMsgIdFromElement(element) {
  const candidates = [
    element?.id,
    element?.getAttribute?.('id'),
    element?.querySelector?.('[id^="msg"]')?.id,
    element?.querySelector?.('a[name^="msg"]')?.getAttribute('name'),
    element?.querySelector?.('a[href*="#msg"]')?.getAttribute('href'),
  ];
  for (const candidate of candidates) {
    const match = String(candidate || '').match(/msg(\d+)/i);
    if (match) return match[1];
  }
  return '';
}

function preserveBlockText(value) {
  return decodeHtmlEntities(String(value || ''))
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(?:div|p|li|tr|td)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\u00a0/g, ' ')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .trim();
}

function getElementTextWithBreaks(element) {
  if (!element) return '';
  const html = typeof element.innerHTML === 'string' ? element.innerHTML : '';
  return preserveBlockText(html || element.textContent || '');
}

function findThreadPostContainers(doc) {
  const containers = new Map();

  const resolvePostContainer = (anchor) => {
    if (!anchor) return null;

    // Bitcointalk SMF posts often look like:
    // <td class="msgcl1"><a name="msg123"></a><table>...</table></td>
    // The full post lives in td.msgcl1, while post links inside the header are
    // nested in smaller tables that do not contain the message body.
    const messageCell = anchor.closest('td.msgcl1, td.msgcl2, .msgcl1, .msgcl2');
    if (messageCell) return messageCell;

    if (/^msg\d+$/i.test(anchor.getAttribute?.('name') || anchor.id || '')) {
      let sibling = anchor.nextElementSibling;
      while (sibling && !/^(table|div)$/i.test(sibling.tagName || '')) sibling = sibling.nextElementSibling;
      if (sibling) return sibling;
    }

    const table = anchor.closest('table');
    if (table?.querySelector?.('.post, .code, .poster_info')) return table;
    const row = anchor.closest('tr');
    if (row?.querySelector?.('.post, .code, .poster_info')) return row;
    return anchor.closest('.post_wrapper, .windowbg, .windowbg2') || anchor.parentElement;
  };

  Array.from(doc.querySelectorAll('[id^="msg"], a[name^="msg"], a[id^="msg"]')).forEach(anchor => {
    const msgId = extractMsgIdFromElement(anchor);
    if (!msgId) return;
    const container = resolvePostContainer(anchor);
    if (container && !containers.has(msgId)) containers.set(msgId, container);
  });
  Array.from(doc.querySelectorAll('a[href*="#msg"], a[href*="msg"]')).forEach(link => {
    const msgId = extractMsgIdFromElement(link);
    if (!msgId || containers.has(msgId)) return;
    const container = resolvePostContainer(link);
    if (container) containers.set(msgId, container);
  });
  return Array.from(containers.entries()).map(([msgId, element]) => ({ msgId, element }));
}

function extractAuthorFromPost(post) {
  const posterArea = post.querySelector('td.poster_info, .poster_info') || post;
  const link = posterArea.querySelector('b > a[href*="action=profile"][href*="u="]')
    || posterArea.querySelector('a[href*="action=profile"][href*="u="]')
    || post.querySelector('td.poster_info a[href*="action=profile"][href*="u="], .poster_info a[href*="action=profile"][href*="u="]');
  return {
    uid: extractUserIdFromUrl(link?.getAttribute('href') || link?.href || ''),
    username: cleanUsername(link?.textContent || ''),
  };
}

function authorMatchesFilter(author, authorFilter) {
  const cleanFilter = cleanUsername(authorFilter);
  if (!cleanFilter) return false;
  const wantedUid = cleanFilter.match(/^\d+$/)?.[0] || '';
  const wantedUsername = wantedUid ? '' : normalizeUsername(cleanFilter);
  return Boolean(
    (wantedUid && String(author?.uid || '') === wantedUid)
    || (wantedUsername && normalizeUsername(author?.username || '') === wantedUsername)
  );
}

function extractCodeBlocksFromPost(post) {
  const blocks = Array.from(post.querySelectorAll('.code, code, pre, textarea, td, div'))
    .map(el => getElementTextWithBreaks(el))
    .filter(text => text && text.includes(CUSTOM_DT_MARKER));
  const fullText = getElementTextWithBreaks(post);
  if (fullText?.includes(CUSTOM_DT_MARKER)) blocks.push(fullText);
  return [...new Set(blocks)];
}

function getLastRegexMatch(text, regex, groupIndex = 1) {
  let last = '';
  let match;
  const re = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : `${regex.flags}g`);
  while ((match = re.exec(String(text || '')))) {
    last = match[groupIndex] || '';
  }
  return last;
}

function extractNearbyMsgIdFromHtml(htmlBefore) {
  const text = String(htmlBefore || '');
  return getLastRegexMatch(text, /name=["']msg(\d+)["']/gi)
    || getLastRegexMatch(text, /id=["']msg(\d+)["']/gi)
    || getLastRegexMatch(text, /[.#]msg(\d+)/gi);
}

function extractNearbyAuthorFromHtml(htmlBefore) {
  const text = String(htmlBefore || '');
  const linkRegex = /<a\b[^>]*href=["'][^"']*action=profile;u=(\d+)[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi;
  let last = null;
  let match;
  while ((match = linkRegex.exec(text))) {
    last = {
      uid: match[1] || '',
      username: cleanUsername(preserveBlockText(match[2] || '')),
    };
  }
  return last || { uid: '', username: '' };
}

function collectCustomDtHtmlCodeCandidates(html, sourceUrl, authorFilter = '', topicId = '') {
  const text = String(html || '');
  const candidates = [];
  const seen = new Set();
  const codeRegex = /<div\b[^>]*class=["'][^"']*\bcode\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi;
  let match;

  while ((match = codeRegex.exec(text))) {
    const rawBlock = match[1] || '';
    if (!rawBlock.includes(CUSTOM_DT_MARKER)) continue;

    const contextStart = Math.max(0, match.index - 16000);
    const before = text.slice(contextStart, match.index);
    const msgId = extractNearbyMsgIdFromHtml(before);

    const parsedText = preserveBlockText(rawBlock);
    const data = parseCustomDtPayload(parsedText, sourceUrl);
    if (!data || data.stats.total_users <= 0) continue;

    const author = extractNearbyAuthorFromHtml(before);
    if (!authorMatchesFilter(author, authorFilter)) {
      if (_settings.trustPositionBadgeDebug) {
        console.debug('[BTT trustPositionBadge] custom DT raw code block skipped by author filter', {
          msgId,
          wanted: authorFilter,
          detected: author,
        });
      }
      continue;
    }

    const key = `${msgId || 'unknown'}:${data.stats.total_users}:${match.index}`;
    if (seen.has(key)) continue;
    seen.add(key);

    data.source_msg_id = msgId || '';
    data.source_topic_id = topicId || extractTopicIdFromUrl(sourceUrl);
    data.source_author = author.username || '';
    data.source_author_uid = author.uid || '';
    data.source_post_url = makeMsgUrl(data.source_topic_id, data.source_msg_id);
    data.fetch_status = data.source_msg_id
      ? `Using custom Bitcointalk DT post: msg${data.source_msg_id}`
      : 'Using custom Bitcointalk DT post data';
    candidates.push({ msgId: Number(msgId) || 0, data });
  }

  return candidates;
}

function extractJsonFromText(text) {
  const raw = String(text || '').replace(CUSTOM_DT_MARKER, '').trim();
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
}

function parseSimpleDtList(text, sourceUrl) {
  const normalizedText = String(text || '')
    .replace(/\[\/?code\]/gi, '\n')
    .replace(CUSTOM_DT_MARKER, `\n${CUSTOM_DT_MARKER}\n`)
    .replace(/\b(DT1|DT2|REMOVED|EXCLUDED)\s*:/gi, '\n$1:\n');
  const lines = normalizedText.split(/\r?\n/).map(line => cleanUsername(line)).filter(Boolean);
  let section = '';
  const users = {};
  const removedUsers = [];

  for (const line of lines) {
    if (/^DT1\s*:?$/i.test(line)) { section = 'DT1'; continue; }
    if (/^DT2\s*:?$/i.test(line)) { section = 'DT2'; continue; }
    if (/^(REMOVED|EXCLUDED)\s*:?$/i.test(line)) { section = 'REMOVED'; continue; }
    if (!section || line === CUSTOM_DT_MARKER) continue;

    const parts = line.split('|').map(part => cleanUsername(part));
    const username = parts[0] || '';
    const uid = (parts[1] || '').match(/\d+/)?.[0] || '';
    if (!username && !uid) continue;
    const depth = section === 'DT1' ? 1 : 2;
    const removed = section === 'REMOVED';
    const key = uid || `user:${normalizeUsername(username)}`;

    if (removed) {
      removedUsers.push({
        userId: uid || null,
        user_id: uid || null,
        username: username || null,
        depth: Number(parts[2]) || null,
        removed: true,
        reason: 'custom-list',
        profileUrl: uid ? `https://bitcointalk.org/index.php?action=profile;u=${uid}` : '',
      });
      delete users[key];
      continue;
    }

    users[key] = {
      user_id: uid || null,
      userId: uid || null,
      uid: uid || null,
      username,
      status: depthToDtLevel(depth),
      dt_level: depthToDtLevel(depth),
      label: depthToDtLevel(depth),
      depth,
      source: sourceUrl,
      sources: [sourceUrl],
      profileUrl: uid ? `https://bitcointalk.org/index.php?action=profile;u=${uid}` : '',
    };
  }

  if (!Object.keys(users).length) return null;
  const data = emptyDtData(sourceUrl);
  data.updated_at = new Date().toISOString();
  data.updatedAt = data.updated_at;
  data.source = [sourceUrl];
  data.source_url = sourceUrl;
  data.sourceUrl = sourceUrl;
  data.fetch_status = 'Using custom Bitcointalk DT thread data';
  data.users = users;
  data.removedUsers = removedUsers;
  for (const [key, user] of Object.entries(users)) {
    if (user.user_id) data.username_index[user.user_id] = key;
    if (user.username) {
      data.username_index[user.username] = key;
      data.username_index[normalizeUsername(user.username)] = key;
    }
  }
  removedUsers.forEach(user => {
    if (user.user_id) data.removed_index[user.user_id] = true;
    if (user.username) data.removed_index[normalizeUsername(user.username)] = true;
  });
  recomputeStats(data);
  data.dt1Users = Object.values(data.users).filter(user => user.dt_level === 'DT1').map(toPublicTrustUser);
  data.dt2Users = Object.values(data.users).filter(user => user.dt_level === 'DT2').map(toPublicTrustUser);
  return data;
}

function parseCompactDtSection(text, sectionName, depth, users) {
  const sectionMatch = String(text || '').match(new RegExp(`${sectionName}\\s*:\\s*([\\s\\S]*?)(?=\\b(?:DT1|DT2|REMOVED|EXCLUDED)\\s*:|$)`, 'i'));
  if (!sectionMatch) return;
  const body = sectionMatch[1] || '';
  const matches = body.matchAll(/([^|\n\r<>]{1,80})\|(\d{1,10})/g);
  for (const match of matches) {
    const username = cleanUsername(match[1]);
    const uid = String(match[2] || '').trim();
    if (!username || !uid) continue;
    users[uid] = {
      user_id: uid,
      userId: uid,
      uid,
      username,
      status: depthToDtLevel(depth),
      dt_level: depthToDtLevel(depth),
      label: depthToDtLevel(depth),
      depth,
      source: '',
      sources: [],
      profileUrl: `https://bitcointalk.org/index.php?action=profile;u=${uid}`,
    };
  }
}

function parseCustomDtPayload(text, sourceUrl) {
  const parsedJson = extractJsonFromText(text);
  if (parsedJson) {
    const data = normalizeDtData(parsedJson, sourceUrl);
    data.updated_at = parsedJson.updated_at || parsedJson.updatedAt || new Date().toISOString();
    data.updatedAt = data.updated_at;
    data.source = [sourceUrl];
    data.source_url = sourceUrl;
    data.sourceUrl = sourceUrl;
    data.fetch_status = 'Using custom Bitcointalk DT thread data';
    recomputeStats(data);
    if (data.stats.total_users > 0) return data;
  }
  const parsedSimple = parseSimpleDtList(text, sourceUrl);
  if (parsedSimple?.stats?.total_users > 0) return parsedSimple;

  const compactUsers = {};
  parseCompactDtSection(text, 'DT1', 1, compactUsers);
  parseCompactDtSection(text, 'DT2', 2, compactUsers);
  if (!Object.keys(compactUsers).length) return null;
  const data = emptyDtData(sourceUrl);
  data.updated_at = new Date().toISOString();
  data.updatedAt = data.updated_at;
  data.source = [sourceUrl];
  data.source_url = sourceUrl;
  data.sourceUrl = sourceUrl;
  data.fetch_status = 'Using custom Bitcointalk DT thread data';
  data.users = compactUsers;
  for (const [key, user] of Object.entries(compactUsers)) {
    user.source = sourceUrl;
    user.sources = [sourceUrl];
    data.username_index[key] = key;
    data.username_index[user.username] = key;
    data.username_index[normalizeUsername(user.username)] = key;
  }
  recomputeStats(data);
  data.dt1Users = Object.values(data.users).filter(user => user.dt_level === 'DT1').map(toPublicTrustUser);
  data.dt2Users = Object.values(data.users).filter(user => user.dt_level === 'DT2').map(toPublicTrustUser);
  return data;
}

function collectCustomDtThreadCandidates(html, sourceUrl, authorFilter = '', topicId = '') {
  if (looksLikeUnavailableTrustPage(html)) {
    throw new Error('Custom DT thread unavailable. Please open/login to Bitcointalk and refresh DT cache.');
  }
  const doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
  const candidates = [];

  for (const post of findThreadPostContainers(doc)) {
    const author = extractAuthorFromPost(post.element);
    if (!authorMatchesFilter(author, authorFilter)) {
      if (_settings.trustPositionBadgeDebug) {
        console.debug('[BTT trustPositionBadge] custom DT post skipped by author filter', {
          msgId: post.msgId,
          wanted: authorFilter,
          detected: author,
        });
      }
      continue;
    }

    const blocks = extractCodeBlocksFromPost(post.element);
    for (const block of blocks) {
      if (!block.includes(CUSTOM_DT_MARKER)) continue;
      const data = parseCustomDtPayload(block, sourceUrl);
      if (!data || data.stats.total_users <= 0) continue;
      data.source_msg_id = post.msgId;
      data.source_topic_id = topicId || extractTopicIdFromUrl(sourceUrl);
      data.source_author = author.username || '';
      data.source_author_uid = author.uid || '';
      data.source_post_url = makeMsgUrl(data.source_topic_id, post.msgId);
      data.fetch_status = `Using newest valid custom DT post: msg${post.msgId}`;
      candidates.push({ msgId: Number(post.msgId) || 0, data });
    }
  }

  const htmlCandidates = collectCustomDtHtmlCodeCandidates(html, sourceUrl, authorFilter, topicId);
  const seen = new Set(candidates.map(item => `${item.msgId}:${item.data?.stats?.total_users || 0}`));
  for (const candidate of htmlCandidates) {
    const key = `${candidate.msgId}:${candidate.data?.stats?.total_users || 0}`;
    if (seen.has(key)) continue;
    seen.add(key);
    candidates.push(candidate);
  }

  return candidates;
}

function inspectCustomDtTopicHtml(html) {
  const text = String(html || '');
  return {
    markerFound: text.includes(CUSTOM_DT_MARKER),
    dt1Found: /\bDT1\s*:/i.test(text),
    dt2Found: /\bDT2\s*:/i.test(text),
    postCount: (text.match(/name=["']msg\d+["']/gi) || []).length,
    codeBlockCount: (text.match(/codeheader|class=["'][^"']*\bcode\b/gi) || []).length,
  };
}

function parseCustomDtThreadPage(html, sourceUrl, authorFilter = '', topicId = '') {
  const candidates = collectCustomDtThreadCandidates(html, sourceUrl, authorFilter, topicId);
  candidates.sort((a, b) => b.msgId - a.msgId);
  const latest = candidates[0]?.data;
  if (!latest) {
    throw new Error(`No valid custom DT data post found. Add ${CUSTOM_DT_MARKER} plus JSON/code data to the source thread.`);
  }
  return latest;
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

async function loadCachedDtData({ allowStale = true } = {}) {
  const normalizedResult = await storageGet(NORMALIZED_CACHE_KEY);
  const normalizedCache = normalizedResult[NORMALIZED_CACHE_KEY];
  if (normalizedCache && typeof normalizedCache === 'object') {
    const cachedSource = String(normalizedCache.source_url || normalizedCache.sourceUrl || '');
    const cachedStatus = String(normalizedCache.fetch_status || '');
    if ((cachedSource && !isBitcointalkUrl(cachedSource)) || /github/i.test(cachedSource) || /github/i.test(cachedStatus)) {
      await storageRemove(NORMALIZED_CACHE_KEY);
      return emptyDtData(_settings.trustPositionBadgeCustomThreadUrl || DEFAULT_TRUST_URL);
    }
    const normalized = normalizeDtData(normalizedCache, normalizedCache.source_url || normalizedCache.sourceUrl || '');
    normalized.fetch_status = normalizedCache.fetch_status || normalized.fetch_status || 'Using cached DT data';
    if (allowStale || isCacheFresh(normalized)) return normalized;
  }

  return emptyDtData(_settings.trustPositionBadgeCustomThreadUrl || DEFAULT_TRUST_URL);
}

async function saveNormalizedDtCache(data, fetchStatus = '') {
  if (!isValidDtData(data)) throw new Error('Parsed DT data is empty or invalid.');
  const normalized = normalizeDtData(data, data.source_url || data.sourceUrl || '');
  normalized.updated_at = normalized.updated_at || new Date().toISOString();
  normalized.updatedAt = normalized.updated_at;
  normalized.fetch_status = fetchStatus || normalized.fetch_status || 'DT data refreshed';
  await storageRemove([CACHE_KEY, CACHE_TIMESTAMP_KEY, LEGACY_CACHE_KEY]);
  await storageSet({ [NORMALIZED_CACHE_KEY]: normalized });
  return normalized;
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
  await storageRemove([CACHE_KEY, CACHE_TIMESTAMP_KEY, LEGACY_CACHE_KEY, NORMALIZED_CACHE_KEY]);
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

async function fetchCustomDtThreadData({ forceRefresh = false } = {}) {
  const settings = await getSettings();
  const rawThreadUrl = String(settings.trustPositionBadgeCustomThreadUrl || '').trim();
  if (!rawThreadUrl) {
    throw new Error('Custom DT thread URL is empty. Paste your Bitcointalk DT source thread link, then refresh DT cache.');
  }

  const sourceInfo = getCustomTopicSourceInfo(rawThreadUrl);
  const threadUrl = sourceInfo.topicUrl;
  const sourceUrl = threadUrl;
  const authorFilter = cleanUsername(settings.trustPositionBadgeCustomAuthor || '');
  if (!authorFilter) {
    throw new Error('Trusted DT data publisher is empty. Set the source author username or UID, then refresh DT cache.');
  }

  if (!forceRefresh) {
    const cached = await loadCachedDtData({ allowStale: false });
    const cachedTopicMatches = String(cached.source_topic_id || extractTopicIdFromUrl(cached.source_url || cached.sourceUrl || '')) === sourceInfo.topicId;
    const cachedAuthorMatches = authorMatchesFilter({
      uid: cached.source_author_uid || '',
      username: cached.source_author || '',
    }, authorFilter);
    if (cached.stats.total_users > 0 && cachedTopicMatches && cachedAuthorMatches && isCacheFresh(cached)) return cached;
  }

  const firstHtml = await fetchTrustPage(threadUrl);
  const pageUrls = discoverTopicPageUrls(firstHtml, threadUrl);
  if (!pageUrls.includes(threadUrl)) pageUrls.unshift(threadUrl);
  const allCandidates = [];
  const diagnostics = [];

  for (let i = 0; i < pageUrls.length; i += 1) {
    const pageUrl = pageUrls[i];
    try {
      const html = pageUrl === threadUrl ? firstHtml : await fetchTrustPage(pageUrl);
      diagnostics.push({ pageUrl, ...inspectCustomDtTopicHtml(html) });
      allCandidates.push(...collectCustomDtThreadCandidates(html, sourceUrl, authorFilter, sourceInfo.topicId));
    } catch (err) {
      if (_settings.trustPositionBadgeDebug) {
        console.warn('[BTT trustPositionBadge] custom DT topic page skipped', { pageUrl, reason: err.message });
      }
    }
    if (i < pageUrls.length - 1) await delay(CUSTOM_DT_FETCH_DELAY_MS);
  }

  allCandidates.sort((a, b) => b.msgId - a.msgId);
  const parsed = allCandidates[0]?.data;
  if (!parsed) {
    const markerSeen = diagnostics.some(item => item.markerFound);
    const dtHeadersSeen = diagnostics.some(item => item.dt1Found || item.dt2Found);
    const checked = diagnostics.map(item => `${item.pageUrl} (posts: ${item.postCount}, code blocks: ${item.codeBlockCount}, marker: ${item.markerFound ? 'yes' : 'no'})`).join('; ');
    if (!markerSeen) {
      throw new Error(`No ${CUSTOM_DT_MARKER} marker was found in the checked topic page(s). Checked: ${checked || pageUrls.join(', ')}.`);
    }
    if (!dtHeadersSeen) {
      throw new Error(`The DT marker was found, but DT1:/DT2: sections were not found. Checked: ${checked || pageUrls.join(', ')}.`);
    }
    throw new Error(`No valid custom DT data post by ${authorFilter} found in ${pageUrls.length} checked topic page(s). Checked: ${checked || pageUrls.join(', ')}.`);
  }
  parsed.source_topic_id = sourceInfo.topicId;
  parsed.source_post_url = parsed.source_post_url || makeMsgUrl(sourceInfo.topicId, parsed.source_msg_id);
  parsed.source_url = parsed.source_post_url || threadUrl;
  parsed.sourceUrl = parsed.source_url;
  parsed.source = [parsed.source_url];
  parsed.fetch_status = `Using newest valid custom DT data reply by ${parsed.source_author || authorFilter}: msg${parsed.source_msg_id || 'unknown'}`;
  const saved = await saveNormalizedDtCache(parsed, parsed.fetch_status || 'Custom Bitcointalk DT thread data refreshed');
  runDiagnosticCheck(saved);
  return saved;
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
    const cached = forceRefresh ? emptyDtData(_settings.trustPositionBadgeCustomThreadUrl || DEFAULT_TRUST_URL) : await loadCachedDtData({ allowStale: false });
    if (!forceRefresh && cached.stats.total_users > 0 && isCacheFresh(cached)) {
      _dtData = cached;
      return cached;
    }

    let refreshError = '';
    try {
      const customData = await fetchCustomDtThreadData({ forceRefresh });
      if (customData) {
        _dtData = customData;
        return _dtData;
      }
    } catch (err) {
      refreshError = err.message || String(err);
      logFetchFailure(refreshError);
    }

    const staleCached = await loadCachedDtData({ allowStale: true });
    if (staleCached.stats.total_users > 0) {
      _dtData = {
        ...staleCached,
        fetch_status: `Using cached Bitcointalk DT topic data after refresh failed. ${refreshError}`,
      };
      return _dtData;
    }

    _dtData = emptyDtData(_settings.trustPositionBadgeCustomThreadUrl || DEFAULT_TRUST_URL);
    _dtData.fetch_status = refreshError || 'DT topic data unavailable. Refresh DT cache later.';
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
    const customThreadUrl = settings.trustPositionBadgeCustomThreadUrl || '';
    const customAuthor = settings.trustPositionBadgeCustomAuthor || '';

    container.innerHTML = `
      <div class="btt-panel">
        <p style="font-size:13px;color:var(--text-secondary,#9ca3af)">
          Shows DT badges using locally cached data from the configured Bitcointalk DT source topic. No GitHub or third-party DT source is used.
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
        <div style="margin-top:14px;padding:12px;border:1px solid var(--border,#374151);border-radius:6px;background:var(--bg-secondary,#111827)">
          <h3 style="font-size:14px;margin:0 0 8px">DT data source</h3>
          <div style="font-size:12px;color:var(--text-secondary,#9ca3af);margin-bottom:6px">Source mode: <strong>Newest valid publisher reply in custom Bitcointalk thread</strong></div>
          <label style="display:block;font-size:12px;color:var(--text-secondary,#9ca3af);margin:10px 0 6px">Custom DT thread URL</label>
          <input id="btt-tpb-custom-thread-url" type="url" value="${escapeHtml(customThreadUrl)}" placeholder="https://bitcointalk.org/index.php?topic=1234567.0" style="width:100%;box-sizing:border-box;padding:7px 10px;border-radius:6px;border:1px solid var(--border,#374151);background:var(--bg-secondary,#111827);color:var(--text,#e5e7eb);font-size:13px">
          <label style="display:block;font-size:12px;color:var(--text-secondary,#9ca3af);margin:10px 0 6px">Trusted data publisher username or UID</label>
          <input id="btt-tpb-custom-author" type="text" value="${escapeHtml(customAuthor)}" placeholder="misfoxie" style="width:100%;box-sizing:border-box;padding:7px 10px;border-radius:6px;border:1px solid var(--border,#374151);background:var(--bg-secondary,#111827);color:var(--text,#e5e7eb);font-size:13px">
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
            <button id="btt-tpb-save-source" class="btt-btn btt-btn-sm btt-btn-secondary">Save DT source settings</button>
          </div>
          <details style="margin-top:10px;font-size:12px;color:var(--text-secondary,#9ca3af);line-height:1.6">
            <summary>How to make the Bitcointalk source post</summary>
            <div style="margin-top:8px">
              Create one thread and post a new reply each month. The extension will fetch the whole thread, ignore other users, ignore unmarked normal replies, and use the newest valid reply from the configured publisher by highest msg id.
              Put this marker and JSON inside a code block:
              <pre style="white-space:pre-wrap;background:var(--bg,#0f172a);border:1px solid var(--border,#374151);border-radius:6px;padding:8px;color:var(--text,#e5e7eb)">[code]
${CUSTOM_DT_MARKER}
{
  "updated_at": "2026-06-01T00:00:00Z",
  "users": {
    "459836": {
      "username": "LoyceV",
      "uid": "459836",
      "depth": 1,
      "dt_level": "DT1",
      "removed": false
    }
  }
}
[/code]</pre>
              You can also use sections like <code>DT1:</code>, <code>DT2:</code>, and <code>REMOVED:</code> with lines formatted as <code>username|uid</code>.
            </div>
          </details>
        </div>
        <div style="margin-top:12px;font-size:12px;color:var(--text-secondary,#9ca3af);line-height:1.7">
          Cache key: <strong>${NORMALIZED_CACHE_KEY}</strong><br>
          Data source: <strong>${escapeHtml(source)}</strong><br>
          Source msg: <strong>${escapeHtml(data.source_msg_id ? `msg${data.source_msg_id}` : 'N/A')}</strong><br>
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

    container.querySelector('#btt-tpb-save-source').addEventListener('click', async () => {
      const rawUrl = container.querySelector('#btt-tpb-custom-thread-url')?.value || '';
      const author = container.querySelector('#btt-tpb-custom-author')?.value || '';
      try {
        const normalizedUrl = rawUrl.trim() ? normalizeCustomTopicUrl(rawUrl) : '';
        await updateSetting('trustPositionBadgeSourceMode', 'custom-thread');
        await updateSetting('trustPositionBadgeCustomThreadUrl', normalizedUrl);
        await updateSetting('trustPositionBadgeCustomAuthor', cleanUsername(author));
        showToast(normalizedUrl ? 'DT source settings saved. Refresh DT cache when ready.' : 'DT source settings saved. Custom thread URL is empty.', 'success');
        notifyTabs();
      } catch (err) {
        showToast(err.message || 'Invalid DT source settings.', 'error');
      }
    });

    container.querySelector('#btt-tpb-refresh').addEventListener('click', async e => {
      const btn = e.currentTarget;
      const statusEl = container.querySelector('#btt-tpb-refresh-status');
      const originalText = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Refreshing...';
      if (statusEl) statusEl.textContent = 'Fetching custom Bitcointalk DT thread...';

      try {
        const rawUrl = container.querySelector('#btt-tpb-custom-thread-url')?.value || '';
        const author = container.querySelector('#btt-tpb-custom-author')?.value || '';
        await updateSetting('trustPositionBadgeSourceMode', 'custom-thread');
        await updateSetting('trustPositionBadgeCustomThreadUrl', rawUrl.trim() ? normalizeCustomTopicUrl(rawUrl) : '');
        await updateSetting('trustPositionBadgeCustomAuthor', cleanUsername(author));
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
