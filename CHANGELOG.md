# Changelog

All notable changes to Bitcointalk All-in-One Toolkit are documented here.

---

## [1.0.0] — 2025-01-01

### Added

**Core infrastructure**
- Manifest V3 extension with ES Module content scripts and background service worker
- `moduleManager.js` — lifecycle manager with per-module init/destroy, error isolation, and state tracking (`unloaded | loading | active | disabled | error`)
- `storage.js` — unified `chrome.storage.local` API with `localStorage` fallback for dashboard context; all keys namespaced `btt_`
- `bbcodeParser.js` — Bitcointalk-accurate BBCode → HTML converter with XSS hardening (HTML escaped first, code blocks protected as placeholders, `safeUrl`/`safeColor`/`safeFontSize` on all attribute values)
- `sanitizer.js` — `safeUrl()` decodes HTML entities and strips control characters before scheme validation to prevent `&amp;javascript:` bypass
- `sharedUI.js` — `Toast`, `showModal`, `confirmDialog`, `copyToClipboard`, `downloadFile` shared across modules
- `constants.js` — `DEFAULT_SETTINGS`, `BTC_RANKS`, `BTT_STORAGE_PREFIX`
- Floating FAB launcher (₿ button) with quick-access mini menu on every Bitcointalk page

**Layout & Reading modules**
- `darkMode` — dark theme toggled via FAB menu and dashboard; no flash on load
- `codeCopyFixer` — copy buttons on all `<pre>` code blocks; bypasses Bitcointalk's broken selection
- `navigationBooster` — floating ↑↓ jump buttons and keyboard shortcut to reply box
- `quoteAssistant` — select any text and quote it directly into the reply textarea
- `localDraftSaver` — auto-saves textarea content per thread; restores on revisit
- `boardCleaner` — hide avatars, signatures; compact post density mode
- `longQuoteCollapser` — collapses nested quotes taller than 200px
- `imageCollapser` — collapses large images; click to expand
- `mobileEnhancer` — viewport fixes and touch-friendly tap targets
- `keywordAlert` — highlights user-defined keywords across posts
- `ignoreEnhancer` — dims posts from locally ignored users without requiring a page reload

**Security modules**
- `clipboardSafety` — warns when a copied crypto address is different from what was shown on screen
- `addressHighlighter` — highlights BTC, ETH, LTC, DOGE, TRX addresses in posts; click to copy
- `antiPhishingLinkChecker` — marks links pointing to domains not matching the displayed text
- `externalLinkPreview` — shows destination domain in a tooltip on hover for external links
- `txidHelper` — detects and highlights transaction IDs; click to copy

**Thread tools**
- `threadScraper` - extracts posts, usernames, ranks, addresses, slot numbers from any thread; single-page or multi-page with configurable delay and stop button; CSV/TSV/JSON export; also available in Dashboard -> Thread.
- `selfPostFinder` - highlights your own posts on the current page.
- `postLinkCopier` - adds a small post-link button to copy canonical direct post URLs.

**Campaign tools**
- `campaignHelper` - dashboard workflow built on Thread Scraper results; saves applicant projects, tracks accepted/rejected/pending status, warns on duplicate usernames or addresses, and exports CSV/BBCode tables.

**Posting & BBCode modules**
- `bbcodeStudio` - dashboard BBCode editor with live preview, toolbar, templates, snippet insertion, and draft save.
- `tableMaker` - visual grid editor; generates `[table]` BBCode; Tab key navigation; style presets; send to Studio.
- `personalPostLibrary` - save/search/insert BBCode snippets; on-page floating popup below reply textarea.
- `mentionHelper` - Shift+click any username to copy BBCode mention variants; dashboard generator with username+UID input.
- `scamReportBuilder` - form-based generator for scam-report BBCode.

**User/Profile modules**
- `userNotes` - private color-tagged notes on any username; notes shown on hover; CRUD from dashboard.
- `trustPositionBadge` - shows DT1, DT2, DT3+ and optional Not in DT badges in user areas using only Bitcointalk's official `action=trust;dt` and `action=trust;dtview` pages.
- DefaultTrust dashboard section - search/filter/export panel for official DT users and struck-through removed users, with cache status, last update time, and Bitcointalk profile/trust links.
- `rankProgressTracker` - activity+merit input to current-rank display and progress bars toward next rank.

**Coming soon / planned modules**
- `threadBookmarkManager` / `threadBookmarks` - planned; disabled in the dashboard and not enabled by default.
- `multiQuoteBasket` - planned; disabled in the dashboard and not enabled by default.
- `postBackupExporter` - planned; disabled in the dashboard and not enabled by default.
- `reputationCard` - planned; disabled in the dashboard and not enabled by default.
- `escrowTemplateGenerator` / `escrowTemplate` - planned; disabled in the dashboard and not enabled by default.

**Dashboard (full-screen UI)**
- Home with stats (enabled modules, drafts, notes, snippets)
- All Tools grid with search and category filter; page-module toggles, dashboard-only Open buttons, and disabled Coming soon entries
- BBCode Studio panel
- Thread section with working scraper tab; planned bookmarks, multi-quote, and post-backup tabs are disabled
- Campaign section (project cards with applicant tables and status management)
- My Data section (drafts, notes, snippets; unfinished tabs are labeled as coming soon)
- Legacy Scripts section with migration guide
- Settings (export JSON, import JSON with validation, reset all)

**Legacy script adapter**
- `adapter.js` — `GM_API` shim implementing `GM_getValue`, `GM_setValue`, `GM_deleteValue`, `GM_listValues`, `GM_xmlhttpRequest`, `GM_setClipboard`, `GM_notification`, `GM_log` using `chrome.storage.local`
- `legacyRegistry.js` — module manifest for registered legacy scripts
- `exampleLegacyWrapper.js` — template for wrapping existing scripts

### Fixed
- `background.js` now sends `{ success: true, html }` on fetch success (was missing `success` field, causing all consumers to silently treat every response as failure)
- `background.js` `openDashboard` now appends `#section` hash correctly
- `bbcodeParser.js` — removed `onerror` inline JS event handler from `<img>` tags (blocked by extension CSP); replaced with `class="btt-img-safe"` + CSS rule
- `sanitizer.js` `safeUrl()` — decodes HTML entities and strips ASCII control characters before scheme validation
- `storage.js` `importSettings()` — validates `enabledModules` is an array of alphanumeric strings (max 100); drops invalid `watchedKeywords`/`ignoredUsers`
- `content.js` — removed redundant dynamic imports inside `toggleDarkMode`/`toggleCompactMode`; restored `Toast` import
- `dashboard.js` — `parseThreadPage` and `findDuplicates` loaded via dynamic import with fallback; module load failure no longer crashes the entire dashboard
- `rankProgressTracker` added to `content.js` `ALL_MODULES` (was missing)
