# Legacy Script Integration Guide

This folder lets you convert your old Tampermonkey/Greasemonkey scripts into extension modules.

## Quick Steps

1. **Copy your old script** into this folder, e.g. `src/legacy-scripts/myScript.js`
2. **Wrap it** using the `exampleLegacyWrapper.js` template
3. **Register it** in `legacyRegistry.js`
4. **Enable it** from the Dashboard > Legacy Scripts section

---

## Full Conversion Guide

### Old Tampermonkey script:

```javascript
// ==UserScript==
// @name         My Script
// @match        https://bitcointalk.org/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// ==/UserScript==

(function() {
  'use strict';
  // your code here
})();
```

### Converted extension module:

```javascript
import GM_API from './adapter.js';

export default {
  id:             'my-script',
  name:           'My Script',
  description:    'What it does',
  category:       'Legacy Scripts',
  defaultEnabled: false,

  async init(api) {
    const { GM_getValue, GM_setValue, GM_addStyle } = GM_API;

    // Paste your old code here, replacing GM_ calls:
    GM_addStyle('body { background: red; }');
    const val = await GM_getValue('key', 'default');
    await GM_setValue('key', 'newValue');
  },

  destroy() {
    // Remove DOM changes
  },

  renderDashboardPanel(container) {
    container.innerHTML = '<p>My script panel</p>';
  },
};
```

### Register in legacyRegistry.js:

```javascript
import myScript from './myScript.js';
export const LEGACY_MODULES = [ myScript ];
```

---

## API Replacements

| Tampermonkey | Extension equivalent |
|---|---|
| `GM_getValue(key, default)` | `await GM_API.GM_getValue(key, default)` |
| `GM_setValue(key, value)` | `await GM_API.GM_setValue(key, value)` |
| `GM_deleteValue(key)` | `await GM_API.GM_deleteValue(key)` |
| `GM_listValues()` | `await GM_API.GM_listValues()` |
| `GM_addStyle(css)` | `GM_API.GM_addStyle(css)` |
| `GM_notification(text)` | `GM_API.GM_notification(text)` |
| `GM_setClipboard(text)` | `await GM_API.GM_setClipboard(text)` |
| `GM_xmlhttpRequest({...})` | `GM_API.GM_xmlhttpRequest({...})` |
| `GM_registerMenuCommand(name, fn)` | `GM_API.GM_registerMenuCommand(name, fn)` |
| `GM_openInTab(url)` | `GM_API.GM_openInTab(url)` |

## Known Limitations

- **`unsafeWindow`** — Not available. Use `window` directly, but page-level JS globals may not be accessible from content scripts.
- **`@require`** — External scripts are not auto-loaded. Copy the library into `/src/` or import from npm.
- **Cross-origin requests** — Only `bitcointalk.org` has `host_permissions`. For other sites, add them to `manifest.json`.
- **`GM_xmlhttpRequest` to external sites** — Will fail with CORS unless the host has permissions.
- **`document_start`** — Extension content scripts run at `document_end` by default. Change `run_at` in `manifest.json` if needed.
