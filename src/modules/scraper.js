// scraper.js — Unified Thread Scraper (v2)
// Enhanced: EVM addresses, social handles, campaign fields, explorer links,
// expanded filters, field-selective exports, stats helpers, custom page ranges.

// ── URL utilities ─────────────────────────────────────────────────────────────

export function parseBitcointalkUrl(url) {
  if (!url) return null;
  const m = url.match(/[?&]topic=(\d+)(?:\.(\d+))?/);
  if (!m) return null;
  return { topicId: m[1], offset: parseInt(m[2] || '0', 10) };
}

export function buildPageUrl(topicId, offset) {
  return `https://bitcointalk.org/index.php?topic=${topicId}.${offset}`;
}

// ── Background fetch ──────────────────────────────────────────────────────────

export function bgFetch(url) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: 'fetchUrl', url }, res => {
      if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
      if (res?.success) resolve(res.html);
      else reject(new Error(res?.error || 'Fetch failed'));
    });
  });
}

// ── Crypto extraction ─────────────────────────────────────────────────────────

function _extractBitcoinAddresses(text) {
  // Negative lookbehind/ahead to avoid matching within longer alphanumeric tokens
  const re = /(?<![a-zA-Z0-9])(1[a-zA-HJ-NP-Z0-9]{25,34}|3[a-zA-HJ-NP-Z0-9]{25,34}|bc1[a-zA-HJ-NP-Z0-9]{6,87})(?![a-zA-Z0-9])/g;
  const seen = new Set();
  const out  = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    const addr = m[1];
    if (!seen.has(addr)) { seen.add(addr); out.push(addr); }
  }
  return out.slice(0, 20);
}

function _extractEvmAddresses(text) {
  const re = /(?<![a-fA-F0-9])(0x[a-fA-F0-9]{40})(?![a-fA-F0-9])/gi;
  const seen = new Set();
  const out  = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    const norm = m[1].toLowerCase();
    if (!seen.has(norm)) { seen.add(norm); out.push(m[1]); }
  }
  return out.slice(0, 20);
}

function _extractTxids(text) {
  const re = /(?<![a-fA-F0-9])([a-fA-F0-9]{64})(?![a-fA-F0-9])/g;
  const seen = new Set();
  const out  = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    if (!seen.has(m[1])) { seen.add(m[1]); out.push(m[1]); }
  }
  return out.slice(0, 10);
}

// ── Known block-explorer hosts ────────────────────────────────────────────────

const EXPLORER_HOSTS = [
  'mempool.space', 'blockchain.com', 'blockchair.com',
  'etherscan.io', 'bscscan.com', 'polygonscan.com',
  'tronscan.org', 'solscan.io', 'ftmscan.com', 'arbiscan.io',
  'snowtrace.io', 'avascan.info', 'explorer.bitcoin.com',
  'blockstream.info', 'smartbch.fountainhead.cash',
];

// ── Link / image / content extractors ────────────────────────────────────────

function _extractLinks(el) {
  if (!el) return [];
  const out = [];
  el.querySelectorAll('a[href]').forEach(a => {
    if (a.href?.startsWith('http') && !out.includes(a.href)) out.push(a.href);
  });
  return out.slice(0, 60);
}

function _extractImages(el) {
  if (!el) return [];
  const out = [];
  el.querySelectorAll('img[src]').forEach(img => {
    if (img.src?.startsWith('http') && !out.includes(img.src)) out.push(img.src);
  });
  return out.slice(0, 20);
}

function _extractCodeBlocks(el) {
  if (!el) return [];
  const out = [];
  el.querySelectorAll('div.code, pre, code').forEach(c => {
    const t = c.textContent.trim();
    if (t) out.push(t.slice(0, 1000));
  });
  return out;
}

function _extractQuotes(el) {
  if (!el) return [];
  const out = [];
  el.querySelectorAll('.quoteheader').forEach(qh => {
    const raw = qh.textContent.trim();
    // "Quote from: username link=... on: date" or bare "Quote from: username"
    const m = raw.match(/quote\s+from\s*:?\s*(.+?)(?:\s+link=|\s+on\s*:|$)/i);
    let author = 'Unknown';
    if (m) {
      author = m[1].trim().split('\n')[0].trim();
    } else {
      const lnk = qh.querySelector('a');
      if (lnk) author = lnk.textContent.trim();
    }
    const quoteDiv  = qh.nextElementSibling;
    const quoteText = quoteDiv ? (quoteDiv.innerText || quoteDiv.textContent || '').trim() : '';
    out.push({ author: author.slice(0, 80), text: quoteText.slice(0, 500) });
  });
  // Fallback: <div class="quote"> or <blockquote>
  if (!out.length) {
    el.querySelectorAll('div.quote, blockquote').forEach(bq => {
      out.push({ author: 'Unknown', text: (bq.innerText || bq.textContent || '').trim().slice(0, 500) });
    });
  }
  return out;
}

function _extractExplorerLinks(el) {
  if (!el) return [];
  const out = [];
  el.querySelectorAll('a[href]').forEach(a => {
    const href = a.href || '';
    if (href.startsWith('http') && EXPLORER_HOSTS.some(h => href.includes(h)) && !out.includes(href)) {
      out.push(href);
    }
  });
  return out;
}

function _extractTableContent(el) {
  if (!el) return [];
  const out = [];
  el.querySelectorAll('table').forEach(tbl => {
    const rows = [];
    tbl.querySelectorAll('tr').forEach(tr => {
      const cells = Array.from(tr.querySelectorAll('td, th')).map(c => c.textContent.trim());
      if (cells.length) rows.push(cells);
    });
    if (rows.length) out.push(rows);
  });
  return out;
}

function _extractListItems(el) {
  if (!el) return [];
  const out = [];
  el.querySelectorAll('ul li, ol li').forEach(li => {
    const t = li.textContent.trim();
    if (t && !out.includes(t)) out.push(t);
  });
  return out.slice(0, 50);
}

// ── Social handle extraction ──────────────────────────────────────────────────

