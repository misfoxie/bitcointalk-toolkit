// externalLinkPreview.js - Tooltip showing destination domain on hover.

import { escapeHtml } from '../utils/sanitizer.js';
import { isUrlShortener, isSuspiciousDomain } from '../utils/validators.js';

const PROCESSED = 'data-btt-ext-done';
const LINK_SELECTOR = 'td.td_headerandpost a, .post a, .postarea a, .postbody a';
const SKIP_LINK_SELECTOR = '#btt-toolkit-root, .btt-addr, .btt-txid, .btt-code-copy-btn';

function isInternalBitcointalkLink(url) {
  return url.hostname === 'bitcointalk.org' || url.hostname.endsWith('.bitcointalk.org');
}

export default {
  id: 'externalLinkPreview',
  name: 'External Link Preview',
  description: 'Shows destination domain in a tooltip when hovering external links.',
  category: 'Security Tools',
  defaultEnabled: true,

  _tooltip: null,
  _observer: null,
  _controller: null,
  _scanTimer: null,

  init() {
    this._controller = new AbortController();
    this._tooltip = document.createElement('div');
    this._tooltip.className = 'btt-link-preview-tooltip';
    this._tooltip.style.display = 'none';
    document.body.appendChild(this._tooltip);

    this._processAll();
    this._observer = new MutationObserver(() => this._scheduleScan());
    this._observer.observe(document.body, { childList: true, subtree: true });
  },

  destroy() {
    this._observer?.disconnect();
    this._controller?.abort();
    this._tooltip?.remove();

    if (this._scanTimer) clearTimeout(this._scanTimer);

    document.querySelectorAll(`[${PROCESSED}]`).forEach((link) => {
      link.removeAttribute(PROCESSED);
    });

    this._tooltip = null;
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

      let url;
      try {
        url = new URL(link.href);
      } catch {
        return;
      }

      if (isInternalBitcointalkLink(url)) return;

      link.setAttribute(PROCESSED, '1');
      if (!link.title) link.title = `External link: ${url.hostname}`;
      this._attachTooltip(link, url);
    });
  },

  _attachTooltip(link, url) {
    const warn = isSuspiciousDomain(link.href) || isUrlShortener(link.href);

    link.addEventListener('mouseenter', (event) => {
      if (!this._tooltip) return;

      this._tooltip.innerHTML = `
        <span style="color:${warn ? '#fca5a5' : '#e5e7eb'}">${escapeHtml(url.hostname)}</span>
        ${warn ? '<br><span style="font-size:10px;color:#fca5a5">Suspicious or shortened link</span>' : ''}
      `;
      this._tooltip.style.display = 'block';
      this._positionTooltip(event);
    }, { signal: this._controller?.signal });

    link.addEventListener('mouseleave', () => {
      if (this._tooltip) this._tooltip.style.display = 'none';
    }, { signal: this._controller?.signal });

    link.addEventListener('mousemove', (event) => {
      this._positionTooltip(event);
    }, { signal: this._controller?.signal });
  },

  _positionTooltip(event) {
    if (!this._tooltip) return;
    const margin = 10;
    const rect = this._tooltip.getBoundingClientRect();
    const left = Math.min(
      window.innerWidth - rect.width - margin,
      Math.max(margin, event.clientX + 6),
    );
    const top = Math.min(
      window.innerHeight - rect.height - margin,
      Math.max(margin, event.clientY + 14),
    );
    this._tooltip.style.position = 'fixed';
    this._tooltip.style.top = `${top}px`;
    this._tooltip.style.left = `${left}px`;
  },

  renderDashboardPanel(container) {
    container.innerHTML = `
      <div class="btt-panel">
        <p>Shows the destination domain of external links on hover. Suspicious domains are highlighted in red.</p>
      </div>
    `;
  },
};
