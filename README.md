# Bitcointalk All-in-One Toolkit

A browser extension for Bitcointalk.org that bundles 30+ productivity and security tools into a single, unified dashboard.

---

## Features

| Category | Tools |
|---|---|
| **Layout & Reading** | Dark Mode, Compact Mode, Code Copy Fixer, Navigation Booster, Quote Assistant, Draft Saver, Board Cleaner, Long Quote Collapser, Image Collapser, Keyword Alert, Mobile Enhancer |
| **Security** | Clipboard Safety, Address Highlighter, Anti-Phishing Link Checker, External Link Preview, TXID Helper |
| **Thread Tools** | Thread Scraper Pro, Self-Post Finder |
| **Campaign Tools** | Campaign Manager |
| **Posting & BBCode** | BBCode Studio (live preview), Table Maker, Personal Post Library, Scam Report Builder, Mention Helper |
| **User/Profile** | User Notes, Trust Position Badge, Rank Progress Tracker |
| **Coming soon** | Thread Bookmarks, Multi-Quote Basket, Post Backup Exporter, Reputation Card Generator, Escrow Template Generator |

---

## Installation

### Chrome / Edge / Brave (Developer Mode)

1. Download or clone this repository.
2. Open your browser and navigate to `chrome://extensions` (or `edge://extensions` / `brave://extensions`).
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked**.
5. Select the `bitcointalk-toolkit` folder (the one containing `manifest.json`).
6. The extension icon (â‚¿) will appear in your toolbar.

> **Chrome 111+ required** â€” the extension uses ES Module content scripts (`type: "module"`), which require Chrome 111 or later.

### Firefox

> Firefox support is partial. Manifest V3 support in Firefox differs from Chrome's implementation.

1. Download or clone this repository.
2. Open `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on**.
4. Select `manifest.json` from the `bitcointalk-toolkit` folder.

**Known Firefox limitations:**
- The extension loads as a temporary add-on and is removed on browser restart (requires Firefox Developer Edition or Nightly for persistent unsigned extensions).
- `chrome.storage` API is supported via Firefox's `browser.*` compatibility shim, but ES Module content scripts require Firefox 112+.
- Some MV3 features (e.g., `service_worker` in background) may behave differently â€” test thoroughly before relying on scraper functionality.

For long-term Firefox use, consider submitting to [addons.mozilla.org](https://addons.mozilla.org) with the [web-ext](https://github.com/mozilla/web-ext) tool.

---

## Usage

1. **Visit any Bitcointalk.org page** â€” the â‚¿ floating button appears in the bottom-right corner.
2. Click â‚¿ to open the quick menu:
   - **Open Dashboard** â€” full settings and tools
   - **BBCode Studio** â€” jump directly to the editor
   - **Toggle Dark Mode**
   - **Toggle Compact Mode**
   - **Settings**
3. In the **Dashboard -> All Tools**, enable or disable page modules with toggle switches, or open dashboard-only tools with their **Open** button.
4. Changes take effect on the next page load (or instantly for layout modules). Planned tools are hidden from All Tools until implemented.

### Thread Scraper

1. Go to **Dashboard -> Thread -> Scraper**.
2. Enter the thread URL, choose page limit and delay, click **Scrape**.
3. Export results as CSV, TSV, or JSON.

> **Note:** Multi-page scraping is limited to Page 1 only by default to avoid rate-limiting. Increase the limit manually and keep the delay at 2s or higher.

### Campaign Manager

1. Use **Dashboard -> Thread -> Scraper** to scrape a campaign application thread.
2. Click **Extract Campaign Applications** in the scraper results.
3. Save as a project. Review applicants in **Dashboard -> Campaign**, accept/reject, and export a BBCode table.

### BBCode Studio

1. Go to **Dashboard â†’ BBCode Studio** (or click â‚¿ â†’ BBCode Studio).
2. Write or paste BBCode in the left panel â€” live preview updates on the right.
3. Use the toolbar buttons for common tags. Insert templates from the dropdown.
4. Click **Save Draft** to preserve your work.

---

### Trust Position Badge

1. Enable **Trust Position Badge** from **Dashboard -> All Tools**.
2. On topic pages, the extension shows DT status near each post author's profile area.
3. Supported badge states are **DT1**, **DT2**, **DT3** and deeper DT labels, plus optional **Not in DT**. If the DT cache is unavailable, post pages simply skip badges.
4. The module fetches Bitcointalk's official DefaultTrust pages (`https://bitcointalk.org/index.php?action=trust;dt` and `https://bitcointalk.org/index.php?action=trust;dtview`) through the extension background worker using the active Bitcointalk session, then falls back to an open Bitcointalk content tab if needed.
5. DT data is cached locally in `chrome.storage.local` under `dtCache`. The dashboard panel can refresh the cache, clear the cache, show/hide **Not in DT** badges, and show the fetch status and last update time. **Not in DT** is only shown when the cache is fresh, UID-keyed, and large enough to be trusted.
6. The dashboard also includes a DefaultTrust section with username/UID search, DT1/DT2/removed filters, Bitcointalk reference links, and JSON export.

