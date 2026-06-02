// codeCopyFixer.js - Add copy buttons inside Bitcointalk code boxes.

import { copyToClipboard } from '../utils/sharedUI.js';

const CODE_BOX_SELECTOR = [
  'div.code',
  '.code',
  'pre',
  'code',
  '.bbc_code',
  '.post code',
  '.post pre',
  'td.td_headerandpost code',
  'td.td_headerandpost pre',
  'td.td_headerandpost div.code',
].join(',');

function isInjectedUi(el) {
  return !!el.closest('.btt-code-copy-btn, .btt-code-copy-wrapper, #btt-launcher, #btt-toast-container');
}

function isLikelyCodeBox(el) {
  if (!el || isInjectedUi(el)) return false;
  if (el.classList?.contains('code') || el.classList?.contains('bbc_code')) return true;
  if (el.tagName === 'PRE') return true;
  if (el.tagName === 'CODE') {
    if (el.closest('pre, div.code, .bbc_code')) return false;
    const text = (el.textContent || '').trim();
    const rect = el.getBoundingClientRect();
    return text.length > 20 || rect.width > 220 || text.includes('\n');
  }
  return false;
}

function getCopyText(codeBox) {
  const clone = codeBox.cloneNode(true);
  clone.querySelectorAll('.btt-code-copy-btn').forEach(btn => btn.remove());
  return (clone.textContent || '').replace(/\u00a0/g, ' ').trimEnd();
}

export default {
  id:             'codeCopyFixer',
  name:           'Code Copy Fixer',
  description:    'Adds a one-click "Copy" button to every code block. Shows a toast on copy.',
  category:       'Layout & Reading',
  defaultEnabled: true,

  _observer: null,
  _scanTimer: null,

  init() {
    this._processAll();
    this._observer = new MutationObserver(mutations => {
      if (mutations.some(m => Array.from(m.addedNodes).some(node => node.nodeType === 1 && !isInjectedUi(node)))) {
        this._scheduleScan();
      }
    });
    this._observer.observe(document.body, { childList: true, subtree: true });
  },

  destroy() {
    this._observer?.disconnect();
    this._observer = null;
    clearTimeout(this._scanTimer);
    this._scanTimer = null;

    document.querySelectorAll('.btt-code-copy-btn').forEach(btn => btn.remove());
    document.querySelectorAll('[data-btt-code-copy-processed="1"]').forEach(el => {
      delete el.dataset.bttCodeCopyProcessed;
      el.classList.remove('btt-code-copy-wrapper');
    });
  },

  _scheduleScan() {
    clearTimeout(this._scanTimer);
    this._scanTimer = setTimeout(() => this._processAll(), 350);
  },

  _processAll() {
    document.querySelectorAll(CODE_BOX_SELECTOR).forEach(el => {
      const codeBox = this._resolveCodeBox(el);
      if (!codeBox || !isLikelyCodeBox(codeBox)) return;
      if (codeBox.dataset.bttCodeCopyProcessed === '1') return;
      if (codeBox.querySelector(':scope > .btt-code-copy-btn')) return;
      this._addCopyButton(codeBox);
    });
  },

  _resolveCodeBox(el) {
    if (!el) return null;
    const outerCode = el.closest('div.code, .bbc_code, pre');
    return outerCode || el;
  },

  _addCopyButton(codeBox) {
    codeBox.dataset.bttCodeCopyProcessed = '1';
    codeBox.classList.add('btt-code-copy-wrapper');

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btt-code-copy-btn';
    btn.textContent = 'Copy';
    btn.title = 'Copy code';
    btn.setAttribute('aria-label', 'Copy code to clipboard');

    btn.addEventListener('click', async e => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      const ok = await copyToClipboard(getCopyText(codeBox));
      if (!ok) return;

      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(() => {
        if (!btn.isConnected) return;
        btn.textContent = 'Copy';
        btn.classList.remove('copied');
      }, 1500);
    });

    codeBox.appendChild(btn);
  },

  renderDashboardPanel(container) {
    container.innerHTML = `
      <div class="btt-panel">
        <p>Adds a <strong>Copy</strong> button inside every Bitcointalk code box.</p>
        <ul style="font-size:13px;color:var(--text-secondary,#aaa);padding-left:16px;line-height:1.7">
          <li>Places one button in the upper-right corner of each code box</li>
          <li>Copies only the code content</li>
          <li>Shows "Copied!" for 1.5 seconds</li>
          <li>Safely handles dynamically loaded posts and previews</li>
        </ul>
      </div>
    `;
  },
};
