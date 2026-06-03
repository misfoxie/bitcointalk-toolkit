// validators.js — Input validation helpers

import { CRYPTO_PATTERNS, URL_SHORTENERS, SUSPICIOUS_DOMAINS } from './constants.js';

export function isBtcAddress(str) {
  return (
    /^1[a-zA-HJ-NP-Z0-9]{25,34}$/.test(str) ||
    /^3[a-zA-HJ-NP-Z0-9]{25,34}$/.test(str) ||
    /^bc1[a-zA-HJ-NP-Z0-9]{6,87}$/i.test(str)
  );
}

export function isEthAddress(str) {
  return /^0x[a-fA-F0-9]{40}$/.test(str);
}

export function isTxid(str) {
  return /^[a-fA-F0-9]{64}$/.test(str);
}

export function isBitcointalkUrl(url) {
  try {
    return new URL(url).hostname === 'bitcointalk.org';
  } catch { return false; }
}

export function parseBitcointalkUrl(url) {
  try {
    const u = new URL(url);
    if (u.hostname !== 'bitcointalk.org') return null;
    const topicId = u.searchParams.get('topic');
    const msgId   = url.match(/msg(\d+)/)?.[1] || null;
    const page    = parseInt(topicId?.split('.')[1] || '0', 10);
    return { topicId: topicId?.split('.')[0], page, msgId };
  } catch { return null; }
}

export function extractAllCryptoAddresses(text) {
  const results = { btc: [], eth: [], ltc: [], doge: [], trx: [], txids: [] };
  const t = String(text);
  let m;
  const patterns = [
    ['btc',   CRYPTO_PATTERNS.btcLegacy],
    ['btc',   CRYPTO_PATTERNS.btcP2SH],
    ['btc',   CRYPTO_PATTERNS.btcBech32],
    ['eth',   CRYPTO_PATTERNS.eth],
    ['ltc',   CRYPTO_PATTERNS.ltc],
    ['doge',  CRYPTO_PATTERNS.doge],
    ['trx',   CRYPTO_PATTERNS.trx],
    ['txids', CRYPTO_PATTERNS.txid],
  ];
  patterns.forEach(([key, pattern]) => {
    const re = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g');
    re.lastIndex = 0;
    while ((m = re.exec(t)) !== null) {
      if (!results[key].includes(m[1] || m[0])) results[key].push(m[1] || m[0]);
    }
  });
  return results;
}

export function isUrlShortener(url) {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    return URL_SHORTENERS.some(s => hostname === s);
  } catch { return false; }
}

export function isSuspiciousDomain(url) {
  try {
    const hostname = new URL(url).hostname.toLowerCase().replace('www.', '');
    return SUSPICIOUS_DOMAINS.some(d => d.toLowerCase() === hostname);
  } catch { return false; }
}

export function hasPunycode(url) {
  try {
    return new URL(url).hostname.includes('xn--');
  } catch { return false; }
}

export function extractSlotNumbers(text) {
  const numbers = new Set();
  const patterns = [
    /\bslot[:\s#]*(\d+)\b/gi,
    /\bnumber[:\s#]*(\d+)\b/gi,
    /\bmy\s+pick[:\s#]*(\d+)\b/gi,
    /\b#(\d+)\b/g,
    /\b(\d{1,3})(?:\s*,\s*(\d{1,3}))+/g,
  ];
  patterns.forEach(re => {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      for (let i = 1; i < m.length; i++) {
        if (m[i]) numbers.add(parseInt(m[i], 10));
      }
    }
  });
  return [...numbers].sort((a, b) => a - b);
}

export function textSimilarity(a, b) {
  // Simple Jaccard similarity on word sets
  const wordsA = new Set(a.toLowerCase().split(/\W+/).filter(Boolean));
  const wordsB = new Set(b.toLowerCase().split(/\W+/).filter(Boolean));
  const intersection = [...wordsA].filter(w => wordsB.has(w)).length;
  const union = new Set([...wordsA, ...wordsB]).size;
  return union === 0 ? 0 : intersection / union;
}
