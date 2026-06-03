// antiPhishingLinkChecker.js - Highlight suspicious external links.

import { isUrlShortener, isSuspiciousDomain, hasPunycode } from '../utils/validators.js';
import { escapeHtml } from '../utils/sanitizer.js';

const PROCESSED = 'data-btt-phish-done';
const LINK_SELECTOR = 'td.td_headerandpost a, .post a, .postarea a, .postbody a';
const SKIP_LINK_SELECTOR = '#btt-toolkit-root, .btt-addr, .btt-txid, .btt-code-copy-btn';

const BITCOINTALK_LOOKALIKES = [
  /bitcointa1k/i,
  /bitc0intalk/i,
  /bitcolntalk/i,
  /bitcointaIk/i,
  /bitcolntaIk/i,
  /b1tcointalk/i,
];

function isInternalBitcointalkLink(url) {
  return url.hostname === 'bitcointalk.org' || url.hostname.endsWith('.bitcointalk.org');
}

export default {
  id: 'antiPhishingLinkChecker',
  name: 'Anti-Phishing Link Checker',
  description: 'Highlights suspicious external links, shortened URLs, and lookalike domains.',
  category: 'Security Tools',
  defaultEnabled: true,

  _observer: null,
  _controller: null,
  _scanTimer: null,

  init() {
    this._controller = new AbortController();
    this._processAll();
    this._observer = new MutationObserver(() => this._scheduleScan());
    this._observer.observe(document.body, { childList: true, subtree: true });
  },

  destroy() {
    this._observer?.disconnect();
    this._controller?.abort();

    if (this._scanTimer) clearTimeout(this._scanTimer);

    document.querySelectorAll('.btt-phish-warn').forEach((el) => {
      el.classList.remove('btt-phish-warn');
    });
    document.querySelectorAll('.btt-phish-tooltip').forEach((el) => el.remove());
    document.querySelectorAll(`[${PROCESSED}]`).forEach((el) => el.removeAttribute(PROCESSED));

    this._observer = null;
    this._controller = null;
    this._scanTimer = null;
  },

  _scheduleScan() {
    if (this._scanTimer) clearTimeout(this._scanTimer);
    this._scanTimer = setTimeout(() => {
      this._scanTimer = null;
      this._processAll();
    }, 300);
  },

  _processAll() {
    document.querySelectorAll(LINK_SELECTOR).forEach((link) => {
      if (link.getAttribute(PROCESSED)) return;
      if (link.closest(SKIP_LINK_SELECTOR)) return;

      link.setAttribute(PROCESSED, '1');
      this._checkLink(link);
    });
  },

  _checkLink(link) {
    let url;
    try {
      url = new URL(link.href);
    } catch {
      return;
    }

    if (isInternalBitcointalkLink(url)) return;

    const warnings = [];

    if (isSuspiciousDomain(link.href)) warnings.push('Known suspicious domain');
    if (isUrlShortener(link.href)) warnings.push('URL shortener, destination hidden');
    if (hasPunycode(link.href)) warnings.push('Punycode domain, possible lookalike');
    if (BITCOINTALK_LOOKALIKES.some((re) => re.test(url.hostname))) {
      warnings.push('Looks like a fake Bitcointalk domain');
    }

    if (warnings.length) {
      link.classList.add('btt-phish-warn');
      link.title = `${warnings.join(' | ')} | Actual: ${url.hostname}`;
    }

    if (warnings.length) this._addTooltip(link, url, warnings);
  },

  _addTooltip(link, url, warnings) {
    let tooltip = null;

    link.addEventListener('mouseenter', () => {
      tooltip = document.createElement('div');
      tooltip.className = 'btt-phish-tooltip';

      const color = warnings.length ? '#fca5a5' : '#e5e7eb';
      tooltip.innerHTML = `
        <div style="color:${color};font-weight:${warnings.length ? '600' : '400'}">
          ${escapeHtml(url.hostname)}
        </div>
        <div style="color:#9ca3af;font-size:10px">${escapeHtml(url.protocol)}//</div>
        ${warnings.map((warning) => (
          `<div style="color:#fca5a5;font-size:10px;margin-top:2px">${escapeHtml(warning)}</div>`
        )).join('')}
      `;

      const rect = link.getBoundingClientRect();
      tooltip.style.cssText = `
        position:fixed;top:${rect.bottom + 4}px;left:${rect.left}px;
        z-index:2147483645;
      `;
      document.body.appendChild(tooltip);
    }, { signal: this._controller?.signal });

    link.addEventListener('mouseleave', () => {
      tooltip?.remove();
      tooltip = null;
    }, { signal: this._controller?.signal });
  },

  renderDashboardPanel(container) {
    container.innerHTML = `
      <div class="btt-panel">
        <p>Scans all links in Bitcointalk posts and highlights suspicious ones.</p>
        <div style="margin-top:10px;font-size:13px">
          <div style="margin-bottom:6px"><strong>Detects:</strong></div>
          <ul style="padding-left:16px;color:var(--text-secondary,#aaa);line-height:1.8">
            <li>Known suspicious/phishing domains</li>
            <li>URL shorteners such as bit.ly and tinyurl.com</li>
            <li>Punycode domains such as xn-- lookalikes</li>
            <li>Bitcointalk lookalike domains</li>
          </ul>
          <div style="margin-top:8px"><strong>Visual indicators:</strong></div>
          <ul style="padding-left:16px;color:var(--text-secondary,#aaa);line-height:1.8">
            <li>Red dashed underline on suspicious links</li>
            <li>Hover tooltip shows full domain and warning reason</li>
          </ul>
        </div>
        <p style="font-size:12px;color:var(--text-secondary,#aaa);margin-top:10px">
          All checks are local. No external APIs are called.
        </p>
      </div>
    `;
  },
};
