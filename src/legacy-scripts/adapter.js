// adapter.js — Tampermonkey/Greasemonkey compatibility layer
// Makes old userscript GM_* functions work in the extension context.

import { storageGet, storageSet, storageRemove } from '../utils/storage.js';
import { Toast, showToast } from '../utils/sharedUI.js';
import { injectStyles } from '../utils/sharedUI.js';

let styleCounter = 0;

const GM_API = {
  // ── Storage ────────────────────────────────────────────────────────────────

  async GM_getValue(key, defaultValue) {
    const result = await storageGet(`gm_${key}`);
    return result[`gm_${key}`] ?? defaultValue;
  },

  async GM_setValue(key, value) {
    await storageSet({ [`gm_${key}`]: value });
  },

  async GM_deleteValue(key) {
    await storageRemove(`gm_${key}`);
  },

  async GM_listValues() {
    // Returns all keys stored with gm_ prefix via chrome.storage.local
    return new Promise(resolve => {
      chrome.storage.local.get(null, items => {
        resolve(Object.keys(items).filter(k => k.startsWith('gm_')).map(k => k.replace('gm_', '')));
      });
    });
  },

  // ── Style injection ────────────────────────────────────────────────────────

  GM_addStyle(css) {
    const id = `gm-style-${++styleCounter}`;
    injectStyles(id, css);
    return document.getElementById(id);
  },

  // ── Notifications (mapped to Toast) ───────────────────────────────────────

  GM_notification(details) {
    const text = typeof details === 'string' ? details : (details.text || details.title || '');
    showToast(text, 'info', details.timeout || 3000);
  },

  // ── Clipboard (requires clipboardWrite permission) ────────────────────────

  async GM_setClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      console.warn('[BTT Legacy] GM_setClipboard failed — clipboard permission may be denied.');
      return false;
    }
  },

  // ── Network requests ──────────────────────────────────────────────────────
  // Only bitcointalk.org URLs are allowed (host_permission).
  // For other origins, the fetch will fail due to CORS.
  // To allow other origins, add them to host_permissions in manifest.json.

  GM_xmlhttpRequest(details) {
    const {
      url, method = 'GET', headers = {}, data, onload, onerror, ontimeout,
      timeout = 30000,
    } = details;

    const controller = new AbortController();
    const timer = setTimeout(() => { controller.abort(); ontimeout?.({ statusText: 'Timeout' }); }, timeout);

    fetch(url, {
      method,
      headers,
      body: method !== 'GET' ? data : undefined,
      signal: controller.signal,
      credentials: 'omit',
    })
      .then(async r => {
        clearTimeout(timer);
        const responseText = await r.text();
        onload?.({
          status:       r.status,
          statusText:   r.statusText,
          responseText,
          response:     responseText,
          finalUrl:     r.url,
        });
      })
      .catch(err => {
        clearTimeout(timer);
        if (err.name !== 'AbortError') onerror?.({ error: err.message });
      });
  },

  // ── Menu commands (mapped to dashboard action buttons) ────────────────────
  // These are registered but shown only if the user opens the legacy script's dashboard panel.

  _menuCommands: [],

  GM_registerMenuCommand(name, fn) {
    GM_API._menuCommands.push({ name, fn });
    console.log(`[BTT Legacy] Menu command registered: "${name}". It will appear in the Legacy Scripts dashboard panel.`);
  },

  // ── Tab management ────────────────────────────────────────────────────────

  GM_openInTab(url, options = {}) {
    window.open(url, options.active === false ? '_blank' : '_blank');
  },

  // ── Info ──────────────────────────────────────────────────────────────────

  GM_info: {
    script: {
      name:        'Legacy Script',
      namespace:   'https://bitcointalk.org',
      version:     '1.0.0',
      description: 'Imported legacy userscript',
    },
    version:       '4.0',
    scriptHandler: 'BTT Legacy Adapter',
  },

  // ── unsafeWindow note ────────────────────────────────────────────────────
  // unsafeWindow is NOT available in extension content scripts.
  // If your script uses unsafeWindow to access page globals, you will need to
  // use the window object directly or inject a <script> element.
  // See the README for more details.

  get unsafeWindow() {
    console.warn('[BTT Legacy] unsafeWindow is not available in extension context. Use window directly.');
    return window;
  },
};

export default GM_API;

// ── Convenience: inject GM globals into module scope ─────────────────────────
// Call injectGmGlobals(api) at the top of your legacy module's init() to get
// GM_getValue, GM_setValue, etc. as local variables.

export function injectGmGlobals(scope) {
  Object.entries(GM_API).forEach(([k, v]) => {
    if (typeof v === 'function' || (typeof v === 'object' && v !== null)) {
      scope[k] = v;
    }
  });
}