function _parseNumericValue(raw) {
  if (!raw) return null;
  const n = Number.parseFloat(String(raw).replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : null;
}

function _extractValueMatches(text) {
  const out = [];
  const seen = new Set();
  const patterns = [
    /([$€£])\s*([0-9][0-9,]*(?:\.\d+)?)(?:\s*(usd|usdt|busd|eur|gbp))?/gi,
    /\b([0-9][0-9,]*(?:\.\d+)?)\s*(usd|usdt|busd|usdc|eur|gbp|btc|eth|bnb|ltc|doge|trx|sats?|satoshi)\b/gi,
  ];

  for (const re of patterns) {
    let m;
    while ((m = re.exec(text)) !== null) {
      const raw = m[0].trim();
      const hasSymbol = /[$€£]/.test(m[1] || '');
      const amount = hasSymbol ? m[2] : m[1];
      const currency = (hasSymbol ? (m[3] || m[1]) : m[2] || '').toUpperCase();
      const value = _parseNumericValue(amount);
      const key = raw.toLowerCase();
      if (value === null || seen.has(key)) continue;
      seen.add(key);
      out.push({ raw, amount: value, currency });
    }
  }

  return out.slice(0, 30);
}

function _extractSocialHandles(text) {
  const telegram = [], twitter = [], discord = [];
  let m;

  // Telegram: t.me/username links
  const tgLink = /(?:https?:\/\/)?t\.me\/([a-zA-Z0-9_]{4,32})/gi;
  while ((m = tgLink.exec(text)) !== null) {
    if (!telegram.includes(m[1])) telegram.push(m[1]);
  }
  // Telegram: label-prefixed @username
  const tgCtx = /(?:telegram|tg|telegram\s*username)[:\s]+@?([a-zA-Z0-9_]{4,32})/gi;
  while ((m = tgCtx.exec(text)) !== null) {
    if (!telegram.includes(m[1])) telegram.push(m[1]);
  }

  // Twitter / X
  const twLink = /(?:https?:\/\/)?(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]{1,50})(?:\/|$|\?|\s|[,.;!)])/gi;
  while ((m = twLink.exec(text)) !== null) {
    const h = m[1];
    if (!['intent', 'share', 'hashtag', 'search', 'home', 'explore', 'i'].includes(h.toLowerCase()) && !twitter.includes(h)) {
      twitter.push(h);
    }
  }

  // Discord: invite links
  const dcInvite = /(?:https?:\/\/)?discord\.(?:gg|com\/invite)\/([a-zA-Z0-9]+)/gi;
  while ((m = dcInvite.exec(text)) !== null) {
    if (!discord.includes(m[1])) discord.push(m[1]);
  }
  // Discord: legacy username#1234 style
  const dcUser = /([a-zA-Z0-9_.]{2,32}#\d{4})/g;
  while ((m = dcUser.exec(text)) !== null) {
    if (!discord.includes(m[1])) discord.push(m[1]);
  }

  return { telegram, twitter, discord };
}

// ── Campaign / application field extraction ───────────────────────────────────

