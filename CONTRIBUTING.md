# Contributing — Creating a New Module

Every feature in the Bitcointalk Toolkit is a self-contained module file in `src/modules/`. This guide walks through creating one from scratch.

---

## Module contract

A module is a plain object (default export) with exactly these seven fields:

```js
export default {
  // Unique camelCase ID — must match the ID used in DEFAULT_SETTINGS.enabledModules
  id: 'myFeature',

  // Human-readable name shown in the dashboard
  name: 'My Feature',

  // One-sentence description shown in the tools grid
  description: 'What this module does in plain English.',

  // Category — must match one of the existing categories or a new one you add to MODULE_DEFS in dashboard.js
  // Existing: 'Layout & Reading', 'Security Tools', 'Thread Tools',
  //           'Campaign Tools', 'Posting & BBCode', 'User/Profile Tools', 'Marketplace Tools'
  category: 'Thread Tools',

  // Whether the module is enabled immediately after install (before the user touches settings)
  defaultEnabled: false,

  // Called when the module is enabled. Set up DOM, listeners, observers here.
  // api: shared API object (see below)
  init(api) {},

  // Called when the module is disabled. Undo everything init() did.
  destroy() {},

  // Optional. Called by the dashboard to render a settings/info panel in the module section.
  // container: a <div> you can write into freely.
  renderDashboardPanel(container) {
    container.innerHTML = '<p>No dashboard panel.</p>';
  },
};
```

All seven fields are required. `init` and `destroy` may be empty functions. Missing any field will cause `moduleManager` to log a warning and skip the module.

---

## The shared API object

`init(api)` receives a shared API so modules don't need direct imports:

```js
api.settings          // { ...all current settings } snapshot at init time
api.storage.get(key)  // → Promise resolving to chrome.storage result
api.storage.set(items)// → Promise
api.toast             // Toast.info(msg) / Toast.success(msg) / Toast.error(msg)
api.modal             // showModal({ title, content, actions })
api.copy(text)        // → Promise<boolean> — copies to clipboard
api.download(name, content, mime) // triggers a file download
api.bbcode.parse(text)// → HTML string (XSS-safe)
api.dom               // domHelpers utilities (waitFor, onLoad, etc.)
api.openDashboard(section) // opens the dashboard tab at a given section
api.isModuleActive(id)     // → boolean — check if another module is running
```

---

## Step-by-step: adding a new module

### 1. Create the file

```
src/modules/myFeature.js
```

Start from this template:

```js
// myFeature.js

let _observer = null;

export default {
  id:             'myFeature',
  name:           'My Feature',
  description:    'Short description.',
  category:       'Thread Tools',
  defaultEnabled: false,

  init(api) {
    // Set up your feature here
    // Example: add a button to every post
    document.querySelectorAll('.post').forEach(post => {
      const btn = document.createElement('button');
      btn.textContent = 'My Button';
      btn.className = 'btt-my-feature-btn';
      btn.addEventListener('click', () => api.toast.info('Clicked!'));
      post.appendChild(btn);
    });
  },

  destroy() {
    // Undo everything: remove elements, disconnect observers, clear timers
    document.querySelectorAll('.btt-my-feature-btn').forEach(el => el.remove());
    _observer?.disconnect();
    _observer = null;
  },

  renderDashboardPanel(container) {
    container.innerHTML = `
      <div class="btt-panel">
        <p>Configure My Feature here.</p>
      </div>
    `;
  },
};
```

### 2. Register it in `content.js`

Add the import and include it in `ALL_MODULES`:

```js
// In src/content/content.js
import myFeature from '../modules/myFeature.js';

const ALL_MODULES = [
  // ... existing modules ...
  myFeature,
];
```

### 3. Add it to the dashboard module list

In `src/ui/dashboard.js`, add an entry to `MODULE_DEFS`:

```js
{ id:'myFeature', name:'My Feature', category:'Thread Tools', description:'Short description.', defaultEnabled:false },
```

### 4. Add it to `DEFAULT_SETTINGS` (optional)

If `defaultEnabled: true`, add the id to `DEFAULT_SETTINGS.enabledModules` in `src/utils/constants.js`:

```js
enabledModules: ['codeCopyFixer', 'navigationBooster', /* ... */ 'myFeature'],
```

### 5. Add to `web_accessible_resources` (automatic)

`manifest.json` uses `"src/modules/*.js"` — your new file is automatically included.

---

## Rules and patterns

**Isolation**
- Never throw unhandled errors in `init()` — wrap risky operations in try/catch. If `init()` throws, the module is set to `error` state and all other modules continue normally.
- Never mutate global variables from outside your module. Use module-level `let` variables.

**Cleanup**
- `destroy()` must undo everything `init()` did: remove DOM nodes, disconnect MutationObservers, clear `setInterval`/`setTimeout` IDs, remove event listeners added to `document` or `window`.
- Use a class name unique to your module (e.g. `btt-myfeature-*`) so `destroy()` can find and remove only your elements.

**Storage**
- Use the `api.storage` methods, or import from `../utils/storage.js` directly. Never use `localStorage` in content scripts.
- Namespace your own data keys: `btt_myfeature_*`.

**Security**
- Never set `innerHTML` on user-supplied strings without escaping. Use `api.bbcode.parse()` for BBCode, or `escapeHtml()` from `../utils/sanitizer.js` for raw text.
- Never use `eval()`, `new Function()`, or `document.write()`.

**FAB menu entry (optional)**
If your module adds an on-page action reachable from the ₿ button:

```js
init(api) {
  const menu = document.getElementById('btt-mini-menu');
  if (menu) {
    const btn = document.createElement('button');
    btn.id = 'btt-myfeature-fab-btn';
    btn.innerHTML = '<span>🔧</span> My Action';
    btn.addEventListener('click', () => { /* ... */ });
    menu.appendChild(btn);
  }
},

destroy() {
  document.getElementById('btt-myfeature-fab-btn')?.remove();
},
```

---

## Testing your module

1. Load the extension unpacked in Chrome (see README.md).
2. Open a Bitcointalk page and press F12.
3. Check the Console for `[BTT] Initialized. Active: N` — your module should increment N.
4. If your module shows `error` state, the specific error is logged as `[BTT] Module myFeature init failed: <message>`.
5. Toggle the module off and on from the dashboard to verify `destroy()` and `init()` cycle correctly.
6. Check that no DOM elements or event listeners leak after `destroy()` using the DevTools Elements panel.

---

## Pull request checklist

- [ ] All 7 required fields present
- [ ] `destroy()` removes all DOM elements and cleans up listeners
- [ ] No unhandled Promise rejections in `init()`
- [ ] No hardcoded strings that should be in `constants.js`
- [ ] Added to `content.js` ALL_MODULES and `dashboard.js` MODULE_DEFS
- [ ] `defaultEnabled: false` for any module that is off by default
- [ ] Tested enable/disable cycle without page reload errors
