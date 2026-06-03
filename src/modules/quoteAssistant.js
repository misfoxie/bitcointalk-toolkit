// quoteAssistant.js - Select text and insert a Bitcointalk BBCode quote.

import { getReplyTextarea, getTopicId } from '../content/domHelpers.js';
import { Toast } from '../utils/sharedUI.js';

const PENDING_QUOTE_KEY = 'btt_quote_assistant_pending_quote';

function stopButtonEvent(e) {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
}

function normalizeSelectedText(text) {
  return String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/\u00a0/g, ' ')
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    .trim();
}

function escapeQuoteAuthor(author) {
  return String(author || '').trim().replace(/\]/g, '');
}

function parseBitcointalkDateToUnix(text) {
  const raw = String(text || '').replace(/\s+/g, ' ').trim();
  if (!raw) return '';
  const lower = raw.toLowerCase();
  const relative = lower.match(/\b(today|yesterday)\s+at\s+(\d{1,2}:\d{2}:\d{2})\s*(am|pm)?/i);
  if (relative) {
    const d = new Date();
    if (relative[1].toLowerCase() === 'yesterday') d.setDate(d.getDate() - 1);
    let hour = Number(relative[2].split(':')[0]);
    const minute = Number(relative[2].split(':')[1]);
    const second = Number(relative[2].split(':')[2]);
    const meridiem = relative[3]?.toLowerCase();
    if (meridiem === 'pm' && hour < 12) hour += 12;
    if (meridiem === 'am' && hour === 12) hour = 0;
    d.setHours(hour, minute, second, 0);
    return String(Math.floor(d.getTime() / 1000));
  }
  const clean = raw
    .replace(/^on:\s*/i, '')
    .replace(/\b(?:Today|Yesterday)\s+at\s+/i, '')
    .replace(/\s*\(.*?\)\s*$/, '')
    .trim();
  const parsed = Date.parse(clean);
  return Number.isFinite(parsed) ? String(Math.floor(parsed / 1000)) : '';
}

