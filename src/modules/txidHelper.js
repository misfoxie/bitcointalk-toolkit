// txidHelper.js — Highlight TXIDs and generate block explorer links

import { BLOCK_EXPLORERS } from '../utils/constants.js';
import { copyToClipboard, Toast } from '../utils/sharedUI.js';
import { escapeHtml } from '../utils/sanitizer.js';

const TXID_RE = /\b([a-fA-F0-9]{64})\b/g;
const PROCESSED = 'data-btt-txid-done';

export default {
  id: 'txidHelper', name: 'TXID Helper',
  description: 'Highlights Bitcoin transaction IDs in posts. Click to copy or open in block explorer.',
  category: 'Security Tools', defaultEnabled: true,

  _observer: null,

  init() {
    this._processAll();
    this._observer = new MutationObserver(() => this._processAll());
    this._observer.observe(document.body, { childList: true, subtree: true });
  },

  destroy() {
    this._observer?.disconnect();
    document.querySelectorAll('.btt-txid-wrap').forEach(el => el.replaceWith(document.createTextNode(el.dataset.full || el.textContent)));
    this._observer = null;
  },

  _processAll() {
    document.querySelectorAll('td.td_headerandpost, .post').forEach(container => {
      if (container.getAttribute(PROCESSED)) return;
      container.setAttribute(PROCESSED, '1');
      this._process(container);
    });
  },

  _process(container) {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        const tag = n.parentElement?.tagName;
        if (['SCRIPT','STYLE','TEXTAREA','A'].includes(tag)) return NodeFilter.FILTER_REJECT;
        return TXID_RE.test(n.textContent) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes = [];
    let n;
    TXID_RE.lastIndex = 0;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(tn => this._replace(tn));
  },

  _replace(tn) {
    TXID_RE.lastIndex = 0;
    const text = tn.textContent;
    const frag = document.createDocumentFragment();
    let last = 0, m;
    while ((m = TXID_RE.exec(text)) !== null) {
      if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      const span = document.createElement('span');
      span.className = 'btt-txid btt-txid-wrap';
      span.dataset.full = m[0];
      span.textContent = m[0].slice(0, 8) + '…' + m[0].slice(-8);
      span.title = 'TXID: ' + m[0] + ' — click to copy';
      span.style.cursor = 'pointer';
      const full = m[0];
      span.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (e.ctrlKey || e.metaKey) {
          window.open(BLOCK_EXPLORERS.btc[0].url + full, '_blank');
        } else {
          await copyToClipboard(full);
          Toast.success('TXID copied.');
        }
      });
      frag.appendChild(span);
      last = m.index + m[0].length;
    }
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    tn.parentNode.replaceChild(frag, tn);
  },

  renderDashboardPanel(container) {
    container.innerHTML = `<div class="btt-panel"><p>Detects 64-character hex strings (Bitcoin TXIDs) in posts. Click to copy. Ctrl+click to open in block explorer.</p></div>`;
  },
};