function _extractCampaignFields(text) {
  const result = {};
  let m;

  // Slot
  const slotRe = /\bslot\s*(?:type|number|#)?\s*:?\s*([^\n|;,]{1,60})/gi;
  m = slotRe.exec(text);
  if (m) result.slot = m[1].trim();

  // Week number
  const weekRe = /\bweek\s*(?:number|#)?\s*:?\s*(\d+)/gi;
  m = weekRe.exec(text);
  if (m) result.weekNumber = m[1];

  // Payment amount (generous match, cap length)
  const payRe = /(?:payment|paid|amount|reward|pay)\s*:?\s*([\d.,]+\s*(?:BTC|ETH|USD|USDT|BUSD|SAT|satoshi|[$€₿])[^\n|;,]{0,40})/gi;
  m = payRe.exec(text);
  if (m) result.paymentAmount = m[1].trim().slice(0, 80);

  // Post status keywords
  const lower = text.toLowerCase();
  if (/\b(accepted|approved)\b/.test(lower))           result.postStatus = 'accepted';
  else if (/\b(rejected|denied|declined)\b/.test(lower)) result.postStatus = 'rejected';
  else if (/\b(pending|waiting|under\s+review)\b/.test(lower)) result.postStatus = 'pending';

  // Application form: at least 3 lines with "key: value" structure
  const formLines = text.split(/\r?\n/).filter(l => /^\s*[^:]{2,40}:\s*.{2,}/.test(l));
  result.hasApplicationForm = formLines.length >= 3;

  return result;
}

// ── Poster-cell extra extractors ──────────────────────────────────────────────

function _extractAvatarUrl(posterCell) {
  if (!posterCell) return '';
  const img = posterCell.querySelector('img.avatar, img[src*="avatars"]');
  return img ? (img.src || '') : '';
}

function _extractPersonalText(posterCell) {
  if (!posterCell) return '';
  const el = posterCell.querySelector('.stitle, .custom_title, .personal_text');
  return el ? el.textContent.trim() : '';
}

function _extractTrustInfo(posterCell) {
  if (!posterCell) return '';
  const el = posterCell.querySelector('a[href*="trust"]');
  return el ? el.textContent.trim() : '';
}

// ── DOM traversal helper ──────────────────────────────────────────────────────

function _closestTag(el, tag) {
  let node = el.parentElement;
  while (node && node.tagName !== tag && node.tagName !== 'BODY') node = node.parentElement;
  return node?.tagName === tag ? node : null;
}

// ── Post extractors ───────────────────────────────────────────────────────────

function _extractPost(posterCell, contentCell, postDiv, msgId, topicId, topicTitle, pageNumber, idx) {
  // ── Poster info ──
  const usernameEl = posterCell
    ? (posterCell.querySelector('b > a') || posterCell.querySelector('b a') || posterCell.querySelector('a[href*="profile"]'))
    : null;
  const username = usernameEl ? usernameEl.textContent.trim() : 'Unknown';

  const profileEl  = posterCell ? (posterCell.querySelector('a[href*="action=profile"]') || usernameEl) : null;
  const profileLink = profileEl ? profileEl.href : '';
  const userId      = (profileLink.match(/u=(\d+)/) || [])[1] || '';

  const rankEl = posterCell ? (posterCell.querySelector('.membergroup') || posterCell.querySelector('.position')) : null;
  const rank   = rankEl ? rankEl.textContent.trim() : '';

  let activity = '', merit = '';
  if (posterCell) {
    posterCell.querySelectorAll('.smalltext, div').forEach(el => {
      const t = el.textContent.trim();
      if (/^Activity\s*:/i.test(t)) activity = t.replace(/^Activity\s*:\s*/i, '').trim();
      if (/^Merit\s*:/i.test(t))    merit    = t.replace(/^Merit\s*:\s*/i,    '').trim();
    });
    const html = posterCell.innerHTML;
    if (!activity) { const m = html.match(/Activity:\s*<\/b>\s*(\d+)/i);   if (m) activity = m[1]; }
    if (!merit)    { const m = html.match(/Merit:\s*<\/b>\s*([\d,]+)/i);    if (m) merit = m[1].replace(/,/g, ''); }
  }

  const avatarUrl    = _extractAvatarUrl(posterCell);
  const personalText = _extractPersonalText(posterCell);
  const trustInfo    = _extractTrustInfo(posterCell);

  // ── Post date ──
  let postDate = '';
  if (contentCell) {
    const html   = contentCell.innerHTML || '';
    const onMatch = html.match(/on:\s*<b>([^<]+)<\/b>/i) || html.match(/on:\s*([A-Z][a-z]+ \d{2},\s*\d{4}[^<]*)/i);
    if (onMatch) {
      postDate = onMatch[1].trim();
    } else {
      const dateEl = contentCell.querySelector('.smalltext');
      if (dateEl) postDate = dateEl.textContent.trim().split('\n')[0].trim();
    }
  }

  // ── Post body ──
  const bodyEl      = postDiv || (contentCell ? contentCell.querySelector('div.post') : null);
  const contentHtml = bodyEl ? bodyEl.innerHTML : '';
  const fullContentText = bodyEl ? (bodyEl.innerText || bodyEl.textContent || '').trim() : '';
  const contentText = fullContentText.slice(0, 5000);

  // ── Signature & edited info ──
  const sigEl         = contentCell ? (contentCell.querySelector('.signature') || contentCell.querySelector('td.signature')) : null;
  const signatureText = sigEl ? sigEl.textContent.trim() : '';
  const editEl        = contentCell ? contentCell.querySelector('.modified') : null;
  const editedBy      = editEl ? editEl.textContent.trim() : '';

  // ── Post URL ──
  const resolvedMsgId = msgId || '';
  const postUrl = (topicId && resolvedMsgId)
    ? `https://bitcointalk.org/index.php?topic=${topicId}.msg${resolvedMsgId}#msg${resolvedMsgId}`
    : '';

  // ── Content-level data ──
  const links         = _extractLinks(bodyEl);
  const internalLinks = links.filter(l => l.includes('bitcointalk.org'));
  const externalLinks = links.filter(l => !l.includes('bitcointalk.org'));
  const imageLinks    = _extractImages(bodyEl);
  const codeBlocks    = _extractCodeBlocks(bodyEl);
  const quotes        = _extractQuotes(bodyEl || contentCell);
  const explorerLinks = _extractExplorerLinks(bodyEl);
  const tableContent  = _extractTableContent(bodyEl);
  const listItems     = _extractListItems(bodyEl);

  // ── Crypto data ──
  const btcAddresses = _extractBitcoinAddresses(fullContentText);
  const evmAddresses = _extractEvmAddresses(fullContentText);
  const txids        = _extractTxids(fullContentText);
  const valueMatches = _extractValueMatches(fullContentText);

  // ── Social & campaign ──
  const socials       = _extractSocialHandles(fullContentText);
  const campaignFields = _extractCampaignFields(fullContentText);

  return {
    msgId: resolvedMsgId, topicId, topicTitle, pageNumber, replyNumber: idx,
    postUrl, username, userId, profileLink, rank, activity, merit,
    avatarUrl, personalText, trustInfo,
    postDate, editedBy, signatureText,
    contentText, fullContentText, contentHtml,
    links, internalLinks, externalLinks, imageLinks, explorerLinks,
    codeBlocks, quotes, tableContent, listItems, valueMatches,
    btcAddresses, evmAddresses, txids,
    telegram: socials.telegram,
    twitter:  socials.twitter,
    discord:  socials.discord,
    slot:          campaignFields.slot          || '',
    weekNumber:    campaignFields.weekNumber    || '',
    paymentAmount: campaignFields.paymentAmount || '',
    postStatus:    campaignFields.postStatus    || '',
    hasApplicationForm: campaignFields.hasApplicationForm || false,
    hasQuote:       quotes.length > 0,
    hasImage:       imageLinks.length > 0,
    hasCode:        codeBlocks.length > 0,
    hasLink:        links.length > 0,
    hasValue:       valueMatches.length > 0,
    hasEdited:      !!editedBy,
    hasBtc:         btcAddresses.length > 0,
    hasEvm:         evmAddresses.length > 0,
    hasTxid:        txids.length > 0,
    hasExplorerLink: explorerLinks.length > 0,
    hasTelegram:    socials.telegram.length > 0,
    hasTwitter:     socials.twitter.length > 0,
    hasDiscord:     socials.discord.length > 0,
    hasCampaign:    campaignFields.hasApplicationForm || false,
    hasTable:       tableContent.length > 0,
    hasInternalLink: internalLinks.length > 0,
    hasExternalLink: externalLinks.length > 0,
  };
}

function _extractBarePost(div, msgId, topicId, topicTitle, pageNumber, idx) {
  const fullContentText = (div.innerText || div.textContent || '').trim();
  const contentText    = fullContentText.slice(0, 5000);
  const resolvedMsgId  = msgId || div.id.replace('msg_', '');
  const links          = _extractLinks(div);
  const internalLinks  = links.filter(l => l.includes('bitcointalk.org'));
  const externalLinks  = links.filter(l => !l.includes('bitcointalk.org'));
  const imageLinks     = _extractImages(div);
  const codeBlocks     = _extractCodeBlocks(div);
  const quotes         = _extractQuotes(div);
  const explorerLinks  = _extractExplorerLinks(div);
  const btcAddresses   = _extractBitcoinAddresses(fullContentText);
  const evmAddresses   = _extractEvmAddresses(fullContentText);
  const txids          = _extractTxids(fullContentText);
  const valueMatches   = _extractValueMatches(fullContentText);
  const socials        = _extractSocialHandles(fullContentText);
  const campaignFields = _extractCampaignFields(fullContentText);

  return {
    msgId: resolvedMsgId, topicId, topicTitle, pageNumber, replyNumber: idx,
    postUrl: (topicId && resolvedMsgId)
      ? `https://bitcointalk.org/index.php?topic=${topicId}.msg${resolvedMsgId}#msg${resolvedMsgId}` : '',
    username: 'Unknown', userId: '', profileLink: '', rank: '', activity: '', merit: '',
    avatarUrl: '', personalText: '', trustInfo: '',
    postDate: '', editedBy: '', signatureText: '',
    contentText, fullContentText, contentHtml: div.innerHTML,
    links, internalLinks, externalLinks, imageLinks, explorerLinks,
    codeBlocks, quotes, tableContent: [], listItems: [], valueMatches,
    btcAddresses, evmAddresses, txids,
    telegram: socials.telegram, twitter: socials.twitter, discord: socials.discord,
    slot: campaignFields.slot || '', weekNumber: campaignFields.weekNumber || '',
    paymentAmount: campaignFields.paymentAmount || '', postStatus: campaignFields.postStatus || '',
    hasApplicationForm: campaignFields.hasApplicationForm || false,
    hasQuote:   quotes.length > 0,
    hasImage:   imageLinks.length > 0,
    hasCode:    codeBlocks.length > 0,
    hasLink:    links.length > 0,
    hasValue:   valueMatches.length > 0,
    hasEdited:  false,
    hasBtc:     btcAddresses.length > 0,
    hasEvm:     evmAddresses.length > 0,
    hasTxid:    txids.length > 0,
    hasExplorerLink: explorerLinks.length > 0,
    hasTelegram: socials.telegram.length > 0,
    hasTwitter:  socials.twitter.length > 0,
    hasDiscord:  socials.discord.length > 0,
    hasCampaign: campaignFields.hasApplicationForm || false,
    hasTable:    false,
    hasInternalLink: internalLinks.length > 0,
    hasExternalLink: externalLinks.length > 0,
  };
}

// ── HTML parser — 3-strategy Bitcointalk SMF structure ────────────────────────
//
// Strategy 1: td.poster_info → outer TR → sibling td.td_headerandpost
// Strategy 2: div.post[id^="msg_"] → walk up to TR with poster_info
// Strategy 3: any div.post (bare fallback)

export function parseThreadHtml(html, pageUrl) {
  const doc   = new DOMParser().parseFromString(html, 'text/html');
  const posts = [];

  // Topic title — prefer #subject_header, fallback to <title>
  const titleEl =
    doc.querySelector('#subject_header a') ||
    doc.querySelector('td.title_text') ||
    doc.querySelector('.nav a:last-of-type') ||
    doc.querySelector('title');
  let topicTitle = titleEl ? titleEl.textContent.trim().replace(/\s+/g, ' ') : '';
  // Strip "Topic: " prefix and read-count suffix from <title>
  topicTitle = topicTitle.replace(/^Topic:\s*/i, '').replace(/\s*\(Read \d+ times\)\s*$/i, '').trim();

  // Board name from navigation breadcrumb (second-to-last nav link)
  let boardName = '';
  const navLinks = Array.from(doc.querySelectorAll('.nav a, #bodyarea td.nav a'));
  if (navLinks.length >= 2) boardName = navLinks[navLinks.length - 2]?.textContent?.trim() || '';

  const parsed     = parseBitcointalkUrl(pageUrl);
  const topicId    = parsed?.topicId ?? null;
  const pageOffset = parsed?.offset  ?? 0;
  const pageNumber = Math.floor(pageOffset / 20) + 1;

  // Total pages from pagination
  let totalPages = null;
  const pageLinks = Array.from(doc.querySelectorAll('a.navPages, .navPages a'));
  if (pageLinks.length > 0) {
    const offsets = pageLinks.map(a => {
      const m = (a.href || '').match(/\.(\d+)(?:#|$)/);
      return m ? parseInt(m[1], 10) : 0;
    });
    const maxOffset = Math.max(...offsets, 0);
    if (maxOffset > 0) totalPages = Math.ceil(maxOffset / 20) + 1;
  }

  // ── Strategy 1 ──
  const posterCells = Array.from(doc.querySelectorAll('td.poster_info'));
  if (posterCells.length > 0) {
    posterCells.forEach((posterCell, idx) => {
      try {
        const row = _closestTag(posterCell, 'TR');
        if (!row) return;
        const contentCell = row.querySelector('td.td_headerandpost');
        if (!contentCell) return;
        const postDiv = contentCell.querySelector('[id^="msg_"]');
        const msgId   = postDiv ? postDiv.id.replace('msg_', '') : '';
        const post = _extractPost(posterCell, contentCell, postDiv, msgId, topicId, topicTitle, pageNumber, idx);
        if (post) posts.push(post);
      } catch (_) { /* skip malformed row */ }
    });
  }

  // ── Strategy 2 ──
  if (posts.length === 0) {
    Array.from(doc.querySelectorAll('div.post[id^="msg_"], [id^="msg_"]')).forEach((postDiv, idx) => {
      try {
        const msgId = postDiv.id.replace('msg_', '');
        let row = postDiv.parentElement;
        while (row && row.tagName !== 'BODY') {
          if (row.tagName === 'TR' && row.querySelector('td.poster_info')) break;
          row = row.parentElement;
        }
        if (!row || row.tagName === 'BODY') {
          posts.push(_extractBarePost(postDiv, msgId, topicId, topicTitle, pageNumber, idx));
          return;
        }
        const posterCell  = row.querySelector('td.poster_info');
        const contentCell = row.querySelector('td.td_headerandpost');
        const post = _extractPost(posterCell, contentCell, postDiv, msgId, topicId, topicTitle, pageNumber, idx);
        if (post) posts.push(post);
      } catch (_) { /* skip */ }
    });
  }

  // ── Strategy 3 ──
  if (posts.length === 0) {
    Array.from(doc.querySelectorAll('div.post')).forEach((div, idx) => {
      try { posts.push(_extractBarePost(div, '', topicId, topicTitle, pageNumber, idx)); }
      catch (_) { /* skip */ }
    });
  }

  return { posts, topicTitle, topicId, totalPages, boardName };
}

// ── Filters ───────────────────────────────────────────────────────────────────

export function applyFilters(results, filters) {
  if (!filters || !Object.keys(filters).length) return results;

  return results.filter(post => {

    // ── User filters ──────────────────────────────────────────────────────────
    if (filters.username) {
      const u     = filters.username.trim().toLowerCase();
      const match = post.username.toLowerCase().includes(u);
      if (filters.usernameMode === 'exclude' ? match : !match) return false;
    }
    if (filters.rank) {
      const r = filters.rank.trim().toLowerCase();
      if (r && !post.rank.toLowerCase().includes(r)) return false;
    }
    if (filters.minMerit !== undefined && filters.minMerit !== '') {
      const merit = parseInt(String(post.merit || '0').replace(/,/g, ''), 10) || 0;
      if (merit < parseInt(filters.minMerit, 10)) return false;
    }
    if (filters.maxMerit !== undefined && filters.maxMerit !== '') {
      const merit = parseInt(String(post.merit || '0').replace(/,/g, ''), 10) || 0;
      if (merit > parseInt(filters.maxMerit, 10)) return false;
    }
    if (filters.minActivity !== undefined && filters.minActivity !== '') {
      const act = parseInt(String(post.activity || '0').replace(/,/g, ''), 10) || 0;
      if (act < parseInt(filters.minActivity, 10)) return false;
    }
    if (filters.maxActivity !== undefined && filters.maxActivity !== '') {
      const act = parseInt(String(post.activity || '0').replace(/,/g, ''), 10) || 0;
      if (act > parseInt(filters.maxActivity, 10)) return false;
    }

    // ── Keyword / phrase filters ──────────────────────────────────────────────
    if (filters.keyword) {
      const kw = filters.keyword.trim();
      const haystack = post.fullContentText || post.contentText || '';
      try {
        const re  = filters.keywordRegex ? new RegExp(kw, filters.keywordCase ? '' : 'i') : null;
        const hit = re ? re.test(haystack) : haystack.toLowerCase().includes(kw.toLowerCase());
        if (filters.keywordMode === 'exclude' ? hit : !hit) return false;
      } catch (_) { /* invalid regex — skip */ }
    }
    if (filters.exactPhrase) {
      const phrase = filters.exactPhrase.trim().toLowerCase();
      const haystack = post.fullContentText || post.contentText || '';
      if (phrase && !haystack.toLowerCase().includes(phrase)) return false;
    }

    // ── Page / reply range filters ────────────────────────────────────────────
    if (filters.startPage !== undefined && filters.startPage !== '') {
      if (post.pageNumber < parseInt(filters.startPage, 10)) return false;
    }
    if (filters.endPage !== undefined && filters.endPage !== '') {
      if (post.pageNumber > parseInt(filters.endPage, 10)) return false;
    }
    if (filters.startReply !== undefined && filters.startReply !== '') {
      if ((post.replyNumber + 1) < parseInt(filters.startReply, 10)) return false;
    }
    if (filters.endReply !== undefined && filters.endReply !== '') {
      if ((post.replyNumber + 1) > parseInt(filters.endReply, 10)) return false;
    }

    // ── Content presence ──────────────────────────────────────────────────────
    if (filters.hasImage        && !post.hasImage)        return false;
    if (filters.hasLink         && !post.hasLink)         return false;
    if (filters.hasQuote        && !post.hasQuote)        return false;
    if (filters.hasCode         && !post.hasCode)         return false;
    if (filters.hasEdited       && !post.hasEdited)       return false;
    if (filters.hasInternalLink && !post.hasInternalLink) return false;
    if (filters.hasExternalLink && !post.hasExternalLink) return false;
    if (filters.hasTable        && !post.hasTable)        return false;
    if (filters.hasValue        && !post.hasValue)        return false;
    if (filters.valueSearch) {
      const s = filters.valueSearch.trim().toLowerCase();
      if (s && !(post.valueMatches || []).some(v => String(v.raw || '').toLowerCase().includes(s))) return false;
    }
    if (filters.minValue !== undefined && filters.minValue !== '') {
      const min = Number.parseFloat(String(filters.minValue).replace(/,/g, ''));
      if (Number.isFinite(min) && !(post.valueMatches || []).some(v => Number(v.amount) >= min)) return false;
    }
    if (filters.maxValue !== undefined && filters.maxValue !== '') {
      const max = Number.parseFloat(String(filters.maxValue).replace(/,/g, ''));
      if (Number.isFinite(max) && !(post.valueMatches || []).some(v => Number(v.amount) <= max)) return false;
    }

    // ── Crypto filters ────────────────────────────────────────────────────────
    if (filters.hasBtc         && !post.hasBtc)          return false;
    if (filters.hasEvm         && !post.hasEvm)           return false;
    if (filters.hasTxid        && !post.hasTxid)          return false;
    if (filters.hasExplorerLink && !post.hasExplorerLink) return false;
    if (filters.btcAddressSearch) {
      const s = filters.btcAddressSearch.trim().toLowerCase();
      if (s && !(post.btcAddresses || []).some(a => a.toLowerCase().includes(s))) return false;
    }
    if (filters.evmAddressSearch) {
      const s = filters.evmAddressSearch.trim().toLowerCase();
      if (s && !(post.evmAddresses || []).some(a => a.toLowerCase().includes(s))) return false;
    }
    if (filters.txidSearch) {
      const s = filters.txidSearch.trim().toLowerCase();
      if (s && !(post.txids || []).some(t => t.toLowerCase().includes(s))) return false;
    }

    // ── Campaign / social filters ─────────────────────────────────────────────
    if (filters.hasTelegram   && !post.hasTelegram)   return false;
    if (filters.hasTwitter    && !post.hasTwitter)    return false;
    if (filters.hasDiscord    && !post.hasDiscord)    return false;
    if (filters.hasCampaign   && !post.hasCampaign)   return false;
    if (filters.hasSlot       && !post.slot)          return false;
    if (filters.hasPayment    && !post.paymentAmount) return false;
    if (filters.hasWeekNumber && !post.weekNumber)    return false;
    if (filters.postStatus    && post.postStatus !== filters.postStatus) return false;

    return true;
  });
}

// ── Deduplication ─────────────────────────────────────────────────────────────

export function deduplicateResults(results) {
  const seen = new Set();
  return results.filter(p => {
    if (!p.msgId) return true;
    if (seen.has(p.msgId)) return false;
    seen.add(p.msgId);
    return true;
  });
}

// ── Legacy exports (unchanged signatures) ────────────────────────────────────

export function exportToCsv(results) {
  const headers = [
    'topic_id','topic_title','page_number','reply_number','message_id',
    'post_url','username','user_id','profile_url','rank','activity','merit',
    'post_datetime','content_text','links','image_links','bitcoin_addresses',
    'evm_addresses','txids','has_quote','has_code','has_image','has_link','has_edited',
  ];
  const esc = v => `"${String(v ?? '').replace(/"/g, '""').replace(/\n/g, ' ')}"`;
  const rows = results.map(p => [
    p.topicId, p.topicTitle, p.pageNumber, p.replyNumber, p.msgId,
    p.postUrl, p.username, p.userId, p.profileLink, p.rank, p.activity, p.merit,
    p.postDate, p.contentText,
    (p.links || []).join('; '),
    (p.imageLinks || []).join('; '),
    (p.btcAddresses || []).join('; '),
    (p.evmAddresses || []).join('; '),
    (p.txids || []).join('; '),
    p.hasQuote ? 1 : 0, p.hasCode ? 1 : 0, p.hasImage ? 1 : 0, p.hasLink ? 1 : 0,
    p.hasEdited ? 1 : 0,
  ].map(esc).join(','));
  return [headers.join(','), ...rows].join('\n');
}

export function exportToJson(results) {
  return JSON.stringify(results, null, 2);
}

export function exportToMarkdown(results) {
  let md = `# Scraped Posts\nExported: ${new Date().toLocaleString()}\nTotal: ${results.length}\n\n---\n\n`;
  results.forEach((p, i) => {
    md += `## Post ${i + 1}: @${p.username}\n**Date:** ${p.postDate}  \n`;
    if (p.postUrl) md += `**Link:** ${p.postUrl}  \n`;
    if (p.btcAddresses?.length) md += `**BTC:** ${p.btcAddresses.join(', ')}  \n`;
    if (p.evmAddresses?.length) md += `**EVM:** ${p.evmAddresses.join(', ')}  \n`;
    md += `\n${p.contentText}\n\n---\n\n`;
  });
  return md;
}

export function exportToBBCode(results) {
  return results.map(p => {
    const ts  = Math.floor(Date.now() / 1000);
    const tid = p.topicId || '0', mid = p.msgId || '0';
    return `[quote author=${p.username} link=topic=${tid}.msg${mid}#msg${mid} date=${ts}]\n${p.contentText.slice(0, 600)}\n[/quote]`;
  }).join('\n\n');
}

export function exportSelectedLinks(results) {
  return results.map(p => p.postUrl).filter(Boolean).join('\n');
}

// ── New export: plain text with optional field selection ──────────────────────

export function exportCodeSections(results) {
  const sections = [];
  results.forEach((p, postIndex) => {
    (p.codeBlocks || []).forEach((code, codeIndex) => {
      sections.push([
        `POST ${postIndex + 1} CODE ${codeIndex + 1}`,
        p.username ? `Author: ${p.username}` : '',
        p.postUrl ? `URL: ${p.postUrl}` : '',
        '',
        code,
      ].filter(line => line !== '').join('\n'));
    });
  });
  return sections.join('\n\n' + '-'.repeat(60) + '\n\n');
}

export function exportFullContent(results) {
  return results.map((p, i) => [
    `POST ${i + 1}: @${p.username || 'Unknown'}`,
    p.postUrl ? `URL: ${p.postUrl}` : '',
    p.postDate ? `Date: ${p.postDate}` : '',
    '',
    p.fullContentText || p.contentText || '',
  ].filter(line => line !== '').join('\n')).join('\n\n' + '-'.repeat(60) + '\n\n');
}

export function exportToTxt(results, fields) {
  const sf  = k => !fields || fields.includes(k);
  const SEP = '\n' + '─'.repeat(60) + '\n';
  return results.map((p, i) => {
    const lines = [`POST ${i + 1}  ·  @${p.username}`];
    if (sf('postUrl')      && p.postUrl)       lines.push(`URL:      ${p.postUrl}`);
    if (sf('postDate')     && p.postDate)       lines.push(`Date:     ${p.postDate}`);
    if (sf('rank')         && p.rank)           lines.push(`Rank:     ${p.rank}`);
    if (sf('merit')        && p.merit)          lines.push(`Merit:    ${p.merit}`);
    if (sf('activity')     && p.activity)       lines.push(`Activity: ${p.activity}`);
    if (sf('btcAddresses') && p.btcAddresses?.length) lines.push(`BTC:      ${p.btcAddresses.join('  ')}`);
    if (sf('evmAddresses') && p.evmAddresses?.length) lines.push(`EVM:      ${p.evmAddresses.join('  ')}`);
    if (sf('txids')        && p.txids?.length)  lines.push(`TXIDs:    ${p.txids.join('  ')}`);
    if (sf('telegram')     && p.telegram?.length) lines.push(`Telegram: ${p.telegram.map(t => '@' + t).join(', ')}`);
    if (sf('twitter')      && p.twitter?.length)  lines.push(`Twitter:  ${p.twitter.map(t => '@' + t).join(', ')}`);
    if (sf('discord')      && p.discord?.length)  lines.push(`Discord:  ${p.discord.join(', ')}`);
    if (sf('slot')         && p.slot)           lines.push(`Slot:     ${p.slot}`);
    if (sf('postStatus')   && p.postStatus)     lines.push(`Status:   ${p.postStatus}`);
    if (sf('signatureText') && p.signatureText) lines.push(`Sig:      ${p.signatureText.slice(0, 200)}`);
    if (sf('editedBy')     && p.editedBy)       lines.push(`Edited:   ${p.editedBy}`);
    if (sf('valueMatches') && p.valueMatches?.length) lines.push(`Values:   ${p.valueMatches.map(v => v.raw).join(', ')}`);
    if (sf('codeBlocks')   && p.codeBlocks?.length)   lines.push(`Code:\n${p.codeBlocks.join('\n\n--- code ---\n\n')}`);
    if (sf('fullContentText') && p.fullContentText) lines.push('\n' + p.fullContentText);
    if (sf('contentText')  && p.contentText)    lines.push('\n' + p.contentText.slice(0, 2000));
    return lines.join('\n');
  }).join(SEP);
}

// ── New export: BBCode [table] with field selection ───────────────────────────

const _BBCODE_FIELD_DEFS = [
  { key: 'replyNumber',   label: '#',           render: p => String(p.replyNumber + 1) },
  { key: 'username',      label: 'Username',    render: p => p.profileLink ? `[url=${p.profileLink}]${p.username}[/url]` : (p.username || '-') },
  { key: 'userId',        label: 'User ID',     render: p => p.userId || '-' },
  { key: 'rank',          label: 'Rank',        render: p => p.rank || '-' },
  { key: 'merit',         label: 'Merit',       render: p => p.merit || '-' },
  { key: 'activity',      label: 'Activity',    render: p => p.activity || '-' },
  { key: 'pageNumber',    label: 'Page',        render: p => String(p.pageNumber || '-') },
  { key: 'postDate',      label: 'Date',        render: p => p.postDate || '-' },
  { key: 'postUrl',       label: 'Post URL',    render: p => p.postUrl ? `[url=${p.postUrl}]#${p.msgId}[/url]` : '-' },
  { key: 'btcAddresses',  label: 'BTC Address', render: p => (p.btcAddresses || []).slice(0, 1).join('') || '-' },
  { key: 'evmAddresses',  label: 'EVM Address', render: p => (p.evmAddresses || []).slice(0, 1).join('') || '-' },
  { key: 'telegram',      label: 'Telegram',    render: p => (p.telegram || []).map(t => '@' + t).join(', ') || '-' },
  { key: 'twitter',       label: 'Twitter/X',   render: p => (p.twitter  || []).map(t => '@' + t).join(', ') || '-' },
  { key: 'discord',       label: 'Discord',     render: p => (p.discord  || []).join(', ')                   || '-' },
  { key: 'slot',          label: 'Slot',        render: p => p.slot          || '-' },
  { key: 'postStatus',    label: 'Status',      render: p => p.postStatus    || '-' },
  { key: 'paymentAmount', label: 'Payment',     render: p => p.paymentAmount || '-' },
  { key: 'weekNumber',    label: 'Week',        render: p => p.weekNumber    || '-' },
];

const _DEFAULT_BBCODE_FIELDS = ['replyNumber', 'username', 'rank', 'merit', 'postDate', 'postUrl', 'btcAddresses'];

export function exportToBBCodeTable(results, fields) {
  const active = fields
    ? _BBCODE_FIELD_DEFS.filter(d => fields.includes(d.key))
    : _BBCODE_FIELD_DEFS.filter(d => _DEFAULT_BBCODE_FIELDS.includes(d.key));
  if (!active.length) return '';
  const header = '[tr]' + active.map(d => `[td][b]${d.label}[/b][/td]`).join('') + '[/tr]';
  const rows   = results.map(p => '[tr]' + active.map(d => `[td]${d.render(p)}[/td]`).join('') + '[/tr]');
  return '[table]\n' + header + '\n' + rows.join('\n') + '\n[/table]';
}

// ── New export: CSV with field selection ──────────────────────────────────────

const _CSV_FIELD_DEFS = [
  { key: 'topicId',         label: 'topic_id' },
  { key: 'topicTitle',      label: 'topic_title' },
  { key: 'pageNumber',      label: 'page_number' },
  { key: 'replyNumber',     label: 'reply_number' },
  { key: 'msgId',           label: 'message_id' },
  { key: 'postUrl',         label: 'post_url' },
  { key: 'username',        label: 'username' },
  { key: 'userId',          label: 'user_id' },
  { key: 'profileLink',     label: 'profile_url' },
  { key: 'rank',            label: 'rank' },
  { key: 'activity',        label: 'activity' },
  { key: 'merit',           label: 'merit' },
  { key: 'postDate',        label: 'post_datetime' },
  { key: 'editedBy',        label: 'edited_info' },
  { key: 'contentText',     label: 'content_text' },
  { key: 'fullContentText', label: 'full_content_text' },
  { key: 'codeBlocks',      label: 'code_blocks',         arr: true },
  { key: 'signatureText',   label: 'signature' },
  { key: 'avatarUrl',       label: 'avatar_url' },
  { key: 'btcAddresses',    label: 'bitcoin_addresses',  arr: true },
  { key: 'evmAddresses',    label: 'evm_addresses',      arr: true },
  { key: 'txids',           label: 'txids',              arr: true },
  { key: 'links',           label: 'links',              arr: true },
  { key: 'internalLinks',   label: 'internal_links',     arr: true },
  { key: 'externalLinks',   label: 'external_links',     arr: true },
  { key: 'imageLinks',      label: 'image_links',        arr: true },
  { key: 'explorerLinks',   label: 'explorer_links',     arr: true },
  { key: 'valueMatches',    label: 'value_matches',      arr: true },
  { key: 'telegram',        label: 'telegram',           arr: true },
  { key: 'twitter',         label: 'twitter',            arr: true },
  { key: 'discord',         label: 'discord',            arr: true },
  { key: 'slot',            label: 'slot' },
  { key: 'weekNumber',      label: 'week_number' },
  { key: 'paymentAmount',   label: 'payment_amount' },
  { key: 'postStatus',      label: 'post_status' },
  { key: 'hasQuote',        label: 'has_quote',    bool: true },
  { key: 'hasCode',         label: 'has_code',     bool: true },
  { key: 'hasImage',        label: 'has_image',    bool: true },
  { key: 'hasEdited',       label: 'has_edited',   bool: true },
  { key: 'hasBtc',          label: 'has_btc',      bool: true },
  { key: 'hasEvm',          label: 'has_evm',      bool: true },
  { key: 'hasTxid',         label: 'has_txid',     bool: true },
  { key: 'hasCampaign',     label: 'has_campaign', bool: true },
];

export function exportToCsvWithFields(results, fields) {
  const active = fields
    ? _CSV_FIELD_DEFS.filter(d => fields.includes(d.key))
    : _CSV_FIELD_DEFS;
  const esc = v => `"${String(v ?? '').replace(/"/g, '""').replace(/\n/g, ' ')}"`;
  const headers = active.map(d => d.label).join(',');
  const rows    = results.map(p =>
    active.map(d => {
      const v = p[d.key];
      if (d.bool) return esc(v ? 1 : 0);
      if (d.arr) {
        return esc((v || []).map(item => {
          if (item && typeof item === 'object') return item.raw || JSON.stringify(item);
          return item;
        }).join('; '));
      }
      return esc(v);
    }).join(',')
  );
  return [headers, ...rows].join('\n');
}

// ── Stats helpers ─────────────────────────────────────────────────────────────

export function countStats(results) {
  const usernames  = new Set();
  const btcAddrs   = new Set();
  const evmAddrs   = new Set();
  const topPosters = {};

  results.forEach(p => {
    if (p.username && p.username !== 'Unknown') {
      usernames.add(p.username);
      topPosters[p.username] = (topPosters[p.username] || 0) + 1;
    }
    (p.btcAddresses || []).forEach(a => btcAddrs.add(a));
    (p.evmAddresses || []).forEach(a => evmAddrs.add(a.toLowerCase()));
  });

  return {
    totalPosts:         results.length,
    uniqueUsernames:    usernames.size,
    uniqueBtcAddresses: btcAddrs.size,
    uniqueEvmAddresses: evmAddrs.size,
    postsWithBtc:    results.filter(p => p.hasBtc).length,
    postsWithEvm:    results.filter(p => p.hasEvm).length,
    postsWithLinks:  results.filter(p => p.hasLink).length,
    postsWithImages: results.filter(p => p.hasImage).length,
    postsWithCode:   results.filter(p => p.hasCode).length,
    postsWithQuotes: results.filter(p => p.hasQuote).length,
    postsEdited:     results.filter(p => p.hasEdited).length,
    postsWithCampaign: results.filter(p => p.hasCampaign).length,
    topPosters: Object.entries(topPosters)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([username, count]) => ({ username, count })),
  };
}

export function getUniqueValues(results, field) {
  const seen = new Set();
  const out  = [];
  results.forEach(p => {
    const val = p[field];
    if (Array.isArray(val)) {
      val.forEach(v => { if (v && !seen.has(v)) { seen.add(v); out.push(v); } });
    } else if (val && val !== 'Unknown') {
      if (!seen.has(val)) { seen.add(val); out.push(val); }
    }
  });
  return out;
}

// ── Campaign Application Extractor ────────────────────────────────────────────

const DEFAULT_FIELD_LABELS = [
  { key: 'username',    labels: ['username','bitcointalk username','forum username','btc username'] },
  { key: 'profileLink', labels: ['profile','profile link','bitcointalk profile','btct profile'] },
  { key: 'rank',        labels: ['rank','current rank','forum rank','btct rank'] },
  { key: 'postCount',   labels: ['post count','posts','current post count','total posts','no. of posts'] },
  { key: 'merit',       labels: ['merit','merit count','current merit','total merit'] },
  { key: 'btcAddress',  labels: ['bitcoin address','btc address','payment address','wallet address','bep20','erc20','receiving address'] },
  { key: 'telegram',    labels: ['telegram','telegram username','tg','tg username','tg:'] },
  { key: 'twitter',     labels: ['twitter','twitter username','x username','x.com'] },
  { key: 'discord',     labels: ['discord','discord username','discord server'] },
  { key: 'campaign',    labels: ['applying for','campaign','campaign name','campaign title'] },
  { key: 'slot',        labels: ['slot','slot type','preferred slot','slot number','slot applied'] },
  { key: 'status',      labels: ['status','decision','accepted','rejected','approved'] },
];

export function extractApplicationData(contentText, customLabels = []) {
  const labels = [...DEFAULT_FIELD_LABELS, ...customLabels];
  const result = {};
  contentText.split(/[\n\r]+/).forEach(line => {
    const ci = line.indexOf(':');
    if (ci === -1) return;
    const rawKey = line.slice(0, ci).trim().toLowerCase().replace(/[\[\]]/g, '');
    const value  = line.slice(ci + 1).trim().replace(/\[.*?\]/g, '').trim();
    if (!value) return;
    labels.forEach(({ key, labels: syns }) => {
      if (result[key]) return;
      if (syns.some(s => rawKey.includes(s))) result[key] = value;
    });
  });
  if (!result.btcAddress) {
    const addrs = _extractBitcoinAddresses(contentText);
    if (addrs.length) result.btcAddress = addrs[0];
  }
  if (!result.btcAddress) {
    const evms = _extractEvmAddresses(contentText);
    if (evms.length) result.btcAddress = evms[0]; // fallback to EVM
  }
  return result;
}

export function buildCampaignTable(apps) {
  let t = '[table]\n';
  t += '[tr][td][b]#[/b][/td][td][b]Username[/b][/td][td][b]Rank[/b][/td][td][b]Posts[/b][/td][td][b]Merit[/b][/td][td][b]BTC/EVM Address[/b][/td][td][b]Telegram[/b][/td][td][b]Status[/b][/td][/tr]\n';
  apps.forEach((a, i) => {
    const uLink = a.profileLink
      ? `[url=${a.profileLink}]${a.username || 'Unknown'}[/url]`
      : (a.username || 'Unknown');
    t += `[tr][td]${i + 1}[/td][td]${uLink}[/td][td]${a.rank || '-'}[/td][td]${a.postCount || '-'}[/td][td]${a.merit || '-'}[/td][td]${a.btcAddress ? `[code]${a.btcAddress}[/code]` : '-'}[/td][td]${a.telegram || '-'}[/td][td]${a.status || 'Pending'}[/td][/tr]\n`;
  });
  return t + '[/table]';
}

// ── Session storage ───────────────────────────────────────────────────────────

const SESSIONS_KEY = 'btt_scraper_sessions';

function _uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

export function loadSessions() {
  return new Promise(r => chrome.storage.local.get(SESSIONS_KEY, d => r(d[SESSIONS_KEY] || [])));
}

export async function saveSession(data) {
  const sessions = await loadSessions();
  sessions.unshift({ id: 'sess_' + _uid(), ...data });
  if (sessions.length > 10) sessions.length = 10;
  await new Promise(r => chrome.storage.local.set({ [SESSIONS_KEY]: sessions }, r));
}

export async function deleteSession(id) {
  const sessions = await loadSessions();
  await new Promise(r => chrome.storage.local.set({ [SESSIONS_KEY]: sessions.filter(s => s.id !== id) }, r));
}

// ── Main scraping loop ────────────────────────────────────────────────────────

export async function scrapeThread(url, options = {}, onProgress) {
  const parsed = parseBitcointalkUrl(url);
  if (!parsed) throw new Error('Invalid Bitcointalk thread URL. Expected: https://bitcointalk.org/index.php?topic=TOPICID');

  const { topicId } = parsed;
  const delay     = options.delay ?? 2000;

  // Custom page range support (1-indexed page numbers)
  const startPage = options.startPage ?? null;
  const endPage   = options.endPage   ?? null;

  let currentOffset;
  if (startPage != null) {
    currentOffset = Math.max(0, (startPage - 1) * 20);
  } else {
    currentOffset = parsed.offset;
  }

  let maxPages;
  if (endPage != null && startPage != null) {
    maxPages = endPage - startPage + 1;
  } else if (endPage != null) {
    maxPages = endPage;
  } else {
    maxPages = options.maxPages ?? 10;
  }

  const ctrl = options.ctrl || {};
  ctrl.paused = ctrl.paused ?? false;
  ctrl.abort  = ctrl.abort  ?? false;

  let results      = [];
  let pagesScraped = 0;
  let pagesTotal   = null;
  let boardName    = '';
  let allDone      = false;

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  while (!allDone && !ctrl.abort && pagesScraped < maxPages) {
    while (ctrl.paused && !ctrl.abort) await sleep(200);
    if (ctrl.abort) break;

    const pageUrl = buildPageUrl(topicId, currentOffset);
    try {
      const html = await bgFetch(pageUrl);
      const { posts, totalPages, boardName: bn } = parseThreadHtml(html, pageUrl);

      if (totalPages !== null && pagesTotal === null) pagesTotal = totalPages;
      if (bn && !boardName) boardName = bn;

      if (posts.length === 0 && pagesScraped > 0) { allDone = true; break; }

      results = deduplicateResults([...results, ...posts]);
      pagesScraped++;
      currentOffset += 20;

      // Stop if we've exceeded endPage
      if (endPage != null && Math.floor(currentOffset / 20) + 1 > endPage) allDone = true;

      onProgress?.({ pagesScraped, pagesTotal, postsFound: results.length, status: 'scraping' });

      if (pagesTotal !== null && currentOffset >= pagesTotal * 20) allDone = true;
    } catch (err) {
      if (pagesScraped === 0) throw err;
      pagesScraped++;
      currentOffset += 20;
      onProgress?.({ pagesScraped, pagesTotal, postsFound: results.length, status: 'error', lastError: err.message });
    }

    if (!allDone && !ctrl.abort && pagesScraped < maxPages) await sleep(delay);
  }

  const finalStatus = ctrl.abort ? 'stopped' : 'completed';
  onProgress?.({ pagesScraped, pagesTotal, postsFound: results.length, status: finalStatus });

  await saveSession({
    url, topicId,
    topicTitle: results[0]?.topicTitle || '',
    boardName,
    scrapeDate:   new Date().toISOString(),
    pagesScraped,
    postCount:    results.length,
    results,
  });

  return results;
}

// ── Module default export ─────────────────────────────────────────────────────

let _menuBtn = null;

export default {
  id: 'scraper',
  name: 'Thread Scraper',
  description: 'Scrape posts, addresses, links, and campaign data from Bitcointalk threads.',
  category: 'Thread Tools',
  defaultEnabled: false,

  init() {
    const menu = document.getElementById('btt-mini-menu');
    if (!menu) return;
    _menuBtn = document.createElement('button');
    _menuBtn.innerHTML = '<span>🔍</span> Thread Scraper';
    _menuBtn.addEventListener('click', () => {
      menu.classList.remove('open');
      chrome.runtime.sendMessage({ action: 'openDashboard', section: 'thread' });
    });
    menu.appendChild(_menuBtn);
  },

  destroy() {
    _menuBtn?.remove();
    _menuBtn = null;
  },
};
