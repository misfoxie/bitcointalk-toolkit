# Privacy Policy

**Bitcointalk All-in-One Toolkit** - last updated 2025-01-01

---

## Summary

This extension does **not** collect, transmit, or sell any personal data. Everything stays on your device unless you explicitly export it or configure a custom DT data JSON source.

---

## Data stored locally

All data is stored using `chrome.storage.local` and never leaves your browser unless you explicitly export it.

| Data | Storage key | Purpose |
|---|---|---|
| Extension settings | `btt_settings` | Which modules are enabled, dark mode preference, etc. |
| Post drafts | `btt_drafts` | Auto-saved textarea content per thread |
| User notes | `btt_user_notes` | Your private notes on Bitcointalk usernames |
| Snippets | `btt_snippets` | Saved BBCode templates |
| Bookmarks | `btt_bookmarks` | Saved thread links |
| Campaign projects | `btt_campaigns` | Applicant lists from Campaign Manager scans |
| Trust position cache | `dtCache` | Cached DT badge data parsed from Bitcointalk's official DefaultTrust pages |

All keys use the `btt_` namespace prefix. No data is written to `localStorage` in the content script context. The `localStorage` fallback is only used in the dashboard page when `chrome.storage` is unavailable.

---

## Network requests

The only network requests made by this extension are:

1. **Thread Scraper** - fetches pages from `https://bitcointalk.org/*` via the background service worker when you click Scrape. This uses your existing browser session for Bitcointalk requests.
2. **Trust Position Badge** - fetches `https://bitcointalk.org/index.php?action=trust;dt` and `https://bitcointalk.org/index.php?action=trust;dtview` through the background service worker or an open Bitcointalk content tab, parses DT depths and profile UIDs, skips struck-through removed users, and caches the merged result locally under `dtCache`.

Bitcointalk page requests are validated in `background.js` against `/^https:\/\/bitcointalk\.org\//i` before any service-worker fetch is attempted. Any other URL is rejected with an error.

There is **no analytics**, **no telemetry**, **no crash reporting**, and no third-party tracking service.

---

## Permissions

| Permission | Reason |
|---|---|
| `storage` | Save settings and user data locally |
| `activeTab` | Read the current tab's URL for context-aware features, such as the draft key per thread |
| `scripting` | Run a one-shot fetch helper in an open Bitcointalk tab when the Trust Position Badge needs the logged-in DefaultTrust page and the content script is unavailable |
| `clipboardWrite` | Copy BBCode, addresses, or mentions to clipboard |
| `host_permissions: https://bitcointalk.org/*` | Thread Scraper fetches Bitcointalk pages; Trust Position Badge fetches the official Bitcointalk DefaultTrust page |

---

## Data export and deletion

- **Export**: Dashboard -> Settings -> Export JSON exports all settings as a local file. No upload occurs.
- **Import**: Dashboard -> Settings -> Import JSON imports a previously exported file. Validated before applying.
- **Reset**: Dashboard -> Settings -> Reset All wipes all extension settings back to defaults.
- **Manual deletion**: `chrome.storage.local.clear()` from the DevTools console removes all extension data.

---

## Contact

If you have concerns about data handling, open an issue in the project repository.
