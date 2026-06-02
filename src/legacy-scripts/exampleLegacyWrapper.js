// exampleLegacyWrapper.js — Template for wrapping an old Tampermonkey script
//
// BEFORE (old Tampermonkey script):
// ===================================
// // ==UserScript==
// // @name         My Bitcointalk Script
// // @match        https://bitcointalk.org/*
// // @grant        GM_getValue
// // @grant        GM_setValue
// // @grant        GM_addStyle
// // ==/UserScript==
//
// (function() {
//   'use strict';
//   GM_addStyle('body { background: blue; }');
//   const saved = GM_getValue('myKey', 'default');
//   GM_setValue('myKey', 'newValue');
//   // ... rest of your script
// })();
//
// AFTER (extension module):
// ===================================

import GM_API, { injectGmGlobals } from './adapter.js';

export default {
  // ── Module metadata ────────────────────────────────────────────────────────
  id:             'my-old-script',           // Unique ID, no spaces
  name:           'My Old Script',           // Display name
  description:    'Imported from Tampermonkey. What does it do?',
  category:       'Legacy Scripts',
  defaultEnabled: false,                     // Start disabled by default

  // ── Cleanup references (store handles here so destroy() can remove them) ──
  _styleEl:   null,
  _intervals: [],
  _observers: [],

  // ── init() — runs when the module is enabled ─────────────────────────────
  async init(api) {
    // Make GM_* functions available
    const {
      GM_getValue, GM_setValue, GM_deleteValue, GM_addStyle,
      GM_xmlhttpRequest, GM_notification, GM_openInTab,
    } = GM_API;

    // ── PASTE YOUR OLD SCRIPT CODE HERE ────────────────────────────────────
    // Replace:
    //   window.prompt()    → api.modal() or just read from UI
    //   window.alert()     → api.toast.info()
    //   document.body      → document.body (same)
    //   GM_getValue        → await GM_getValue('key', default)
    //   GM_setValue        → await GM_setValue('key', value)
    //   GM_addStyle        → GM_addStyle('css string')
    //   unsafeWindow.X     → window.X  (may not work for all cases)

    // EXAMPLE — replace with your real code:
    GM_addStyle(`
      /* Your CSS here */
    `);

    const savedValue = await GM_getValue('exampleKey', 'defaultValue');
    console.log('[Legacy] Loaded value:', savedValue);
    await GM_setValue('exampleKey', 'newValue');

    // If you had:  $(document).ready(function() { ... });
    // Replace with:
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this._run(api));
    } else {
      this._run(api);
    }
  },

  // ── _run() — put the main logic here ─────────────────────────────────────
  _run(api) {
    // Your main script logic here
    console.log('[Legacy] Example script running on', location.href);
  },

  // ── destroy() — runs when the module is disabled ──────────────────────────
  // Remove all DOM changes, clear intervals, disconnect observers.
  destroy() {
    this._styleEl?.remove();
    this._intervals.forEach(clearInterval);
    this._observers.forEach(obs => obs.disconnect());
    this._intervals = [];
    this._observers = [];
    // Remove any elements your script added to the page
    document.querySelectorAll('[data-my-script-id]').forEach(el => el.remove());
  },

  // ── renderDashboardPanel() — dashboard UI ────────────────────────────────
  renderDashboardPanel(container, api) {
    container.innerHTML = `
      <div class="btt-panel">
        <p>This is a legacy script imported from Tampermonkey.</p>
        <p style="font-size:12px;color:var(--text-secondary,#aaa)">
          Edit <code>src/legacy-scripts/exampleLegacyWrapper.js</code> to add a real control panel.
        </p>
        <!-- Add buttons, inputs, etc. here -->
      </div>
    `;

    // Render any GM_registerMenuCommand entries as buttons
    if (GM_API._menuCommands.length) {
      const btnArea = document.createElement('div');
      btnArea.style.marginTop = '10px';
      GM_API._menuCommands.forEach(({ name, fn }) => {
        const btn = document.createElement('button');
        btn.className = 'btt-btn btt-btn-secondary';
        btn.textContent = name;
        btn.addEventListener('click', fn);
        btnArea.appendChild(btn);
      });
      container.querySelector('.btt-panel').appendChild(btnArea);
    }
  },
};
