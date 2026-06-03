// clipboardSafety.js — Detect clipboard-hijacking by comparing copied vs pasted addresses

import { CRYPTO_PATTERNS } from '../utils/constants.js';
import { Toast } from '../utils/sharedUI.js';

export default {
  id:             'clipboardSafety',
  name:           'Clipboard Safety Checker',
  description:    'Warns if a pasted crypto address differs from the one you copied — protects against clipboard-hijacking malware.',
  category:       'Security Tools',
  defaultEnabled: true,

  _lastCopied:    null,  // address copied in this session (memory only, never stored)
  _copyHandler:   null,
  _pasteHandler:  null,
  _warnBanner:    null,

  init(api) {
    this._createBanner();
    this._bindCopy();
    this._bindPaste();
  },

  destroy() {
    document.removeEventListener('copy',  this._copyHandler);
    document.removeEventListener('paste', this._pasteHandler);
    this._warnBanner?.remove();
    this._lastCopied  = null;
    this._copyHandler = this._pasteHandler = this._warnBanner = null;
  },

  _createBanner() {
    if (document.getElementById('btt-clipboard-warning')) return;
    this._warnBanner = document.createElement('div');
    this._warnBanner.id = 'btt-clipboard-warning';
    document.body.appendChild(this._warnBanner);
  },

  _extractAddress(text) {
    const t = String(text || '');
    for (const [, pattern] of Object.entries(CRYPTO_PATTERNS)) {
      const re = new RegExp(pattern.source, 'i');
      const m  = t.match(re);
      if (m) return m[0];
    }
    return null;
  },

  _bindCopy() {
    this._copyHandler = (e) => {
      const text = window.getSelection()?.toString() || '';
      const addr = this._extractAddress(text);
      if (addr) {
        this._lastCopied = addr;
        // Don't persist to storage — memory only
      }
    };
    document.addEventListener('copy', this._copyHandler);
  },

  _bindPaste() {
    this._pasteHandler = async (e) => {
      // Only warn in Bitcointalk textareas
      if (!['TEXTAREA', 'INPUT'].includes(e.target.tagName)) return;

      let pasted = '';
      try { pasted = e.clipboardData?.getData('text') || ''; }
      catch { return; }

      const pastedAddr = this._extractAddress(pasted);
      if (!pastedAddr) return;

      if (this._lastCopied && this._lastCopied !== pastedAddr) {
        // Addresses differ — WARN
        const copied  = this._lastCopied;
        const short = a => `${a.slice(0, 6)}…${a.slice(-6)}`;
        this._showWarning(
          `⚠️ Clipboard address mismatch!\n` +
          `Copied:  ${short(copied)}\n` +
          `Pasting: ${short(pastedAddr)}\n` +
          `Your clipboard may have been modified by malware. Verify manually!`
        );
      }
    };
    document.addEventListener('paste', this._pasteHandler);
  },

  _showWarning(msg) {
    if (!this._warnBanner) return;
    this._warnBanner.innerHTML = msg.replace(/\n/g, '<br>') +
      ` <button onclick="document.getElementById('btt-clipboard-warning').style.display='none'" style="margin-left:10px;padding:3px 8px;border-radius:4px;border:none;background:#fca5a5;color:#7f1d1d;cursor:pointer">Dismiss</button>`;
    this._warnBanner.style.display = 'block';

    // Auto-dismiss after 15 seconds
    setTimeout(() => {
      if (this._warnBanner) this._warnBanner.style.display = 'none';
    }, 15000);

    Toast.error('⚠️ Address mismatch detected! Check your clipboard.', 8000);
  },

  renderDashboardPanel(container) {
    container.innerHTML = `
      <div class="btt-panel">
        <h4>Clipboard Safety Checker</h4>
        <p>Monitors copy/paste actions for crypto addresses. If you copy an address and then paste a <em>different</em> address, a visible warning is shown.</p>
        <div class="btt-info-box" style="background:rgba(239,68,68,.1);border:1px solid #ef4444;border-radius:6px;padding:10px;margin-top:10px;font-size:13px;">
          <strong>How it works:</strong><br>
          1. When you copy a crypto address, it's stored in memory only (never saved to disk).<br>
          2. When you paste into a Bitcointalk textarea, the pasted address is compared.<br>
          3. If they differ, a warning banner appears at the top of the page.<br><br>
          <strong>Privacy:</strong> The copied address is never sent anywhere and is cleared when the tab is closed.
        </div>
        <div style="margin-top:12px;font-size:13px;color:var(--text-secondary,#aaa)">
          Supported: BTC (legacy, P2SH, bech32), ETH, LTC, DOGE, TRX
        </div>
      </div>
    `;
  },
};
