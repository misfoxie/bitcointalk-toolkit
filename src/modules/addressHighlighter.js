// addressHighlighter.js - Highlight crypto addresses and TXIDs in posts.

import { CRYPTO_PATTERNS } from '../utils/constants.js';
import { copyToClipboard, Toast } from '../utils/sharedUI.js';

const SCAN_SELECTOR = 'td.td_headerandpost, .post, .postarea, .postbody';
const SKIP_SELECTOR = [
  'script',
  'style',
  'textarea',
  'input',
  'select',
  'button',
  'a',
  'code',
  'pre',
  '.btt-addr',
  '.btt-txid',
  '.btt-code-copy-btn',
  '#btt-toolkit-root',
].join(',');

const PATTERNS = [
  { re: CRYPTO_PATTERNS.btcBech32, cls: 'btt-addr', label: 'BTC bech32 address', type: 'address' },
  { re: CRYPTO_PATTERNS.btcLegacy, cls: 'btt-addr', label: 'BTC address', type: 'address' },
  { re: CRYPTO_PATTERNS.btcP2SH, cls: 'btt-addr', label: 'BTC P2SH address', type: 'address' },
  { re: CRYPTO_PATTERNS.eth, cls: 'btt-addr', label: 'ETH address', type: 'address' },
  { re: CRYPTO_PATTERNS.ltc, cls: 'btt-addr', label: 'LTC address', type: 'address' },
  { re: CRYPTO_PATTERNS.doge, cls: 'btt-addr', label: 'DOGE address', type: 'address' },
  { re: CRYPTO_PATTERNS.trx, cls: 'btt-addr', label: 'TRX address', type: 'address' },
  { re: CRYPTO_PATTERNS.txid, cls: 'btt-txid', label: 'Transaction ID', type: 'txid' },
];

function cloneGlobalRegex(re) {
  const flags = re.flags.includes('g') ? re.flags : `${re.flags}g`;
  return new RegExp(re.source, flags);
}

function shortenValue(value) {
  if (!value || value.length <= 22) return value;
  return `${value.slice(0, 10)}...${value.slice(-8)}`;
}

function collectMatches(text) {
  const matches = [];

  for (const pattern of PATTERNS) {
    const re = cloneGlobalRegex(pattern.re);
    let match;

    while ((match = re.exec(text))) {
      const value = match[1] || match[0];
      const start = match.index + match[0].indexOf(value);
      const end = start + value.length;

      matches.push({ ...pattern, value, start, end });

      if (match[0].length === 0) re.lastIndex += 1;
    }
  }

  matches.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return (b.end - b.start) - (a.end - a.start);
  });

  const accepted = [];
  let lastEnd = -1;

  for (const match of matches) {
    if (match.start < lastEnd) continue;
    accepted.push(match);
    lastEnd = match.end;
  }

  return accepted;
}

function isSkippableTextNode(node) {
  const parent = node.parentElement;
  if (!parent) return true;
  if (!node.textContent || !node.textContent.trim()) return true;
  return Boolean(parent.closest(SKIP_SELECTOR));
}

export default {
  id: 'addressHighlighter',
  name: 'Address Highlighter',
  description: 'Highlights Bitcoin and crypto addresses in posts. Click to copy.',
  category: 'Security Tools',
  defaultEnabled: true,

  _observer: null,
  _scanTimer: null,

  init() {
    this._processAll();
    this._observer = new MutationObserver(() => this._scheduleScan());
    this._observer.observe(document.body, { childList: true, subtree: true });
  },

  destroy() {
    this._observer?.disconnect();
    this._observer = null;

    if (this._scanTimer) {
      clearTimeout(this._scanTimer);
      this._scanTimer = null;
    }

    document.querySelectorAll('.btt-addr, .btt-txid').forEach((el) => {
      const value = el.dataset.bttAddrValue || el.textContent || '';
      el.replaceWith(document.createTextNode(value));
    });
  },

  _scheduleScan() {
    if (this._scanTimer) clearTimeout(this._scanTimer);
    this._scanTimer = setTimeout(() => {
      this._scanTimer = null;
      this._processAll();
    }, 300);
  },

  _processAll() {
    document.querySelectorAll(SCAN_SELECTOR).forEach((container) => {
      this._highlightInElement(container);
    });
  },

  _highlightInElement(container) {
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          return isSkippableTextNode(node)
            ? NodeFilter.FILTER_REJECT
            : NodeFilter.FILTER_ACCEPT;
        },
      },
    );

    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) textNodes.push(node);

    textNodes.forEach((textNode) => {
      const fragment = this._buildHighlightedFragment(textNode.textContent);
      if (fragment) textNode.replaceWith(fragment);
    });
  },

  _buildHighlightedFragment(text) {
    const matches = collectMatches(text);
    if (!matches.length) return null;

    const fragment = document.createDocumentFragment();
    let cursor = 0;

    for (const match of matches) {
      if (match.start > cursor) {
        fragment.appendChild(document.createTextNode(text.slice(cursor, match.start)));
      }

      const span = document.createElement('span');
      span.className = match.cls;
      span.dataset.bttAddrValue = match.value;
      span.dataset.bttAddrType = match.type;
      span.title = `${match.label} - click to copy`;
      span.textContent = shortenValue(match.value);
      span.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopPropagation();

        const ok = await copyToClipboard(match.value);
        Toast[ok ? 'success' : 'error'](
          ok ? `Copied: ${shortenValue(match.value)}` : 'Copy failed',
        );
      });

      fragment.appendChild(span);
      cursor = match.end;
    }

    if (cursor < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(cursor)));
    }

    return fragment;
  },

  renderDashboardPanel(container) {
    container.innerHTML = `
      <div class="btt-panel">
        <p>Scans post content and highlights cryptocurrency addresses and transaction IDs.</p>
        <ul style="font-size:13px;color:var(--text-secondary,#aaa);padding-left:16px;line-height:1.7">
          <li>BTC: Legacy (1...), P2SH (3...), bech32 (bc1...)</li>
          <li>ETH: 0x... (40 hex chars)</li>
          <li>LTC, DOGE, TRX addresses</li>
          <li>TXIDs (64 hex chars)</li>
          <li>Click any highlighted address to copy it</li>
        </ul>
      </div>
    `;
  },
};
