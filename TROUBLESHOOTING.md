# Troubleshooting

---

## The extension icon doesn't appear in the toolbar

1. Go to `chrome://extensions` and confirm the extension is enabled (toggle is blue).
2. Pin the extension: click the puzzle-piece icon in the toolbar → find "Bitcointalk Toolkit" → click the pin icon.
3. If the extension shows an error badge, click **Details → Errors** to read the error message.

---

## The ₿ floating button doesn't appear on Bitcointalk

- The button only appears on `https://bitcointalk.org/*` pages (not `http://` — Bitcointalk redirects to HTTPS automatically).
- Check that the content script loaded: open DevTools (F12) → Console, and look for `[BTT] Initialized.` or any `[BTT]` errors.
- If you see a CSP error or module load error, try reloading the extension: `chrome://extensions` → click the refresh icon on the Bitcointalk Toolkit card.

---

## Thread Scraper returns "Fetch failed"

- Open DevTools → Background service worker (click the `service worker` link on the extension card in `chrome://extensions`).
- Look for `[BTT background]` errors in the service worker console.
- **Most common cause**: the extension doesn't have permission to access Bitcointalk. Check that `host_permissions` includes `https://bitcointalk.org/*` in `manifest.json`.
- **Rate limiting**: if you scrape many pages rapidly, Bitcointalk may return a CAPTCHA page instead of thread HTML. Increase the delay to 3–5s.
- **Login-gated threads**: the service worker fetches pages without your session cookies (`credentials: 'omit'`). If the thread requires login to view, scraping will return the login page instead.

---

## Dark mode doesn't apply immediately after toggling

Dark mode is applied by adding `btt-dark` to `<html>`. If a Bitcointalk page overrides styles aggressively, the theme may not apply to all elements. Reload the page after enabling.

---

## Dashboard opens but shows a blank page

- Open DevTools on the dashboard page (right-click → Inspect).
- Check the Console for module import errors. A syntax error in any module imported at dashboard load will prevent the dashboard from rendering.
- If you see `Failed to fetch dynamically imported module`, a module file may be missing. Check that all files listed in `src/modules/` are present.

---

## Settings import fails

- The imported file must be a JSON object — either in the raw `{ key: value }` format or the export wrapper `{ version, exportedAt, settings: { ... } }`.
- `enabledModules` must be an array of strings (module IDs). Invalid entries are filtered out automatically.
- If the import still fails, open the exported file in a text editor and verify it is valid JSON (no trailing commas, etc.).

---

## A module stopped working after an update

Modules are isolated — a failing module is set to `error` state and does not affect other modules. Check the DevTools console for `[BTT] Module <id> init failed:` messages with the specific error.

To reset a module: disable it in the dashboard, reload the page, then re-enable it.

---

## Clipboard Safety gives false positives

The Clipboard Safety module compares the address you copy with what was rendered on screen. Some addresses are truncated or formatted differently (e.g., `1ABC...XYZ`) in posts — this can trigger a warning even for a correct address. You can dismiss the warning safely in those cases.

---

## Firefox: extension removed after browser restart

Firefox only allows unsigned extensions to persist in Developer Edition or Nightly with `xpinstall.signatures.required` set to `false` in `about:config`. For regular Firefox, use [web-ext](https://github.com/mozilla/web-ext) to build and temporarily install, or submit to AMO for a signed release.

---

## Legacy script: GM_xmlhttpRequest doesn't work

`GM_xmlhttpRequest` in the adapter sends requests via `fetch` from the content script context — it is subject to CORS restrictions. Requests to `bitcointalk.org` will work (covered by `host_permissions`), but requests to other domains will fail unless those domains are added to `host_permissions` in `manifest.json`.

---

## Checking module error states

1. Open DevTools on any Bitcointalk page.
2. In the Console, run: `chrome.storage.local.get(null, console.log)` to dump all stored data.
3. Module init errors appear as `[BTT] Module <id> init failed: <error>` in the console at page load time.

---

## Full reset

If the extension is in an unrecoverable state:

1. Go to Dashboard → Settings → **Reset All** to wipe all settings.
2. Or open DevTools → Application → Storage → clear `chrome.storage.local`.
3. Reload all Bitcointalk tabs.