---

## Legacy Script Integration

You can migrate old Tampermonkey/Greasemonkey scripts into the extension:

1. Copy your script into `src/legacy-scripts/myScript.js`.
2. Wrap it using `src/legacy-scripts/exampleLegacyWrapper.js` as a template.
3. Replace `GM_getValue`/`GM_setValue` calls with `await GM_API.GM_getValue`/`GM_setValue`.
4. Register it in `src/legacy-scripts/legacyRegistry.js`.
5. Enable from **Dashboard â†’ Legacy Scripts**.

See `src/legacy-scripts/README.md` for full instructions and limitations.

---

## File Structure

```
bitcointalk-toolkit/
â”œâ”€â”€ manifest.json
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ background/
â”‚   â”‚   â””â”€â”€ background.js        # Service worker (fetch proxy, tab management)
â”‚   â”œâ”€â”€ content/
â”‚   â”‚   â”œâ”€â”€ content.js           # Entry point, loads all modules
â”‚   â”‚   â”œâ”€â”€ moduleManager.js     # Lifecycle manager (init/destroy/error tracking)
â”‚   â”‚   â”œâ”€â”€ domHelpers.js        # Shared DOM utilities
â”‚   â”‚   â””â”€â”€ content.css          # Base page styles
â”‚   â”œâ”€â”€ modules/                 # One file per feature module
â”‚   â”œâ”€â”€ ui/
â”‚   â”‚   â”œâ”€â”€ dashboard.html/js/css
â”‚   â”‚   â”œâ”€â”€ popup.html/js/css
â”‚   â”‚   â””â”€â”€ options.html
â”‚   â”œâ”€â”€ utils/
â”‚   â”‚   â”œâ”€â”€ storage.js           # Unified storage API
â”‚   â”‚   â”œâ”€â”€ bbcodeParser.js      # BBCode â†’ HTML converter
â”‚   â”‚   â”œâ”€â”€ sanitizer.js         # HTML/URL/color sanitization
â”‚   â”‚   â”œâ”€â”€ sharedUI.js          # Toast, modal, clipboard helpers
â”‚   â”‚   â”œâ”€â”€ constants.js         # DEFAULT_SETTINGS, BTC_RANKS, etc.
â”‚   â”‚   â”œâ”€â”€ validators.js        # Input validators
â”‚   â”‚   â””â”€â”€ exportUtils.js       # CSV/TSV/JSON export helpers
â”‚   â””â”€â”€ legacy-scripts/          # Tampermonkey adapter
â””â”€â”€ assets/                      # Icons
```

---

## Permissions

| Permission | Why |
|---|---|
| `storage` | Save settings, drafts, notes, bookmarks |
| `activeTab` | Read current tab URL for context-aware features |
| `scripting` | Fetch the official DefaultTrust page from an open Bitcointalk tab if the normal background/content-script fetch path is unavailable |
| `clipboardWrite` | Copy BBCode to clipboard |
| `host_permissions: bitcointalk.org/*` | Thread Scraper fetches pages via the background service worker; Trust Position Badge fetches the official Bitcointalk DefaultTrust page |

No analytics or telemetry are used. Extension data stays in local browser storage. Network access is limited to Bitcointalk pages.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to create a new module.

---

## Privacy

See [PRIVACY.md](PRIVACY.md) for the full data handling policy.

---

## Troubleshooting

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues and solutions.