function extractMsgId(value) {
  const text = String(value || '');
  return text.match(/(?:^|[.#])msg_?(\d+)/i)?.[1]
    || text.match(/[?;&]msg=(\d+)/i)?.[1]
    || text.match(/^msg_?(\d+)$/i)?.[1]
    || '';
}

function getPostMessageId(postDiv) {
  const fromId = extractMsgId(postDiv?.id);
  if (fromId) return fromId;
  const scope = getPostScope(postDiv);
  const anchor = scope?.querySelector?.('a[name^="msg"], a[id^="msg"], a[href*="#msg"], a[href*=".msg"], a[href*="msg="]')
    || postDiv?.querySelector?.('a[name^="msg"], a[id^="msg"], a[href*="#msg"], a[href*=".msg"], a[href*="msg="]');
  const id = anchor?.name || anchor?.id || '';
  const fromAnchorId = extractMsgId(id);
  if (fromAnchorId) return fromAnchorId;
  const href = anchor?.href || anchor?.getAttribute?.('href') || '';
  return extractMsgId(href);
}

function findRealBitcointalkPost(node) {
  let el = node?.nodeType === Node.TEXT_NODE ? node.parentElement : node;
  while (el && el !== document.body) {
    if (extractMsgId(el.id) && findBuiltInQuoteLink(getPostScope(el) || el)) return getPostScope(el) || el;
    const contentCell = el.closest?.('td.td_headerandpost');
    if (contentCell) {
      const scope = getPostScope(contentCell) || contentCell;
      if (findBuiltInQuoteLink(scope)) return scope;
    }
    const post = findMessageElement(el);
    if (post && el.matches?.('td.td_headerandpost, .post, .windowbg, .windowbg2')) {
      const scope = getPostScope(post) || el;
      if (findBuiltInQuoteLink(scope)) return scope;
    }
    if (findBuiltInQuoteLink(el) && (el.querySelector?.('td.poster_info, .poster_info') || findMessageElement(el))) return el;
    el = el.parentElement;
  }
  return null;
}

function findMessageElement(scope) {
  if (!scope?.querySelectorAll) return null;
  return Array.from(scope.querySelectorAll('[id], a[name]')).find(candidate => (
    extractMsgId(candidate.id) || extractMsgId(candidate.getAttribute?.('name'))
  )) || null;
}

function getPostScope(postDiv) {
  let el = postDiv;
  while (el && el !== document.body) {
    if (el.matches?.('table') && el.querySelector('td.poster_info, .poster_info') && (findMessageElement(el) || findBuiltInQuoteLink(el))) return el;
    if (el.matches?.('tr') && el.querySelector('td.poster_info, .poster_info') && (findMessageElement(el) || findBuiltInQuoteLink(el))) return el;
    el = el.parentElement;
  }
  return postDiv?.closest('table') || postDiv?.closest('tr') || null;
}

function findPostRows(postDiv) {
  const contentRow = postDiv?.closest('tr');
  const contentCell = postDiv?.closest('td.td_headerandpost') || postDiv?.closest('td');
  const headerRow = findHeaderRow(contentRow);
  const scope = getPostScope(postDiv);
  const posterCell = headerRow?.querySelector('td.poster_info')
    || contentRow?.querySelector('td.poster_info')
    || scope?.querySelector('td.poster_info, .poster_info')
    || findPosterCellNearPost(postDiv);
  const headerCell = headerRow?.querySelector('td.td_headerandpost')
    || contentCell?.parentElement?.previousElementSibling?.querySelector?.('td.td_headerandpost')
    || scope?.querySelector('td.td_headerandpost .smalltext')?.closest('td.td_headerandpost')
    || contentCell;
  return { contentCell, headerCell, posterCell };
}

function findHeaderRow(contentRow) {
  let row = contentRow;
  for (let i = 0; i < 4 && row; i += 1) {
    if (row.querySelector?.('td.poster_info, .poster_info')) return row;
    row = row.previousElementSibling;
  }
  return contentRow?.previousElementSibling || null;
}

function findPosterCellNearPost(postDiv) {
  const postRect = postDiv?.getBoundingClientRect?.();
  if (!postRect) return null;
  let best = null;
  let bestScore = Infinity;
  document.querySelectorAll('td.poster_info, .poster_info').forEach(cell => {
    const rect = cell.getBoundingClientRect();
    const vertical = Math.abs(rect.top - postRect.top);
    const horizontalPenalty = rect.left > postRect.left ? 1000 : 0;
    const score = vertical + horizontalPenalty;
    if (score < bestScore) {
      best = cell;
      bestScore = score;
    }
  });
  return bestScore < 500 ? best : null;
}

function getAuthorFromPosterCell(posterCell) {
  const author = posterCell?.querySelector('b > a[href*="action=profile"]')?.textContent?.trim()
    || posterCell?.querySelector('b a[href*="action=profile"]')?.textContent?.trim()
    || posterCell?.querySelector('a[href*="action=profile"]')?.textContent?.trim()
    || posterCell?.querySelector('b')?.textContent?.trim()
    || '';
  return author.replace(/\s+/g, ' ').trim();
}

function getAuthorFromPostScope(postScope) {
  const scope = getPostScope(postScope) || postScope;
  const author = getAuthorFromPosterCell(scope?.querySelector?.('td.poster_info, .poster_info'))
    || scope?.querySelector?.('td.poster_info b a[href*="action=profile"], .poster_info b a[href*="action=profile"]')?.textContent?.trim()
    || scope?.querySelector?.('td.poster_info a[href*="action=profile"], .poster_info a[href*="action=profile"]')?.textContent?.trim()
    || '';
  return author.replace(/\s+/g, ' ').trim();
}

function getPostTimestamp(headerCell, contentCell) {
  const scope = headerCell?.closest('table') || contentCell?.closest('table') || contentCell;
  const candidates = [
    headerCell?.querySelector?.('.smalltext')?.textContent,
    headerCell?.textContent,
    contentCell?.querySelector?.('.smalltext')?.textContent,
    scope?.querySelector?.('.smalltext')?.textContent,
    scope?.textContent,
  ];
  for (const text of candidates) {
    const match = String(text || '').match(/on:\s*(.+?)(?:\n|$|Last edit:|Views:|Reply with quote)/i);
    const timestamp = parseBitcointalkDateToUnix(match?.[1] || text);
    if (timestamp) return timestamp;
  }
  return '';
}

function getTopicIdFromPost(postDiv) {
  const fromLocation = getTopicId();
  if (fromLocation) return fromLocation;
  const scope = getPostScope(postDiv);
  const link = scope?.querySelector?.('a[href*="topic="]') || document.querySelector('a[href*="topic="]');
  const href = link?.href || link?.getAttribute?.('href') || '';
  return href.match(/[?;&]topic=(\d+)/)?.[1] || '';
}

function parseBitcointalkParams(value) {
  const out = {};
  const text = String(value || '').replace(/&amp;/g, '&');
  const query = text.includes('?') ? text.slice(text.indexOf('?') + 1) : text;
  query.split(/[;&]/).forEach(part => {
    const [rawKey, ...rest] = part.split('=');
    const key = decodeURIComponent(rawKey || '').trim();
    if (!key) return;
    out[key] = decodeURIComponent(rest.join('=') || '');
  });
  return out;
}

function isBuiltInQuoteLink(link) {
  if (!link) return false;
  const href = link.href || link.getAttribute?.('href') || '';
  const text = `${link.textContent || ''} ${link.title || ''} ${link.getAttribute?.('onclick') || ''}`.toLowerCase();
  if (!/quote/.test(text) && !/[?;&]quote=|action=quote|quotefast/i.test(href)) return false;
  return /action=post|action=quote|quote=|quotefast/i.test(href) || /quote/.test(text);
}

function findBuiltInQuoteLink(scope) {
  if (!scope?.querySelectorAll) return null;
  const links = Array.from(scope.querySelectorAll('a[href], button, input[type="button"], input[type="submit"]'));
  return links.find(isBuiltInQuoteLink) || null;
}

function parseQuoteLinkMeta(link) {
  if (!link) return {};
  const href = link.href || link.getAttribute?.('href') || '';
  const onclick = link.getAttribute?.('onclick') || '';
  const params = parseBitcointalkParams(href);
  const onclickParams = parseBitcointalkParams(onclick);
  const topicRaw = params.topic || onclickParams.topic || '';
  const quoteRaw = params.quote || params.msg || onclickParams.quote || onclickParams.msg || '';
  const dateRaw = params.date || onclickParams.date || '';
  return {
    topicId: String(topicRaw).match(/\d+/)?.[0] || '',
    msgId: String(quoteRaw).match(/\d+/)?.[0] || extractMsgId(href) || extractMsgId(onclick),
    timestamp: String(dateRaw).match(/\d{8,}/)?.[0] || '',
  };
}

function enrichMetaFromLinks(postDiv, meta) {
  const scope = getPostScope(postDiv);
  const links = Array.from(scope?.querySelectorAll?.('a[href]') || []);
  for (const link of links) {
    const href = link.href || link.getAttribute('href') || '';
    if (!meta.topicId) {
      const topicMatch = href.match(/[?;&]topic=(\d+)/i);
      if (topicMatch) meta.topicId = topicMatch[1];
    }
    if (!meta.msgId) {
      const msgId = extractMsgId(href) || extractMsgId(link.id) || extractMsgId(link.name);
      if (msgId) meta.msgId = msgId;
    }
    if (meta.topicId && meta.msgId) break;
  }
  return meta;
}

function getSelectionRect(selection) {
  if (!selection?.rangeCount) return null;
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  if (rect && (rect.width || rect.height)) return rect;
  return range.getClientRects?.()[0] || null;
}

function buildQuoteBbcode({ text, author, topicId, msgId, timestamp }) {
  const cleanAuthor = escapeQuoteAuthor(author);
  const hasLink = topicId && msgId;
  const attrs = [];

  if (cleanAuthor) attrs.push(`author=${cleanAuthor}`);
  if (hasLink) attrs.push(`link=topic=${topicId}.msg${msgId}#msg${msgId}`);
  if (timestamp && cleanAuthor && hasLink) attrs.push(`date=${timestamp}`);

  return `[quote${attrs.length ? ' ' + attrs.join(' ') : ''}]\n${text}\n[/quote]\n\n`;
}

function savePendingQuote(bbcode) {
  try {
    sessionStorage.setItem(PENDING_QUOTE_KEY, JSON.stringify({
      bbcode,
      topicId: getTopicId(),
      createdAt: Date.now(),
    }));
    return true;
  } catch {
    return false;
  }
}

function loadPendingQuote() {
  try {
    const raw = sessionStorage.getItem(PENDING_QUOTE_KEY);
    if (!raw) return null;
    const pending = JSON.parse(raw);
    if (!pending?.bbcode || Date.now() - Number(pending.createdAt || 0) > 10 * 60 * 1000) {
      sessionStorage.removeItem(PENDING_QUOTE_KEY);
      return null;
    }
    return pending;
  } catch {
    return null;
  }
}

function clearPendingQuote() {
  try {
    sessionStorage.removeItem(PENDING_QUOTE_KEY);
  } catch {
    // Ignore storage failures.
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isVisibleElement(el) {
  if (!el) return false;
  const style = window.getComputedStyle(el);
  return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null;
}

function isSafeQuickReplyControl(el) {
  if (!el || !isVisibleElement(el)) return false;
  const text = `${el.textContent || ''} ${el.value || ''} ${el.title || ''} ${el.id || ''} ${el.className || ''}`.toLowerCase();
  if (!/quick\s*reply|quickreply|quick_reply/.test(text)) return false;
  if (/quote/.test(text)) return false;

  const href = el.getAttribute?.('href') || '';
  if (!href) return true;
  if (href === '#' || href.startsWith('#')) return true;
  if (/^javascript:/i.test(href)) return true;
  return false;
}

function tryOpenQuickReply() {
  const controls = [
    ...document.querySelectorAll('button, input[type="button"], input[type="submit"], a, [role="button"]'),
  ];
  const control = controls.find(isSafeQuickReplyControl);
  if (!control) return false;
  control.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
  return true;
}

function getReplyPageUrl() {
  const topicId = getTopicId();
  const links = Array.from(document.querySelectorAll('a[href]'));
  const replyLink = links.find(link => {
    const href = link.getAttribute('href') || '';
    const text = `${link.textContent || ''} ${link.title || ''}`.toLowerCase();
    if (!/action=post/i.test(href)) return false;
    if (/action=quote|quotefast|quote=/i.test(href)) return false;
    if (topicId && !href.includes(`topic=${topicId}`)) return false;
    return /reply|post/.test(text) || /topic=\d+/i.test(href);
  });

  if (replyLink?.href) return replyLink.href;
  if (topicId) return `https://bitcointalk.org/index.php?action=post;topic=${encodeURIComponent(topicId)}`;
  return '';
}

function insertBbcodeIntoTextarea(textarea, bbcode) {
  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? textarea.value.length;
  textarea.value = textarea.value.slice(0, start) + bbcode + textarea.value.slice(end);
  textarea.selectionStart = textarea.selectionEnd = start + bbcode.length;
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  textarea.dispatchEvent(new Event('change', { bubbles: true }));
  textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
  textarea.focus();
}

export default {
  id:             'quoteAssistant',
  name:           'Quote Assistant',
  description:    'Select text in any post and click the floating button to insert it as a BBCode quote.',
  category:       'Layout & Reading',
  defaultEnabled: true,

  _floatBtn: null,
  _selectionHandler: null,
  _selectionChangeHandler: null,
  _hideHandler: null,
  _selectionTimer: null,
  _lastQuote: null,

  init() {
    this._createFloatBtn();
    this._bindSelection();
    this._insertPendingQuoteWhenReady();
  },

  destroy() {
    this._floatBtn?.remove();
    document.removeEventListener('mouseup', this._selectionHandler);
    document.removeEventListener('keyup', this._selectionHandler);
    document.removeEventListener('touchend', this._selectionHandler);
    document.removeEventListener('selectionchange', this._selectionChangeHandler);
    document.removeEventListener('mousedown', this._hideHandler, true);
    clearTimeout(this._selectionTimer);
    this._floatBtn = null;
    this._selectionHandler = null;
    this._selectionChangeHandler = null;
    this._hideHandler = null;
    this._selectionTimer = null;
    this._lastQuote = null;
  },

  _createFloatBtn() {
    this._floatBtn = document.getElementById('btt-quote-selection-btn');
    if (!this._floatBtn) {
      this._floatBtn = document.createElement('button');
      this._floatBtn.id = 'btt-quote-selection-btn';
      this._floatBtn.type = 'button';
      document.body.appendChild(this._floatBtn);
    }
    this._floatBtn.textContent = 'Quote';
    this._floatBtn.title = 'Quote selected text';
    this._floatBtn.style.cssText = `
      position:fixed;
      display:none;
      z-index:2147483646;
      padding:5px 10px;
      border-radius:6px;
      border:1px solid var(--btt-border,#374151);
      background:var(--btt-surface,#1f2937);
      color:var(--btt-text,#ffffff);
      box-shadow:0 3px 10px rgba(0,0,0,.35);
      cursor:pointer;
      font:12px/1.3 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
      white-space:nowrap;
    `;
    ['pointerdown', 'mousedown', 'mouseup'].forEach(type => {
      this._floatBtn.addEventListener(type, stopButtonEvent, true);
    });
    this._floatBtn.addEventListener('click', e => {
      stopButtonEvent(e);
      this._insertQuote();
    }, true);
  },

  _bindSelection() {
    this._selectionHandler = () => {
      clearTimeout(this._selectionTimer);
      this._selectionTimer = setTimeout(() => this._handleSelection(), 40);
    };
    this._selectionChangeHandler = () => {
      clearTimeout(this._selectionTimer);
      this._selectionTimer = setTimeout(() => this._handleSelection(), 120);
    };
    this._hideHandler = e => {
      if (e.target === this._floatBtn) return;
      setTimeout(() => {
        if (!window.getSelection()?.toString().trim()) this._hideButton();
      }, 80);
    };

    document.addEventListener('mouseup', this._selectionHandler);
    document.addEventListener('keyup', this._selectionHandler);
    document.addEventListener('touchend', this._selectionHandler);
    document.addEventListener('selectionchange', this._selectionChangeHandler);
    document.addEventListener('mousedown', this._hideHandler, true);
  },

  _handleSelection() {
    const selection = window.getSelection();
    const text = normalizeSelectedText(selection?.toString());
    if (!selection?.rangeCount || text.length < 2) {
      this._hideButton();
      return;
    }

    const container = selection.getRangeAt(0).commonAncestorContainer;
    if ((container.nodeType === Node.ELEMENT_NODE ? container : container.parentElement)?.closest?.('textarea, input, #btt-quote-selection-btn')) {
      this._hideButton();
      return;
    }

    const postDiv = findRealBitcointalkPost(container);
    if (!postDiv) {
      console.warn('[BTT Quote Assistant] No post container found', container);
      this._hideButton();
      return;
    }

    this._lastQuote = postDiv
      ? this._collectQuoteMeta(postDiv, text)
      : { text, author: '', topicId: getTopicId(), msgId: '', timestamp: '' };
    const rect = getSelectionRect(selection);
    if (!rect) {
      this._hideButton();
      return;
    }

    this._floatBtn.style.display = 'block';
    this._floatBtn.style.left = `${Math.max(8, Math.min(rect.left + (rect.width / 2) - 28, window.innerWidth - 76))}px`;
    this._floatBtn.style.top = `${Math.max(8, rect.top - 36)}px`;
  },

  _collectQuoteMeta(postDiv, text) {
    const { contentCell, headerCell, posterCell } = findPostRows(postDiv);
    const quoteLink = findBuiltInQuoteLink(postDiv) || findBuiltInQuoteLink(getPostScope(postDiv));
    const quoteMeta = parseQuoteLinkMeta(quoteLink);
    const msgId = quoteMeta.msgId || getPostMessageId(postDiv);
    const topicId = quoteMeta.topicId || getTopicIdFromPost(postDiv);
    const timestamp = quoteMeta.timestamp || getPostTimestamp(headerCell, contentCell);
    return enrichMetaFromLinks(postDiv, {
      text,
      author: getAuthorFromPosterCell(posterCell) || getAuthorFromPostScope(postDiv),
      topicId,
      msgId,
      timestamp,
    });
  },

  async _findOrOpenReplyTextarea() {
    let textarea = getReplyTextarea();
    if (textarea) return textarea;

    if (tryOpenQuickReply()) {
      for (let i = 0; i < 12; i += 1) {
        await sleep(150);
        textarea = getReplyTextarea();
        if (textarea) return textarea;
      }
    }

    return null;
  },

  async _insertPendingQuoteWhenReady() {
    const pending = loadPendingQuote();
    if (!pending?.bbcode) return;

    for (let i = 0; i < 20; i += 1) {
      const textarea = getReplyTextarea();
      if (textarea) {
        insertBbcodeIntoTextarea(textarea, pending.bbcode);
        clearPendingQuote();
        Toast.success('Quote inserted.');
        return;
      }
      await sleep(150);
    }
  },

  async _insertQuote() {
    const quoteData = this._lastQuote;
    if (!quoteData?.text) return;

    const bbcode = buildQuoteBbcode(quoteData);
    const textarea = await this._findOrOpenReplyTextarea();
    if (!textarea) {
      const replyUrl = getReplyPageUrl();
      if (replyUrl && savePendingQuote(bbcode)) {
        this._hideButton();
        window.getSelection()?.removeAllRanges();
        location.assign(replyUrl);
        return;
      }
      Toast.warning('Open reply box first, then use Quote Assistant.');
      this._hideButton();
      return;
    }

    insertBbcodeIntoTextarea(textarea, bbcode);

    window.getSelection()?.removeAllRanges();
    this._hideButton();
    Toast.success('Quote inserted.');
  },

  _hideButton() {
    if (this._floatBtn) this._floatBtn.style.display = 'none';
  },

  renderDashboardPanel(container) {
    container.innerHTML = `
      <div class="btt-panel">
        <p>Select text in a Bitcointalk post, then click the floating <strong>Quote</strong> button near the selection.</p>
        <p>The inserted quote uses author, post link, and timestamp metadata when available.</p>
        <ul style="font-size:13px;color:var(--text-secondary,#aaa);padding-left:16px;line-height:1.7">
          <li>Builds <code>[quote author=... link=topic=... date=...]</code> when possible</li>
          <li>Falls back gracefully if author, link, or date cannot be detected</li>
          <li>Inserts at the cursor in the reply textarea without opening Bitcointalk's quote action</li>
        </ul>
      </div>
    `;
  },
};
