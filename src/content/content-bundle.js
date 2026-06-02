(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // src/utils/constants.js
  var BTT_STORAGE_PREFIX, TOOLKIT_THEME_STORAGE_KEY, FORUM_THEME_STORAGE_KEY, DEFAULT_FORUM_CUSTOM_COLORS, THEME_DEFS, THEME_OPTIONS, FORUM_THEME_OPTIONS, DEFAULT_SETTINGS, BTC_RANKS, CRYPTO_PATTERNS, SUSPICIOUS_DOMAINS, URL_SHORTENERS, BLOCK_EXPLORERS;
  var init_constants = __esm({
    "src/utils/constants.js"() {
      BTT_STORAGE_PREFIX = "btt_";
      TOOLKIT_THEME_STORAGE_KEY = "bttToolkitTheme";
      FORUM_THEME_STORAGE_KEY = "bttForumTheme";
      DEFAULT_FORUM_CUSTOM_COLORS = {
        pageBg: "#f6f6f6",
        cardBg: "#ffffff",
        text: "#222222",
        mutedText: "#666666",
        border: "#cccccc",
        divider: "#dddddd",
        link: "#3366cc",
        linkVisited: "#663399",
        linkHover: "#cc6600",
        linkActive: "#ff6600",
        categoryHeaderBg: "#e5e5e5",
        categoryHeaderText: "#111111",
        boardHeaderBg: "#d8d8d8",
        boardHeaderText: "#111111",
        tableHeaderBg: "#eeeeee",
        tableHeaderText: "#111111",
        postBg: "#ffffff",
        postAltBg: "#f8f8f8",
        postTitle: "#222222",
        postMeta: "#666666",
        signatureText: "#555555",
        quoteBg: "#f9f9f9",
        quoteText: "#222222",
        quoteBorder: "#bbbbbb",
        codeBg: "#eeeeee",
        codeText: "#222222",
        codeBorder: "#bbbbbb",
        buttonBg: "#dddddd",
        buttonText: "#111111",
        buttonHoverBg: "#cccccc",
        inputBg: "#ffffff",
        inputText: "#111111",
        inputBorder: "#aaaaaa",
        selectedBg: "#cce5ff",
        selectedText: "#000000",
        newPostHighlight: "#fff4cc",
        warning: "#c98200",
        success: "#1f8f3a",
        danger: "#cc3333",
        info: "#337ab7",
        merit: "#008000",
        trustPositive: "#008000",
        trustNeutral: "#666666",
        trustNegative: "#cc0000",
        dtBadge: "#d97706",
        dt1Badge: "#2563eb",
        dt2Badge: "#7c3aed",
        notificationBadge: "#dc2626",
        tooltipBg: "#111111",
        tooltipText: "#ffffff"
      };
      THEME_DEFS = {
        dark: {
          name: "Dark Mode",
          values: {
            bg: "#0f1117",
            surface: "#1a1d23",
            surface2: "#1e2025",
            text: "#e5e7eb",
            mutedText: "#9ca3af",
            border: "#2d3340",
            primary: "#3b82f6",
            primaryHover: "#60a5fa",
            accent: "#f7931a",
            success: "#22c55e",
            warning: "#f59e0b",
            danger: "#ef4444",
            link: "#60a5fa",
            inputBg: "#1e2025",
            buttonBg: "#252a35",
            buttonText: "#ffffff",
            previewBg: "#ffffff",
            previewText: "#111827"
          }
        },
        light: {
          name: "Classic Light",
          values: {
            bg: "#f3f4f6",
            surface: "#ffffff",
            surface2: "#f9fafb",
            text: "#111827",
            mutedText: "#6b7280",
            border: "#d1d5db",
            primary: "#2563eb",
            primaryHover: "#1d4ed8",
            accent: "#f7931a",
            success: "#16a34a",
            warning: "#d97706",
            danger: "#dc2626",
            link: "#1d4ed8",
            inputBg: "#ffffff",
            buttonBg: "#eef2ff",
            buttonText: "#111827",
            previewBg: "#ffffff",
            previewText: "#111827"
          }
        },
        bitcoin: {
          name: "Bitcoin Orange",
          values: {
            bg: "#17120b",
            surface: "#24180d",
            surface2: "#302012",
            text: "#fff7ed",
            mutedText: "#f1c38a",
            border: "#5b3414",
            primary: "#f7931a",
            primaryHover: "#ffad3b",
            accent: "#facc15",
            success: "#22c55e",
            warning: "#f59e0b",
            danger: "#ef4444",
            link: "#fbbf24",
            inputBg: "#1f160c",
            buttonBg: "#3a2410",
            buttonText: "#fff7ed",
            previewBg: "#fff8ef",
            previewText: "#24180d"
          }
        },
        "forum-gray": {
          name: "Forum Gray",
          values: {
            bg: "#d8dbe2",
            surface: "#eef0f4",
            surface2: "#ffffff",
            text: "#1f2937",
            mutedText: "#4b5563",
            border: "#aeb5c1",
            primary: "#50627a",
            primaryHover: "#3f4f63",
            accent: "#c6812d",
            success: "#15803d",
            warning: "#b45309",
            danger: "#b91c1c",
            link: "#1f5d9d",
            inputBg: "#ffffff",
            buttonBg: "#e5e7eb",
            buttonText: "#1f2937",
            previewBg: "#ffffff",
            previewText: "#111827"
          }
        },
        "soft-blue": {
          name: "Soft Blue",
          values: {
            bg: "#eef6ff",
            surface: "#f8fbff",
            surface2: "#ffffff",
            text: "#172033",
            mutedText: "#5d708c",
            border: "#bfd5ee",
            primary: "#2f80ed",
            primaryHover: "#1c64d1",
            accent: "#f7931a",
            success: "#169b62",
            warning: "#c98216",
            danger: "#d14343",
            link: "#1f65c1",
            inputBg: "#ffffff",
            buttonBg: "#e5f0ff",
            buttonText: "#172033",
            previewBg: "#ffffff",
            previewText: "#172033"
          }
        },
        sepia: {
          name: "Sepia Reading Mode",
          values: {
            bg: "#f4ecd8",
            surface: "#fbf4e3",
            surface2: "#fff9ea",
            text: "#33291c",
            mutedText: "#7a6548",
            border: "#d2bd94",
            primary: "#8f5b22",
            primaryHover: "#704616",
            accent: "#b7791f",
            success: "#2f855a",
            warning: "#b7791f",
            danger: "#b83232",
            link: "#6b4e16",
            inputBg: "#fffaf0",
            buttonBg: "#ead9b8",
            buttonText: "#33291c",
            previewBg: "#fffaf0",
            previewText: "#33291c"
          }
        },
        "high-contrast": {
          name: "High Contrast",
          values: {
            bg: "#000000",
            surface: "#000000",
            surface2: "#111111",
            text: "#ffffff",
            mutedText: "#f5f5f5",
            border: "#ffffff",
            primary: "#ffff00",
            primaryHover: "#ffffff",
            accent: "#00ffff",
            success: "#00ff66",
            warning: "#ffff00",
            danger: "#ff4d4d",
            link: "#00ffff",
            inputBg: "#000000",
            buttonBg: "#222222",
            buttonText: "#ffffff",
            previewBg: "#000000",
            previewText: "#ffffff"
          }
        }
      };
      THEME_OPTIONS = Object.entries(THEME_DEFS).map(([id, theme]) => ({
        id,
        name: theme.name
      }));
      FORUM_THEME_OPTIONS = [
        { id: "original", name: "Original Bitcointalk" },
        { id: "custom", name: "Custom Forum Theme" },
        ...THEME_OPTIONS
      ];
      DEFAULT_SETTINGS = {
        enabledModules: [
          "codeCopyFixer",
          "navigationBooster",
          "quoteAssistant",
          "localDraftSaver",
          "clipboardSafety",
          "boardCleaner",
          "addressHighlighter",
          "keywordAlert",
          "antiPhishingLinkChecker",
          "longQuoteCollapser",
          "userNotes",
          "externalLinkPreview",
          "imageCollapser",
          "postLinkCopier",
          "trustPositionBadge"
        ],
        darkMode: false,
        theme: "dark",
        toolkitTheme: "dark",
        forumTheme: "original",
        forumCustomColors: { ...DEFAULT_FORUM_CUSTOM_COLORS },
        dashboardDarkMode: true,
        compactMode: false,
        hideAvatars: true,
        hideSignatures: true,
        hidePersonalText: false,
        collapseQuotes: false,
        collapseImages: false,
        boardCleanerDefaultsV2: true,
        clipboardProtection: true,
        mobileEnhancer: true,
        watchedKeywords: [],
        userNotes: {},
        savedDrafts: {},
        bookmarks: [],
        personalSnippets: [],
        legacyScriptsEnabled: false,
        clipboardWhitelist: [],
        ignoredUsers: [],
        watchedUsers: [],
        trustPositionBadgeEnabled: true,
        trustPositionBadgeShowNoDt: false,
        showNotInDt: false,
        trustPositionBadgeDebug: false,
        savedSnippets: [],
        campaignProjects: [],
        giveawayHistory: [],
        quoteCollapseHeight: 300,
        imageCollapseHeight: 400,
        scraperDelay: 2e3,
        autoSaveInterval: 5e3
      };
      BTC_RANKS = [
        { name: "Brand new member", minActivity: 0, minMerit: 0, color: "#aaa" },
        { name: "Newbie", minActivity: 1, minMerit: 0, color: "#aaa" },
        { name: "Jr. Member", minActivity: 30, minMerit: 0, color: "#aaa" },
        { name: "Member", minActivity: 120, minMerit: 1, color: "#0070bb" },
        { name: "Full Member", minActivity: 240, minMerit: 10, color: "#0070bb" },
        { name: "Sr. Member", minActivity: 480, minMerit: 100, color: "#0070bb" },
        { name: "Hero Member", minActivity: 766, minMerit: 500, color: "#c7922b" },
        { name: "Legendary", minActivity: 1e3, minMerit: 999, color: "#c00" }
      ];
      CRYPTO_PATTERNS = {
        btcLegacy: /\b(1[a-zA-HJ-NP-Z0-9]{25,34})\b/g,
        btcP2SH: /\b(3[a-zA-HJ-NP-Z0-9]{25,34})\b/g,
        btcBech32: /\b(bc1[a-zA-HJ-NP-Z0-9]{6,87})\b/gi,
        eth: /\b(0x[a-fA-F0-9]{40})\b/g,
        ltc: /\b(L[a-km-zA-HJ-NP-Z0-9]{26,33})\b/g,
        doge: /\b(D[5-9A-HJ-NP-U]{1}[1-9A-HJ-NP-Za-km-z]{32})\b/g,
        trx: /\b(T[1-9A-HJ-NP-Za-km-z]{33})\b/g,
        txid: /\b([a-fA-F0-9]{64})\b/g
      };
      SUSPICIOUS_DOMAINS = [
        "bitcointalk.com",
        "bitcointaIk.org",
        "bitc0intalk.org",
        "blockchaln.com",
        "blockchain.co",
        "blockchian.com",
        "blokchain.com",
        "metamasks.io",
        "metarnask.io",
        "binancer.com",
        "binancee.com",
        "trustwalllet.com"
      ];
      URL_SHORTENERS = [
        "bit.ly",
        "tinyurl.com",
        "t.co",
        "goo.gl",
        "ow.ly",
        "buff.ly",
        "ift.tt",
        "dlvr.it",
        "is.gd",
        "v.gd",
        "rb.gy",
        "cutt.ly",
        "short.io"
      ];
      BLOCK_EXPLORERS = {
        btc: [
          { name: "Blockchain.com", url: "https://www.blockchain.com/btc/tx/" },
          { name: "Blockchair", url: "https://blockchair.com/bitcoin/transaction/" },
          { name: "Mempool.space", url: "https://mempool.space/tx/" }
        ],
        eth: [
          { name: "Etherscan", url: "https://etherscan.io/tx/" }
        ]
      };
    }
  });

  // src/utils/storage.js
  var storage_exports = {};
  __export(storage_exports, {
    deleteBookmark: () => deleteBookmark,
    deleteCampaignProject: () => deleteCampaignProject,
    deleteDraft: () => deleteDraft,
    deleteSnippet: () => deleteSnippet,
    deleteUserNote: () => deleteUserNote,
    exportSettings: () => exportSettings,
    getBookmarks: () => getBookmarks,
    getCampaignProjects: () => getCampaignProjects,
    getDrafts: () => getDrafts,
    getSettings: () => getSettings,
    getSnippets: () => getSnippets,
    getUserNotes: () => getUserNotes,
    importSettings: () => importSettings,
    isModuleEnabled: () => isModuleEnabled,
    resetSettings: () => resetSettings,
    saveBookmark: () => saveBookmark,
    saveCampaignProject: () => saveCampaignProject,
    saveDraft: () => saveDraft,
    saveSettings: () => saveSettings,
    saveSnippet: () => saveSnippet,
    setModuleEnabled: () => setModuleEnabled,
    setUserNote: () => setUserNote,
    storageGet: () => storageGet,
    storageRemove: () => storageRemove,
    storageSet: () => storageSet,
    updateSetting: () => updateSetting
  });
  function storageGet(keys) {
    return new Promise((resolve) => {
      if (USE_CHROME) {
        chrome.storage.local.get(keys, (result) => resolve(result));
      } else {
        const result = {};
        const arr = Array.isArray(keys) ? keys : typeof keys === "string" ? [keys] : Object.keys(keys);
        arr.forEach((k) => {
          const raw = localStorage.getItem(BTT_STORAGE_PREFIX + k);
          if (raw !== null) {
            try {
              result[k] = JSON.parse(raw);
            } catch {
              result[k] = raw;
            }
          } else if (typeof keys === "object" && !Array.isArray(keys)) {
            result[k] = keys[k];
          }
        });
        resolve(result);
      }
    });
  }
  function storageSet(items) {
    return new Promise((resolve) => {
      if (USE_CHROME) {
        chrome.storage.local.set(items, resolve);
      } else {
        Object.entries(items).forEach(([k, v]) => {
          localStorage.setItem(BTT_STORAGE_PREFIX + k, JSON.stringify(v));
        });
        resolve();
      }
    });
  }
  function storageRemove(keys) {
    const arr = Array.isArray(keys) ? keys : [keys];
    return new Promise((resolve) => {
      if (USE_CHROME) {
        chrome.storage.local.remove(arr, resolve);
      } else {
        arr.forEach((k) => localStorage.removeItem(BTT_STORAGE_PREFIX + k));
        resolve();
      }
    });
  }
  async function getSettings() {
    const result = await storageGet(["btt_settings", TOOLKIT_THEME_STORAGE_KEY, FORUM_THEME_STORAGE_KEY]);
    const saved = result["btt_settings"] || {};
    const settings = { ...DEFAULT_SETTINGS, ...saved };
    settings.toolkitTheme = result[TOOLKIT_THEME_STORAGE_KEY] || saved.toolkitTheme || saved.theme || DEFAULT_SETTINGS.toolkitTheme;
    settings.forumTheme = result[FORUM_THEME_STORAGE_KEY] || saved.forumTheme || DEFAULT_SETTINGS.forumTheme;
    settings.theme = settings.toolkitTheme;
    settings.darkMode = settings.forumTheme === "dark";
    if (Array.isArray(settings.enabledModules)) {
      settings.enabledModules = settings.darkMode ? [.../* @__PURE__ */ new Set([...settings.enabledModules, "darkMode"])] : settings.enabledModules.filter((id) => id !== "darkMode");
    }
    if (saved.boardCleanerDefaultsV2 !== true) {
      settings.hideAvatars = true;
      settings.hideSignatures = true;
      settings.boardCleanerDefaultsV2 = true;
      await storageSet({ btt_settings: settings });
    }
    if (saved.trustPositionBadgeEnabled !== false && Array.isArray(settings.enabledModules) && !settings.enabledModules.includes("trustPositionBadge")) {
      settings.enabledModules = [...settings.enabledModules, "trustPositionBadge"];
    }
    if (saved.quoteAssistantEnabled !== false && Array.isArray(settings.enabledModules) && !settings.enabledModules.includes("quoteAssistant")) {
      settings.enabledModules = [...settings.enabledModules, "quoteAssistant"];
    }
    return settings;
  }
  async function saveSettings(settings) {
    await storageSet({ btt_settings: settings });
  }
  async function updateSetting(key, value) {
    const settings = await getSettings();
    settings[key] = value;
    await saveSettings(settings);
    return settings;
  }
  async function resetSettings() {
    await saveSettings({ ...DEFAULT_SETTINGS });
    return { ...DEFAULT_SETTINGS };
  }
  async function exportSettings() {
    const settings = await getSettings();
    return JSON.stringify({
      version: "1.0.0",
      exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
      settings
    }, null, 2);
  }
  async function importSettings(jsonString) {
    let data;
    try {
      data = JSON.parse(jsonString);
    } catch {
      throw new Error("Invalid JSON \u2014 the file could not be parsed.");
    }
    if (typeof data !== "object" || data === null) {
      throw new Error("Invalid format \u2014 expected a JSON object.");
    }
    const incoming = data.settings && typeof data.settings === "object" ? data.settings : data;
    if ("enabledModules" in incoming && !Array.isArray(incoming.enabledModules)) {
      throw new Error('Invalid settings: "enabledModules" must be an array.');
    }
    if ("enabledModules" in incoming) {
      incoming.enabledModules = incoming.enabledModules.filter((id) => typeof id === "string" && /^[a-zA-Z0-9_]+$/.test(id)).slice(0, 100);
    }
    if ("watchedKeywords" in incoming && !Array.isArray(incoming.watchedKeywords)) {
      delete incoming.watchedKeywords;
    }
    if ("ignoredUsers" in incoming && !Array.isArray(incoming.ignoredUsers)) {
      delete incoming.ignoredUsers;
    }
    const current = await getSettings();
    const merged = { ...DEFAULT_SETTINGS, ...current, ...incoming };
    await saveSettings(merged);
    return merged;
  }
  async function isModuleEnabled(moduleId) {
    const settings = await getSettings();
    return (settings.enabledModules || []).includes(moduleId);
  }
  async function setModuleEnabled(moduleId, enabled) {
    const settings = await getSettings();
    let list = settings.enabledModules || [];
    if (enabled) {
      if (!list.includes(moduleId)) list = [...list, moduleId];
    } else {
      list = list.filter((id) => id !== moduleId);
    }
    return updateSetting("enabledModules", list);
  }
  async function getDrafts() {
    const result = await storageGet("btt_drafts");
    return result["btt_drafts"] || {};
  }
  async function saveDraft(key, content, name) {
    const drafts = await getDrafts();
    drafts[key] = { content, name: name || key, savedAt: Date.now() };
    await storageSet({ btt_drafts: drafts });
  }
  async function deleteDraft(key) {
    const drafts = await getDrafts();
    delete drafts[key];
    await storageSet({ btt_drafts: drafts });
  }
  async function getUserNotes() {
    const result = await storageGet("btt_user_notes");
    return result["btt_user_notes"] || {};
  }
  async function setUserNote(username, note) {
    const notes = await getUserNotes();
    notes[username.toLowerCase()] = { ...note, updatedAt: Date.now() };
    await storageSet({ btt_user_notes: notes });
  }
  async function deleteUserNote(username) {
    const notes = await getUserNotes();
    delete notes[username.toLowerCase()];
    await storageSet({ btt_user_notes: notes });
  }
  async function getSnippets() {
    const result = await storageGet("btt_snippets");
    return result["btt_snippets"] || [];
  }
  async function saveSnippet(snippet) {
    const snippets = await getSnippets();
    const existing = snippets.findIndex((s) => s.id === snippet.id);
    if (existing >= 0) snippets[existing] = snippet;
    else snippets.push({ ...snippet, id: snippet.id || Date.now().toString(), createdAt: Date.now() });
    await storageSet({ btt_snippets: snippets });
  }
  async function deleteSnippet(id) {
    const snippets = await getSnippets();
    await storageSet({ btt_snippets: snippets.filter((s) => s.id !== id) });
  }
  async function getBookmarks() {
    const result = await storageGet("btt_bookmarks");
    return result["btt_bookmarks"] || [];
  }
  async function saveBookmark(bookmark) {
    const bookmarks = await getBookmarks();
    bookmarks.unshift({ ...bookmark, id: Date.now().toString(), savedAt: Date.now() });
    await storageSet({ btt_bookmarks: bookmarks });
  }
  async function deleteBookmark(id) {
    const bookmarks = await getBookmarks();
    await storageSet({ btt_bookmarks: bookmarks.filter((b) => b.id !== id) });
  }
  async function getCampaignProjects() {
    const result = await storageGet("btt_campaigns");
    return result["btt_campaigns"] || [];
  }
  async function saveCampaignProject(project) {
    const projects = await getCampaignProjects();
    const idx = projects.findIndex((p) => p.id === project.id);
    if (idx >= 0) projects[idx] = { ...projects[idx], ...project, updatedAt: Date.now() };
    else projects.unshift({ ...project, id: Date.now().toString(), createdAt: Date.now(), updatedAt: Date.now() });
    await storageSet({ btt_campaigns: projects });
    return projects;
  }
  async function deleteCampaignProject(id) {
    const projects = await getCampaignProjects();
    await storageSet({ btt_campaigns: projects.filter((p) => p.id !== id) });
  }
  var USE_CHROME;
  var init_storage = __esm({
    "src/utils/storage.js"() {
      init_constants();
      USE_CHROME = typeof chrome !== "undefined" && chrome.storage && chrome.storage.local;
    }
  });

  // src/utils/sharedUI.js
  var sharedUI_exports = {};
  __export(sharedUI_exports, {
    Toast: () => Toast,
    confirmDialog: () => confirmDialog,
    copyToClipboard: () => copyToClipboard,
    createToggle: () => createToggle,
    createToolCard: () => createToolCard,
    downloadFile: () => downloadFile,
    injectStyles: () => injectStyles,
    showModal: () => showModal,
    showToast: () => showToast
  });
  function getToastContainer() {
    if (!toastContainer || !document.body.contains(toastContainer)) {
      toastContainer = document.createElement("div");
      toastContainer.id = "btt-toast-container";
      toastContainer.style.cssText = `
      position:fixed; bottom:20px; right:20px; z-index:2147483647;
      display:flex; flex-direction:column-reverse; gap:8px; pointer-events:none;
    `;
      document.body.appendChild(toastContainer);
    }
    return toastContainer;
  }
  function showToast(message, type = "info", duration = 3e3) {
    const container = getToastContainer();
    const toast = document.createElement("div");
    const colors = {
      success: "var(--btt-success,#22c55e)",
      error: "var(--btt-danger,#ef4444)",
      warning: "var(--btt-warning,#f59e0b)",
      info: "var(--btt-primary,#3b82f6)"
    };
    toast.style.cssText = `
    background:var(--btt-surface-2,#1e2025); color:var(--btt-text,#fff); padding:10px 16px; border-radius:6px;
    font-size:13px; max-width:340px; border-left:3px solid ${colors[type] || colors.info};
    box-shadow:0 4px 12px rgba(0,0,0,.4); pointer-events:all;
    animation:bttToastIn .2s ease; opacity:1; transition:opacity .3s;
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  `;
    toast.textContent = message;
    container.appendChild(toast);
    if (!document.getElementById("btt-toast-style")) {
      const s = document.createElement("style");
      s.id = "btt-toast-style";
      s.textContent = `@keyframes bttToastIn{from{transform:translateX(20px);opacity:0}to{transform:translateX(0);opacity:1}}`;
      document.head.appendChild(s);
    }
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, duration);
    return toast;
  }
  function showModal({ title, content, actions = [], width = "480px" }) {
    const overlay = document.createElement("div");
    overlay.className = "btt-modal-overlay";
    overlay.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:2147483646;
    display:flex;align-items:center;justify-content:center;padding:16px;
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  `;
    const modal = document.createElement("div");
    modal.style.cssText = `
    background:var(--btt-surface-2,#1e2025);color:var(--btt-text,#e5e7eb);border-radius:10px;max-width:${width};
    width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.5);
  `;
    const header = document.createElement("div");
    header.style.cssText = "padding:16px 20px;border-bottom:1px solid var(--btt-border,#2d3340);display:flex;justify-content:space-between;align-items:center;";
    header.innerHTML = `<h3 style="margin:0;font-size:16px;font-weight:600">${title}</h3>`;
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Close";
    closeBtn.style.cssText = "background:none;border:none;color:var(--btt-muted-text,#aaa);font-size:12px;cursor:pointer;padding:0;";
    closeBtn.onclick = () => overlay.remove();
    header.appendChild(closeBtn);
    const body = document.createElement("div");
    body.style.cssText = "padding:20px;";
    if (typeof content === "string") body.innerHTML = content;
    else if (content instanceof HTMLElement) body.appendChild(content);
    const footer = document.createElement("div");
    footer.style.cssText = "padding:12px 20px;border-top:1px solid var(--btt-border,#2d3340);display:flex;gap:8px;justify-content:flex-end;";
    actions.forEach(({ label, type = "secondary", onClick }) => {
      const btn = document.createElement("button");
      btn.textContent = label;
      btn.style.cssText = `
      padding:8px 16px;border-radius:6px;border:none;cursor:pointer;font-size:13px;
      background:${type === "primary" ? "var(--btt-primary,#3b82f6)" : "var(--btt-button-bg,#374151)"};
      color:var(--btt-button-text,#fff);font-weight:${type === "primary" ? "600" : "400"};
    `;
      btn.addEventListener("click", () => {
        onClick && onClick();
        overlay.remove();
      });
      footer.appendChild(btn);
    });
    modal.appendChild(header);
    modal.appendChild(body);
    if (actions.length) modal.appendChild(footer);
    overlay.appendChild(modal);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.remove();
    });
    document.body.appendChild(overlay);
    return { overlay, modal, close: () => overlay.remove() };
  }
  function confirmDialog(message) {
    return new Promise((resolve) => {
      showModal({
        title: "Confirm",
        content: `<p style="margin:0">${message}</p>`,
        actions: [
          { label: "Cancel", type: "secondary", onClick: () => resolve(false) },
          { label: "Confirm", type: "primary", onClick: () => resolve(true) }
        ]
      });
    });
  }
  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const el = document.createElement("textarea");
        el.value = text;
        el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        el.remove();
        return true;
      } catch {
        return false;
      }
    }
  }
  function downloadFile(filename, content, mimeType = "text/plain") {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
  function createToggle(label, checked, onChange) {
    const wrap = document.createElement("label");
    wrap.style.cssText = "display:flex;align-items:center;gap:10px;cursor:pointer;user-select:none;";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = checked;
    input.style.display = "none";
    const track = document.createElement("span");
    track.style.cssText = `
    width:36px;height:20px;border-radius:10px;display:inline-flex;align-items:center;
    padding:2px;transition:background .2s;flex-shrink:0;
    background:${checked ? "var(--btt-primary,#3b82f6)" : "var(--btt-button-bg,#374151)"};
  `;
    const knob = document.createElement("span");
    knob.style.cssText = `
    width:16px;height:16px;border-radius:50%;background:#fff;
    transition:transform .2s;transform:${checked ? "translateX(16px)" : "translateX(0)"};
  `;
    track.appendChild(knob);
    const text = document.createElement("span");
    text.style.cssText = "font-size:13px;";
    text.textContent = label;
    input.addEventListener("change", () => {
      const val = input.checked;
      track.style.background = val ? "var(--btt-primary,#3b82f6)" : "var(--btt-button-bg,#374151)";
      knob.style.transform = val ? "translateX(16px)" : "translateX(0)";
      onChange && onChange(val);
    });
    wrap.addEventListener("click", () => {
      input.checked = !input.checked;
      input.dispatchEvent(new Event("change"));
    });
    wrap.appendChild(input);
    wrap.appendChild(track);
    wrap.appendChild(text);
    return wrap;
  }
  function createToolCard(module, enabled, onToggle, onOpen) {
    const card = document.createElement("div");
    card.className = "btt-tool-card";
    card.dataset.moduleId = module.id;
    card.innerHTML = `
    <div class="btc-card-header">
      <span class="btt-card-name">${module.name}</span>
      <span class="btt-card-category">${module.category || ""}</span>
    </div>
    <p class="btt-card-desc">${module.description || ""}</p>
    <div class="btt-card-footer"></div>
  `;
    const footer = card.querySelector(".btt-card-footer");
    const toggle = createToggle("", enabled, (val) => onToggle && onToggle(module.id, val));
    footer.appendChild(toggle);
    if (onOpen) {
      const openBtn = document.createElement("button");
      openBtn.className = "btt-btn btt-btn-sm";
      openBtn.textContent = "Open";
      openBtn.addEventListener("click", () => onOpen(module.id));
      footer.appendChild(openBtn);
    }
    return card;
  }
  function injectStyles(id, css) {
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
  }
  var toastContainer, Toast;
  var init_sharedUI = __esm({
    "src/utils/sharedUI.js"() {
      toastContainer = null;
      Toast = {
        success: (msg, dur) => showToast(msg, "success", dur),
        error: (msg, dur) => showToast(msg, "error", dur || 5e3),
        warning: (msg, dur) => showToast(msg, "warning", dur),
        info: (msg, dur) => showToast(msg, "info", dur)
      };
    }
  });

  // src/content/moduleManager.js
  init_storage();
  init_sharedUI();

  // src/utils/sanitizer.js
  function escapeHtml(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function safeUrl(url) {
    const raw = String(url).trim();
    const decoded = raw.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    const clean = decoded.replace(/[\x00-\x20\x7f]+/g, "");
    if (/^https?:\/\//i.test(clean)) return clean;
    return "#blocked";
  }
  function safeColor(color) {
    const c = String(color).trim();
    if (/^#[0-9a-fA-F]{3,6}$/.test(c)) return c;
    if (/^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/.test(c)) return c;
    const named = [
      "red",
      "green",
      "blue",
      "yellow",
      "orange",
      "purple",
      "pink",
      "black",
      "white",
      "gray",
      "grey",
      "brown",
      "cyan",
      "magenta",
      "lime",
      "navy",
      "teal",
      "maroon",
      "olive",
      "silver",
      "gold",
      "coral",
      "salmon",
      "violet",
      "indigo",
      "aqua",
      "fuchsia"
    ];
    if (named.includes(c.toLowerCase())) return c;
    return "inherit";
  }
  function safeFontSize(size) {
    const s = String(size).trim();
    if (/^\d+(\.\d+)?(pt|px|em|rem|%)$/.test(s)) return s;
    if (/^\d+$/.test(s)) return s + "pt";
    const named = ["xx-small", "x-small", "small", "medium", "large", "x-large", "xx-large"];
    if (named.includes(s.toLowerCase())) return s;
    return "14px";
  }

  // src/utils/bbcodeParser.js
  function extractCodeBlocks(text) {
    const blocks = [];
    const out = text.replace(/\[code(?:=[^\]]+)?\]([\s\S]*?)\[\/code\]/gi, (_, content) => {
      const id = `\0CODE${blocks.length}\0`;
      blocks.push(content);
      return id;
    });
    return { text: out, blocks };
  }
  function restoreCodeBlocks(text, blocks) {
    return text.replace(/\x00CODE(\d+)\x00/g, (_, i) => {
      const content = blocks[parseInt(i, 10)];
      return `<div class="btt-code-block"><pre><code>${content}</code></pre><button class="btt-code-copy" title="Copy code">Copy</button></div>`;
    });
  }
  function processQuotes(text) {
    let prev = "";
    let depth = 0;
    while (prev !== text && depth < 10) {
      prev = text;
      depth++;
      text = text.replace(
        /\[quote\s+author=([^\]\n]+?)(?:\s+link=[^\]\n]*?)?(?:\s+date=(\d+))?\]((?:(?!\[quote).)*?)\[\/quote\]/gis,
        (_, author, date, content) => {
          const safeAuthor = escapeHtml(author.trim().replace(/['"]/g, ""));
          const dateStr = date ? new Date(parseInt(date, 10) * 1e3).toLocaleDateString() : "";
          return `<div class="btt-quote"><div class="btt-quote-header">Quote from: <strong>${safeAuthor}</strong>${dateStr ? ` \u2014 ${dateStr}` : ""}</div><div class="btt-quote-body">${content}</div></div>`;
        }
      );
      text = text.replace(
        /\[quote\]((?:(?!\[quote).)*?)\[\/quote\]/gis,
        (_, content) => `<div class="btt-quote"><div class="btt-quote-body">${content}</div></div>`
      );
    }
    return text;
  }
  function processLists(text) {
    text = text.replace(/\[list=1\]([\s\S]*?)\[\/list\]/gi, (_, content) => {
      const items = content.replace(/\[li\]([\s\S]*?)\[\/li\]/gi, "<li>$1</li>");
      const starItems = items.split(/\[\*\]/i).filter((s) => s.trim());
      if (starItems.length > 1) return `<ol>${starItems.map((i) => `<li>${i.trim()}</li>`).join("")}</ol>`;
      return `<ol>${items}</ol>`;
    });
    text = text.replace(/\[list\]([\s\S]*?)\[\/list\]/gi, (_, content) => {
      const withLi = content.replace(/\[li\]([\s\S]*?)\[\/li\]/gi, "<li>$1</li>");
      const parts = withLi.split(/\[\*\]/i).filter((s) => s.trim());
      if (parts.length > 1) return `<ul>${parts.map((i) => `<li>${i.trim()}</li>`).join("")}</ul>`;
      return `<ul>${withLi}</ul>`;
    });
    return text;
  }
  function parse(rawText, options = {}) {
    if (!rawText) return "";
    let html = escapeHtml(rawText);
    const { text: noCode, blocks } = extractCodeBlocks(html);
    html = noCode;
    html = html.replace(/\[b\]([\s\S]*?)\[\/b\]/gi, "<strong>$1</strong>");
    html = html.replace(/\[i\]([\s\S]*?)\[\/i\]/gi, "<em>$1</em>");
    html = html.replace(/\[u\]([\s\S]*?)\[\/u\]/gi, "<u>$1</u>");
    html = html.replace(/\[s\]([\s\S]*?)\[\/s\]/gi, "<s>$1</s>");
    html = html.replace(/\[sup\]([\s\S]*?)\[\/sup\]/gi, "<sup>$1</sup>");
    html = html.replace(/\[sub\]([\s\S]*?)\[\/sub\]/gi, "<sub>$1</sub>");
    html = html.replace(/\[tt\]([\s\S]*?)\[\/tt\]/gi, '<code class="btt-tt">$1</code>');
    html = html.replace(/\[pre\]([\s\S]*?)\[\/pre\]/gi, '<pre class="btt-pre">$1</pre>');
    html = html.replace(
      /\[color=([^\]]+)\]([\s\S]*?)\[\/color\]/gi,
      (_, color, content) => `<span style="color:${safeColor(color)}">${content}</span>`
    );
    html = html.replace(
      /\[size=([^\]]+)\]([\s\S]*?)\[\/size\]/gi,
      (_, size, content) => `<span style="font-size:${safeFontSize(size)}">${content}</span>`
    );
    html = html.replace(
      /\[font=([^\]]+)\]([\s\S]*?)\[\/font\]/gi,
      (_m, _font, content) => `<span>${content}</span>`
    );
    html = html.replace(
      /\[glow=([^\]]+)\]([\s\S]*?)\[\/glow\]/gi,
      (_, params, content) => `<span class="btt-glow">${content}</span>`
    );
    html = html.replace(
      /\[shadow=([^\]]+)\]([\s\S]*?)\[\/shadow\]/gi,
      (_, params, content) => `<span class="btt-shadow">${content}</span>`
    );
    html = html.replace(
      /\[move\]([\s\S]*?)\[\/move\]/gi,
      (_, content) => `<span class="btt-move-label">[marquee preview]</span> ${content}`
    );
    html = html.replace(/\[center\]([\s\S]*?)\[\/center\]/gi, '<div class="btt-center">$1</div>');
    html = html.replace(/\[left\]([\s\S]*?)\[\/left\]/gi, '<div class="btt-left">$1</div>');
    html = html.replace(/\[right\]([\s\S]*?)\[\/right\]/gi, '<div class="btt-right">$1</div>');
    html = html.replace(
      /\[url=([^\]]+)\]([\s\S]*?)\[\/url\]/gi,
      (_, url, text) => `<a href="${safeUrl(url)}" target="_blank" rel="noopener noreferrer">${text}</a>`
    );
    html = html.replace(
      /\[url\](https?:\/\/[^\[\]]+?)\[\/url\]/gi,
      (_, url) => `<a href="${safeUrl(url)}" target="_blank" rel="noopener noreferrer">${url}</a>`
    );
    html = html.replace(
      /\[img\]\s*(https?:\/\/[^\[\]\s]+?)\s*\[\/img\]/gi,
      (_, url) => `<img src="${safeUrl(url)}" alt="" loading="lazy" class="btt-img" class="btt-img-safe">`
    );
    html = html.replace(
      /\[img\s+width=(\d+)\]\s*(https?:\/\/[^\[\]\s]+?)\s*\[\/img\]/gi,
      (_, w, url) => `<img src="${safeUrl(url)}" alt="" loading="lazy" style="max-width:100%;width:${w}px" class="btt-img" class="btt-img-safe">`
    );
    html = html.replace(/\[table(?:=[^\]]*)?\]([\s\S]*?)\[\/table\]/gi, '<table class="btt-table">$1</table>');
    html = html.replace(/\[tr\]([\s\S]*?)\[\/tr\]/gi, "<tr>$1</tr>");
    html = html.replace(/\[th\]([\s\S]*?)\[\/th\]/gi, "<th>$1</th>");
    html = html.replace(/\[td(?:=[^\]]*)?\]([\s\S]*?)\[\/td\]/gi, "<td>$1</td>");
    html = processLists(html);
    html = processQuotes(html);
    html = html.replace(/\[hr\]/gi, '<hr class="btt-hr">');
    if (options.autoLink !== false) {
      html = html.replace(
        /(?<!href=["'])(?<!src=["'])(https?:\/\/[^\s<>"']+)/g,
        (url) => `<a href="${safeUrl(url)}" target="_blank" rel="noopener noreferrer">${url}</a>`
      );
    }
    html = restoreCodeBlocks(html, blocks);
    html = html.replace(/\n/g, "<br>");
    return html;
  }

  // src/content/domHelpers.js
  var domHelpers_exports = {};
  __export(domHelpers_exports, {
    getActivityFromPosterCell: () => getActivityFromPosterCell,
    getAllCodeBlocks: () => getAllCodeBlocks,
    getAllPosts: () => getAllPosts,
    getAllQuoteBlocks: () => getAllQuoteBlocks,
    getMeritFromPosterCell: () => getMeritFromPosterCell,
    getMsgId: () => getMsgId,
    getNavLinks: () => getNavLinks,
    getPageNumber: () => getPageNumber,
    getPostDate: () => getPostDate,
    getPostText: () => getPostText,
    getPostUrl: () => getPostUrl,
    getProfileLinkFromPosterCell: () => getProfileLinkFromPosterCell,
    getRankFromPosterCell: () => getRankFromPosterCell,
    getReplyTextarea: () => getReplyTextarea,
    getTopicId: () => getTopicId,
    getUsernameFromPosterCell: () => getUsernameFromPosterCell,
    insertIntoReplyTextarea: () => insertIntoReplyTextarea,
    isBoardPage: () => isBoardPage,
    isProfilePage: () => isProfilePage,
    isThreadPage: () => isThreadPage,
    isTrustPage: () => isTrustPage,
    isUsableTextarea: () => isUsableTextarea
  });
  function isThreadPage() {
    return /[?&]topic=\d+/.test(location.href);
  }
  function isBoardPage() {
    return /[?&]board=\d+/.test(location.href);
  }
  function isProfilePage() {
    return /[?&]action=profile/.test(location.href);
  }
  function isTrustPage() {
    return /[?&]action=trust/.test(location.href);
  }
  function getTopicId() {
    const m = location.href.match(/topic=(\d+)/);
    return m ? m[1] : null;
  }
  function getPageNumber() {
    const m = location.href.match(/topic=\d+\.(\d+)/);
    return m ? Math.floor(parseInt(m[1], 10) / 20) + 1 : 1;
  }
  function getAllPosts() {
    return Array.from(document.querySelectorAll("td.poster_info")).map((posterCell) => {
      const row1 = posterCell.closest("tr");
      const row2 = row1?.nextElementSibling;
      const contentCell = row2?.querySelector("td.td_headerandpost") || row2?.querySelector("td");
      const postDiv = row2?.querySelector('[id^="msg_"]');
      return { posterCell, contentCell, postDiv, row: row1 };
    }).filter((p) => p.postDiv);
  }
  function getUsernameFromPosterCell(posterCell) {
    return posterCell.querySelector("b > a")?.textContent?.trim() || posterCell.querySelector("a")?.textContent?.trim() || "Unknown";
  }
  function getProfileLinkFromPosterCell(posterCell) {
    return posterCell.querySelector("b > a")?.href || posterCell.querySelector("a")?.href || "";
  }
  function getRankFromPosterCell(posterCell) {
    const texts = Array.from(posterCell.querySelectorAll("span")).map((s) => s.textContent.trim());
    return texts[0] || "";
  }
  function getActivityFromPosterCell(posterCell) {
    const html = posterCell.innerHTML;
    const m = html.match(/Activity:\s*<\/b>\s*(\d+)/i);
    return m ? m[1] : "";
  }
  function getMeritFromPosterCell(posterCell) {
    const html = posterCell.innerHTML;
    const m = html.match(/Merit:\s*<\/b>\s*([\d,]+)/i);
    return m ? m[1].replace(/,/g, "") : "";
  }
  function getPostDate(contentCell) {
    const html = contentCell?.innerHTML || "";
    const m = html.match(/on:\s*<\/b>\s*([A-Za-z]+ \d{2}, \d{4}, \d{2}:\d{2}:\d{2} (?:AM|PM))/i) || html.match(/on:\s*<b>([^<]+)<\/b>/i);
    return m ? m[1].trim() : "";
  }
  function getMsgId(postDiv) {
    return postDiv?.id?.replace("msg_", "") || "";
  }
  function getPostUrl(msgId) {
    const topicId = getTopicId();
    if (!topicId || !msgId) return "";
    return `https://bitcointalk.org/index.php?topic=${topicId}.msg${msgId}#msg${msgId}`;
  }
  function getPostText(postDiv) {
    if (!postDiv) return "";
    const clone = postDiv.cloneNode(true);
    clone.querySelectorAll(".quoteheader, .quote").forEach((q) => q.remove());
    return clone.textContent?.trim() || "";
  }
  function isUsableTextarea(textarea) {
    if (!textarea) return false;
    if (!(textarea instanceof HTMLTextAreaElement)) return false;
    const style = window.getComputedStyle(textarea);
    if (style.display === "none") return false;
    if (style.visibility === "hidden") return false;
    if (textarea.disabled || textarea.readOnly) return false;
    return true;
  }
  function getReplyTextarea() {
    const selectors = [
      "textarea[name='message']",
      "textarea#message",
      "#message",
      "textarea[name='body']",
      "textarea.editor",
      "textarea.sceditor-textarea",
      ".sceditor-container textarea",
      "form[action*='action=post'] textarea",
      "form textarea[name='message']",
      "#quickReplyOptions textarea",
      "#quickreply textarea",
      "#quick_reply textarea",
      "textarea"
    ];
    for (const selector of selectors) {
      const textarea = document.querySelector(selector);
      if (isUsableTextarea(textarea)) return textarea;
    }
    return null;
  }
  function insertIntoReplyTextarea(text, prepend = false) {
    const ta = getReplyTextarea();
    if (!ta) return false;
    if (prepend) {
      ta.value = text + ta.value;
    } else {
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      ta.value = ta.value.slice(0, start) + text + ta.value.slice(end);
      const newPos = start + text.length;
      ta.selectionStart = ta.selectionEnd = newPos;
    }
    ta.dispatchEvent(new Event("input"));
    ta.focus();
    return true;
  }
  function getAllCodeBlocks() {
    return Array.from(document.querySelectorAll(".post code, .post pre, td.td_headerandpost code, td.td_headerandpost pre"));
  }
  function getAllQuoteBlocks() {
    return Array.from(document.querySelectorAll(".quoteheader, blockquote, .quote"));
  }
  function getNavLinks() {
    return {
      prev: document.querySelector('a[rel="prev"]') || null,
      next: document.querySelector('a[rel="next"]') || null
    };
  }

  // src/content/moduleManager.js
  var moduleStates = /* @__PURE__ */ new Map();
  var sharedApi = null;
  function buildApi(settings) {
    return {
      settings,
      storage: {
        get: (key) => chrome.storage.local.get(key),
        set: (items) => chrome.storage.local.set(items)
      },
      dom: domHelpers_exports,
      toast: Toast,
      modal: showModal,
      copy: copyToClipboard,
      download: downloadFile,
      bbcode: { parse },
      // Convenience: navigate to a dashboard section
      openDashboard: (section) => {
        chrome.runtime.sendMessage({ action: "openDashboard", section });
      },
      // Check if a module is active
      isModuleActive: (id) => {
        const entry = moduleStates.get(id);
        return entry?.state === "active";
      }
    };
  }
  var registeredModules = /* @__PURE__ */ new Map();
  function registerModule(mod) {
    if (!mod?.id) {
      console.warn("[BTT] Module missing id, skipping.");
      return;
    }
    registeredModules.set(mod.id, mod);
    if (!moduleStates.has(mod.id)) moduleStates.set(mod.id, { state: "unloaded", error: null, module: mod });
  }
  function getModuleState(id) {
    return moduleStates.get(id) || { state: "unloaded", error: null };
  }
  async function initModules(modules) {
    const settings = await getSettings();
    sharedApi = buildApi(settings);
    const enabled = new Set(settings.enabledModules || []);
    for (const mod of modules) {
      registerModule(mod);
      if (enabled.has(mod.id)) {
        await initModule(mod.id);
      } else {
        moduleStates.set(mod.id, { state: "disabled", error: null, module: mod });
      }
    }
    console.log(`[BTT] Initialized. Active: ${[...moduleStates.values()].filter((s) => s.state === "active").length}`);
  }
  async function initModule(id) {
    const entry = moduleStates.get(id);
    if (!entry) return;
    if (entry.state === "active" || entry.state === "loading") return;
    const mod = entry.module;
    moduleStates.set(id, { ...entry, state: "loading" });
    const DEV = false;
    const t0 = DEV ? performance.now() : 0;
    try {
      await mod.init(sharedApi);
      moduleStates.set(id, { ...entry, state: "active", error: null });
      if (DEV) console.log(`[BTT] ${id} init in ${(performance.now() - t0).toFixed(1)}ms`);
    } catch (err) {
      console.error(`[BTT] Module ${id} init failed:`, err);
      moduleStates.set(id, { ...entry, state: "error", error: err.message });
    }
  }
  async function destroyModule(id) {
    const entry = moduleStates.get(id);
    if (!entry || entry.state !== "active") return;
    try {
      await entry.module.destroy?.();
      moduleStates.set(id, { ...entry, state: "disabled", error: null });
    } catch (err) {
      console.error(`[BTT] Module ${id} destroy failed:`, err);
      moduleStates.set(id, { ...entry, state: "error", error: err.message });
    }
  }
  async function enableModule(id) {
    const entry = moduleStates.get(id);
    if (!entry) return;
    await setModuleEnabled(id, true);
    if (entry.state !== "active") await initModule(id);
  }
  async function disableModule(id) {
    const entry = moduleStates.get(id);
    if (!entry) return;
    await setModuleEnabled(id, false);
    if (entry.state === "active") await destroyModule(id);
  }

  // src/content/content.js
  init_storage();
  init_constants();
  init_sharedUI();

  // src/utils/theme.js
  init_constants();
  var DEFAULT_THEME_ID = "dark";
  var FORUM_THEME_STYLE_ID = "btt-forum-theme-style";
  var CSS_VAR_MAP = {
    bg: "--btt-bg",
    surface: "--btt-surface",
    surface2: "--btt-surface-2",
    text: "--btt-text",
    mutedText: "--btt-muted-text",
    border: "--btt-border",
    primary: "--btt-primary",
    primaryHover: "--btt-primary-hover",
    accent: "--btt-accent",
    success: "--btt-success",
    warning: "--btt-warning",
    danger: "--btt-danger",
    link: "--btt-link",
    inputBg: "--btt-input-bg",
    buttonBg: "--btt-button-bg",
    buttonText: "--btt-button-text",
    previewBg: "--btt-preview-bg",
    previewText: "--btt-preview-text"
  };
  var UI_CSS_VAR_MAP = {
    bg: "--btt-ui-bg",
    surface: "--btt-ui-surface",
    surface2: "--btt-ui-surface-2",
    text: "--btt-ui-text",
    mutedText: "--btt-ui-muted-text",
    border: "--btt-ui-border",
    primary: "--btt-ui-primary",
    primaryHover: "--btt-ui-primary-hover",
    accent: "--btt-ui-accent",
    success: "--btt-ui-success",
    warning: "--btt-ui-warning",
    danger: "--btt-ui-danger",
    link: "--btt-ui-link",
    inputBg: "--btt-ui-input-bg",
    buttonBg: "--btt-ui-button-bg",
    buttonText: "--btt-ui-button-text",
    previewBg: "--btt-ui-preview-bg",
    previewText: "--btt-ui-preview-text"
  };
  var FORUM_CSS_VAR_MAP = Object.fromEntries(
    Object.entries(CSS_VAR_MAP).map(([key, variable]) => [key, variable.replace("--btt-", "--btt-forum-")])
  );
  var FORUM_COLOR_GROUPS = [
    {
      label: "General Forum Colors",
      fields: [
        ["pageBg", "Page Background Color"],
        ["cardBg", "Forum/Card Background Color"],
        ["text", "Main Text Color"],
        ["mutedText", "Muted/Secondary Text Color"],
        ["border", "Border Color"],
        ["divider", "Divider Color"]
      ]
    },
    {
      label: "Link Colors",
      fields: [
        ["link", "Link Color"],
        ["linkVisited", "Visited Link Color"],
        ["linkHover", "Link Hover Color"],
        ["linkActive", "Active Link Color"]
      ]
    },
    {
      label: "Header / Table Colors",
      fields: [
        ["categoryHeaderBg", "Category Header Background"],
        ["categoryHeaderText", "Category Header Text"],
        ["boardHeaderBg", "Board Header Background"],
        ["boardHeaderText", "Board Header Text"],
        ["tableHeaderBg", "Table Header Background"],
        ["tableHeaderText", "Table Header Text"]
      ]
    },
    {
      label: "Post Colors",
      fields: [
        ["postBg", "Post Background Color"],
        ["postAltBg", "Alternate Post Background Color"],
        ["postTitle", "Post Title Color"],
        ["postMeta", "Post Meta Text Color"],
        ["signatureText", "Signature Text Color"]
      ]
    },
    {
      label: "Quote / Code Colors",
      fields: [
        ["quoteBg", "Quote Box Background"],
        ["quoteText", "Quote Box Text Color"],
        ["quoteBorder", "Quote Box Border Color"],
        ["codeBg", "Code Box Background"],
        ["codeText", "Code Text Color"],
        ["codeBorder", "Code Box Border Color"]
      ]
    },
    {
      label: "Button / Input Colors",
      fields: [
        ["buttonBg", "Button Background Color"],
        ["buttonText", "Button Text Color"],
        ["buttonHoverBg", "Button Hover Background"],
        ["inputBg", "Input Background Color"],
        ["inputText", "Input Text Color"],
        ["inputBorder", "Input Border Color"]
      ]
    },
    {
      label: "Status / Highlight Colors",
      fields: [
        ["selectedBg", "Selected Text Background"],
        ["selectedText", "Selected Text Color"],
        ["newPostHighlight", "New Post Highlight Color"],
        ["warning", "Warning Color"],
        ["success", "Success Color"],
        ["danger", "Error/Danger Color"],
        ["info", "Info Color"]
      ]
    },
    {
      label: "Bitcointalk Toolkit Specific Colors",
      fields: [
        ["merit", "Merit Color"],
        ["trustPositive", "Positive Trust Color"],
        ["trustNeutral", "Neutral Trust Color"],
        ["trustNegative", "Negative Trust Color"],
        ["dtBadge", "DT Badge Color"],
        ["dt1Badge", "DT1 Badge Color"],
        ["dt2Badge", "DT2 Badge Color"],
        ["notificationBadge", "Notification Badge Color"],
        ["tooltipBg", "Tooltip Background"],
        ["tooltipText", "Tooltip Text Color"]
      ]
    }
  ];
  var FORUM_SKIN_PRESETS = [
    {
      id: "original",
      name: "Default Bitcointalk",
      colors: { ...DEFAULT_FORUM_CUSTOM_COLORS },
      forumTheme: "original"
    },
    {
      id: "classic-light",
      name: "Classic Light",
      colors: {
        ...DEFAULT_FORUM_CUSTOM_COLORS,
        pageBg: "#f3f4f6",
        cardBg: "#ffffff",
        text: "#111827",
        mutedText: "#6b7280",
        link: "#1d4ed8",
        linkVisited: "#6d28d9",
        linkHover: "#b45309",
        categoryHeaderBg: "#e5e7eb",
        boardHeaderBg: "#eef2f7",
        tableHeaderBg: "#f9fafb",
        postBg: "#ffffff",
        postAltBg: "#f8fafc",
        buttonBg: "#e5e7eb",
        buttonHoverBg: "#d1d5db"
      }
    },
    {
      id: "dark",
      name: "Dark Mode",
      colors: {
        ...DEFAULT_FORUM_CUSTOM_COLORS,
        pageBg: "#0f1117",
        cardBg: "#1a1d23",
        text: "#e5e7eb",
        mutedText: "#9ca3af",
        border: "#2d3340",
        divider: "#374151",
        link: "#60a5fa",
        linkVisited: "#a78bfa",
        linkHover: "#fbbf24",
        categoryHeaderBg: "#111827",
        categoryHeaderText: "#f9fafb",
        boardHeaderBg: "#1f2937",
        boardHeaderText: "#f9fafb",
        tableHeaderBg: "#111827",
        tableHeaderText: "#f9fafb",
        postBg: "#1a1d23",
        postAltBg: "#20242c",
        postTitle: "#f3f4f6",
        postMeta: "#9ca3af",
        signatureText: "#9ca3af",
        quoteBg: "#111827",
        quoteText: "#e5e7eb",
        quoteBorder: "#374151",
        codeBg: "#0b1020",
        codeText: "#e5e7eb",
        codeBorder: "#374151",
        buttonBg: "#252a35",
        buttonText: "#ffffff",
        buttonHoverBg: "#374151",
        inputBg: "#111827",
        inputText: "#f9fafb",
        inputBorder: "#374151",
        selectedBg: "#1d4ed8",
        selectedText: "#ffffff"
      }
    },
    {
      id: "amoled",
      name: "AMOLED Black",
      colors: {
        ...DEFAULT_FORUM_CUSTOM_COLORS,
        pageBg: "#000000",
        cardBg: "#050505",
        text: "#f5f5f5",
        mutedText: "#b8b8b8",
        border: "#2a2a2a",
        divider: "#242424",
        link: "#4da3ff",
        linkVisited: "#b48cff",
        linkHover: "#f7931a",
        categoryHeaderBg: "#000000",
        categoryHeaderText: "#ffffff",
        boardHeaderBg: "#0a0a0a",
        boardHeaderText: "#ffffff",
        tableHeaderBg: "#050505",
        tableHeaderText: "#ffffff",
        postBg: "#000000",
        postAltBg: "#090909",
        postTitle: "#ffffff",
        postMeta: "#b8b8b8",
        signatureText: "#a0a0a0",
        quoteBg: "#080808",
        quoteText: "#eeeeee",
        quoteBorder: "#303030",
        codeBg: "#050505",
        codeText: "#f0f0f0",
        codeBorder: "#303030",
        buttonBg: "#111111",
        buttonText: "#ffffff",
        buttonHoverBg: "#242424",
        inputBg: "#050505",
        inputText: "#ffffff",
        inputBorder: "#333333"
      }
    },
    {
      id: "sepia",
      name: "Sepia Reading",
      colors: {
        ...DEFAULT_FORUM_CUSTOM_COLORS,
        pageBg: "#f4ecd8",
        cardBg: "#fbf4e3",
        text: "#33291c",
        mutedText: "#7a6548",
        border: "#d2bd94",
        divider: "#decba5",
        link: "#6b4e16",
        linkVisited: "#7c4a1e",
        linkHover: "#b7791f",
        categoryHeaderBg: "#d8c49a",
        categoryHeaderText: "#2f2518",
        boardHeaderBg: "#ead9b8",
        boardHeaderText: "#2f2518",
        tableHeaderBg: "#f0e1c3",
        tableHeaderText: "#2f2518",
        postBg: "#fffaf0",
        postAltBg: "#f7edda",
        quoteBg: "#efe2c6",
        codeBg: "#ead9b8",
        buttonBg: "#ead9b8",
        buttonHoverBg: "#decba5",
        inputBg: "#fffaf0"
      }
    },
    {
      id: "soft-blue",
      name: "Soft Blue",
      colors: {
        ...DEFAULT_FORUM_CUSTOM_COLORS,
        pageBg: "#eef6ff",
        cardBg: "#f8fbff",
        text: "#172033",
        mutedText: "#5d708c",
        border: "#bfd5ee",
        divider: "#d6e7f8",
        link: "#1f65c1",
        linkVisited: "#5f4bb6",
        linkHover: "#0f766e",
        categoryHeaderBg: "#cfe4ff",
        categoryHeaderText: "#172033",
        boardHeaderBg: "#dbeafe",
        boardHeaderText: "#172033",
        tableHeaderBg: "#eaf4ff",
        tableHeaderText: "#172033",
        postBg: "#ffffff",
        postAltBg: "#f1f7ff",
        quoteBg: "#eaf4ff",
        codeBg: "#e8f1ff",
        buttonBg: "#dbeafe",
        buttonHoverBg: "#bfdbfe",
        inputBg: "#ffffff"
      }
    },
    {
      id: "green-terminal",
      name: "Green Terminal",
      colors: {
        ...DEFAULT_FORUM_CUSTOM_COLORS,
        pageBg: "#031006",
        cardBg: "#071a0b",
        text: "#d5ffd9",
        mutedText: "#85c98e",
        border: "#1f5e2c",
        divider: "#174722",
        link: "#70ff88",
        linkVisited: "#53d86a",
        linkHover: "#baffc4",
        categoryHeaderBg: "#06270e",
        categoryHeaderText: "#d5ffd9",
        boardHeaderBg: "#0a3313",
        boardHeaderText: "#d5ffd9",
        tableHeaderBg: "#071a0b",
        tableHeaderText: "#d5ffd9",
        postBg: "#061607",
        postAltBg: "#091f0d",
        postTitle: "#d5ffd9",
        postMeta: "#85c98e",
        signatureText: "#76b982",
        quoteBg: "#031006",
        quoteText: "#d5ffd9",
        quoteBorder: "#1f5e2c",
        codeBg: "#000000",
        codeText: "#7cff8d",
        codeBorder: "#1f5e2c",
        buttonBg: "#0a3313",
        buttonText: "#d5ffd9",
        buttonHoverBg: "#145222",
        inputBg: "#031006",
        inputText: "#d5ffd9",
        inputBorder: "#1f5e2c",
        selectedBg: "#1f5e2c",
        selectedText: "#ffffff",
        success: "#70ff88",
        info: "#53d86a"
      }
    },
    {
      id: "bitcoin",
      name: "Bitcoin Orange",
      colors: {
        ...DEFAULT_FORUM_CUSTOM_COLORS,
        pageBg: "#17120b",
        cardBg: "#24180d",
        text: "#fff7ed",
        mutedText: "#f1c38a",
        border: "#5b3414",
        divider: "#704616",
        link: "#fbbf24",
        linkVisited: "#fdba74",
        linkHover: "#ffad3b",
        categoryHeaderBg: "#3a2410",
        categoryHeaderText: "#fff7ed",
        boardHeaderBg: "#4a2c10",
        boardHeaderText: "#fff7ed",
        tableHeaderBg: "#302012",
        tableHeaderText: "#fff7ed",
        postBg: "#24180d",
        postAltBg: "#302012",
        postTitle: "#fff7ed",
        postMeta: "#f1c38a",
        signatureText: "#e2b978",
        quoteBg: "#1f160c",
        quoteText: "#fff7ed",
        quoteBorder: "#5b3414",
        codeBg: "#1b1209",
        codeText: "#fff7ed",
        codeBorder: "#5b3414",
        buttonBg: "#3a2410",
        buttonText: "#fff7ed",
        buttonHoverBg: "#5b3414",
        inputBg: "#1f160c",
        inputText: "#fff7ed",
        inputBorder: "#5b3414",
        selectedBg: "#f7931a",
        selectedText: "#111111",
        merit: "#facc15"
      }
    },
    {
      id: "gray-compact",
      name: "Gray Compact",
      colors: {
        ...DEFAULT_FORUM_CUSTOM_COLORS,
        pageBg: "#d8dbe2",
        cardBg: "#eef0f4",
        text: "#1f2937",
        mutedText: "#4b5563",
        border: "#aeb5c1",
        divider: "#c8cdd6",
        link: "#1f5d9d",
        linkVisited: "#5b4a91",
        linkHover: "#9a5b18",
        categoryHeaderBg: "#bfc5cf",
        categoryHeaderText: "#1f2937",
        boardHeaderBg: "#d4d8df",
        boardHeaderText: "#1f2937",
        tableHeaderBg: "#e5e7eb",
        tableHeaderText: "#1f2937",
        postBg: "#f4f5f7",
        postAltBg: "#e9edf2",
        quoteBg: "#e5e7eb",
        codeBg: "#dde2e8",
        buttonBg: "#d1d5db",
        buttonHoverBg: "#bfc5cf"
      }
    }
  ];
  var FORUM_CUSTOM_CSS_VAR_MAP = {
    pageBg: "--btt-page-bg",
    cardBg: "--btt-card-bg",
    text: "--btt-text",
    mutedText: "--btt-muted-text",
    border: "--btt-border",
    divider: "--btt-divider",
    link: "--btt-link",
    linkVisited: "--btt-link-visited",
    linkHover: "--btt-link-hover",
    linkActive: "--btt-link-active",
    categoryHeaderBg: "--btt-category-header-bg",
    categoryHeaderText: "--btt-category-header-text",
    boardHeaderBg: "--btt-board-header-bg",
    boardHeaderText: "--btt-board-header-text",
    tableHeaderBg: "--btt-table-header-bg",
    tableHeaderText: "--btt-table-header-text",
    postBg: "--btt-post-bg",
    postAltBg: "--btt-post-alt-bg",
    postTitle: "--btt-post-title",
    postMeta: "--btt-post-meta",
    signatureText: "--btt-signature-text",
    quoteBg: "--btt-quote-bg",
    quoteText: "--btt-quote-text",
    quoteBorder: "--btt-quote-border",
    codeBg: "--btt-code-bg",
    codeText: "--btt-code-text",
    codeBorder: "--btt-code-border",
    buttonBg: "--btt-button-bg",
    buttonText: "--btt-button-text",
    buttonHoverBg: "--btt-button-hover-bg",
    inputBg: "--btt-input-bg",
    inputText: "--btt-input-text",
    inputBorder: "--btt-input-border",
    selectedBg: "--btt-selected-bg",
    selectedText: "--btt-selected-text",
    newPostHighlight: "--btt-new-post-highlight",
    warning: "--btt-warning",
    success: "--btt-success",
    danger: "--btt-danger",
    info: "--btt-info",
    merit: "--btt-merit",
    trustPositive: "--btt-trust-positive",
    trustNeutral: "--btt-trust-neutral",
    trustNegative: "--btt-trust-negative",
    dtBadge: "--btt-dt-badge",
    dt1Badge: "--btt-dt1-badge",
    dt2Badge: "--btt-dt2-badge",
    notificationBadge: "--btt-notification-badge",
    tooltipBg: "--btt-tooltip-bg",
    tooltipText: "--btt-tooltip-text"
  };
  var FORUM_CUSTOM_ALIASES = {
    "--btt-forum-bg": "--btt-page-bg",
    "--btt-forum-surface": "--btt-card-bg",
    "--btt-forum-surface-2": "--btt-post-alt-bg",
    "--btt-forum-text": "--btt-text",
    "--btt-forum-muted-text": "--btt-muted-text",
    "--btt-forum-border": "--btt-border",
    "--btt-forum-link": "--btt-link",
    "--btt-forum-primary": "--btt-link",
    "--btt-forum-input-bg": "--btt-input-bg",
    "--btt-forum-button-bg": "--btt-button-bg",
    "--btt-forum-button-text": "--btt-button-text"
  };
  var HEX_RE = /^#[0-9a-f]{6}$/i;
  var LEGACY_ALIASES = {
    "--bg": "--btt-bg",
    "--bg-panel": "--btt-surface",
    "--bg-card": "--btt-surface-2",
    "--bg-input": "--btt-input-bg",
    "--border": "--btt-border",
    "--text": "--btt-text",
    "--text-secondary": "--btt-muted-text",
    "--accent": "--btt-primary",
    "--accent-2": "--btt-accent",
    "--success": "--btt-success",
    "--danger": "--btt-danger",
    "--warning": "--btt-warning"
  };
  function setThemeVariables(values, map, root) {
    Object.entries(map).forEach(([key, variable]) => {
      root.style.setProperty(variable, values[key]);
    });
  }
  function normalizeForumCustomColors(colors = {}) {
    const normalized = { ...DEFAULT_FORUM_CUSTOM_COLORS };
    Object.keys(DEFAULT_FORUM_CUSTOM_COLORS).forEach((key) => {
      const value = String(colors?.[key] || "").trim();
      if (HEX_RE.test(value)) normalized[key] = value.toLowerCase();
    });
    return normalized;
  }
  function validateForumCustomColors(colors) {
    if (!colors || typeof colors !== "object" || Array.isArray(colors)) {
      throw new Error("Theme JSON must be an object.");
    }
    Object.keys(colors).forEach((key) => {
      if (!(key in DEFAULT_FORUM_CUSTOM_COLORS)) return;
      if (!HEX_RE.test(String(colors[key]).trim())) {
        throw new Error(`Invalid color for ${key}. Use #rrggbb format.`);
      }
    });
    return normalizeForumCustomColors(colors);
  }
  function applyForumCustomVariables(colors, root) {
    const values = normalizeForumCustomColors(colors);
    setThemeVariables(values, FORUM_CUSTOM_CSS_VAR_MAP, root);
    Object.entries(FORUM_CUSTOM_ALIASES).forEach(([alias, variable]) => {
      root.style.setProperty(alias, `var(${variable})`);
    });
    return values;
  }
  function resolveThemeId(themeId) {
    return THEME_DEFS[themeId] ? themeId : DEFAULT_THEME_ID;
  }
  function resolveForumThemeId(themeId) {
    if (themeId === "original") return "original";
    if (themeId === "custom") return "custom";
    return resolveThemeId(themeId);
  }
  function getTheme(themeId) {
    const id = resolveThemeId(themeId);
    return { id, ...THEME_DEFS[id] };
  }
  function applyTheme(themeId, root = document.documentElement) {
    if (!root) return getTheme(themeId);
    const theme = getTheme(themeId);
    const { values } = theme;
    const lightish = ["light", "forum-gray", "soft-blue", "sepia"].includes(theme.id);
    root.dataset.bttTheme = theme.id;
    root.dataset.theme = lightish ? "light" : "dark";
    root.classList.toggle("btt-theme-lightish", lightish);
    root.classList.toggle("btt-theme-high-contrast", theme.id === "high-contrast");
    setThemeVariables(values, CSS_VAR_MAP, root);
    setThemeVariables(values, UI_CSS_VAR_MAP, root);
    Object.entries(LEGACY_ALIASES).forEach(([alias, variable]) => {
      root.style.setProperty(alias, `var(${variable})`);
    });
    return theme;
  }
  function applyThemeFromSettings(settings, root = document.documentElement) {
    const legacyTheme = settings?.dashboardDarkMode === false ? "light" : "dark";
    return applyTheme(settings?.toolkitTheme || settings?.theme || legacyTheme, root);
  }
  function ensureForumThemeStyle() {
    if (document.getElementById(FORUM_THEME_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = FORUM_THEME_STYLE_ID;
    style.textContent = `
html.btt-forum-theme body,
html.btt-forum-theme #bodyarea,
html.btt-forum-theme #top_section,
html.btt-forum-theme #middle_section,
html.btt-forum-theme #bot_section,
html.btt-forum-theme #footerarea,
html.btt-forum-theme .windowbg,
html.btt-forum-theme .windowbg2,
html.btt-forum-theme .windowbg3,
html.btt-forum-theme .approvebg,
html.btt-forum-theme .approvebg2 {
  background: var(--btt-forum-bg) !important;
  color: var(--btt-forum-text) !important;
}

html.btt-forum-theme table,
html.btt-forum-theme td,
html.btt-forum-theme th,
html.btt-forum-theme .tborder,
html.btt-forum-theme .bordercolor {
  border-color: var(--btt-forum-border) !important;
  color: var(--btt-forum-text) !important;
}

html.btt-forum-theme td.windowbg,
html.btt-forum-theme td.windowbg2,
html.btt-forum-theme td.windowbg3,
html.btt-forum-theme tr.windowbg td,
html.btt-forum-theme tr.windowbg2 td,
html.btt-forum-theme .post,
html.btt-forum-theme .post_wrapper,
html.btt-forum-theme .poster_info {
  background: var(--btt-forum-surface) !important;
  color: var(--btt-forum-text) !important;
  border-color: var(--btt-forum-border) !important;
}

html.btt-forum-theme .catbg,
html.btt-forum-theme .catbg2,
html.btt-forum-theme .cat_bg,
html.btt-forum-theme .cat_bar,
html.btt-forum-theme .titlebg,
html.btt-forum-theme .titlebg2,
html.btt-forum-theme .maintab_first,
html.btt-forum-theme .maintab_back,
html.btt-forum-theme .maintab_last,
html.btt-forum-theme .mirrortab_first,
html.btt-forum-theme .mirrortab_back,
html.btt-forum-theme .mirrortab_last,
html.btt-forum-theme #menu_main,
html.btt-forum-theme #menu_main td {
  background: var(--btt-forum-surface-2) !important;
  color: var(--btt-forum-text) !important;
  border-color: var(--btt-forum-border) !important;
}

html.btt-forum-theme a,
html.btt-forum-theme a:link,
html.btt-forum-theme .nav {
  color: var(--btt-forum-link) !important;
}

html.btt-forum-theme a:visited {
  color: color-mix(in srgb, var(--btt-forum-link) 72%, var(--btt-forum-muted-text)) !important;
}

html.btt-forum-theme input,
html.btt-forum-theme textarea,
html.btt-forum-theme select,
html.btt-forum-theme button {
  background: var(--btt-forum-input-bg) !important;
  color: var(--btt-forum-text) !important;
  border-color: var(--btt-forum-border) !important;
}

html.btt-forum-theme input[type="button"],
html.btt-forum-theme input[type="submit"],
html.btt-forum-theme button {
  background: var(--btt-forum-button-bg) !important;
  color: var(--btt-forum-button-text) !important;
}

html.btt-forum-theme blockquote,
html.btt-forum-theme .quote,
html.btt-forum-theme .code,
html.btt-forum-theme pre {
  background: var(--btt-forum-surface-2) !important;
  color: var(--btt-forum-text) !important;
  border-color: var(--btt-forum-border) !important;
}

html.btt-forum-theme .quoteheader,
html.btt-forum-theme .codeheader,
html.btt-forum-theme .smalltext,
html.btt-forum-theme .middletext {
  color: var(--btt-forum-muted-text) !important;
}

html.btt-forum-theme .subject,
html.btt-forum-theme .subject a {
  color: var(--btt-forum-primary) !important;
}

html.btt-forum-theme hr,
html.btt-forum-theme .hrcolor {
  border-color: var(--btt-forum-border) !important;
  background: var(--btt-forum-border) !important;
}

html.btt-forum-theme img {
  filter: none !important;
}

html.btt-forum-theme.btt-forum-custom body,
html.btt-forum-theme.btt-forum-custom #bodyarea,
html.btt-forum-theme.btt-forum-custom #top_section,
html.btt-forum-theme.btt-forum-custom #middle_section,
html.btt-forum-theme.btt-forum-custom #bot_section,
html.btt-forum-theme.btt-forum-custom #footerarea {
  background: var(--btt-page-bg) !important;
  color: var(--btt-text) !important;
}

html.btt-forum-theme.btt-forum-custom .windowbg,
html.btt-forum-theme.btt-forum-custom .windowbg3,
html.btt-forum-theme.btt-forum-custom td.windowbg,
html.btt-forum-theme.btt-forum-custom tr.windowbg td,
html.btt-forum-theme.btt-forum-custom .post,
html.btt-forum-theme.btt-forum-custom .post_wrapper,
html.btt-forum-theme.btt-forum-custom .poster_info {
  background: var(--btt-post-bg) !important;
  color: var(--btt-text) !important;
}

html.btt-forum-theme.btt-forum-custom .windowbg2,
html.btt-forum-theme.btt-forum-custom td.windowbg2,
html.btt-forum-theme.btt-forum-custom tr.windowbg2 td,
html.btt-forum-theme.btt-forum-custom .approvebg,
html.btt-forum-theme.btt-forum-custom .approvebg2 {
  background: var(--btt-post-alt-bg) !important;
  color: var(--btt-text) !important;
}

html.btt-forum-theme.btt-forum-custom table,
html.btt-forum-theme.btt-forum-custom td,
html.btt-forum-theme.btt-forum-custom th,
html.btt-forum-theme.btt-forum-custom .tborder,
html.btt-forum-theme.btt-forum-custom .bordercolor {
  border-color: var(--btt-border) !important;
}

html.btt-forum-theme.btt-forum-custom hr,
html.btt-forum-theme.btt-forum-custom .hrcolor {
  border-color: var(--btt-divider) !important;
  background: var(--btt-divider) !important;
}

html.btt-forum-theme.btt-forum-custom a,
html.btt-forum-theme.btt-forum-custom a:link,
html.btt-forum-theme.btt-forum-custom .nav {
  color: var(--btt-link) !important;
}

html.btt-forum-theme.btt-forum-custom a:visited {
  color: var(--btt-link-visited) !important;
}

html.btt-forum-theme.btt-forum-custom a:hover {
  color: var(--btt-link-hover) !important;
}

html.btt-forum-theme.btt-forum-custom a:active {
  color: var(--btt-link-active) !important;
}

html.btt-forum-theme.btt-forum-custom .catbg,
html.btt-forum-theme.btt-forum-custom .catbg2,
html.btt-forum-theme.btt-forum-custom .cat_bg,
html.btt-forum-theme.btt-forum-custom .cat_bar {
  background: var(--btt-category-header-bg) !important;
  color: var(--btt-category-header-text) !important;
}

html.btt-forum-theme.btt-forum-custom .titlebg,
html.btt-forum-theme.btt-forum-custom .titlebg2 {
  background: var(--btt-board-header-bg) !important;
  color: var(--btt-board-header-text) !important;
}

html.btt-forum-theme.btt-forum-custom thead,
html.btt-forum-theme.btt-forum-custom th,
html.btt-forum-theme.btt-forum-custom .table_grid th {
  background: var(--btt-table-header-bg) !important;
  color: var(--btt-table-header-text) !important;
}

html.btt-forum-theme.btt-forum-custom .subject,
html.btt-forum-theme.btt-forum-custom .subject a {
  color: var(--btt-post-title) !important;
}

html.btt-forum-theme.btt-forum-custom .smalltext,
html.btt-forum-theme.btt-forum-custom .middletext,
html.btt-forum-theme.btt-forum-custom .modified {
  color: var(--btt-post-meta) !important;
}

html.btt-forum-theme.btt-forum-custom .signature,
html.btt-forum-theme.btt-forum-custom td.signature {
  color: var(--btt-signature-text) !important;
}

html.btt-forum-theme.btt-forum-custom blockquote,
html.btt-forum-theme.btt-forum-custom .quote {
  background: var(--btt-quote-bg) !important;
  color: var(--btt-quote-text) !important;
  border-color: var(--btt-quote-border) !important;
}

html.btt-forum-theme.btt-forum-custom .quoteheader {
  color: var(--btt-quote-text) !important;
}

html.btt-forum-theme.btt-forum-custom .code,
html.btt-forum-theme.btt-forum-custom pre,
html.btt-forum-theme.btt-forum-custom code {
  background: var(--btt-code-bg) !important;
  color: var(--btt-code-text) !important;
  border-color: var(--btt-code-border) !important;
}

html.btt-forum-theme.btt-forum-custom input,
html.btt-forum-theme.btt-forum-custom textarea,
html.btt-forum-theme.btt-forum-custom select {
  background: var(--btt-input-bg) !important;
  color: var(--btt-input-text) !important;
  border-color: var(--btt-input-border) !important;
}

html.btt-forum-theme.btt-forum-custom input[type="button"],
html.btt-forum-theme.btt-forum-custom input[type="submit"],
html.btt-forum-theme.btt-forum-custom button {
  background: var(--btt-button-bg) !important;
  color: var(--btt-button-text) !important;
  border-color: var(--btt-input-border) !important;
}

html.btt-forum-theme.btt-forum-custom input[type="button"]:hover,
html.btt-forum-theme.btt-forum-custom input[type="submit"]:hover,
html.btt-forum-theme.btt-forum-custom button:hover {
  background: var(--btt-button-hover-bg) !important;
}

html.btt-forum-theme.btt-forum-custom ::selection {
  background: var(--btt-selected-bg) !important;
  color: var(--btt-selected-text) !important;
}

html.btt-forum-theme.btt-forum-custom .highlight,
html.btt-forum-theme.btt-forum-custom .btt-keyword-highlight {
  background: var(--btt-new-post-highlight) !important;
  color: var(--btt-text) !important;
}

html.btt-forum-theme.btt-forum-custom .btt-post-merit-badge {
  color: var(--btt-merit) !important;
  border-color: var(--btt-merit) !important;
}

html.btt-forum-theme.btt-forum-custom .btt-trust-dt1 {
  background: var(--btt-dt1-badge) !important;
}

html.btt-forum-theme.btt-forum-custom .btt-trust-dt2 {
  background: var(--btt-dt2-badge) !important;
}

html.btt-forum-theme.btt-forum-custom .btt-trust-badge {
  border-color: var(--btt-dt-badge) !important;
}

html.btt-forum-theme.btt-forum-custom .btt-phish-warn {
  border-bottom-color: var(--btt-danger) !important;
}

html.btt-forum-theme.btt-forum-custom .btt-phish-tooltip,
html.btt-forum-theme.btt-forum-custom .btt-link-preview-tooltip,
html.btt-forum-theme.btt-forum-custom .btt-ext-link-tooltip {
  background: var(--btt-tooltip-bg) !important;
  color: var(--btt-tooltip-text) !important;
  border-color: var(--btt-border) !important;
}

html.btt-forum-theme.btt-forum-high-contrast a,
html.btt-forum-theme.btt-forum-high-contrast .subject,
html.btt-forum-theme.btt-forum-high-contrast .subject a {
  text-decoration: underline !important;
}

html.btt-forum-theme.btt-forum-high-contrast *:focus-visible {
  outline: 2px solid var(--btt-forum-primary) !important;
  outline-offset: 2px !important;
}
`;
    (document.head || document.documentElement).appendChild(style);
  }
  function applyBitcointalkForumTheme(settings, root = document.documentElement) {
    const themeId = resolveForumThemeId(settings?.forumTheme || "original");
    if (themeId === "original") {
      root.classList.remove("btt-forum-theme", "btt-forum-high-contrast", "btt-forum-custom");
      delete root.dataset.bttForumTheme;
      document.getElementById(FORUM_THEME_STYLE_ID)?.remove();
      return null;
    }
    if (themeId === "custom") {
      const colors = applyForumCustomVariables(settings?.forumCustomColors, root);
      ensureForumThemeStyle();
      root.classList.add("btt-forum-theme", "btt-forum-custom");
      root.classList.remove("btt-forum-high-contrast");
      root.dataset.bttForumTheme = "custom";
      return { id: "custom", name: "Custom Forum Theme", values: colors };
    }
    const theme = getTheme(themeId);
    setThemeVariables(theme.values, FORUM_CSS_VAR_MAP, root);
    ensureForumThemeStyle();
    root.classList.add("btt-forum-theme");
    root.classList.remove("btt-forum-custom");
    root.classList.toggle("btt-forum-high-contrast", theme.id === "high-contrast");
    root.dataset.bttForumTheme = theme.id;
    return theme;
  }

  // src/modules/darkMode.js
  var STYLE_ID = "btt-dark-mode-style";
  var DARK_CSS = `
html.btt-dark body,
html.btt-dark #bodyarea,
html.btt-dark .windowbg,
html.btt-dark .windowbg2,
html.btt-dark #top_section,
html.btt-dark #middle_section,
html.btt-dark #bot_section {
  background: #0f1117 !important;
  color: #e5e7eb !important;
}
html.btt-dark table, html.btt-dark td, html.btt-dark th {
  background: #1a1d23 !important;
  border-color: #2d3340 !important;
  color: #e5e7eb !important;
}
html.btt-dark .cat_bg, html.btt-dark .catbg, html.btt-dark .catbg2 {
  background: #1e2530 !important;
}
html.btt-dark .titlebg, html.btt-dark .titlebg2 {
  background: #1e2c40 !important;
}
html.btt-dark a { color: #60a5fa !important; }
html.btt-dark a:visited { color: #a78bfa !important; }
html.btt-dark input, html.btt-dark textarea, html.btt-dark select {
  background: #1e2025 !important;
  color: #e5e7eb !important;
  border-color: #2d3340 !important;
}
html.btt-dark .post { background: #1a1d23 !important; }
html.btt-dark .quoteheader { background: #252a35 !important; color: #9ca3af !important; }
html.btt-dark blockquote, html.btt-dark .quote {
  background: #1e2530 !important;
  border-color: #4b5563 !important;
  color: #d1d5db !important;
}
html.btt-dark code, html.btt-dark pre {
  background: #111827 !important;
  color: #86efac !important;
  border-color: #374151 !important;
}
html.btt-dark .subject { color: #93c5fd !important; }
html.btt-dark hr { border-color: #2d3340 !important; }
html.btt-dark .poster_info { background: #161a21 !important; border-color: #2d3340 !important; }
html.btt-dark #menu_main, html.btt-dark #menu_main td { background: #111520 !important; }
html.btt-dark .nav { color: #9ca3af !important; }
/* Images \u2014 never darken or filter; give transparent PNGs a white backing */
html.btt-dark img { background-color: #fff !important; filter: none !important; }
/* Compact mode */
html.btt-compact .post { padding: 4px !important; }
html.btt-compact .poster_info { min-width: 80px !important; }
`;
  var darkMode_default = {
    id: "darkMode",
    name: "Dark Mode",
    description: "Apply a dark theme to all Bitcointalk pages.",
    category: "Layout & Reading",
    defaultEnabled: false,
    async init(api) {
      const settings = await api.settings;
      if (settings.darkMode) this._apply();
    },
    destroy() {
      this._remove();
    },
    setEnabled(on) {
      if (on) this._apply();
      else this._remove();
    },
    _apply() {
      if (!document.getElementById(STYLE_ID)) {
        const style = document.createElement("style");
        style.id = STYLE_ID;
        style.textContent = DARK_CSS;
        document.head.appendChild(style);
      }
      document.documentElement.classList.add("btt-dark");
    },
    _remove() {
      document.getElementById(STYLE_ID)?.remove();
      document.documentElement.classList.remove("btt-dark");
    },
    renderDashboardPanel(container, api) {
      container.innerHTML = `
      <div class="btt-panel">
        <p>Applies a dark theme to all Bitcointalk pages. Toggle from the popup or the floating FAB menu.</p>
        <p style="font-size:12px;color:var(--text-secondary,#aaa)">
          The dark theme targets the main layout, posts, quotes, code blocks, navigation, and form inputs.
        </p>
      </div>
    `;
    }
  };

  // src/modules/codeCopyFixer.js
  init_sharedUI();
  var CODE_BOX_SELECTOR = [
    "div.code",
    ".code",
    "pre",
    "code",
    ".bbc_code",
    ".post code",
    ".post pre",
    "td.td_headerandpost code",
    "td.td_headerandpost pre",
    "td.td_headerandpost div.code"
  ].join(",");
  function isInjectedUi(el) {
    return !!el.closest(".btt-code-copy-btn, .btt-code-copy-wrapper, #btt-launcher, #btt-toast-container");
  }
  function isLikelyCodeBox(el) {
    if (!el || isInjectedUi(el)) return false;
    if (el.classList?.contains("code") || el.classList?.contains("bbc_code")) return true;
    if (el.tagName === "PRE") return true;
    if (el.tagName === "CODE") {
      if (el.closest("pre, div.code, .bbc_code")) return false;
      const text = (el.textContent || "").trim();
      const rect = el.getBoundingClientRect();
      return text.length > 20 || rect.width > 220 || text.includes("\n");
    }
    return false;
  }
  function getCopyText(codeBox) {
    const clone = codeBox.cloneNode(true);
    clone.querySelectorAll(".btt-code-copy-btn").forEach((btn) => btn.remove());
    return (clone.textContent || "").replace(/\u00a0/g, " ").trimEnd();
  }
  var codeCopyFixer_default = {
    id: "codeCopyFixer",
    name: "Code Copy Fixer",
    description: 'Adds a one-click "Copy" button to every code block. Shows a toast on copy.',
    category: "Layout & Reading",
    defaultEnabled: true,
    _observer: null,
    _scanTimer: null,
    init() {
      this._processAll();
      this._observer = new MutationObserver((mutations) => {
        if (mutations.some((m) => Array.from(m.addedNodes).some((node) => node.nodeType === 1 && !isInjectedUi(node)))) {
          this._scheduleScan();
        }
      });
      this._observer.observe(document.body, { childList: true, subtree: true });
    },
    destroy() {
      this._observer?.disconnect();
      this._observer = null;
      clearTimeout(this._scanTimer);
      this._scanTimer = null;
      document.querySelectorAll(".btt-code-copy-btn").forEach((btn) => btn.remove());
      document.querySelectorAll('[data-btt-code-copy-processed="1"]').forEach((el) => {
        delete el.dataset.bttCodeCopyProcessed;
        el.classList.remove("btt-code-copy-wrapper");
      });
    },
    _scheduleScan() {
      clearTimeout(this._scanTimer);
      this._scanTimer = setTimeout(() => this._processAll(), 350);
    },
    _processAll() {
      document.querySelectorAll(CODE_BOX_SELECTOR).forEach((el) => {
        const codeBox = this._resolveCodeBox(el);
        if (!codeBox || !isLikelyCodeBox(codeBox)) return;
        if (codeBox.dataset.bttCodeCopyProcessed === "1") return;
        if (codeBox.querySelector(":scope > .btt-code-copy-btn")) return;
        this._addCopyButton(codeBox);
      });
    },
    _resolveCodeBox(el) {
      if (!el) return null;
      const outerCode = el.closest("div.code, .bbc_code, pre");
      return outerCode || el;
    },
    _addCopyButton(codeBox) {
      codeBox.dataset.bttCodeCopyProcessed = "1";
      codeBox.classList.add("btt-code-copy-wrapper");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btt-code-copy-btn";
      btn.textContent = "Copy";
      btn.title = "Copy code";
      btn.setAttribute("aria-label", "Copy code to clipboard");
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        const ok = await copyToClipboard(getCopyText(codeBox));
        if (!ok) return;
        btn.textContent = "Copied!";
        btn.classList.add("copied");
        setTimeout(() => {
          if (!btn.isConnected) return;
          btn.textContent = "Copy";
          btn.classList.remove("copied");
        }, 1500);
      });
      codeBox.appendChild(btn);
    },
    renderDashboardPanel(container) {
      container.innerHTML = `
      <div class="btt-panel">
        <p>Adds a <strong>Copy</strong> button inside every Bitcointalk code box.</p>
        <ul style="font-size:13px;color:var(--text-secondary,#aaa);padding-left:16px;line-height:1.7">
          <li>Places one button in the upper-right corner of each code box</li>
          <li>Copies only the code content</li>
          <li>Shows "Copied!" for 1.5 seconds</li>
          <li>Safely handles dynamically loaded posts and previews</li>
        </ul>
      </div>
    `;
    }
  };

  // src/modules/navigationBooster.js
  var navigationBooster_default = {
    id: "navigationBooster",
    name: "Navigation Booster",
    description: "Floating \u2191 and \u2193 arrows for quick page navigation, plus jump-to-reply.",
    category: "Layout & Reading",
    defaultEnabled: true,
    _goTop: null,
    _goBottom: null,
    _scrollHandler: null,
    _observer: null,
    init(api) {
      this._injectArrows();
      this._bindScroll();
    },
    destroy() {
      this._goTop?.remove();
      this._goBottom?.remove();
      if (this._scrollHandler) window.removeEventListener("scroll", this._scrollHandler, { passive: true });
      this._goTop = this._goBottom = this._scrollHandler = null;
    },
    _injectArrows() {
      document.getElementById("btt-go-top")?.remove();
      document.getElementById("btt-go-bottom")?.remove();
      this._goTop = this._makeArrow("btt-go-top", "\u2191", "Back to top", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      this._goBottom = this._makeArrow("btt-go-bottom", "\u2193", "Go to bottom", () => {
        const textarea = document.querySelector('#message, textarea[name="message"]');
        if (textarea) {
          textarea.scrollIntoView({ behavior: "smooth", block: "center" });
          textarea.focus();
        } else {
          window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
        }
      });
      document.body.appendChild(this._goTop);
      document.body.appendChild(this._goBottom);
    },
    _makeArrow(id, symbol, title, onClick) {
      const btn = document.createElement("button");
      btn.id = id;
      btn.className = "btt-nav-arrow";
      btn.title = title;
      btn.textContent = symbol;
      btn.setAttribute("aria-label", title);
      btn.addEventListener("click", onClick);
      return btn;
    },
    _bindScroll() {
      let ticking = false;
      this._scrollHandler = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          const atBottom = maxScroll > 0 && scrollY >= maxScroll - 10;
          this._goBottom?.classList.toggle("hidden", atBottom);
          ticking = false;
        });
      };
      window.addEventListener("scroll", this._scrollHandler, { passive: true });
      this._scrollHandler();
    },
    renderDashboardPanel(container) {
      container.innerHTML = `
      <div class="btt-panel">
        <p>Adds floating \u2191 and \u2193 navigation arrows to Bitcointalk pages.</p>
        <ul style="font-size:13px;color:var(--text-secondary,#aaa);padding-left:16px;line-height:1.7">
          <li><strong>\u2191</strong> \u2014 scrolls back to the top of the page</li>
          <li><strong>\u2193</strong> \u2014 jumps to reply box, or page bottom if no reply box</li>
          <li>Arrows appear after scrolling 300px down</li>
          <li>Arrows disappear when you are near the bottom (\u2193) or top (\u2191)</li>
        </ul>
        <p style="font-size:12px;color:var(--text-secondary,#aaa)">
          The arrows are positioned bottom-right, above the toolkit FAB button.
        </p>
      </div>
    `;
    }
  };

  // src/modules/quoteAssistant.js
  init_sharedUI();
  var PENDING_QUOTE_KEY = "btt_quote_assistant_pending_quote";
  function stopButtonEvent(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  }
  function normalizeSelectedText(text) {
    return String(text || "").replace(/\r\n/g, "\n").replace(/\u00a0/g, " ").split("\n").map((line) => line.trimEnd()).join("\n").trim();
  }
  function escapeQuoteAuthor(author) {
    return String(author || "").trim().replace(/\]/g, "");
  }
  function parseBitcointalkDateToUnix(text) {
    const raw = String(text || "").replace(/\s+/g, " ").trim();
    if (!raw) return "";
    const lower = raw.toLowerCase();
    const relative = lower.match(/\b(today|yesterday)\s+at\s+(\d{1,2}:\d{2}:\d{2})\s*(am|pm)?/i);
    if (relative) {
      const d = /* @__PURE__ */ new Date();
      if (relative[1].toLowerCase() === "yesterday") d.setDate(d.getDate() - 1);
      let hour = Number(relative[2].split(":")[0]);
      const minute = Number(relative[2].split(":")[1]);
      const second = Number(relative[2].split(":")[2]);
      const meridiem = relative[3]?.toLowerCase();
      if (meridiem === "pm" && hour < 12) hour += 12;
      if (meridiem === "am" && hour === 12) hour = 0;
      d.setHours(hour, minute, second, 0);
      return String(Math.floor(d.getTime() / 1e3));
    }
    const clean = raw.replace(/^on:\s*/i, "").replace(/\b(?:Today|Yesterday)\s+at\s+/i, "").replace(/\s*\(.*?\)\s*$/, "").trim();
    const parsed = Date.parse(clean);
    return Number.isFinite(parsed) ? String(Math.floor(parsed / 1e3)) : "";
  }
  function extractMsgId(value) {
    const text = String(value || "");
    return text.match(/(?:^|[.#])msg_?(\d+)/i)?.[1] || text.match(/[?;&]msg=(\d+)/i)?.[1] || text.match(/^msg_?(\d+)$/i)?.[1] || "";
  }
  function getPostMessageId(postDiv) {
    const fromId = extractMsgId(postDiv?.id);
    if (fromId) return fromId;
    const scope = getPostScope(postDiv);
    const anchor = scope?.querySelector?.('a[name^="msg"], a[id^="msg"], a[href*="#msg"], a[href*=".msg"], a[href*="msg="]') || postDiv?.querySelector?.('a[name^="msg"], a[id^="msg"], a[href*="#msg"], a[href*=".msg"], a[href*="msg="]');
    const id = anchor?.name || anchor?.id || "";
    const fromAnchorId = extractMsgId(id);
    if (fromAnchorId) return fromAnchorId;
    const href = anchor?.href || anchor?.getAttribute?.("href") || "";
    return extractMsgId(href);
  }
  function findRealBitcointalkPost(node) {
    let el = node?.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    while (el && el !== document.body) {
      if (extractMsgId(el.id) && findBuiltInQuoteLink(getPostScope(el) || el)) return getPostScope(el) || el;
      const contentCell = el.closest?.("td.td_headerandpost");
      if (contentCell) {
        const scope = getPostScope(contentCell) || contentCell;
        if (findBuiltInQuoteLink(scope)) return scope;
      }
      const post = findMessageElement(el);
      if (post && el.matches?.("td.td_headerandpost, .post, .windowbg, .windowbg2")) {
        const scope = getPostScope(post) || el;
        if (findBuiltInQuoteLink(scope)) return scope;
      }
      if (findBuiltInQuoteLink(el) && (el.querySelector?.("td.poster_info, .poster_info") || findMessageElement(el))) return el;
      el = el.parentElement;
    }
    return null;
  }
  function findMessageElement(scope) {
    if (!scope?.querySelectorAll) return null;
    return Array.from(scope.querySelectorAll("[id], a[name]")).find((candidate) => extractMsgId(candidate.id) || extractMsgId(candidate.getAttribute?.("name"))) || null;
  }
  function getPostScope(postDiv) {
    let el = postDiv;
    while (el && el !== document.body) {
      if (el.matches?.("table") && el.querySelector("td.poster_info, .poster_info") && (findMessageElement(el) || findBuiltInQuoteLink(el))) return el;
      if (el.matches?.("tr") && el.querySelector("td.poster_info, .poster_info") && (findMessageElement(el) || findBuiltInQuoteLink(el))) return el;
      el = el.parentElement;
    }
    return postDiv?.closest("table") || postDiv?.closest("tr") || null;
  }
  function findPostRows(postDiv) {
    const contentRow = postDiv?.closest("tr");
    const contentCell = postDiv?.closest("td.td_headerandpost") || postDiv?.closest("td");
    const headerRow = findHeaderRow(contentRow);
    const scope = getPostScope(postDiv);
    const posterCell = headerRow?.querySelector("td.poster_info") || contentRow?.querySelector("td.poster_info") || scope?.querySelector("td.poster_info, .poster_info") || findPosterCellNearPost(postDiv);
    const headerCell = headerRow?.querySelector("td.td_headerandpost") || contentCell?.parentElement?.previousElementSibling?.querySelector?.("td.td_headerandpost") || scope?.querySelector("td.td_headerandpost .smalltext")?.closest("td.td_headerandpost") || contentCell;
    return { contentCell, headerCell, posterCell };
  }
  function findHeaderRow(contentRow) {
    let row = contentRow;
    for (let i = 0; i < 4 && row; i += 1) {
      if (row.querySelector?.("td.poster_info, .poster_info")) return row;
      row = row.previousElementSibling;
    }
    return contentRow?.previousElementSibling || null;
  }
  function findPosterCellNearPost(postDiv) {
    const postRect = postDiv?.getBoundingClientRect?.();
    if (!postRect) return null;
    let best = null;
    let bestScore = Infinity;
    document.querySelectorAll("td.poster_info, .poster_info").forEach((cell) => {
      const rect = cell.getBoundingClientRect();
      const vertical = Math.abs(rect.top - postRect.top);
      const horizontalPenalty = rect.left > postRect.left ? 1e3 : 0;
      const score = vertical + horizontalPenalty;
      if (score < bestScore) {
        best = cell;
        bestScore = score;
      }
    });
    return bestScore < 500 ? best : null;
  }
  function getAuthorFromPosterCell(posterCell) {
    const author = posterCell?.querySelector('b > a[href*="action=profile"]')?.textContent?.trim() || posterCell?.querySelector('b a[href*="action=profile"]')?.textContent?.trim() || posterCell?.querySelector('a[href*="action=profile"]')?.textContent?.trim() || posterCell?.querySelector("b")?.textContent?.trim() || "";
    return author.replace(/\s+/g, " ").trim();
  }
  function getAuthorFromPostScope(postScope) {
    const scope = getPostScope(postScope) || postScope;
    const author = getAuthorFromPosterCell(scope?.querySelector?.("td.poster_info, .poster_info")) || scope?.querySelector?.('td.poster_info b a[href*="action=profile"], .poster_info b a[href*="action=profile"]')?.textContent?.trim() || scope?.querySelector?.('td.poster_info a[href*="action=profile"], .poster_info a[href*="action=profile"]')?.textContent?.trim() || "";
    return author.replace(/\s+/g, " ").trim();
  }
  function getPostTimestamp(headerCell, contentCell) {
    const scope = headerCell?.closest("table") || contentCell?.closest("table") || contentCell;
    const candidates = [
      headerCell?.querySelector?.(".smalltext")?.textContent,
      headerCell?.textContent,
      contentCell?.querySelector?.(".smalltext")?.textContent,
      scope?.querySelector?.(".smalltext")?.textContent,
      scope?.textContent
    ];
    for (const text of candidates) {
      const match = String(text || "").match(/on:\s*(.+?)(?:\n|$|Last edit:|Views:|Reply with quote)/i);
      const timestamp = parseBitcointalkDateToUnix(match?.[1] || text);
      if (timestamp) return timestamp;
    }
    return "";
  }
  function getTopicIdFromPost(postDiv) {
    const fromLocation = getTopicId();
    if (fromLocation) return fromLocation;
    const scope = getPostScope(postDiv);
    const link = scope?.querySelector?.('a[href*="topic="]') || document.querySelector('a[href*="topic="]');
    const href = link?.href || link?.getAttribute?.("href") || "";
    return href.match(/[?;&]topic=(\d+)/)?.[1] || "";
  }
  function parseBitcointalkParams(value) {
    const out = {};
    const text = String(value || "").replace(/&amp;/g, "&");
    const query = text.includes("?") ? text.slice(text.indexOf("?") + 1) : text;
    query.split(/[;&]/).forEach((part) => {
      const [rawKey, ...rest] = part.split("=");
      const key = decodeURIComponent(rawKey || "").trim();
      if (!key) return;
      out[key] = decodeURIComponent(rest.join("=") || "");
    });
    return out;
  }
  function isBuiltInQuoteLink(link) {
    if (!link) return false;
    const href = link.href || link.getAttribute?.("href") || "";
    const text = `${link.textContent || ""} ${link.title || ""} ${link.getAttribute?.("onclick") || ""}`.toLowerCase();
    if (!/quote/.test(text) && !/[?;&]quote=|action=quote|quotefast/i.test(href)) return false;
    return /action=post|action=quote|quote=|quotefast/i.test(href) || /quote/.test(text);
  }
  function findBuiltInQuoteLink(scope) {
    if (!scope?.querySelectorAll) return null;
    const links = Array.from(scope.querySelectorAll('a[href], button, input[type="button"], input[type="submit"]'));
    return links.find(isBuiltInQuoteLink) || null;
  }
  function parseQuoteLinkMeta(link) {
    if (!link) return {};
    const href = link.href || link.getAttribute?.("href") || "";
    const onclick = link.getAttribute?.("onclick") || "";
    const params = parseBitcointalkParams(href);
    const onclickParams = parseBitcointalkParams(onclick);
    const topicRaw = params.topic || onclickParams.topic || "";
    const quoteRaw = params.quote || params.msg || onclickParams.quote || onclickParams.msg || "";
    const dateRaw = params.date || onclickParams.date || "";
    return {
      topicId: String(topicRaw).match(/\d+/)?.[0] || "",
      msgId: String(quoteRaw).match(/\d+/)?.[0] || extractMsgId(href) || extractMsgId(onclick),
      timestamp: String(dateRaw).match(/\d{8,}/)?.[0] || ""
    };
  }
  function enrichMetaFromLinks(postDiv, meta) {
    const scope = getPostScope(postDiv);
    const links = Array.from(scope?.querySelectorAll?.("a[href]") || []);
    for (const link of links) {
      const href = link.href || link.getAttribute("href") || "";
      if (!meta.topicId) {
        const topicMatch = href.match(/[?;&]topic=(\d+)/i);
        if (topicMatch) meta.topicId = topicMatch[1];
      }
      if (!meta.msgId) {
        const msgId = extractMsgId(href) || extractMsgId(link.id) || extractMsgId(link.name);
        if (msgId) meta.msgId = msgId;
      }
      if (meta.topicId && meta.msgId) break;
    }
    return meta;
  }
  function getSelectionRect(selection) {
    if (!selection?.rangeCount) return null;
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (rect && (rect.width || rect.height)) return rect;
    return range.getClientRects?.()[0] || null;
  }
  function buildQuoteBbcode({ text, author, topicId, msgId, timestamp }) {
    const cleanAuthor = escapeQuoteAuthor(author);
    const hasLink = topicId && msgId;
    const attrs = [];
    if (cleanAuthor) attrs.push(`author=${cleanAuthor}`);
    if (hasLink) attrs.push(`link=topic=${topicId}.msg${msgId}#msg${msgId}`);
    if (timestamp && cleanAuthor && hasLink) attrs.push(`date=${timestamp}`);
    return `[quote${attrs.length ? " " + attrs.join(" ") : ""}]
${text}
[/quote]

`;
  }
  function savePendingQuote(bbcode) {
    try {
      sessionStorage.setItem(PENDING_QUOTE_KEY, JSON.stringify({
        bbcode,
        topicId: getTopicId(),
        createdAt: Date.now()
      }));
      return true;
    } catch {
      return false;
    }
  }
  function loadPendingQuote() {
    try {
      const raw = sessionStorage.getItem(PENDING_QUOTE_KEY);
      if (!raw) return null;
      const pending = JSON.parse(raw);
      if (!pending?.bbcode || Date.now() - Number(pending.createdAt || 0) > 10 * 60 * 1e3) {
        sessionStorage.removeItem(PENDING_QUOTE_KEY);
        return null;
      }
      return pending;
    } catch {
      return null;
    }
  }
  function clearPendingQuote() {
    try {
      sessionStorage.removeItem(PENDING_QUOTE_KEY);
    } catch {
    }
  }
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  function isVisibleElement(el) {
    if (!el) return false;
    const style = window.getComputedStyle(el);
    return style.display !== "none" && style.visibility !== "hidden" && el.offsetParent !== null;
  }
  function isSafeQuickReplyControl(el) {
    if (!el || !isVisibleElement(el)) return false;
    const text = `${el.textContent || ""} ${el.value || ""} ${el.title || ""} ${el.id || ""} ${el.className || ""}`.toLowerCase();
    if (!/quick\s*reply|quickreply|quick_reply/.test(text)) return false;
    if (/quote/.test(text)) return false;
    const href = el.getAttribute?.("href") || "";
    if (!href) return true;
    if (href === "#" || href.startsWith("#")) return true;
    if (/^javascript:/i.test(href)) return true;
    return false;
  }
  function tryOpenQuickReply() {
    const controls = [
      ...document.querySelectorAll('button, input[type="button"], input[type="submit"], a, [role="button"]')
    ];
    const control = controls.find(isSafeQuickReplyControl);
    if (!control) return false;
    control.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
    return true;
  }
  function getReplyPageUrl() {
    const topicId = getTopicId();
    const links = Array.from(document.querySelectorAll("a[href]"));
    const replyLink = links.find((link) => {
      const href = link.getAttribute("href") || "";
      const text = `${link.textContent || ""} ${link.title || ""}`.toLowerCase();
      if (!/action=post/i.test(href)) return false;
      if (/action=quote|quotefast|quote=/i.test(href)) return false;
      if (topicId && !href.includes(`topic=${topicId}`)) return false;
      return /reply|post/.test(text) || /topic=\d+/i.test(href);
    });
    if (replyLink?.href) return replyLink.href;
    if (topicId) return `https://bitcointalk.org/index.php?action=post;topic=${encodeURIComponent(topicId)}`;
    return "";
  }
  function insertBbcodeIntoTextarea(textarea, bbcode) {
    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? textarea.value.length;
    textarea.value = textarea.value.slice(0, start) + bbcode + textarea.value.slice(end);
    textarea.selectionStart = textarea.selectionEnd = start + bbcode.length;
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    textarea.dispatchEvent(new Event("change", { bubbles: true }));
    textarea.scrollIntoView({ behavior: "smooth", block: "center" });
    textarea.focus();
  }
  var quoteAssistant_default = {
    id: "quoteAssistant",
    name: "Quote Assistant",
    description: "Select text in any post and click the floating button to insert it as a BBCode quote.",
    category: "Layout & Reading",
    defaultEnabled: true,
    _floatBtn: null,
    _selectionHandler: null,
    _selectionChangeHandler: null,
    _hideHandler: null,
    _selectionTimer: null,
    _lastQuote: null,
    init() {
      this._createFloatBtn();
      this._bindSelection();
      this._insertPendingQuoteWhenReady();
    },
    destroy() {
      this._floatBtn?.remove();
      document.removeEventListener("mouseup", this._selectionHandler);
      document.removeEventListener("keyup", this._selectionHandler);
      document.removeEventListener("touchend", this._selectionHandler);
      document.removeEventListener("selectionchange", this._selectionChangeHandler);
      document.removeEventListener("mousedown", this._hideHandler, true);
      clearTimeout(this._selectionTimer);
      this._floatBtn = null;
      this._selectionHandler = null;
      this._selectionChangeHandler = null;
      this._hideHandler = null;
      this._selectionTimer = null;
      this._lastQuote = null;
    },
    _createFloatBtn() {
      this._floatBtn = document.getElementById("btt-quote-selection-btn");
      if (!this._floatBtn) {
        this._floatBtn = document.createElement("button");
        this._floatBtn.id = "btt-quote-selection-btn";
        this._floatBtn.type = "button";
        document.body.appendChild(this._floatBtn);
      }
      this._floatBtn.textContent = "Quote";
      this._floatBtn.title = "Quote selected text";
      this._floatBtn.style.cssText = `
      position:fixed;
      display:none;
      z-index:2147483646;
      padding:5px 10px;
      border-radius:6px;
      border:1px solid var(--btt-border,#374151);
      background:var(--btt-surface,#1f2937);
      color:var(--btt-text,#ffffff);
      box-shadow:0 3px 10px rgba(0,0,0,.35);
      cursor:pointer;
      font:12px/1.3 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
      white-space:nowrap;
    `;
      ["pointerdown", "mousedown", "mouseup"].forEach((type) => {
        this._floatBtn.addEventListener(type, stopButtonEvent, true);
      });
      this._floatBtn.addEventListener("click", (e) => {
        stopButtonEvent(e);
        this._insertQuote();
      }, true);
    },
    _bindSelection() {
      this._selectionHandler = () => {
        clearTimeout(this._selectionTimer);
        this._selectionTimer = setTimeout(() => this._handleSelection(), 40);
      };
      this._selectionChangeHandler = () => {
        clearTimeout(this._selectionTimer);
        this._selectionTimer = setTimeout(() => this._handleSelection(), 120);
      };
      this._hideHandler = (e) => {
        if (e.target === this._floatBtn) return;
        setTimeout(() => {
          if (!window.getSelection()?.toString().trim()) this._hideButton();
        }, 80);
      };
      document.addEventListener("mouseup", this._selectionHandler);
      document.addEventListener("keyup", this._selectionHandler);
      document.addEventListener("touchend", this._selectionHandler);
      document.addEventListener("selectionchange", this._selectionChangeHandler);
      document.addEventListener("mousedown", this._hideHandler, true);
    },
    _handleSelection() {
      const selection = window.getSelection();
      const text = normalizeSelectedText(selection?.toString());
      if (!selection?.rangeCount || text.length < 2) {
        this._hideButton();
        return;
      }
      const container = selection.getRangeAt(0).commonAncestorContainer;
      if ((container.nodeType === Node.ELEMENT_NODE ? container : container.parentElement)?.closest?.("textarea, input, #btt-quote-selection-btn")) {
        this._hideButton();
        return;
      }
      const postDiv = findRealBitcointalkPost(container);
      if (!postDiv) {
        console.warn("[BTT Quote Assistant] No post container found", container);
        this._hideButton();
        return;
      }
      this._lastQuote = postDiv ? this._collectQuoteMeta(postDiv, text) : { text, author: "", topicId: getTopicId(), msgId: "", timestamp: "" };
      const rect = getSelectionRect(selection);
      if (!rect) {
        this._hideButton();
        return;
      }
      this._floatBtn.style.display = "block";
      this._floatBtn.style.left = `${Math.max(8, Math.min(rect.left + rect.width / 2 - 28, window.innerWidth - 76))}px`;
      this._floatBtn.style.top = `${Math.max(8, rect.top - 36)}px`;
    },
    _collectQuoteMeta(postDiv, text) {
      const { contentCell, headerCell, posterCell } = findPostRows(postDiv);
      const quoteLink = findBuiltInQuoteLink(postDiv) || findBuiltInQuoteLink(getPostScope(postDiv));
      const quoteMeta = parseQuoteLinkMeta(quoteLink);
      const msgId = quoteMeta.msgId || getPostMessageId(postDiv);
      const topicId = quoteMeta.topicId || getTopicIdFromPost(postDiv);
      const timestamp = quoteMeta.timestamp || getPostTimestamp(headerCell, contentCell);
      return enrichMetaFromLinks(postDiv, {
        text,
        author: getAuthorFromPosterCell(posterCell) || getAuthorFromPostScope(postDiv),
        topicId,
        msgId,
        timestamp
      });
    },
    async _findOrOpenReplyTextarea() {
      let textarea = getReplyTextarea();
      if (textarea) return textarea;
      if (tryOpenQuickReply()) {
        for (let i = 0; i < 12; i += 1) {
          await sleep(150);
          textarea = getReplyTextarea();
          if (textarea) return textarea;
        }
      }
      return null;
    },
    async _insertPendingQuoteWhenReady() {
      const pending = loadPendingQuote();
      if (!pending?.bbcode) return;
      for (let i = 0; i < 20; i += 1) {
        const textarea = getReplyTextarea();
        if (textarea) {
          insertBbcodeIntoTextarea(textarea, pending.bbcode);
          clearPendingQuote();
          Toast.success("Quote inserted.");
          return;
        }
        await sleep(150);
      }
    },
    async _insertQuote() {
      const quoteData = this._lastQuote;
      if (!quoteData?.text) return;
      const bbcode = buildQuoteBbcode(quoteData);
      const textarea = await this._findOrOpenReplyTextarea();
      if (!textarea) {
        const replyUrl = getReplyPageUrl();
        if (replyUrl && savePendingQuote(bbcode)) {
          this._hideButton();
          window.getSelection()?.removeAllRanges();
          location.assign(replyUrl);
          return;
        }
        Toast.warning("Open reply box first, then use Quote Assistant.");
        this._hideButton();
        return;
      }
      insertBbcodeIntoTextarea(textarea, bbcode);
      window.getSelection()?.removeAllRanges();
      this._hideButton();
      Toast.success("Quote inserted.");
    },
    _hideButton() {
      if (this._floatBtn) this._floatBtn.style.display = "none";
    },
    renderDashboardPanel(container) {
      container.innerHTML = `
      <div class="btt-panel">
        <p>Select text in a Bitcointalk post, then click the floating <strong>Quote</strong> button near the selection.</p>
        <p>The inserted quote uses author, post link, and timestamp metadata when available.</p>
        <ul style="font-size:13px;color:var(--text-secondary,#aaa);padding-left:16px;line-height:1.7">
          <li>Builds <code>[quote author=... link=topic=... date=...]</code> when possible</li>
          <li>Falls back gracefully if author, link, or date cannot be detected</li>
          <li>Inserts at the cursor in the reply textarea without opening Bitcointalk's quote action</li>
        </ul>
      </div>
    `;
    }
  };

  // src/modules/localDraftSaver.js
  init_storage();
  init_sharedUI();
  var localDraftSaver_default = {
    id: "localDraftSaver",
    name: "Local Draft Saver",
    description: "Auto-saves your reply as you type and restores it after page reload.",
    category: "Layout & Reading",
    defaultEnabled: true,
    _interval: null,
    _banner: null,
    _draftKey: null,
    async init(api) {
      if (!isThreadPage()) return;
      const topicId = getTopicId();
      if (!topicId) return;
      this._draftKey = `thread_${topicId}`;
      await this._restoreDraft();
      this._startAutoSave(api.settings?.autoSaveInterval || 5e3);
    },
    destroy() {
      clearInterval(this._interval);
      this._banner?.remove();
      this._interval = null;
      this._banner = null;
    },
    async _restoreDraft() {
      const drafts = await getDrafts();
      const draft = drafts[this._draftKey];
      if (!draft?.content?.trim()) return;
      const ta = getReplyTextarea();
      if (!ta) return;
      this._showBanner(draft, ta);
    },
    _showBanner(draft, ta) {
      if (document.getElementById("btt-draft-banner")) return;
      const banner = document.createElement("div");
      banner.id = "btt-draft-banner";
      const ago = this._timeAgo(draft.savedAt);
      banner.innerHTML = `
      <span>\u{1F4BE} You have an unsaved draft from ${ago}.</span>
      <button id="btt-restore-draft" style="background:#3b82f6;color:#fff">Restore</button>
      <button id="btt-discard-draft" style="background:#374151;color:#e5e7eb">Discard</button>
    `;
      ta.parentElement?.insertBefore(banner, ta);
      banner.classList.add("show");
      this._banner = banner;
      document.getElementById("btt-restore-draft").addEventListener("click", async () => {
        ta.value = draft.content;
        ta.dispatchEvent(new Event("input"));
        banner.classList.remove("show");
        setTimeout(() => banner.remove(), 300);
        Toast.success("Draft restored.");
      });
      document.getElementById("btt-discard-draft").addEventListener("click", async () => {
        await deleteDraft(this._draftKey);
        banner.classList.remove("show");
        setTimeout(() => banner.remove(), 300);
        Toast.info("Draft discarded.");
      });
    },
    _startAutoSave(intervalMs) {
      const save = async () => {
        const ta2 = getReplyTextarea();
        if (!ta2 || !ta2.value.trim()) return;
        await saveDraft(this._draftKey, ta2.value, `Thread ${getTopicId()}`);
      };
      this._interval = setInterval(save, intervalMs);
      let debTimer;
      const ta = getReplyTextarea();
      if (ta) {
        ta.addEventListener("input", () => {
          clearTimeout(debTimer);
          debTimer = setTimeout(save, 2e3);
        });
        window.addEventListener("beforeunload", save);
      }
    },
    _timeAgo(ts) {
      if (!ts) return "some time ago";
      const diff = Date.now() - ts;
      if (diff < 6e4) return "just now";
      if (diff < 36e5) return `${Math.floor(diff / 6e4)}m ago`;
      return `${Math.floor(diff / 36e5)}h ago`;
    },
    renderDashboardPanel(container, api) {
      let html = '<div class="btt-panel"><h4>Saved Drafts</h4>';
      getDrafts().then((drafts) => {
        const keys = Object.keys(drafts);
        if (!keys.length) {
          container.querySelector("#btt-draft-list").textContent = "No drafts saved.";
          return;
        }
        const list = container.querySelector("#btt-draft-list");
        list.innerHTML = "";
        keys.forEach((key) => {
          const d = drafts[key];
          const item = document.createElement("div");
          item.style.cssText = "padding:8px;border:1px solid var(--border,#2d3340);border-radius:6px;margin-bottom:6px;";
          item.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center">
            <strong style="font-size:13px">${key}</strong>
            <span style="font-size:11px;color:var(--text-secondary,#aaa)">${new Date(d.savedAt).toLocaleString()}</span>
          </div>
          <p style="margin:4px 0;font-size:12px;color:var(--text-secondary,#aaa)">${(d.content || "").slice(0, 80)}\u2026</p>
          <button data-key="${key}" class="btt-draft-delete btt-btn btt-btn-sm" style="background:#7f1d1d">Delete</button>
        `;
          list.appendChild(item);
        });
        list.querySelectorAll(".btt-draft-delete").forEach((btn) => {
          btn.addEventListener("click", async () => {
            await deleteDraft(btn.dataset.key);
            btn.closest("div[style]").remove();
            Toast.success("Draft deleted.");
          });
        });
      });
      container.innerHTML = `
      <div class="btt-panel">
        <p>Auto-saves your reply textarea every few seconds while you type on Bitcointalk thread pages. Restores automatically on reload.</p>
        <h4 style="margin-top:16px">Saved Drafts</h4>
        <div id="btt-draft-list" style="max-height:300px;overflow-y:auto">Loading\u2026</div>
      </div>
    `;
      getDrafts().then((drafts) => {
        const list = container.querySelector("#btt-draft-list");
        const keys = Object.keys(drafts);
        if (!keys.length) {
          list.textContent = "No drafts saved.";
          return;
        }
        list.innerHTML = "";
        keys.forEach((key) => {
          const d = drafts[key];
          const item = document.createElement("div");
          item.style.cssText = "padding:8px;border:1px solid var(--border,#2d3340);border-radius:6px;margin-bottom:6px;font-size:13px;";
          item.innerHTML = `
          <div style="display:flex;justify-content:space-between">
            <strong>${key}</strong>
            <span style="color:var(--text-secondary,#aaa);font-size:11px">${new Date(d.savedAt).toLocaleString()}</span>
          </div>
          <p style="margin:4px 0;color:var(--text-secondary,#aaa);font-size:12px">${(d.content || "").slice(0, 100)}\u2026</p>
          <button data-k="${key}" class="del-draft btt-btn btt-btn-sm" style="background:#7f1d1d">\u{1F5D1} Delete</button>
        `;
          list.appendChild(item);
        });
        list.querySelectorAll(".del-draft").forEach((btn) => {
          btn.addEventListener("click", async () => {
            await deleteDraft(btn.dataset.k);
            btn.closest("div[style]").remove();
          });
        });
      });
    }
  };

  // src/modules/clipboardSafety.js
  init_constants();
  init_sharedUI();
  var clipboardSafety_default = {
    id: "clipboardSafety",
    name: "Clipboard Safety Checker",
    description: "Warns if a pasted crypto address differs from the one you copied \u2014 protects against clipboard-hijacking malware.",
    category: "Security Tools",
    defaultEnabled: true,
    _lastCopied: null,
    // address copied in this session (memory only, never stored)
    _copyHandler: null,
    _pasteHandler: null,
    _warnBanner: null,
    init(api) {
      this._createBanner();
      this._bindCopy();
      this._bindPaste();
    },
    destroy() {
      document.removeEventListener("copy", this._copyHandler);
      document.removeEventListener("paste", this._pasteHandler);
      this._warnBanner?.remove();
      this._lastCopied = null;
      this._copyHandler = this._pasteHandler = this._warnBanner = null;
    },
    _createBanner() {
      if (document.getElementById("btt-clipboard-warning")) return;
      this._warnBanner = document.createElement("div");
      this._warnBanner.id = "btt-clipboard-warning";
      document.body.appendChild(this._warnBanner);
    },
    _extractAddress(text) {
      const t = String(text || "");
      for (const [, pattern] of Object.entries(CRYPTO_PATTERNS)) {
        const re = new RegExp(pattern.source, "i");
        const m = t.match(re);
        if (m) return m[0];
      }
      return null;
    },
    _bindCopy() {
      this._copyHandler = (e) => {
        const text = window.getSelection()?.toString() || "";
        const addr = this._extractAddress(text);
        if (addr) {
          this._lastCopied = addr;
        }
      };
      document.addEventListener("copy", this._copyHandler);
    },
    _bindPaste() {
      this._pasteHandler = async (e) => {
        if (!["TEXTAREA", "INPUT"].includes(e.target.tagName)) return;
        let pasted = "";
        try {
          pasted = e.clipboardData?.getData("text") || "";
        } catch {
          return;
        }
        const pastedAddr = this._extractAddress(pasted);
        if (!pastedAddr) return;
        if (this._lastCopied && this._lastCopied !== pastedAddr) {
          const copied = this._lastCopied;
          const short = (a) => `${a.slice(0, 6)}\u2026${a.slice(-6)}`;
          this._showWarning(
            `\u26A0\uFE0F Clipboard address mismatch!
Copied:  ${short(copied)}
Pasting: ${short(pastedAddr)}
Your clipboard may have been modified by malware. Verify manually!`
          );
        }
      };
      document.addEventListener("paste", this._pasteHandler);
    },
    _showWarning(msg) {
      if (!this._warnBanner) return;
      this._warnBanner.innerHTML = msg.replace(/\n/g, "<br>") + ` <button onclick="document.getElementById('btt-clipboard-warning').style.display='none'" style="margin-left:10px;padding:3px 8px;border-radius:4px;border:none;background:#fca5a5;color:#7f1d1d;cursor:pointer">Dismiss</button>`;
      this._warnBanner.style.display = "block";
      setTimeout(() => {
        if (this._warnBanner) this._warnBanner.style.display = "none";
      }, 15e3);
      Toast.error("\u26A0\uFE0F Address mismatch detected! Check your clipboard.", 8e3);
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
    }
  };

  // src/modules/addressHighlighter.js
  init_constants();
  init_sharedUI();
  var SCAN_SELECTOR = "td.td_headerandpost, .post, .postarea, .postbody";
  var SKIP_SELECTOR = [
    "script",
    "style",
    "textarea",
    "input",
    "select",
    "button",
    "a",
    "code",
    "pre",
    ".btt-addr",
    ".btt-txid",
    ".btt-code-copy-btn",
    "#btt-toolkit-root"
  ].join(",");
  var PATTERNS = [
    { re: CRYPTO_PATTERNS.btcBech32, cls: "btt-addr", label: "BTC bech32 address", type: "address" },
    { re: CRYPTO_PATTERNS.btcLegacy, cls: "btt-addr", label: "BTC address", type: "address" },
    { re: CRYPTO_PATTERNS.btcP2SH, cls: "btt-addr", label: "BTC P2SH address", type: "address" },
    { re: CRYPTO_PATTERNS.eth, cls: "btt-addr", label: "ETH address", type: "address" },
    { re: CRYPTO_PATTERNS.ltc, cls: "btt-addr", label: "LTC address", type: "address" },
    { re: CRYPTO_PATTERNS.doge, cls: "btt-addr", label: "DOGE address", type: "address" },
    { re: CRYPTO_PATTERNS.trx, cls: "btt-addr", label: "TRX address", type: "address" },
    { re: CRYPTO_PATTERNS.txid, cls: "btt-txid", label: "Transaction ID", type: "txid" }
  ];
  function cloneGlobalRegex(re) {
    const flags = re.flags.includes("g") ? re.flags : `${re.flags}g`;
    return new RegExp(re.source, flags);
  }
  function shortenValue(value) {
    if (!value || value.length <= 22) return value;
    return `${value.slice(0, 10)}...${value.slice(-8)}`;
  }
  function collectMatches(text) {
    const matches = [];
    for (const pattern of PATTERNS) {
      const re = cloneGlobalRegex(pattern.re);
      let match;
      while (match = re.exec(text)) {
        const value = match[1] || match[0];
        const start = match.index + match[0].indexOf(value);
        const end = start + value.length;
        matches.push({ ...pattern, value, start, end });
        if (match[0].length === 0) re.lastIndex += 1;
      }
    }
    matches.sort((a, b) => {
      if (a.start !== b.start) return a.start - b.start;
      return b.end - b.start - (a.end - a.start);
    });
    const accepted = [];
    let lastEnd = -1;
    for (const match of matches) {
      if (match.start < lastEnd) continue;
      accepted.push(match);
      lastEnd = match.end;
    }
    return accepted;
  }
  function isSkippableTextNode(node) {
    const parent = node.parentElement;
    if (!parent) return true;
    if (!node.textContent || !node.textContent.trim()) return true;
    return Boolean(parent.closest(SKIP_SELECTOR));
  }
  var addressHighlighter_default = {
    id: "addressHighlighter",
    name: "Address Highlighter",
    description: "Highlights Bitcoin and crypto addresses in posts. Click to copy.",
    category: "Security Tools",
    defaultEnabled: true,
    _observer: null,
    _scanTimer: null,
    init() {
      this._processAll();
      this._observer = new MutationObserver(() => this._scheduleScan());
      this._observer.observe(document.body, { childList: true, subtree: true });
    },
    destroy() {
      this._observer?.disconnect();
      this._observer = null;
      if (this._scanTimer) {
        clearTimeout(this._scanTimer);
        this._scanTimer = null;
      }
      document.querySelectorAll(".btt-addr, .btt-txid").forEach((el) => {
        const value = el.dataset.bttAddrValue || el.textContent || "";
        el.replaceWith(document.createTextNode(value));
      });
    },
    _scheduleScan() {
      if (this._scanTimer) clearTimeout(this._scanTimer);
      this._scanTimer = setTimeout(() => {
        this._scanTimer = null;
        this._processAll();
      }, 300);
    },
    _processAll() {
      document.querySelectorAll(SCAN_SELECTOR).forEach((container) => {
        this._highlightInElement(container);
      });
    },
    _highlightInElement(container) {
      const walker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode(node2) {
            return isSkippableTextNode(node2) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
          }
        }
      );
      const textNodes = [];
      let node;
      while (node = walker.nextNode()) textNodes.push(node);
      textNodes.forEach((textNode) => {
        const fragment = this._buildHighlightedFragment(textNode.textContent);
        if (fragment) textNode.replaceWith(fragment);
      });
    },
    _buildHighlightedFragment(text) {
      const matches = collectMatches(text);
      if (!matches.length) return null;
      const fragment = document.createDocumentFragment();
      let cursor = 0;
      for (const match of matches) {
        if (match.start > cursor) {
          fragment.appendChild(document.createTextNode(text.slice(cursor, match.start)));
        }
        const span = document.createElement("span");
        span.className = match.cls;
        span.dataset.bttAddrValue = match.value;
        span.dataset.bttAddrType = match.type;
        span.title = `${match.label} - click to copy`;
        span.textContent = shortenValue(match.value);
        span.addEventListener("click", async (event) => {
          event.preventDefault();
          event.stopPropagation();
          const ok = await copyToClipboard(match.value);
          Toast[ok ? "success" : "error"](
            ok ? `Copied: ${shortenValue(match.value)}` : "Copy failed"
          );
        });
        fragment.appendChild(span);
        cursor = match.end;
      }
      if (cursor < text.length) {
        fragment.appendChild(document.createTextNode(text.slice(cursor)));
      }
      return fragment;
    },
    renderDashboardPanel(container) {
      container.innerHTML = `
      <div class="btt-panel">
        <p>Scans post content and highlights cryptocurrency addresses and transaction IDs.</p>
        <ul style="font-size:13px;color:var(--text-secondary,#aaa);padding-left:16px;line-height:1.7">
          <li>BTC: Legacy (1...), P2SH (3...), bech32 (bc1...)</li>
          <li>ETH: 0x... (40 hex chars)</li>
          <li>LTC, DOGE, TRX addresses</li>
          <li>TXIDs (64 hex chars)</li>
          <li>Click any highlighted address to copy it</li>
        </ul>
      </div>
    `;
    }
  };

  // src/modules/boardCleaner.js
  var STYLE_ID2 = "btt-board-cleaner-style";
  function buildCss(settings) {
    const rules = [];
    if (settings.hideAvatars) {
      rules.push(`
      td.poster_info img.avatar,
      td.poster_info img[src*="avatar"],
      td.poster_info img[src*="avatars"],
      td.poster_info img[alt*="avatar" i],
      td.poster_info a[href*="action=profile"] > img,
      .poster_info img.avatar,
      .poster_info img[src*="avatar"],
      .poster_info img[src*="avatars"],
      .poster_info img[alt*="avatar" i],
      .poster_info a[href*="action=profile"] > img {
        display:none!important;
      }
    `);
    }
    if (settings.hideSignatures) {
      rules.push(`
      .signature,
      div.signature,
      td.signature,
      table.signature,
      [class~="signature"],
      td.td_headerandpost .signature,
      td.td_headerandpost div[id^="msg_"] + .signature {
        display:none!important;
      }
    `);
    }
    if (settings.hidePersonalText) {
      rules.push(`
      .custom_title,
      td.poster_info .smalltext:not(:first-child),
      .poster_info .smalltext:not(:first-child) {
        display:none!important;
      }
    `);
    }
    if (settings.collapseImages) rules.push("td.td_headerandpost img { display:none!important; }");
    if (settings.compactMode) {
      rules.push(`
      .post { padding:4px!important; }
      td.td_headerandpost { padding:4px!important; }
      td.poster_info { padding:4px!important; min-width:80px!important; }
      #bodyarea { padding:4px!important; }
    `);
    }
    return rules.join("\n");
  }
  var boardCleaner_default = {
    id: "boardCleaner",
    name: "Board Cleaner",
    description: "Hide avatars, signatures, images, and enable compact post spacing.",
    category: "Layout & Reading",
    defaultEnabled: true,
    _style: null,
    async init(api) {
      await this._apply(api.settings);
    },
    destroy() {
      document.getElementById(STYLE_ID2)?.remove();
    },
    async _apply(settings) {
      let style = document.getElementById(STYLE_ID2);
      if (!style) {
        style = document.createElement("style");
        style.id = STYLE_ID2;
        document.head.appendChild(style);
      }
      style.textContent = buildCss(settings);
    },
    renderDashboardPanel(container, api) {
      const settings = api?.settings || {};
      container.innerHTML = `
      <div class="btt-panel">
        <p>Toggle individual layout cleanup options below.</p>
        <div id="btt-bc-options" style="display:flex;flex-direction:column;gap:10px;margin-top:10px;"></div>
      </div>
    `;
      const opts = container.querySelector("#btt-bc-options");
      const { createToggle: createToggle2 } = window.BTT_UI || {};
      if (!createToggle2) return;
      const options = [
        { key: "hideAvatars", label: "Hide Avatars" },
        { key: "hideSignatures", label: "Hide Signatures" },
        { key: "hidePersonalText", label: "Hide Personal Text" },
        { key: "collapseImages", label: "Hide Post Images" },
        { key: "compactMode", label: "Compact Mode" }
      ];
      options.forEach(({ key, label }) => {
        const toggle = createToggle2(label, !!settings[key], async (val) => {
          const { updateSetting: updateSetting2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
          const newSettings = await updateSetting2(key, val);
          this._apply(newSettings);
        });
        opts.appendChild(toggle);
      });
    }
  };

  // src/modules/longQuoteCollapser.js
  var QUOTE_SELECTOR = [
    "blockquote",
    "div.quote",
    ".btt-quote .btt-quote-body",
    ".quoteheader + div"
  ].join(",");
  function stopForumHandlers(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  }
  function isInjectedUi2(el) {
    return !!el.closest(".btt-quote-expand-btn, #btt-launcher, #btt-toast-container");
  }
  var longQuoteCollapser_default = {
    id: "longQuoteCollapser",
    name: "Long Quote Collapser",
    description: "Collapses quote blocks taller than 200px. Click to expand.",
    category: "Layout & Reading",
    defaultEnabled: true,
    COLLAPSE_HEIGHT: 100,
    _observer: null,
    _scanTimer: null,
    init(api) {
      this.COLLAPSE_HEIGHT = api.settings?.quoteCollapseHeight || 100;
      this._processAll();
      this._observer = new MutationObserver((mutations) => {
        if (mutations.some((m) => Array.from(m.addedNodes).some((node) => node.nodeType === 1 && !isInjectedUi2(node)))) {
          this._scheduleScan();
        }
      });
      this._observer.observe(document.body, { childList: true, subtree: true });
    },
    destroy() {
      this._observer?.disconnect();
      this._observer = null;
      clearTimeout(this._scanTimer);
      this._scanTimer = null;
      document.querySelectorAll(".btt-quote-collapsed").forEach((el) => {
        el.classList.remove("btt-quote-collapsed");
      });
      document.querySelectorAll('[data-btt-quote-processed="1"]').forEach((el) => {
        delete el.dataset.bttQuoteProcessed;
        delete el.dataset.bttQuoteExpanded;
        el.style.removeProperty("--btt-quote-collapse-height");
      });
      document.querySelectorAll(".btt-quote-expand-btn").forEach((btn) => btn.remove());
    },
    _scheduleScan() {
      clearTimeout(this._scanTimer);
      this._scanTimer = setTimeout(() => this._processAll(), 350);
    },
    _processAll() {
      document.querySelectorAll(QUOTE_SELECTOR).forEach((el) => {
        if (el.dataset.bttQuoteProcessed === "1") return;
        if (isInjectedUi2(el)) return;
        el.dataset.bttQuoteProcessed = "1";
        requestAnimationFrame(() => {
          if (!el.isConnected) return;
          if (el.scrollHeight > this.COLLAPSE_HEIGHT) this._collapseQuote(el);
        });
      });
    },
    _collapseQuote(el) {
      if (el.nextElementSibling?.classList.contains("btt-quote-expand-btn")) return;
      el.dataset.bttQuoteExpanded = "0";
      el.style.setProperty("--btt-quote-collapse-height", `${this.COLLAPSE_HEIGHT}px`);
      el.classList.add("btt-quote-collapsed");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btt-quote-expand-btn";
      btn.textContent = "Show full quote";
      btn.setAttribute("aria-expanded", "false");
      ["pointerdown", "mousedown", "mouseup"].forEach((type) => {
        btn.addEventListener(type, stopForumHandlers, true);
      });
      btn.addEventListener("click", (e) => {
        stopForumHandlers(e);
        const expanded = el.dataset.bttQuoteExpanded === "1";
        el.dataset.bttQuoteExpanded = expanded ? "0" : "1";
        el.classList.toggle("btt-quote-collapsed", expanded);
        btn.textContent = expanded ? "Show full quote" : "Collapse quote";
        btn.setAttribute("aria-expanded", expanded ? "false" : "true");
      }, true);
      el.insertAdjacentElement("afterend", btn);
    },
    renderDashboardPanel(container) {
      container.innerHTML = `
      <div class="btt-panel">
        <p>Automatically collapses quote blocks that exceed the height threshold. Click "Show full quote" to expand without triggering Bitcointalk's quote popup.</p>
        <label style="font-size:13px;display:flex;align-items:center;gap:8px;margin-top:10px;">
          Collapse height threshold:
          <input type="number" id="btt-collapse-h" value="${this.COLLAPSE_HEIGHT}" min="50" max="1000" step="50"
            style="width:80px;padding:4px 6px;border-radius:4px;border:1px solid var(--border,#2d3340);background:var(--bg-input,#1e2025);color:var(--text,#e5e7eb)">
          px
        </label>
        <button id="btt-save-collapse-h" class="btt-btn btt-btn-primary" style="margin-top:8px">Save</button>
      </div>
    `;
      container.querySelector("#btt-save-collapse-h").addEventListener("click", async () => {
        const val = parseInt(container.querySelector("#btt-collapse-h").value, 10);
        if (val > 0) {
          this.COLLAPSE_HEIGHT = val;
          const { updateSetting: updateSetting2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
          await updateSetting2("quoteCollapseHeight", val);
        }
      });
    }
  };

  // src/modules/imageCollapser.js
  var imageCollapser_default = {
    id: "imageCollapser",
    name: "Image Collapser",
    description: "Collapses large images in posts. Click the placeholder to expand.",
    category: "Layout & Reading",
    defaultEnabled: true,
    HEIGHT_LIMIT: 200,
    _observer: null,
    async init(api) {
      this.HEIGHT_LIMIT = api.settings?.imageCollapseHeight || 200;
      this._processAll();
      this._observer = new MutationObserver(() => this._processAll());
      this._observer.observe(document.body, { childList: true, subtree: true });
    },
    destroy() {
      this._observer?.disconnect();
      document.querySelectorAll(".btt-img-placeholder").forEach((p) => {
        const img = p._bttImg;
        if (img) {
          img.classList.remove("btt-img-collapsed");
          p.replaceWith(img);
        }
      });
      this._observer = null;
    },
    _processAll() {
      document.querySelectorAll("td.td_headerandpost img, .post img").forEach((img) => {
        if (img.dataset.bttImgDone) return;
        img.dataset.bttImgDone = "1";
        img.addEventListener("load", () => this._maybeCollapse(img));
        if (img.complete) this._maybeCollapse(img);
      });
    },
    _maybeCollapse(img) {
      if (img.naturalHeight <= this.HEIGHT_LIMIT && img.naturalWidth <= 600) return;
      const domain = (() => {
        try {
          return new URL(img.src).hostname;
        } catch {
          return img.src.slice(0, 30);
        }
      })();
      const ph = document.createElement("span");
      ph.className = "btt-img-placeholder";
      ph._bttImg = img;
      ph.innerHTML = `\u{1F5BC} Image from <strong>${domain}</strong> \u2014 click to expand`;
      img.classList.add("btt-img-collapsed");
      img.insertAdjacentElement("beforebegin", ph);
      ph.addEventListener("click", () => {
        img.classList.remove("btt-img-collapsed");
        ph.remove();
      });
    },
    renderDashboardPanel(container) {
      container.innerHTML = `<div class="btt-panel"><p>Collapses images taller than ${this.HEIGHT_LIMIT}px. A placeholder shows the source domain. Click to reveal the image.</p></div>`;
    }
  };

  // src/modules/userNotes.js
  init_storage();
  init_sharedUI();
  var TAGS = ["trusted", "buyer", "seller", "campaign manager", "avoid", "helpful", "scammer", "friend"];
  var PROFILE_LINK_RE = /(?:[?;&]action=profile\b|\/index\.php\?action=profile\b)/i;
  function isProfileLink(link) {
    if (!link) return false;
    const href = link.getAttribute("href") || link.href || "";
    return PROFILE_LINK_RE.test(href) && /[?;&]u=\d+/i.test(href);
  }
  function findUsernameLink(posterInfo) {
    const preferred = posterInfo.querySelector('b > a[href*="action=profile"][href*="u="]');
    if (isProfileLink(preferred)) return preferred;
    return Array.from(posterInfo.querySelectorAll('a[href*="action=profile"][href*="u="]')).find((link) => {
      if (!isProfileLink(link)) return false;
      const text = (link.textContent || "").trim();
      if (!text) return false;
      if (/^(ignore|trust|show posts|send pm)$/i.test(text)) return false;
      return true;
    }) || null;
  }
  var userNotes_default = {
    id: "userNotes",
    name: "User Notes",
    description: "Add private notes to any username. A badge icon appears next to noted users.",
    category: "User/Profile Tools",
    defaultEnabled: true,
    _notes: {},
    _observer: null,
    async init(api) {
      this._notes = await getUserNotes();
      this._processAll();
      this._observer = new MutationObserver(() => this._processAll());
      this._observer.observe(document.body, { childList: true, subtree: true });
    },
    destroy() {
      this._observer?.disconnect();
      document.querySelectorAll(".btt-note-badge").forEach((b) => b.remove());
      document.querySelectorAll("[data-btt-note-done]").forEach((el) => delete el.dataset.bttNoteDone);
      this._observer = null;
    },
    _processAll() {
      document.querySelectorAll("td.poster_info, .poster_info").forEach((posterInfo) => {
        if (posterInfo.dataset.bttNoteDone) return;
        if (posterInfo.querySelector(".btt-note-badge")) {
          posterInfo.dataset.bttNoteDone = "1";
          return;
        }
        const usernameLink = findUsernameLink(posterInfo);
        if (!usernameLink) return;
        posterInfo.dataset.bttNoteDone = "1";
        this._addBadge(usernameLink);
      });
    },
    _addBadge(usernameEl) {
      const username = usernameEl.textContent.trim().toLowerCase();
      if (!username) return;
      const badge = document.createElement("span");
      badge.className = "btt-note-badge";
      const note = this._notes[username];
      badge.textContent = note ? "\u2605" : "+";
      badge.title = note ? `Note: ${note.text || ""} [${(note.tags || []).join(", ")}]` : "Add note";
      badge.style.background = note ? "#22c55e" : "#f7931a";
      badge.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this._openNoteModal(username, note, badge);
      });
      usernameEl.parentElement.appendChild(badge);
    },
    _openNoteModal(username, existing, badge) {
      const content = document.createElement("div");
      content.innerHTML = `
      <p style="margin-top:0;color:var(--text-secondary,#aaa);font-size:13px">Username: <strong>${escapeHtml(username)}</strong></p>
      <label style="font-size:13px;display:block;margin-bottom:4px">Note:</label>
      <textarea id="btt-note-text" rows="3" style="width:100%;box-sizing:border-box;padding:6px;border-radius:4px;border:1px solid #2d3340;background:#1e2025;color:#e5e7eb;font-size:13px;resize:vertical">${escapeHtml(existing?.text || "")}</textarea>
      <div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:6px" id="btt-note-tags">
        ${TAGS.map((t) => `<label style="font-size:12px;display:flex;align-items:center;gap:4px;cursor:pointer">
          <input type="checkbox" value="${t}" ${(existing?.tags || []).includes(t) ? "checked" : ""}> ${t}
        </label>`).join("")}
      </div>
    `;
      showModal({
        title: `Note for ${username}`,
        content,
        actions: [
          existing ? { label: "\u{1F5D1} Delete", type: "secondary", onClick: async () => {
            await deleteUserNote(username);
            delete this._notes[username];
            if (badge) {
              badge.textContent = "+";
              badge.style.background = "#f7931a";
              badge.title = "Add note";
            }
            Toast.success("Note deleted.");
          } } : null,
          { label: "Cancel", type: "secondary", onClick: () => {
          } },
          { label: "Save", type: "primary", onClick: async () => {
            const text = document.getElementById("btt-note-text")?.value.trim() || "";
            const tags = [...document.querySelectorAll("#btt-note-tags input:checked")].map((c) => c.value);
            const note = { text, tags, updatedAt: Date.now() };
            await setUserNote(username, note);
            this._notes[username.toLowerCase()] = note;
            if (badge) {
              badge.textContent = "\u2605";
              badge.style.background = "#22c55e";
              badge.title = `Note: ${text}`;
            }
            Toast.success("Note saved.");
          } }
        ].filter(Boolean)
      });
    },
    renderDashboardPanel(container) {
      container.innerHTML = `
      <div class="btt-panel">
        <p>Add private notes to any Bitcointalk username. Notes are stored locally and never shared.</p>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;">
          <h4 style="margin:0">All Notes</h4>
          <button id="btt-notes-export" class="btt-btn btt-btn-sm">Export JSON</button>
        </div>
        <div id="btt-notes-list" style="margin-top:10px;max-height:400px;overflow-y:auto">Loading\u2026</div>
      </div>
    `;
      getUserNotes().then((notes) => {
        const list = container.querySelector("#btt-notes-list");
        const entries = Object.entries(notes);
        if (!entries.length) {
          list.textContent = "No notes yet.";
          return;
        }
        list.innerHTML = "";
        entries.forEach(([username, note]) => {
          const div = document.createElement("div");
          div.style.cssText = "padding:8px 10px;border:1px solid var(--border,#2d3340);border-radius:6px;margin-bottom:6px;";
          div.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center">
            <strong style="font-size:13px">${escapeHtml(username)}</strong>
            <span style="font-size:11px;color:var(--text-secondary,#aaa)">${new Date(note.updatedAt || 0).toLocaleDateString()}</span>
          </div>
          <p style="margin:4px 0;font-size:12px">${escapeHtml(note.text || "")}</p>
          ${(note.tags || []).map((t) => `<span style="font-size:10px;background:#374151;padding:1px 6px;border-radius:9px;margin-right:3px">${t}</span>`).join("")}
          <div style="margin-top:6px">
            <button class="btt-btn btt-btn-sm del-note" data-u="${escapeHtml(username)}" style="background:#7f1d1d">Delete</button>
          </div>
        `;
          list.appendChild(div);
        });
        list.querySelectorAll(".del-note").forEach((btn) => {
          btn.addEventListener("click", async () => {
            await deleteUserNote(btn.dataset.u);
            btn.closest("div[style]").remove();
          });
        });
      });
      container.querySelector("#btt-notes-export").addEventListener("click", async () => {
        const { downloadFile: downloadFile2 } = await Promise.resolve().then(() => (init_sharedUI(), sharedUI_exports));
        const notes = await getUserNotes();
        downloadFile2("btt-notes.json", JSON.stringify(notes, null, 2), "application/json");
      });
    }
  };

  // src/modules/keywordAlert.js
  init_storage();
  init_sharedUI();
  var SCAN_SELECTOR2 = "td.td_headerandpost, .post, .postarea, .postbody";
  var SKIP_SELECTOR2 = [
    "script",
    "style",
    "textarea",
    "input",
    "select",
    "button",
    "a",
    ".btt-keyword-highlight",
    "#btt-toolkit-root"
  ].join(",");
  function normalizeKeywordList(keywords) {
    return Array.from(new Set(
      (Array.isArray(keywords) ? keywords : []).map((kw) => String(kw || "").trim()).filter(Boolean)
    ));
  }
  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  function buildKeywordRegex(keywords, caseSensitive) {
    const pattern = normalizeKeywordList(keywords).sort((a, b) => b.length - a.length).map(escapeRegExp).join("|");
    if (!pattern) return null;
    return new RegExp(pattern, caseSensitive ? "g" : "gi");
  }
  function isSkippableTextNode2(node) {
    const parent = node.parentElement;
    if (!parent) return true;
    if (!node.textContent || !node.textContent.trim()) return true;
    return Boolean(parent.closest(SKIP_SELECTOR2));
  }
  var keywordAlert_default = {
    id: "keywordAlert",
    name: "Keyword Alert",
    description: "Highlight your watched keywords in post content.",
    category: "Layout & Reading",
    defaultEnabled: true,
    _keywords: [],
    _observer: null,
    _scanTimer: null,
    _caseSensitive: false,
    _storageListener: null,
    async init() {
      await this._loadSettings();
      this._processAll();
      this._observer = new MutationObserver(() => this._scheduleScan());
      this._observer.observe(document.body, { childList: true, subtree: true });
      this._storageListener = (changes, areaName) => {
        if (areaName !== "local" || !changes.btt_settings) return;
        this._loadSettings().then(() => {
          this._clearHighlights();
          this._processAll();
        });
      };
      if (typeof chrome !== "undefined" && chrome.storage?.onChanged) {
        chrome.storage.onChanged.addListener(this._storageListener);
      }
    },
    destroy() {
      this._observer?.disconnect();
      this._observer = null;
      if (this._scanTimer) {
        clearTimeout(this._scanTimer);
        this._scanTimer = null;
      }
      if (this._storageListener) {
        if (typeof chrome !== "undefined" && chrome.storage?.onChanged) {
          chrome.storage.onChanged.removeListener(this._storageListener);
        }
        this._storageListener = null;
      }
      this._clearHighlights();
    },
    async _loadSettings() {
      const settings = await getSettings();
      this._keywords = normalizeKeywordList(settings.watchedKeywords || []);
      this._caseSensitive = !!settings.keywordsCaseSensitive;
    },
    _scheduleScan() {
      if (this._scanTimer) clearTimeout(this._scanTimer);
      this._scanTimer = setTimeout(() => {
        this._scanTimer = null;
        this._processAll();
      }, 300);
    },
    _clearHighlights() {
      document.querySelectorAll(".btt-keyword-highlight").forEach((el) => {
        el.replaceWith(document.createTextNode(el.textContent || ""));
      });
    },
    _processAll() {
      const regex = buildKeywordRegex(this._keywords, this._caseSensitive);
      if (!regex) return;
      document.querySelectorAll(SCAN_SELECTOR2).forEach((container) => {
        this._highlightKeywords(container, regex);
      });
    },
    _highlightKeywords(container, regex) {
      const walker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode(node2) {
            return isSkippableTextNode2(node2) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
          }
        }
      );
      const nodes = [];
      let node;
      while (node = walker.nextNode()) nodes.push(node);
      nodes.forEach((textNode) => {
        const text = textNode.textContent || "";
        regex.lastIndex = 0;
        if (!regex.test(text)) return;
        regex.lastIndex = 0;
        const fragment = document.createDocumentFragment();
        let cursor = 0;
        let match;
        while ((match = regex.exec(text)) !== null) {
          if (match.index > cursor) {
            fragment.appendChild(document.createTextNode(text.slice(cursor, match.index)));
          }
          const mark = document.createElement("mark");
          mark.className = "btt-keyword-highlight";
          mark.textContent = match[0];
          fragment.appendChild(mark);
          cursor = match.index + match[0].length;
          if (match[0].length === 0) regex.lastIndex += 1;
        }
        if (cursor < text.length) fragment.appendChild(document.createTextNode(text.slice(cursor)));
        textNode.replaceWith(fragment);
      });
    },
    async renderDashboardPanel(container) {
      let keywords = [];
      let caseSensitive = false;
      const settings = await getSettings();
      keywords = normalizeKeywordList(settings.watchedKeywords || []);
      caseSensitive = !!settings.keywordsCaseSensitive;
      container.innerHTML = `
      <div class="btt-panel">
        <p>Enter keywords below. They will be highlighted in yellow on Bitcointalk posts.</p>
        <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
          <input type="text" id="btt-kw-input" placeholder="Add keyword..."
            style="flex:1;min-width:180px;padding:6px 8px;border-radius:4px;border:1px solid var(--border,#2d3340);background:var(--bg-input,#1e2025);color:var(--text,#e5e7eb);font-size:13px">
          <button id="btt-kw-add" class="btt-btn btt-btn-primary">Add</button>
        </div>
        <label style="display:flex;align-items:center;gap:6px;margin-top:10px;font-size:12px;color:var(--text-secondary,#aaa)">
          <input type="checkbox" id="btt-kw-case" ${caseSensitive ? "checked" : ""}>
          Case-sensitive matching
        </label>
        <div id="btt-kw-list" style="margin-top:10px;display:flex;flex-wrap:wrap;gap:6px"></div>
      </div>
    `;
      const save = async () => {
        await updateSetting("watchedKeywords", keywords);
        await updateSetting("keywordsCaseSensitive", caseSensitive);
      };
      const renderList = () => {
        const list = container.querySelector("#btt-kw-list");
        if (!list) return;
        if (!keywords.length) {
          list.innerHTML = '<span style="font-size:12px;color:var(--text-secondary,#aaa)">No keywords saved.</span>';
          return;
        }
        list.innerHTML = "";
        keywords.forEach((kw, index) => {
          const chip = document.createElement("span");
          chip.style.cssText = "background:#374151;padding:3px 10px;border-radius:14px;font-size:12px;display:inline-flex;align-items:center;gap:6px;";
          chip.innerHTML = `${escapeHtml(kw)} <button data-i="${index}" class="del-kw" style="background:none;border:none;color:#d1d5db;cursor:pointer;font-size:14px;padding:0;line-height:1">x</button>`;
          list.appendChild(chip);
        });
        list.querySelectorAll(".del-kw").forEach((btn) => {
          btn.addEventListener("click", async () => {
            keywords.splice(parseInt(btn.dataset.i, 10), 1);
            this._keywords = keywords;
            await save();
            renderList();
          });
        });
      };
      container.querySelector("#btt-kw-add").addEventListener("click", async () => {
        const input = container.querySelector("#btt-kw-input");
        const value = input.value.trim();
        if (!value || keywords.includes(value)) return;
        keywords.push(value);
        this._keywords = keywords;
        input.value = "";
        await save();
        renderList();
        Toast.success(`Keyword "${value}" added.`);
      });
      container.querySelector("#btt-kw-input").addEventListener("keydown", (event) => {
        if (event.key === "Enter") container.querySelector("#btt-kw-add").click();
      });
      container.querySelector("#btt-kw-case").addEventListener("change", async (event) => {
        caseSensitive = event.target.checked;
        this._caseSensitive = caseSensitive;
        await save();
        Toast.success("Keyword settings saved.");
      });
      renderList();
    }
  };

  // src/utils/validators.js
  init_constants();
  function isUrlShortener(url) {
    try {
      const hostname = new URL(url).hostname.replace("www.", "");
      return URL_SHORTENERS.some((s) => hostname === s);
    } catch {
      return false;
    }
  }
  function isSuspiciousDomain(url) {
    try {
      const hostname = new URL(url).hostname.toLowerCase().replace("www.", "");
      return SUSPICIOUS_DOMAINS.some((d) => d.toLowerCase() === hostname);
    } catch {
      return false;
    }
  }
  function hasPunycode(url) {
    try {
      return new URL(url).hostname.includes("xn--");
    } catch {
      return false;
    }
  }

  // src/modules/antiPhishingLinkChecker.js
  var PROCESSED = "data-btt-phish-done";
  var LINK_SELECTOR = "td.td_headerandpost a, .post a, .postarea a, .postbody a";
  var SKIP_LINK_SELECTOR = "#btt-toolkit-root, .btt-addr, .btt-txid, .btt-code-copy-btn";
  var BITCOINTALK_LOOKALIKES = [
    /bitcointa1k/i,
    /bitc0intalk/i,
    /bitcolntalk/i,
    /bitcointaIk/i,
    /bitcolntaIk/i,
    /b1tcointalk/i
  ];
  function isInternalBitcointalkLink(url) {
    return url.hostname === "bitcointalk.org" || url.hostname.endsWith(".bitcointalk.org");
  }
  var antiPhishingLinkChecker_default = {
    id: "antiPhishingLinkChecker",
    name: "Anti-Phishing Link Checker",
    description: "Highlights suspicious external links, shortened URLs, and lookalike domains.",
    category: "Security Tools",
    defaultEnabled: true,
    _observer: null,
    _controller: null,
    _scanTimer: null,
    init() {
      this._controller = new AbortController();
      this._processAll();
      this._observer = new MutationObserver(() => this._scheduleScan());
      this._observer.observe(document.body, { childList: true, subtree: true });
    },
    destroy() {
      this._observer?.disconnect();
      this._controller?.abort();
      if (this._scanTimer) clearTimeout(this._scanTimer);
      document.querySelectorAll(".btt-phish-warn").forEach((el) => {
        el.classList.remove("btt-phish-warn");
      });
      document.querySelectorAll(".btt-phish-tooltip").forEach((el) => el.remove());
      document.querySelectorAll(`[${PROCESSED}]`).forEach((el) => el.removeAttribute(PROCESSED));
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
        link.setAttribute(PROCESSED, "1");
        this._checkLink(link);
      });
    },
    _checkLink(link) {
      let url;
      try {
        url = new URL(link.href);
      } catch {
        return;
      }
      if (isInternalBitcointalkLink(url)) return;
      const warnings = [];
      if (isSuspiciousDomain(link.href)) warnings.push("Known suspicious domain");
      if (isUrlShortener(link.href)) warnings.push("URL shortener, destination hidden");
      if (hasPunycode(link.href)) warnings.push("Punycode domain, possible lookalike");
      if (BITCOINTALK_LOOKALIKES.some((re) => re.test(url.hostname))) {
        warnings.push("Looks like a fake Bitcointalk domain");
      }
      if (warnings.length) {
        link.classList.add("btt-phish-warn");
        link.title = `${warnings.join(" | ")} | Actual: ${url.hostname}`;
      }
      if (warnings.length) this._addTooltip(link, url, warnings);
    },
    _addTooltip(link, url, warnings) {
      let tooltip = null;
      link.addEventListener("mouseenter", () => {
        tooltip = document.createElement("div");
        tooltip.className = "btt-phish-tooltip";
        const color = warnings.length ? "#fca5a5" : "#e5e7eb";
        tooltip.innerHTML = `
        <div style="color:${color};font-weight:${warnings.length ? "600" : "400"}">
          ${escapeHtml(url.hostname)}
        </div>
        <div style="color:#9ca3af;font-size:10px">${escapeHtml(url.protocol)}//</div>
        ${warnings.map((warning) => `<div style="color:#fca5a5;font-size:10px;margin-top:2px">${escapeHtml(warning)}</div>`).join("")}
      `;
        const rect = link.getBoundingClientRect();
        tooltip.style.cssText = `
        position:fixed;top:${rect.bottom + 4}px;left:${rect.left}px;
        z-index:2147483645;
      `;
        document.body.appendChild(tooltip);
      }, { signal: this._controller?.signal });
      link.addEventListener("mouseleave", () => {
        tooltip?.remove();
        tooltip = null;
      }, { signal: this._controller?.signal });
    },
    renderDashboardPanel(container) {
      container.innerHTML = `
      <div class="btt-panel">
        <p>Scans all links in Bitcointalk posts and highlights suspicious ones.</p>
        <div style="margin-top:10px;font-size:13px">
          <div style="margin-bottom:6px"><strong>Detects:</strong></div>
          <ul style="padding-left:16px;color:var(--text-secondary,#aaa);line-height:1.8">
            <li>Known suspicious/phishing domains</li>
            <li>URL shorteners such as bit.ly and tinyurl.com</li>
            <li>Punycode domains such as xn-- lookalikes</li>
            <li>Bitcointalk lookalike domains</li>
          </ul>
          <div style="margin-top:8px"><strong>Visual indicators:</strong></div>
          <ul style="padding-left:16px;color:var(--text-secondary,#aaa);line-height:1.8">
            <li>Red dashed underline on suspicious links</li>
            <li>Hover tooltip shows full domain and warning reason</li>
          </ul>
        </div>
        <p style="font-size:12px;color:var(--text-secondary,#aaa);margin-top:10px">
          All checks are local. No external APIs are called.
        </p>
      </div>
    `;
    }
  };

  // src/modules/externalLinkPreview.js
  var PROCESSED2 = "data-btt-ext-done";
  var LINK_SELECTOR2 = "td.td_headerandpost a, .post a, .postarea a, .postbody a";
  var SKIP_LINK_SELECTOR2 = "#btt-toolkit-root, .btt-addr, .btt-txid, .btt-code-copy-btn";
  function isInternalBitcointalkLink2(url) {
    return url.hostname === "bitcointalk.org" || url.hostname.endsWith(".bitcointalk.org");
  }
  var externalLinkPreview_default = {
    id: "externalLinkPreview",
    name: "External Link Preview",
    description: "Shows destination domain in a tooltip when hovering external links.",
    category: "Security Tools",
    defaultEnabled: true,
    _tooltip: null,
    _observer: null,
    _controller: null,
    _scanTimer: null,
    init() {
      this._controller = new AbortController();
      this._tooltip = document.createElement("div");
      this._tooltip.className = "btt-link-preview-tooltip";
      this._tooltip.style.display = "none";
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
      document.querySelectorAll(`[${PROCESSED2}]`).forEach((link) => {
        link.removeAttribute(PROCESSED2);
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
      document.querySelectorAll(LINK_SELECTOR2).forEach((link) => {
        if (link.getAttribute(PROCESSED2)) return;
        if (link.closest(SKIP_LINK_SELECTOR2)) return;
        let url;
        try {
          url = new URL(link.href);
        } catch {
          return;
        }
        if (isInternalBitcointalkLink2(url)) return;
        link.setAttribute(PROCESSED2, "1");
        if (!link.title) link.title = `External link: ${url.hostname}`;
        this._attachTooltip(link, url);
      });
    },
    _attachTooltip(link, url) {
      const warn = isSuspiciousDomain(link.href) || isUrlShortener(link.href);
      link.addEventListener("mouseenter", (event) => {
        if (!this._tooltip) return;
        this._tooltip.innerHTML = `
        <span style="color:${warn ? "#fca5a5" : "#e5e7eb"}">${escapeHtml(url.hostname)}</span>
        ${warn ? '<br><span style="font-size:10px;color:#fca5a5">Suspicious or shortened link</span>' : ""}
      `;
        this._tooltip.style.display = "block";
        this._positionTooltip(event);
      }, { signal: this._controller?.signal });
      link.addEventListener("mouseleave", () => {
        if (this._tooltip) this._tooltip.style.display = "none";
      }, { signal: this._controller?.signal });
      link.addEventListener("mousemove", (event) => {
        this._positionTooltip(event);
      }, { signal: this._controller?.signal });
    },
    _positionTooltip(event) {
      if (!this._tooltip) return;
      const margin = 10;
      const rect = this._tooltip.getBoundingClientRect();
      const left = Math.min(
        window.innerWidth - rect.width - margin,
        Math.max(margin, event.clientX + 6)
      );
      const top = Math.min(
        window.innerHeight - rect.height - margin,
        Math.max(margin, event.clientY + 14)
      );
      this._tooltip.style.position = "fixed";
      this._tooltip.style.top = `${top}px`;
      this._tooltip.style.left = `${left}px`;
    },
    renderDashboardPanel(container) {
      container.innerHTML = `
      <div class="btt-panel">
        <p>Shows the destination domain of external links on hover. Suspicious domains are highlighted in red.</p>
      </div>
    `;
    }
  };

  // src/modules/txidHelper.js
  init_constants();
  init_sharedUI();
  var TXID_RE = /\b([a-fA-F0-9]{64})\b/g;
  var PROCESSED3 = "data-btt-txid-done";
  var txidHelper_default = {
    id: "txidHelper",
    name: "TXID Helper",
    description: "Highlights Bitcoin transaction IDs in posts. Click to copy or open in block explorer.",
    category: "Security Tools",
    defaultEnabled: true,
    _observer: null,
    init() {
      this._processAll();
      this._observer = new MutationObserver(() => this._processAll());
      this._observer.observe(document.body, { childList: true, subtree: true });
    },
    destroy() {
      this._observer?.disconnect();
      document.querySelectorAll(".btt-txid-wrap").forEach((el) => el.replaceWith(document.createTextNode(el.dataset.full || el.textContent)));
      this._observer = null;
    },
    _processAll() {
      document.querySelectorAll("td.td_headerandpost, .post").forEach((container) => {
        if (container.getAttribute(PROCESSED3)) return;
        container.setAttribute(PROCESSED3, "1");
        this._process(container);
      });
    },
    _process(container) {
      const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
        acceptNode(n2) {
          const tag = n2.parentElement?.tagName;
          if (["SCRIPT", "STYLE", "TEXTAREA", "A"].includes(tag)) return NodeFilter.FILTER_REJECT;
          return TXID_RE.test(n2.textContent) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
      });
      const nodes = [];
      let n;
      TXID_RE.lastIndex = 0;
      while (n = walker.nextNode()) nodes.push(n);
      nodes.forEach((tn) => this._replace(tn));
    },
    _replace(tn) {
      TXID_RE.lastIndex = 0;
      const text = tn.textContent;
      const frag = document.createDocumentFragment();
      let last = 0, m;
      while ((m = TXID_RE.exec(text)) !== null) {
        if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        const span = document.createElement("span");
        span.className = "btt-txid btt-txid-wrap";
        span.dataset.full = m[0];
        span.textContent = m[0].slice(0, 8) + "\u2026" + m[0].slice(-8);
        span.title = "TXID: " + m[0] + " \u2014 click to copy";
        span.style.cursor = "pointer";
        const full = m[0];
        span.addEventListener("click", async (e) => {
          e.stopPropagation();
          if (e.ctrlKey || e.metaKey) {
            window.open(BLOCK_EXPLORERS.btc[0].url + full, "_blank");
          } else {
            await copyToClipboard(full);
            Toast.success("TXID copied.");
          }
        });
        frag.appendChild(span);
        last = m.index + m[0].length;
      }
      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      tn.parentNode.replaceChild(frag, tn);
    },
    renderDashboardPanel(container) {
      container.innerHTML = `<div class="btt-panel"><p>Detects 64-character hex strings (Bitcoin TXIDs) in posts. Click to copy. Ctrl+click to open in block explorer.</p></div>`;
    }
  };

  // src/modules/selfPostFinder.js
  init_storage();
  var STYLE_ID3 = "btt-self-post-style";
  var NAV_ID = "btt-self-nav";
  var USERNAME_SETTING = "myUsername";
  function normalizeUsername(username) {
    return String(username || "").trim().replace(/\s+/g, " ").toLowerCase();
  }
  function getAuthorLink(posterCell) {
    return posterCell?.querySelector('b > a[href*="action=profile"][href*="u="]') || posterCell?.querySelector('b a[href*="action=profile"][href*="u="]') || posterCell?.querySelector('a[href*="action=profile"][href*="u="]');
  }
  function getPostTarget(posterCell) {
    const row1 = posterCell?.closest("tr");
    const row2 = row1?.nextElementSibling;
    const post = row2?.querySelector('[id^="msg_"]') || row1?.querySelector('[id^="msg_"]') || row2?.querySelector("td.td_headerandpost") || row1?.querySelector("td.td_headerandpost");
    return { row1, row2, post };
  }
  function collectPostsForUsername(username) {
    const target = normalizeUsername(username);
    if (!target) return [];
    const posts = [];
    document.querySelectorAll("td.poster_info, .poster_info").forEach((posterCell) => {
      const authorLink = getAuthorLink(posterCell);
      const author = normalizeUsername(authorLink?.textContent);
      if (!author || author !== target) return;
      const { row1, row2, post } = getPostTarget(posterCell);
      if (!post || posts.includes(post)) return;
      post.classList.add("btt-own-post");
      row1?.classList.add("btt-own-post-row");
      row2?.classList.add("btt-own-post-row");
      posts.push(post);
    });
    return posts;
  }
  var selfPostFinder_default = {
    id: "selfPostFinder",
    name: "Self-Post Finder",
    description: "Highlights your posts on the current page and lets you jump between them.",
    category: "Thread Tools",
    defaultEnabled: false,
    _username: "",
    _posts: [],
    _observer: null,
    _scanTimer: null,
    async init() {
      const settings = await getSettings();
      this._username = settings[USERNAME_SETTING] || "";
      this._installStyle();
      this._scan();
      this._observer = new MutationObserver(() => this._scheduleScan());
      this._observer.observe(document.body, { childList: true, subtree: true });
    },
    destroy() {
      this._observer?.disconnect();
      this._observer = null;
      if (this._scanTimer) {
        clearTimeout(this._scanTimer);
        this._scanTimer = null;
      }
      document.getElementById(STYLE_ID3)?.remove();
      document.getElementById(NAV_ID)?.remove();
      document.querySelectorAll(".btt-own-post").forEach((el) => el.classList.remove("btt-own-post"));
      document.querySelectorAll(".btt-own-post-row").forEach((el) => el.classList.remove("btt-own-post-row"));
      this._posts = [];
    },
    _installStyle() {
      if (document.getElementById(STYLE_ID3)) return;
      const style = document.createElement("style");
      style.id = STYLE_ID3;
      style.textContent = `
      .btt-own-post {
        outline: 2px solid #3b82f6 !important;
        outline-offset: 2px;
        background: rgba(59, 130, 246, .08) !important;
      }
      .btt-own-post-row > td {
        box-shadow: inset 3px 0 0 #3b82f6 !important;
      }
    `;
      document.head.appendChild(style);
    },
    _scheduleScan() {
      if (this._scanTimer) clearTimeout(this._scanTimer);
      this._scanTimer = setTimeout(() => {
        this._scanTimer = null;
        this._scan();
      }, 300);
    },
    _scan() {
      document.querySelectorAll(".btt-own-post").forEach((el) => el.classList.remove("btt-own-post"));
      document.querySelectorAll(".btt-own-post-row").forEach((el) => el.classList.remove("btt-own-post-row"));
      document.getElementById(NAV_ID)?.remove();
      if (!this._username) {
        this._showConfigNotice();
        return;
      }
      this._posts = collectPostsForUsername(this._username);
      this._addNav();
    },
    _showConfigNotice() {
      if (document.getElementById(NAV_ID)) return;
      const nav = document.createElement("div");
      nav.id = NAV_ID;
      nav.style.cssText = "position:fixed;top:80px;right:20px;background:#1a1d23;border:1px solid #2d3340;border-radius:8px;padding:10px 12px;z-index:2147483638;font-size:12px;color:#e5e7eb;max-width:240px;box-shadow:0 8px 24px rgba(0,0,0,.35)";
      nav.innerHTML = `
      <div style="font-weight:600;margin-bottom:6px">Self-Post Finder</div>
      <div style="color:#cbd5e1;line-height:1.4">Set your Bitcointalk username from All Tools > Self-Post Finder > Settings.</div>
    `;
      document.body.appendChild(nav);
    },
    _addNav() {
      if (document.getElementById(NAV_ID)) return;
      const nav = document.createElement("div");
      nav.id = NAV_ID;
      nav.style.cssText = "position:fixed;top:80px;right:20px;background:#1a1d23;border:1px solid #2d3340;border-radius:8px;padding:8px 12px;z-index:2147483638;font-size:12px;color:#e5e7eb;box-shadow:0 8px 24px rgba(0,0,0,.35)";
      let idx = 0;
      const count = this._posts.length;
      nav.innerHTML = `
      <div style="margin-bottom:6px;font-weight:600">${count} own post${count === 1 ? "" : "s"}</div>
      <div style="display:flex;gap:4px;align-items:center">
        <button type="button" data-dir="prev" style="background:#374151;color:#fff;border:none;border-radius:4px;padding:3px 8px;cursor:pointer">Up</button>
        <button type="button" data-dir="next" style="background:#374151;color:#fff;border:none;border-radius:4px;padding:3px 8px;cursor:pointer">Down</button>
      </div>
    `;
      nav.querySelector('[data-dir="prev"]').addEventListener("click", () => {
        if (!this._posts.length) return;
        idx = (idx - 1 + this._posts.length) % this._posts.length;
        this._posts[idx].scrollIntoView({ behavior: "smooth", block: "center" });
      });
      nav.querySelector('[data-dir="next"]').addEventListener("click", () => {
        if (!this._posts.length) return;
        idx = (idx + 1) % this._posts.length;
        this._posts[idx].scrollIntoView({ behavior: "smooth", block: "center" });
      });
      document.body.appendChild(nav);
    },
    renderDashboardPanel(container) {
      container.innerHTML = `
      <div class="btt-panel">
        <p>Enter your Bitcointalk username to highlight your own posts on topic pages.</p>
        <label style="font-size:13px">Your username:<br>
          <input type="text" id="btt-spf-user" placeholder="YourUsername"
            style="width:100%;max-width:280px;margin-top:4px;padding:6px 8px;border-radius:4px;border:1px solid var(--border,#2d3340);background:var(--bg-input,#1e2025);color:var(--text,#e5e7eb);font-size:13px;box-sizing:border-box">
        </label>
        <div style="display:flex;gap:8px;align-items:center;margin-top:8px;flex-wrap:wrap">
          <button id="btt-spf-save" class="btt-btn btt-btn-primary">Save</button>
          <span id="btt-spf-status" style="font-size:12px;color:var(--text-secondary,#9ca3af)"></span>
        </div>
        <p style="font-size:12px;color:var(--text-secondary,#9ca3af);margin-top:10px">
          After saving, enable Self-Post Finder and refresh or switch back to the Bitcointalk topic page.
        </p>
      </div>
    `;
      getSettings().then((settings) => {
        container.querySelector("#btt-spf-user").value = settings[USERNAME_SETTING] || "";
      });
      container.querySelector("#btt-spf-save").addEventListener("click", async () => {
        const value = container.querySelector("#btt-spf-user").value.trim();
        this._username = value;
        await updateSetting(USERNAME_SETTING, value);
        container.querySelector("#btt-spf-status").textContent = value ? "Saved." : "Cleared.";
        this._scan?.();
      });
    }
  };

  // src/modules/ignoreEnhancer.js
  init_storage();
  var ignoreEnhancer_default = {
    id: "ignoreEnhancer",
    name: "Ignore Enhancer",
    description: "Locally hide or collapse posts from specific users without using Bitcointalk's ignore system.",
    category: "Layout & Reading",
    defaultEnabled: false,
    _ignored: [],
    _observer: null,
    async init(api) {
      const s = await getSettings();
      this._ignored = s.ignoredUsers || [];
      this._processAll();
      this._observer = new MutationObserver(() => this._processAll());
      this._observer.observe(document.body, { childList: true, subtree: true });
    },
    destroy() {
      this._observer?.disconnect();
      document.querySelectorAll('[data-btt-ignored="1"]').forEach((el) => el.style.display = "");
      this._observer = null;
    },
    _processAll() {
      if (!this._ignored.length) return;
      const ignLower = this._ignored.map((u) => u.toLowerCase());
      document.querySelectorAll("td.poster_info b > a, td.poster_info a").forEach((a) => {
        const username = a.textContent.trim().toLowerCase();
        if (!ignLower.includes(username)) return;
        const row = a.closest("tr");
        if (row && !row.dataset.bttIgnored) {
          row.dataset.bttIgnored = "1";
          row.style.opacity = ".3";
          row.title = "Hidden by Ignore Enhancer \u2014 click to show";
          row.style.cursor = "pointer";
          row.addEventListener("click", () => {
            row.style.opacity = "1";
            row.style.cursor = "";
            row.title = "";
          });
        }
      });
    },
    renderDashboardPanel(container) {
      let ignored = [];
      getSettings().then((s) => {
        ignored = s.ignoredUsers || [];
        renderList();
      });
      container.innerHTML = `
      <div class="btt-panel">
        <p>Posts from ignored users will be dimmed. Click a dimmed post to reveal it.</p>
        <div style="display:flex;gap:8px;margin-top:10px">
          <input type="text" id="btt-ign-input" placeholder="Username to ignore\u2026" style="flex:1;padding:6px 8px;border-radius:4px;border:1px solid var(--border,#2d3340);background:var(--bg-input,#1e2025);color:var(--text,#e5e7eb);font-size:13px">
          <button id="btt-ign-add" class="btt-btn btt-btn-primary">Add</button>
        </div>
        <div id="btt-ign-list" style="margin-top:10px;display:flex;flex-wrap:wrap;gap:6px"></div>
      </div>
    `;
      const renderList = () => {
        const list = container.querySelector("#btt-ign-list");
        if (!list) return;
        list.innerHTML = "";
        ignored.forEach((u, i) => {
          const chip = document.createElement("span");
          chip.style.cssText = "background:#374151;padding:3px 10px;border-radius:14px;font-size:12px;display:inline-flex;align-items:center;gap:6px;";
          chip.innerHTML = `${escapeHtml(u)} <button data-i="${i}" class="del-ign" style="background:none;border:none;color:#9ca3af;cursor:pointer;font-size:14px;padding:0">\xD7</button>`;
          list.appendChild(chip);
        });
        list.querySelectorAll(".del-ign").forEach((btn) => {
          btn.addEventListener("click", async () => {
            ignored.splice(parseInt(btn.dataset.i, 10), 1);
            this._ignored = ignored;
            await updateSetting("ignoredUsers", ignored);
            renderList();
          });
        });
      };
      container.querySelector("#btt-ign-add").addEventListener("click", async () => {
        const val = container.querySelector("#btt-ign-input").value.trim();
        if (!val || ignored.includes(val)) return;
        ignored.push(val);
        this._ignored = ignored;
        await updateSetting("ignoredUsers", ignored);
        container.querySelector("#btt-ign-input").value = "";
        renderList();
      });
    }
  };

  // src/modules/mobileEnhancer.js
  var STYLE_ID4 = "btt-mobile-style";
  var MOBILE_CSS = `
@media (max-width: 768px) {
  /* Bigger tap targets for buttons */
  input[type=submit], .button_submit, .button { min-height:44px!important; font-size:16px!important; padding:10px 16px!important; }
  /* Larger code blocks */
  code, pre { font-size:12px!important; }
  /* Better post spacing */
  td.poster_info { display:none!important; }
  td.td_headerandpost { width:100%!important; }
  /* Sticky reply box */
  #btt-sticky-reply-bar { display:flex!important; }
}
#btt-sticky-reply-bar {
  display:none;
  position:fixed;bottom:0;left:0;right:0;
  background:#1a1d23;border-top:1px solid #2d3340;
  padding:8px 12px;z-index:2147483638;
  align-items:center;justify-content:center;gap:10px;
}
#btt-sticky-reply-bar button {
  padding:8px 18px;border-radius:6px;border:none;cursor:pointer;
  font-size:14px;font-family:inherit;
}
`;
  var mobileEnhancer_default = {
    id: "mobileEnhancer",
    name: "Mobile Enhancer",
    description: "Improves Bitcointalk usability on mobile devices.",
    category: "Layout & Reading",
    defaultEnabled: true,
    _style: null,
    _bar: null,
    init(api) {
      const isMobile = /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
      if (!isMobile && !api.settings?.mobileEnhancer) return;
      this._applyStyles();
      this._addStickyBar();
    },
    destroy() {
      document.getElementById(STYLE_ID4)?.remove();
      document.getElementById("btt-sticky-reply-bar")?.remove();
    },
    _applyStyles() {
      if (document.getElementById(STYLE_ID4)) return;
      const style = document.createElement("style");
      style.id = STYLE_ID4;
      style.textContent = MOBILE_CSS;
      document.head.appendChild(style);
    },
    _addStickyBar() {
      if (document.getElementById("btt-sticky-reply-bar")) return;
      const bar = document.createElement("div");
      bar.id = "btt-sticky-reply-bar";
      bar.innerHTML = `
      <button onclick="document.querySelector('#message,textarea[name=message]')?.scrollIntoView({behavior:'smooth',block:'center'})" style="background:#3b82f6;color:#fff">Reply</button>
      <button onclick="window.scrollTo({top:0,behavior:'smooth'})" style="background:#374151;color:#e5e7eb">Top \u2191</button>
    `;
      document.body.appendChild(bar);
      this._bar = bar;
    },
    renderDashboardPanel(container) {
      container.innerHTML = `<div class="btt-panel"><p>Adds mobile-friendly improvements: sticky reply button, larger tap targets, better layout on small screens.</p></div>`;
    }
  };

  // src/modules/scraper.js
  var _menuBtn = null;
  var scraper_default = {
    id: "scraper",
    name: "Thread Scraper",
    description: "Scrape posts, addresses, links, and campaign data from Bitcointalk threads.",
    category: "Thread Tools",
    defaultEnabled: false,
    init() {
      const menu = document.getElementById("btt-mini-menu");
      if (!menu) return;
      _menuBtn = document.createElement("button");
      _menuBtn.innerHTML = "<span>\u{1F50D}</span> Thread Scraper";
      _menuBtn.addEventListener("click", () => {
        menu.classList.remove("open");
        chrome.runtime.sendMessage({ action: "openDashboard", section: "thread" });
      });
      menu.appendChild(_menuBtn);
    },
    destroy() {
      _menuBtn?.remove();
      _menuBtn = null;
    }
  };

  // src/modules/personalPostLibrary.js
  init_storage();
  var _btn = null;
  var _popup = null;
  var _api = null;
  var personalPostLibrary_default = {
    id: "personalPostLibrary",
    name: "Personal Post Library",
    description: "Save and reuse BBCode snippets quickly.",
    category: "Posting & BBCode",
    defaultEnabled: false,
    init(api) {
      _api = api;
      _injectPageButton();
    },
    destroy() {
      _btn?.remove();
      _btn = null;
      _popup?.remove();
      _popup = null;
      _api = null;
    },
    renderDashboardPanel(container) {
      _renderLibraryUI(container);
    }
  };
  function _injectPageButton() {
    const ta = document.querySelector("#message") || document.querySelector('textarea[name="message"]');
    if (!ta) return;
    const wrap = ta.closest("td") || ta.parentElement;
    if (!wrap || document.getElementById("btt-snippets-btn")) return;
    _btn = document.createElement("button");
    _btn.id = "btt-snippets-btn";
    _btn.textContent = "\u{1F4DA} Snippets";
    _btn.title = "Insert a saved BBCode snippet";
    Object.assign(_btn.style, {
      marginTop: "6px",
      padding: "5px 10px",
      borderRadius: "4px",
      border: "1px solid #4b5563",
      background: "#1f2937",
      color: "#e5e7eb",
      cursor: "pointer",
      fontSize: "12px",
      display: "block"
    });
    _btn.addEventListener("click", (e) => {
      e.preventDefault();
      _togglePopup(ta);
    });
    wrap.appendChild(_btn);
  }
  function _togglePopup(ta) {
    if (_popup) {
      _popup.remove();
      _popup = null;
      return;
    }
    _popup = document.createElement("div");
    Object.assign(_popup.style, {
      position: "absolute",
      zIndex: "999990",
      background: "#1a1b2e",
      border: "1px solid #374151",
      borderRadius: "8px",
      boxShadow: "0 8px 32px rgba(0,0,0,.6)",
      width: "320px",
      maxHeight: "360px",
      display: "flex",
      flexDirection: "column"
    });
    _popup.innerHTML = `
<div style="padding:10px 12px;border-bottom:1px solid #374151;display:flex;justify-content:space-between;align-items:center">
  <strong style="font-size:13px;color:#e5e7eb">\u{1F4DA} Snippets</strong>
  <button id="btt-snip-close" style="background:none;border:none;color:#9ca3af;font-size:18px;cursor:pointer;line-height:1">\xD7</button>
</div>
<div style="padding:8px 10px;border-bottom:1px solid #374151">
  <input id="btt-snip-search" type="search" placeholder="Search snippets\u2026" style="width:100%;padding:5px 8px;border-radius:4px;border:1px solid #374151;background:#374151;color:#e5e7eb;font-size:12px;box-sizing:border-box">
</div>
<div id="btt-snip-list" style="overflow-y:auto;flex:1;padding:4px 0"></div>`;
    document.body.appendChild(_popup);
    const rect = _btn.getBoundingClientRect();
    _popup.style.top = rect.bottom + window.scrollY + 4 + "px";
    _popup.style.left = rect.left + window.scrollX + "px";
    _popup.querySelector("#btt-snip-close").addEventListener("click", () => {
      _popup.remove();
      _popup = null;
    });
    document.addEventListener("click", function handler(e) {
      if (_popup && !_popup.contains(e.target) && e.target !== _btn) {
        _popup.remove();
        _popup = null;
        document.removeEventListener("click", handler);
      }
    }, { capture: true });
    const loadList = async (query = "") => {
      const snippets = await getSnippets();
      const filtered = query ? snippets.filter((s) => s.name.toLowerCase().includes(query) || (s.content || "").toLowerCase().includes(query)) : snippets;
      const listEl = _popup?.querySelector("#btt-snip-list");
      if (!listEl) return;
      if (!filtered.length) {
        listEl.innerHTML = `<p style="padding:12px;text-align:center;font-size:12px;color:#6b7280">${query ? "No results." : "No snippets saved yet.\nCreate them in the Dashboard \u2192 Data \u2192 Snippets."}</p>`;
        return;
      }
      listEl.innerHTML = "";
      filtered.forEach((s) => {
        const item = document.createElement("div");
        item.style.cssText = "padding:8px 12px;cursor:pointer;border-radius:4px;margin:2px 6px;transition:background .1s";
        item.innerHTML = `
        <div style="font-size:12px;font-weight:600;color:#e5e7eb">${_esc(s.name)}</div>
        <div style="font-size:11px;color:#6b7280;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${_esc((s.content || "").slice(0, 60))}</div>`;
        item.addEventListener("mouseenter", () => item.style.background = "rgba(59,130,246,.15)");
        item.addEventListener("mouseleave", () => item.style.background = "");
        item.addEventListener("click", () => {
          _insertIntoTextarea(ta, s.content || "");
          _popup.remove();
          _popup = null;
        });
        listEl.appendChild(item);
      });
    };
    _popup.querySelector("#btt-snip-search").addEventListener("input", (e) => loadList(e.target.value.toLowerCase()));
    loadList();
  }
  function _insertIntoTextarea(ta, text) {
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    ta.value = ta.value.slice(0, start) + text + ta.value.slice(end);
    ta.selectionStart = ta.selectionEnd = start + text.length;
    ta.dispatchEvent(new Event("input"));
    ta.focus();
  }
  function _esc(s) {
    return s ? String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";
  }
  function _renderLibraryUI(container) {
    container.innerHTML = `
<div style="display:flex;flex-direction:column;gap:14px;max-width:800px">
  <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
    <input id="ppl-search" type="search" placeholder="Search snippets\u2026" style="flex:1;min-width:180px;padding:7px 10px;border-radius:6px;border:1px solid var(--border,#374151);background:var(--bg-secondary,#111827);color:var(--text,#e5e7eb);font-size:13px">
    <button id="ppl-add" style="padding:7px 14px;border-radius:6px;border:none;background:var(--accent,#3b82f6);color:#fff;cursor:pointer;font-size:13px;white-space:nowrap">+ New Snippet</button>
  </div>
  <div id="ppl-list" style="display:flex;flex-direction:column;gap:8px"></div>
</div>`;
    const loadList = async (query = "") => {
      const snippets = await getSnippets();
      const filtered = query ? snippets.filter((s) => s.name.toLowerCase().includes(query) || (s.content || "").toLowerCase().includes(query)) : snippets;
      _renderSnippetList(filtered, container.querySelector("#ppl-list"), loadList);
    };
    container.querySelector("#ppl-search").addEventListener("input", (e) => loadList(e.target.value.toLowerCase()));
    container.querySelector("#ppl-add").addEventListener("click", () => {
      _showSnippetEditor(null, () => loadList());
    });
    loadList();
  }
  function _renderSnippetList(snippets, listEl, reload) {
    listEl.innerHTML = "";
    if (!snippets.length) {
      listEl.innerHTML = `<p style="color:var(--text-secondary,#9ca3af);font-size:13px">No snippets yet. Click <strong>+ New Snippet</strong> to create one.</p>`;
      return;
    }
    snippets.forEach((s) => {
      const card = document.createElement("div");
      card.style.cssText = "border:1px solid var(--border,#374151);border-radius:8px;padding:12px 14px;display:flex;gap:12px;align-items:flex-start;";
      card.innerHTML = `
      <div style="flex:1;min-width:0">
        <div style="font-weight:600;font-size:13px;margin-bottom:4px">${_esc(s.name)}</div>
        <div style="font-size:11px;color:var(--text-secondary,#9ca3af);font-family:monospace;white-space:pre-wrap;overflow:hidden;max-height:60px;text-overflow:ellipsis">${_esc((s.content || "").slice(0, 200))}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:5px;flex-shrink:0">
        <button class="ppl-copy" style="padding:4px 10px;border-radius:4px;border:1px solid var(--border,#374151);background:none;color:var(--text,#e5e7eb);cursor:pointer;font-size:11px">Copy</button>
        <button class="ppl-edit" style="padding:4px 10px;border-radius:4px;border:1px solid var(--border,#374151);background:none;color:var(--text,#e5e7eb);cursor:pointer;font-size:11px">Edit</button>
        <button class="ppl-del"  style="padding:4px 10px;border-radius:4px;border:1px solid #7f1d1d;background:none;color:#ef4444;cursor:pointer;font-size:11px">Delete</button>
      </div>`;
      card.querySelector(".ppl-copy").addEventListener("click", () => {
        navigator.clipboard.writeText(s.content || "").then(() => {
          const btn = card.querySelector(".ppl-copy");
          btn.textContent = "\u2713";
          setTimeout(() => {
            btn.textContent = "Copy";
          }, 1500);
        });
      });
      card.querySelector(".ppl-edit").addEventListener("click", () => _showSnippetEditor(s, reload));
      card.querySelector(".ppl-del").addEventListener("click", async () => {
        if (confirm(`Delete snippet "${s.name}"?`)) {
          await deleteSnippet(s.id);
          reload();
        }
      });
      listEl.appendChild(card);
    });
  }
  function _showSnippetEditor(existing, onSave) {
    const modal = document.createElement("div");
    Object.assign(modal.style, {
      position: "fixed",
      inset: "0",
      zIndex: "999995",
      background: "rgba(0,0,0,.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    });
    modal.innerHTML = `
<div style="background:var(--bg,#1a1b2e);border:1px solid var(--border,#374151);border-radius:10px;padding:20px;width:min(96vw,560px);display:flex;flex-direction:column;gap:12px">
  <h3 style="margin:0;font-size:14px">${existing ? "Edit" : "New"} Snippet</h3>
  <input id="se-name" class="form-input" value="${_esc(existing?.name || "")}" placeholder="Snippet name" style="padding:8px 10px;border-radius:6px;border:1px solid var(--border,#374151);background:var(--bg-secondary,#111827);color:var(--text,#e5e7eb);font-size:13px">
  <textarea id="se-content" rows="8" style="padding:8px 10px;border-radius:6px;border:1px solid var(--border,#374151);background:var(--bg-secondary,#111827);color:var(--text,#e5e7eb);font-size:12px;font-family:monospace;resize:vertical" placeholder="BBCode content\u2026">${_esc(existing?.content || "")}</textarea>
  <div style="display:flex;gap:8px;justify-content:flex-end">
    <button id="se-cancel" style="padding:7px 16px;border-radius:5px;border:1px solid var(--border,#374151);background:none;color:var(--text,#e5e7eb);cursor:pointer">Cancel</button>
    <button id="se-save"   style="padding:7px 16px;border-radius:5px;border:none;background:var(--accent,#3b82f6);color:#fff;cursor:pointer;font-weight:600">Save</button>
  </div>
</div>`;
    document.body.appendChild(modal);
    modal.querySelector("#se-cancel").addEventListener("click", () => modal.remove());
    modal.querySelector("#se-save").addEventListener("click", async () => {
      const name = modal.querySelector("#se-name").value.trim();
      const content = modal.querySelector("#se-content").value;
      if (!name) {
        alert("Please enter a name.");
        return;
      }
      await saveSnippet({ id: existing?.id, name, content });
      modal.remove();
      onSave();
    });
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  // src/modules/mentionHelper.js
  var _api2 = null;
  var mentionHelper_default = {
    id: "mentionHelper",
    name: "Mention Helper",
    description: "Generate profile link BBCode for any username.",
    category: "User/Profile Tools",
    defaultEnabled: false,
    init(api) {
      _api2 = api;
      _injectClickHandlers();
    },
    destroy() {
      document.querySelectorAll(".btt-mention-tooltip").forEach((el) => el.remove());
      _api2 = null;
    },
    renderDashboardPanel(container) {
      _renderMentionUI(container);
    }
  };
  function _injectClickHandlers() {
    document.querySelectorAll("td.poster_info b > a, td.poster_info > a").forEach((link) => {
      link.addEventListener("click", (e) => {
        if (!e.shiftKey) return;
        e.preventDefault();
        const username = link.textContent.trim();
        const profileHref = link.getAttribute("href") || "";
        const profileUrl = profileHref.startsWith("http") ? profileHref : profileHref ? "https://bitcointalk.org" + (profileHref.startsWith("/") ? "" : "/") + profileHref : "";
        _showMentionTooltip(link, username, profileUrl);
      });
    });
  }
  var _tooltip = null;
  function _showMentionTooltip(anchor, username, profileUrl) {
    _tooltip?.remove();
    const bbcodeLink = profileUrl ? `[url=${profileUrl}]${username}[/url]` : username;
    const bbcodeMention = `@${username}`;
    _tooltip = document.createElement("div");
    Object.assign(_tooltip.style, {
      position: "fixed",
      zIndex: "999993",
      background: "#1a1b2e",
      border: "1px solid #374151",
      borderRadius: "8px",
      boxShadow: "0 8px 24px rgba(0,0,0,.6)",
      padding: "10px 12px",
      fontSize: "12px",
      color: "#e5e7eb",
      minWidth: "240px"
    });
    _tooltip.innerHTML = `
<div style="font-size:11px;color:#9ca3af;margin-bottom:6px">Mention BBCode for <strong style="color:#e5e7eb">${_esc2(username)}</strong></div>
<div style="display:flex;flex-direction:column;gap:5px">
  <div style="display:flex;gap:6px;align-items:center">
    <code style="flex:1;background:#374151;padding:4px 7px;border-radius:4px;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${_esc2(bbcodeLink)}</code>
    <button data-copy="${_esc2(bbcodeLink)}" style="padding:3px 8px;border-radius:4px;border:1px solid #4b5563;background:none;color:#e5e7eb;cursor:pointer;font-size:10px;white-space:nowrap">Copy</button>
  </div>
  <div style="display:flex;gap:6px;align-items:center">
    <code style="flex:1;background:#374151;padding:4px 7px;border-radius:4px;font-size:11px">${_esc2(bbcodeMention)}</code>
    <button data-copy="${_esc2(bbcodeMention)}" style="padding:3px 8px;border-radius:4px;border:1px solid #4b5563;background:none;color:#e5e7eb;cursor:pointer;font-size:10px;white-space:nowrap">Copy</button>
  </div>
</div>`;
    document.body.appendChild(_tooltip);
    const rect = anchor.getBoundingClientRect();
    _tooltip.style.top = Math.min(rect.bottom + 6, window.innerHeight - _tooltip.offsetHeight - 8) + "px";
    _tooltip.style.left = Math.min(rect.left, window.innerWidth - _tooltip.offsetWidth - 8) + "px";
    _tooltip.querySelectorAll("[data-copy]").forEach((btn) => {
      btn.addEventListener("click", () => {
        navigator.clipboard.writeText(btn.dataset.copy).then(() => {
          btn.textContent = "\u2713";
          setTimeout(() => {
            btn.textContent = "Copy";
          }, 1500);
        });
      });
    });
    const dismiss = (e) => {
      if (!_tooltip.contains(e.target)) {
        _tooltip.remove();
        _tooltip = null;
        document.removeEventListener("click", dismiss, true);
      }
    };
    setTimeout(() => document.addEventListener("click", dismiss, true), 50);
  }
  function _esc2(s) {
    return s ? String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;") : "";
  }
  function _renderMentionUI(container) {
    container.innerHTML = `
<div style="display:flex;flex-direction:column;gap:14px;max-width:600px">
  <div style="background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.3);border-radius:6px;padding:12px;font-size:12px;color:var(--text-secondary,#9ca3af)">
    <strong style="color:var(--accent,#60a5fa)">On Bitcointalk pages:</strong> Hold <kbd style="padding:1px 5px;border:1px solid #4b5563;border-radius:3px;font-size:11px">Shift</kbd> and click any username to get a copy-ready mention BBCode.
  </div>
  <div>
    <label style="font-size:12px;color:var(--text-secondary,#9ca3af);font-weight:500;display:block;margin-bottom:6px">GENERATE MENTION BBCode</label>
    <div style="display:flex;gap:8px;align-items:flex-start;flex-wrap:wrap">
      <input id="mh-username" type="text" placeholder="Username" style="flex:1;min-width:160px;padding:7px 10px;border-radius:6px;border:1px solid var(--border,#374151);background:var(--bg-secondary,#111827);color:var(--text,#e5e7eb);font-size:13px">
      <input id="mh-uid" type="text" placeholder="Profile UID (optional)" style="flex:0 0 180px;padding:7px 10px;border-radius:6px;border:1px solid var(--border,#374151);background:var(--bg-secondary,#111827);color:var(--text,#e5e7eb);font-size:13px">
      <button id="mh-generate" class="btt-btn btt-btn-primary">Generate</button>
    </div>
  </div>
  <div id="mh-results" style="display:none;display:flex;flex-direction:column;gap:8px"></div>
</div>`;
    container.querySelector("#mh-generate").addEventListener("click", () => {
      const username = container.querySelector("#mh-username").value.trim();
      const uid = container.querySelector("#mh-uid").value.trim();
      if (!username) return;
      const profileUrl = uid ? `https://bitcointalk.org/index.php?action=profile;u=${uid}` : `https://bitcointalk.org/index.php?action=profile;u=USERNAME_UID`;
      const variants = [
        { label: "Profile link (with name)", value: `[url=${profileUrl}]${username}[/url]` },
        { label: "Bold mention", value: `[b]${username}[/b]` },
        { label: "@mention (plain)", value: `@${username}` },
        { label: "Quote reference", value: `[quote author=${username}]` }
      ];
      const resultsEl = container.querySelector("#mh-results");
      resultsEl.style.display = "flex";
      resultsEl.innerHTML = variants.map((v) => `
      <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--bg-secondary,#111827);border:1px solid var(--border,#374151);border-radius:6px">
        <span style="font-size:11px;color:var(--text-secondary,#9ca3af);flex:0 0 160px">${_esc2(v.label)}</span>
        <code style="flex:1;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${_esc2(v.value)}</code>
        <button data-val="${_esc2(v.value)}" class="mh-copy-btn" style="padding:4px 10px;border-radius:4px;border:1px solid var(--border,#374151);background:none;color:var(--text,#e5e7eb);cursor:pointer;font-size:11px;white-space:nowrap">Copy</button>
      </div>`).join("");
      resultsEl.querySelectorAll(".mh-copy-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          navigator.clipboard.writeText(btn.dataset.val).then(() => {
            btn.textContent = "\u2713";
            setTimeout(() => {
              btn.textContent = "Copy";
            }, 1500);
          });
        });
      });
    });
    container.querySelector("#mh-uid").addEventListener("keydown", (e) => {
      if (e.key === "Enter") container.querySelector("#mh-generate").click();
    });
    container.querySelector("#mh-username").addEventListener("keydown", (e) => {
      if (e.key === "Enter") container.querySelector("#mh-generate").click();
    });
  }

  // src/modules/rankProgressTracker.js
  init_constants();
  init_storage();
  function getCurrentRank(activity, merit) {
    let rank = BTC_RANKS[0];
    for (const item of BTC_RANKS) {
      if (activity >= item.minActivity && merit >= item.minMerit) rank = item;
      else break;
    }
    return rank;
  }
  function getNextRank(activity, merit) {
    for (const item of BTC_RANKS) {
      if (activity < item.minActivity || merit < item.minMerit) return item;
    }
    return null;
  }
  function renderProgressBar(percent, color) {
    return `
    <div style="background:#374151;border-radius:4px;height:8px;overflow:hidden">
      <div style="height:100%;background:${color};width:${percent}%;transition:width .3s;border-radius:4px"></div>
    </div>
  `;
  }
  var rankProgressTracker_default = {
    id: "rankProgressTracker",
    name: "Rank Progress Tracker",
    description: "Enter your activity and merit to see your current rank and progress to the next.",
    category: "User/Profile Tools",
    defaultEnabled: false,
    init() {
    },
    destroy() {
    },
    async renderDashboardPanel(container) {
      container.innerHTML = `
      <div class="btt-panel">
        <p style="font-size:13px;color:var(--text-secondary,#aaa)">
          Bitcointalk ranks depend on activity and merit. Enter yours below.
        </p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin-top:10px;">
          <label style="font-size:13px;">Activity<br>
            <input type="number" id="btt-rpt-activity" placeholder="e.g. 300" min="0"
              style="width:100%;padding:6px 8px;border-radius:4px;border:1px solid var(--border,#2d3340);background:var(--bg-input,#1e2025);color:var(--text,#e5e7eb);margin-top:4px;box-sizing:border-box">
          </label>
          <label style="font-size:13px;">Merit<br>
            <input type="number" id="btt-rpt-merit" placeholder="e.g. 50" min="0"
              style="width:100%;padding:6px 8px;border-radius:4px;border:1px solid var(--border,#2d3340);background:var(--bg-input,#1e2025);color:var(--text,#e5e7eb);margin-top:4px;box-sizing:border-box">
          </label>
        </div>
        <div style="display:flex;gap:8px;align-items:center;margin-top:10px;flex-wrap:wrap">
          <button id="btt-rpt-check" class="btt-btn btt-btn-primary">Check Rank</button>
          <button id="btt-rpt-save" class="btt-btn btt-btn-secondary">Save Values</button>
          <span id="btt-rpt-save-status" style="font-size:12px;color:var(--text-secondary,#9ca3af)"></span>
        </div>
        <div id="btt-rpt-result" style="margin-top:14px;display:none;"></div>

        <hr style="margin:16px 0;border-color:var(--border,#2d3340)">
        <h4 style="font-size:13px;">All Rank Thresholds</h4>
        <table style="width:100%;border-collapse:collapse;font-size:12px;margin-top:6px;">
          <thead>
            <tr style="background:var(--bg-panel,#161a21);">
              <th style="padding:5px 8px;text-align:left;border:1px solid var(--border,#2d3340)">Rank</th>
              <th style="padding:5px 8px;text-align:right;border:1px solid var(--border,#2d3340)">Min Activity</th>
              <th style="padding:5px 8px;text-align:right;border:1px solid var(--border,#2d3340)">Min Merit</th>
            </tr>
          </thead>
          <tbody>
            ${BTC_RANKS.map((rank) => `
              <tr>
                <td style="padding:5px 8px;border:1px solid var(--border,#2d3340);color:${rank.color}">${rank.name}</td>
                <td style="padding:5px 8px;border:1px solid var(--border,#2d3340);text-align:right">${rank.minActivity}</td>
                <td style="padding:5px 8px;border:1px solid var(--border,#2d3340);text-align:right">${rank.minMerit}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <p style="font-size:11px;color:var(--text-secondary,#aaa);margin-top:8px">
          Activity is not exactly equal to post count. These thresholds are approximate.
        </p>
      </div>
    `;
      const activityInput = container.querySelector("#btt-rpt-activity");
      const meritInput = container.querySelector("#btt-rpt-merit");
      const result = container.querySelector("#btt-rpt-result");
      const saveStatus = container.querySelector("#btt-rpt-save-status");
      const calculate = () => {
        const activity = parseInt(activityInput.value, 10) || 0;
        const merit = parseInt(meritInput.value, 10) || 0;
        const current = getCurrentRank(activity, merit);
        const next = getNextRank(activity, merit);
        result.style.display = "block";
        let html = `
        <div style="background:var(--bg-panel,#161a21);border-radius:8px;padding:12px;border:1px solid var(--border,#2d3340)">
          <div style="font-size:16px;font-weight:700;color:${current.color}">${current.name}</div>
          <div style="font-size:12px;color:var(--text-secondary,#aaa);margin-top:2px">Activity: ${activity} | Merit: ${merit}</div>
      `;
        if (next) {
          const needActivity = Math.max(0, next.minActivity - activity);
          const needMerit = Math.max(0, next.minMerit - merit);
          const actPct = Math.min(100, next.minActivity > 0 ? Math.round(activity / next.minActivity * 100) : 100);
          const meritPct = Math.min(100, next.minMerit > 0 ? Math.round(merit / next.minMerit * 100) : 100);
          html += `
          <div style="margin-top:10px;font-size:13px;color:var(--text,#e5e7eb)">Next rank: <strong style="color:${next.color}">${next.name}</strong></div>
          <div style="margin-top:6px;font-size:12px;color:var(--text-secondary,#aaa)">
            Need ${needActivity > 0 ? `+${needActivity} activity` : "enough activity"} and ${needMerit > 0 ? `+${needMerit} merit` : "enough merit"}
          </div>
          <div style="margin-top:8px">
            <div style="font-size:11px;margin-bottom:2px;color:var(--text-secondary,#aaa)">Activity progress: ${actPct}%</div>
            ${renderProgressBar(actPct, "#3b82f6")}
          </div>
          <div style="margin-top:6px">
            <div style="font-size:11px;margin-bottom:2px;color:var(--text-secondary,#aaa)">Merit progress: ${meritPct}%</div>
            ${renderProgressBar(meritPct, "#f7931a")}
          </div>
        `;
        } else {
          html += '<div style="margin-top:8px;color:#f7931a;font-size:14px">You have reached the highest rank: Legendary.</div>';
        }
        result.innerHTML = `${html}</div>`;
      };
      const settings = await getSettings();
      if (settings.rankProgressActivity != null) activityInput.value = settings.rankProgressActivity;
      if (settings.rankProgressMerit != null) meritInput.value = settings.rankProgressMerit;
      if (activityInput.value || meritInput.value) calculate();
      container.querySelector("#btt-rpt-check").addEventListener("click", calculate);
      activityInput.addEventListener("input", calculate);
      meritInput.addEventListener("input", calculate);
      container.querySelector("#btt-rpt-save").addEventListener("click", async () => {
        await updateSetting("rankProgressActivity", parseInt(activityInput.value, 10) || 0);
        await updateSetting("rankProgressMerit", parseInt(meritInput.value, 10) || 0);
        saveStatus.textContent = "Saved.";
        calculate();
      });
    }
  };

  // src/modules/postLinkCopier.js
  init_sharedUI();
  var ATTR = "data-btt-link-applied";
  var _observer = null;
  function _getPostUrl(postDiv) {
    const msgId = postDiv?.id?.replace("msg_", "");
    if (!msgId) return location.href;
    const topicId = getTopicId();
    if (!topicId) {
      const anchor = postDiv.closest("tr")?.querySelector('a[href*="#msg"]');
      return anchor ? anchor.href : location.href;
    }
    return `https://bitcointalk.org/index.php?topic=${topicId}.msg${msgId}#msg${msgId}`;
  }
  function _processPost(postDiv) {
    if (!postDiv || postDiv.getAttribute(ATTR)) return;
    postDiv.setAttribute(ATTR, "1");
    const row = postDiv.closest("tr");
    if (!row) return;
    const header = row.querySelector(".subject, td.td_headerandpost > table .subject, b.subject") || row.querySelector(".smalltext") || row.querySelector("td.td_headerandpost > table > tbody > tr:first-child td");
    if (!header) return;
    const btn = document.createElement("button");
    btn.className = "btt-postlink-btn";
    btn.textContent = "\u{1F517}";
    btn.title = "Copy link to this post";
    btn.style.cssText = [
      "background:none",
      "border:none",
      "cursor:pointer",
      "font-size:12px",
      "padding:0 4px",
      "margin-left:6px",
      "color:#9ca3af",
      "vertical-align:middle",
      "opacity:.7",
      "transition:opacity .15s"
    ].join(";");
    btn.addEventListener("mouseenter", () => {
      btn.style.opacity = "1";
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.opacity = ".7";
    });
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      e.preventDefault();
      const url = _getPostUrl(postDiv);
      const ok = await copyToClipboard(url);
      btn.textContent = ok ? "\u2713" : "\u2717";
      btn.style.color = ok ? "#22c55e" : "#ef4444";
      setTimeout(() => {
        btn.textContent = "\u{1F517}";
        btn.style.color = "#9ca3af";
      }, 1500);
      if (ok) Toast.success("Post link copied.");
    });
    header.appendChild(btn);
  }
  function _processAll() {
    document.querySelectorAll('[id^="msg_"]').forEach(_processPost);
  }
  var postLinkCopier_default = {
    id: "postLinkCopier",
    name: "Post Link Copier",
    description: "Adds a \u{1F517} button to every post header. Click to copy the direct post URL.",
    category: "Thread Tools",
    defaultEnabled: true,
    init(api) {
      _processAll();
      _observer = new MutationObserver(_processAll);
      _observer.observe(document.body, { childList: true, subtree: true });
    },
    destroy() {
      _observer?.disconnect();
      _observer = null;
      document.querySelectorAll(".btt-postlink-btn").forEach((b) => b.remove());
      document.querySelectorAll(`[${ATTR}]`).forEach((el) => el.removeAttribute(ATTR));
    },
    renderDashboardPanel(container) {
      container.innerHTML = `
      <div class="btt-panel">
        <p style="font-size:13px;color:var(--text-secondary,#9ca3af)">
          Adds a small \u{1F517} icon to every post's subject line. Click it to copy the canonical post URL
          (<code>topic=X.msgY#msgY</code>) to your clipboard. Works on any thread page.
        </p>
      </div>
    `;
    }
  };

  // src/modules/trustPositionBadge.js
  init_storage();
  init_sharedUI();
  var DEFAULT_TRUST_URL = "https://bitcointalk.org/index.php?action=trust;dt";
  var DT_DATA_URL = "https://raw.githubusercontent.com/misfoxie/bitcointalk-dt-data/main/bitcointalk_dt.json";
  var DT_REFRESH_INTERVAL_HOURS = 6;
  var CACHE_KEY = "bitcointalk_dt_data";
  var CACHE_TIMESTAMP_KEY = "bitcointalk_dt_data_timestamp";
  var LEGACY_CACHE_KEY = "dtCache";
  var STYLE_ID5 = "btt-trust-position-style";
  var APPLIED_ATTR = "data-btt-trust-badge";
  var PROCESSED_ATTR = "data-btt-trust-processed";
  var RESCAN_DEBOUNCE_MS = 400;
  var FETCH_TIMEOUT_MS = 1e4;
  var CACHE_VERSION = 2;
  var MIN_VALID_CACHE_USERS = 50;
  var POSITIONS = {
    unavailable: { label: "DT unavailable", className: "btt-trust-unavailable", title: "DT data could not be loaded." },
    dt0: { label: "DT0", className: "btt-trust-dt0", title: "DefaultTrust depth 0 according to cached DT data." },
    dt1: { label: "DT1", className: "btt-trust-dt1", title: "DefaultTrust depth 1 according to cached DT data." },
    dt2: { label: "DT2", className: "btt-trust-dt2", title: "DefaultTrust depth 2 according to cached DT data." },
    dt: { label: "DT", className: "btt-trust-dt", title: "DefaultTrust depth according to cached DT data." },
    none: { label: "Not in DT", className: "btt-trust-none", title: "This user is not in the cached DT data." }
  };
  var _settings = {};
  var _dtData = null;
  var _loadPromise = null;
  var _observer2 = null;
  var _messageHandler = null;
  var _rescanTimer = null;
  var _loggedFetchFailure = false;
  function emptyDtData(sourceUrl = "") {
    return {
      cache_version: CACHE_VERSION,
      updated_at: "",
      source_url: sourceUrl,
      sourceUrl,
      dt1Users: [],
      dt2Users: [],
      removedUsers: [],
      removed_index: {},
      fetch_status: "",
      cacheValid: false,
      stats: { total_users: 0, dt1_count: 0, dt2_count: 0 },
      users: {},
      username_index: {}
    };
  }
  function extractUserIdFromUserUrl(url) {
    if (!url) return null;
    const text = String(url);
    if (!/action=(?:profile|trust)/i.test(text)) return null;
    const match = text.match(/[?;&]u=(\d+)/);
    return match ? match[1] : null;
  }
  function cleanUsername(username) {
    return decodeHtmlEntities(username).replace(/\s+/g, " ").trim();
  }
  function normalizeUsername2(username) {
    return cleanUsername(username).toLowerCase();
  }
  function normalizeDtLevel(value) {
    const normalized = String(value || "").trim().toUpperCase().replace(/\s+/g, "");
    const match = normalized.match(/^DT?(\d+)$/);
    if (match) return `DT${match[1]}`;
    if (["NONE", "NODT", "NOTINDT", "NOT_DT"].includes(normalized)) return "NONE";
    return "";
  }
  function depthToDtLevel(depth) {
    if (depth === null || depth === void 0 || depth === "") return null;
    const n = Number(depth);
    if (Number.isInteger(n) && n >= 0) return `DT${n}`;
    return null;
  }
  function decodeHtmlEntities(value) {
    const text = String(value || "").replace(/&#(\d+);/g, (_, code) => {
      const n = Number(code);
      return Number.isFinite(n) ? String.fromCodePoint(n) : _;
    }).replace(/&#x([0-9a-f]+);/gi, (_, code) => {
      const n = Number.parseInt(code, 16);
      return Number.isFinite(n) ? String.fromCodePoint(n) : _;
    }).replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    if (typeof document === "undefined") return text;
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    return textarea.value;
  }
  function toPublicTrustUser(user) {
    return {
      userId: user.userId || user.user_id || null,
      user_id: user.user_id || user.userId || null,
      username: user.username || null,
      depth: user.depth,
      status: user.dt_level,
      dt_level: user.dt_level,
      profileUrl: user.profileUrl || ""
    };
  }
  function recomputeStats(data) {
    const users = Object.values(data.users || {});
    const removedUsers = data.removedUsers || [];
    data.stats = {
      total_users: users.length,
      dt1_count: users.filter((u) => u.dt_level === "DT1").length,
      dt2_count: users.filter((u) => u.dt_level === "DT2").length,
      removed_count: removedUsers.length
    };
    data.cacheValid = isCacheValidForBadges(data);
  }
  function isCacheValidForBadges(data) {
    const users = data?.users && typeof data.users === "object" ? data.users : {};
    const userEntries = Object.entries(users);
    const updatedAt = data?.updated_at || data?.updatedAt;
    const sourceText = String(data?.source || data?.source_url || data?.sourceUrl || "");
    const sourceIsGitHub = sourceText.includes(DT_DATA_URL);
    const numericUidKeys = userEntries.every(([uid, user]) => /^\d+$/.test(String(uid)) && String(user?.user_id || user?.userId || user?.uid || uid) === String(uid));
    return Boolean(updatedAt) && isCacheFresh({ updated_at: updatedAt }) && (sourceText.includes(DEFAULT_TRUST_URL) || sourceText.includes(DT_DATA_URL)) && userEntries.length >= MIN_VALID_CACHE_USERS && (sourceIsGitHub || numericUidKeys) && (data?.stats?.dt1_count || 0) > 0 && (data?.stats?.dt2_count || 0) > 0;
  }
  function isCacheFresh(data) {
    if (!data?.updated_at) return false;
    const updatedAt = Date.parse(data.updated_at);
    if (!Number.isFinite(updatedAt)) return false;
    return Date.now() - updatedAt < DT_REFRESH_INTERVAL_HOURS * 60 * 60 * 1e3;
  }
  function buildDtMaps(records) {
    const byUsername = /* @__PURE__ */ new Map();
    const byUid = /* @__PURE__ */ new Map();
    for (const item of records) {
      if (!item || !item.username) continue;
      const usernameKey = item.username.trim().toLowerCase();
      byUsername.set(usernameKey, item);
      if (item.uid !== null && item.uid !== void 0) {
        byUid.set(String(item.uid), item);
      }
    }
    return { byUsername, byUid };
  }
  async function loadDtData() {
    const response = await fetch(DT_DATA_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to load DT data: " + response.status);
    }
    const json = await response.json();
    if (!json || !Array.isArray(json.data)) {
      throw new Error("Invalid DT data format");
    }
    return json.data;
  }
  function normalizeGitHubDtRecords(records = [], timestamp = Date.now(), fetchStatus = "") {
    const normalized = emptyDtData(DT_DATA_URL);
    const updatedAt = Number(timestamp) || Date.now();
    normalized.updated_at = new Date(updatedAt).toISOString();
    normalized.updatedAt = normalized.updated_at;
    normalized.source = [DT_DATA_URL];
    normalized.source_url = DT_DATA_URL;
    normalized.sourceUrl = DT_DATA_URL;
    normalized.fetch_status = fetchStatus || "Using GitHub DT data";
    normalized.rawRecords = records;
    buildDtMaps(records);
    normalized.byUsername = /* @__PURE__ */ new Map();
    normalized.byUid = /* @__PURE__ */ new Map();
    for (const item of records) {
      if (!item || !item.username) continue;
      const username = cleanUsername(item.username);
      const usernameKey = normalizeUsername2(username);
      const uid = item.uid !== null && item.uid !== void 0 ? String(item.uid).trim() : "";
      const rawDepth = item.depth !== null && item.depth !== void 0 ? Number(item.depth) : NaN;
      const depth = Number.isFinite(rawDepth) ? rawDepth : null;
      const label = normalizeDtLevel(item.label || item.dt_level || item.status) || depthToDtLevel(depth);
      if (!username || !label) continue;
      const key = uid || `user:${usernameKey}`;
      const excluded = item.excluded === true || item.relation === "excluded" || Number(item.strength) < 0;
      const removed = item.removed === true;
      const user = {
        user_id: uid || null,
        userId: uid || null,
        uid: uid || null,
        username,
        status: label,
        dt_level: label,
        label,
        depth,
        strength: item.strength !== void 0 && item.strength !== null ? Number(item.strength) : null,
        excluded,
        removed,
        active: item.active !== false && !excluded && !removed,
        relation: excluded ? "excluded" : "included",
        source: DT_DATA_URL,
        sources: [DT_DATA_URL],
        profileUrl: uid ? `https://bitcointalk.org/index.php?action=profile;u=${encodeURIComponent(uid)}` : ""
      };
      const existing = normalized.users[key];
      if (existing && Number.isFinite(Number(existing.depth)) && Number.isFinite(Number(user.depth)) && Number(existing.depth) <= Number(user.depth)) {
        continue;
      }
      normalized.users[key] = user;
      normalized.username_index[username] = key;
      normalized.username_index[usernameKey] = key;
      if (uid) {
        normalized.username_index[uid] = key;
        normalized.byUid.set(uid, user);
      }
      normalized.byUsername.set(usernameKey, user);
    }
    recomputeStats(normalized);
    normalized.dt1Users = Object.values(normalized.users).filter((user) => user.dt_level === "DT1").map(toPublicTrustUser);
    normalized.dt2Users = Object.values(normalized.users).filter((user) => user.dt_level === "DT2").map(toPublicTrustUser);
    return normalized;
  }
  async function loadDtCache({ allowStale = false } = {}) {
    const result = await storageGet([CACHE_KEY, CACHE_TIMESTAMP_KEY]);
    const records = result[CACHE_KEY];
    const timestamp = Number(result[CACHE_TIMESTAMP_KEY] || 0);
    if (!Array.isArray(records) || !timestamp) return null;
    const fresh = Date.now() - timestamp < DT_REFRESH_INTERVAL_HOURS * 60 * 60 * 1e3;
    if (!allowStale && !fresh) return null;
    return { records, timestamp, fresh };
  }
  async function saveDtCache(records) {
    if (!Array.isArray(records) || records.length === 0) {
      throw new Error("DT cache is empty or invalid.");
    }
    const timestamp = Date.now();
    await storageSet({
      [CACHE_KEY]: records,
      [CACHE_TIMESTAMP_KEY]: timestamp
    });
    return { records, timestamp, fresh: true };
  }
  async function loadCachedDtData({ allowStale = true } = {}) {
    const cache = await loadDtCache({ allowStale });
    return cache ? normalizeGitHubDtRecords(cache.records, cache.timestamp, cache.fresh ? "Using cached GitHub DT data" : "Using stale cached GitHub DT data") : emptyDtData(DT_DATA_URL);
  }
  function isValidDtData(data) {
    return data?.cache_version === CACHE_VERSION && data?.cacheValid === true && data?.stats?.total_users >= MIN_VALID_CACHE_USERS && Object.keys(data.users || {}).length > 0 && Array.isArray(data.dt1Users) && Array.isArray(data.dt2Users);
  }
  async function clearDtCache() {
    await storageRemove([CACHE_KEY, CACHE_TIMESTAMP_KEY, LEGACY_CACHE_KEY]);
    _dtData = null;
    _loadPromise = null;
  }
  function looksLikeLoginPage(html) {
    const text = String(html || "");
    const visibleText = cleanUsername(text.replace(/<script[\s\S]*?<\/script>/gi, " "));
    return /Only registered members are allowed to access this section/i.test(visibleText) || /action=login/i.test(text) || /<form[^>]+id=["']frmLogin["']/i.test(text) || /<title>\s*Login\s*<\/title>/i.test(text) || /\bLogin\b/i.test(visibleText) && /\bpassword\b/i.test(visibleText) || /please login/i.test(visibleText) || /you are not allowed/i.test(visibleText);
  }
  function looksLikeUnavailableTrustPage(html) {
    if (!String(html || "").trim()) return true;
    const text = cleanUsername(String(html || "").replace(/<script[\s\S]*?<\/script>/gi, " ")).slice(0, 3e3);
    return looksLikeLoginPage(html) || /captcha|verify you are human|cloudflare|checking your browser/i.test(text) || /403|forbidden|not allowed|access denied/i.test(text) || /DT list unavailable|DefaultTrust unavailable|trust list unavailable/i.test(text);
  }
  async function fetchDirectFromContentPage(url = DEFAULT_TRUST_URL) {
    if (location.hostname !== "bitcointalk.org") {
      throw new Error("Current page is not Bitcointalk.");
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const response = await fetch(url, { credentials: "include", cache: "no-store", signal: controller.signal });
      const html = await response.text();
      if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
      if (_settings.trustPositionBadgeDebug) {
        console.debug("[BTT trustPositionBadge] DT fetch", {
          method: "content-direct",
          url,
          status: response.status,
          htmlLength: html.length,
          loginDetected: looksLikeLoginPage(html)
        });
      }
      return { success: true, html, method: "content-direct", status: response.status };
    } finally {
      clearTimeout(timer);
    }
  }
  async function fetchOfficialDTForMessage(url = DEFAULT_TRUST_URL) {
    try {
      const result = await fetchDirectFromContentPage(url);
      if (looksLikeUnavailableTrustPage(result.html)) {
        return { success: false, error: "DT list unavailable. Please login to Bitcointalk and refresh DT cache.", method: "content-direct" };
      }
      return result;
    } catch (err) {
      return { success: false, error: err.message, method: "content-direct" };
    }
  }
  function getDisplayFetchStatus(data) {
    if (data?.fetch_status) return data.fetch_status;
    if (data?.cacheValid) return "Using valid cached DT data";
    if (data?.stats?.total_users > 0) return "DT cache is stale or incomplete. Refresh DT Cache before showing Not in DT.";
    return "DT data unavailable. Refresh DT cache later.";
  }
  async function loadTrustBadgeData({ forceRefresh = false } = {}) {
    if (_loadPromise && !forceRefresh) return _loadPromise;
    _loadPromise = (async () => {
      const cached = forceRefresh ? emptyDtData(DT_DATA_URL) : await loadCachedDtData({ allowStale: false });
      if (!forceRefresh && cached.stats.total_users > 0 && isCacheFresh(cached)) {
        _dtData = cached;
        return cached;
      }
      let refreshError = "";
      try {
        const records = await loadDtData();
        const cache = await saveDtCache(records);
        const loaded = normalizeGitHubDtRecords(cache.records, cache.timestamp, "GitHub DT data refreshed");
        if (!isValidDtData(loaded)) throw new Error("invalid or empty GitHub DT data");
        _dtData = loaded;
        runDiagnosticCheck(_dtData);
        return _dtData;
      } catch (err) {
        refreshError = err.message || String(err);
        logFetchFailure(err.message);
      }
      const staleCached = await loadCachedDtData({ allowStale: true });
      if (staleCached.stats.total_users > 0) {
        _dtData = {
          ...staleCached,
          fetch_status: `Using cached GitHub DT data after refresh failed. Last updated: ${staleCached.updated_at ? new Date(staleCached.updated_at).toLocaleString() : "unknown"}`
        };
        return _dtData;
      }
      _dtData = emptyDtData(DT_DATA_URL);
      _dtData.fetch_status = refreshError || "DT data unavailable. Refresh DT cache later.";
      return _dtData;
    })();
    return _loadPromise;
  }
  function runDiagnosticCheck(data) {
    if (_settings.trustPositionBadgeDebug) {
      console.debug("[BTT trustPositionBadge] DT cache loaded", {
        total: data.stats.total_users,
        dt1: data.stats.dt1_count,
        dt2: data.stats.dt2_count,
        removed: data.stats.removed_count || 0,
        finalDtCacheUserCount: Object.keys(data.users || {}).length,
        partial: Boolean(data.partial)
      });
    }
  }
  function logFetchFailure(reason) {
    if (_loggedFetchFailure) return;
    _loggedFetchFailure = true;
    console.warn("[Bitcointalk DT] Failed to load DT data", reason);
  }
  function injectStyles2() {
    if (document.getElementById(STYLE_ID5)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID5;
    style.textContent = `
.bct-dt-badge,
.btt-trust-badge {
  display:inline-block;
  margin-top:4px;
  padding:2px 6px;
  border-radius:4px;
  font-size:9px;
  font-weight:bold;
  color:#fff;
  line-height:1.3;
  white-space:nowrap;
  cursor:help;
}
.btt-trust-dt0 { background:#111827; }
.btt-trust-dt1 { background:#15803d; }
.btt-trust-dt2 { background:#2563eb; }
.btt-trust-dt { background:#6b7280; }
.btt-trust-none { background:#6b7280; }
.btt-trust-unavailable { background:#991b1b; }
`;
    document.head.appendChild(style);
  }
  function getAuthors() {
    const authors = [];
    const seen = /* @__PURE__ */ new Set();
    const params = new URLSearchParams(location.search);
    const action = params.get("action") || "";
    const isTopicPage = params.has("topic");
    const isProfilePage2 = action === "profile" || /^profile(?:;|$)/i.test(action) || /[?;&]action=profile(?:[;&]|$)/i.test(location.href);
    const addAuthor = (posterCell, link = null) => {
      if (!posterCell || seen.has(posterCell)) return;
      if (posterCell.querySelector(".bct-dt-badge, .btt-trust-badge")) return;
      const profileLink = link || posterCell.querySelector('b > a[href*="action=profile"][href*="u="]') || posterCell.querySelector('a[href*="action=profile"][href*="u="]') || posterCell.querySelector('a[href*="action=trust"][href*="u="]');
      const usernameNode = posterCell.querySelector('b > a[href*="action=profile"]') || posterCell.querySelector("b") || profileLink;
      const username = cleanUsername(usernameNode?.textContent || profileLink?.textContent || "");
      const uidLink = posterCell.querySelector('a[href*="action=profile"][href*="u="]') || profileLink;
      const profileUrl = uidLink?.getAttribute("href") || uidLink?.href || profileLink?.getAttribute("href") || profileLink?.href || "";
      const userId = extractUserIdFromUserUrl(profileUrl);
      const key = `${userId || normalizeUsername2(username)}:${authors.length}`;
      if (!username && !userId) return;
      seen.add(posterCell);
      authors.push({ posterCell, anchor: usernameNode || profileLink, username, profileUrl, userId, key });
    };
    if (isTopicPage) {
      Array.from(document.querySelectorAll("td.poster_info, .poster_info")).forEach((posterCell) => {
        addAuthor(posterCell);
      });
    }
    if (isProfilePage2) {
      const profileUid = getProfileUid() || params.get("u") || "";
      const profileBlocks = Array.from(document.querySelectorAll("td.windowbg, td.windowbg2, .windowbg, .windowbg2, #bodyarea table, #bodyarea")).filter((el) => /Name\s*:|Posts\s*:|Activity\s*:|Merit\s*:|Trust\s*:|Position\s*:|Date Registered\s*:|Last Active\s*:/i.test(el.textContent || ""));
      const profileBlock = profileBlocks.find((el) => el.querySelector('img.avatar, img[src*="avatar"], a[href*="action=trust"][href*="u="]')) || profileBlocks[0] || document.querySelector("#bodyarea") || document.body;
      if (profileBlock) {
        const profileName = getProfileUsername(profileBlock);
        const usernameText = profileName.text;
        authors.push({
          posterCell: profileBlock,
          anchor: profileName.element || profileBlock.querySelector('b a[href*="action=profile"], b, img.avatar, img[src*="avatar"]'),
          username: usernameText,
          profileUrl: location.href,
          userId: profileUid,
          isProfile: true,
          key: `${profileUid || normalizeUsername2(usernameText)}:profile`
        });
      }
    }
    return authors;
  }
  function findRankStarInsertionPoint(posterCell) {
    const starImages = Array.from(posterCell.querySelectorAll('img[alt="*"], img[src*="star"], img[src*="Star"]')).filter((img) => !/avatar/i.test(img.className || "") && !/avatar/i.test(img.src || ""));
    const lastStar = starImages[starImages.length - 1];
    if (lastStar) {
      let node = lastStar.nextSibling;
      while (node && node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) node = node.nextSibling;
      if (node?.nodeName === "BR") return { reference: node, position: "afterend", addBreakAfter: true };
      return { reference: lastStar, position: "afterend", addBreakBefore: true, addBreakAfter: true };
    }
    const rankTextNode = document.createTreeWalker(posterCell, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const text = cleanUsername(node.textContent || "");
        if (!text || text.length > 80) return NodeFilter.FILTER_REJECT;
        return /^(Position\s*:\s*)?(Brand new|Newbie|Jr\. Member|Member|Full Member|Sr\. Member|Hero Member|Legendary|Administrator|Global Moderator|Staff)$/i.test(text) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    }).nextNode();
    if (rankTextNode?.parentElement) {
      let node = rankTextNode.nextSibling;
      while (node && node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) node = node.nextSibling;
      if (node?.nodeName === "BR") return { reference: node, position: "afterend", addBreakAfter: true };
      return { reference: rankTextNode.parentElement, position: "afterend", addBreakBefore: true, addBreakAfter: true };
    }
    return null;
  }
  function findProfileUsernameInsertionPoint(posterCell) {
    const textNode = document.createTreeWalker(posterCell, NodeFilter.SHOW_TEXT, {
      acceptNode(node2) {
        return /Name\s*:/i.test(node2.textContent || "") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    }).nextNode();
    if (!textNode) return null;
    const container = textNode.parentElement;
    if (!container) return null;
    const row = container.closest("tr");
    if (row) {
      const cells = Array.from(row.children || []);
      const labelCellIndex = cells.findIndex((cell) => /Name\s*:/i.test(cell.textContent || ""));
      const valueCell = labelCellIndex >= 0 ? cells[labelCellIndex + 1] : null;
      if (valueCell) return { reference: valueCell, position: "beforeend", inline: true };
    }
    let node = textNode.nextSibling;
    while (node && node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) node = node.nextSibling;
    if (node && node.nodeName !== "BR") return { reference: node, position: "afterend", inline: true };
    return { reference: container, position: "beforeend", inline: true };
  }
  function textWithoutTrustBadges(element) {
    if (!element) return "";
    const clone = element.cloneNode(true);
    clone.querySelectorAll?.(".bct-dt-badge, .btt-trust-badge").forEach((badge) => badge.remove());
    return cleanUsername(clone.textContent || "");
  }
  function cleanProfileNameValue(value) {
    return cleanUsername(value).replace(/\s+(Posts|Activity|Merit|Trust|Position|Date Registered|Last Active)\s*:.*$/i, "").trim();
  }
  function getProfileLabelValue(root, labelPattern) {
    const rows = Array.from(root.querySelectorAll?.("tr") || []);
    for (const row of rows) {
      const cells = Array.from(row.children || []);
      const labelIndex = cells.findIndex((cell) => /Name\s*:/i.test(textWithoutTrustBadges(cell)));
      if (labelIndex < 0) continue;
      const valueCell = cells[labelIndex + 1];
      if (valueCell) {
        const value = cleanProfileNameValue(textWithoutTrustBadges(valueCell));
        if (value) return { text: value, element: valueCell };
      }
      const rowText = textWithoutTrustBadges(row);
      const match2 = rowText.match(labelPattern);
      if (match2?.[1]) return { text: cleanProfileNameValue(match2[1]), element: row };
    }
    const bodyText = textWithoutTrustBadges(root);
    const match = bodyText.match(labelPattern);
    return match?.[1] ? { text: cleanProfileNameValue(match[1]), element: root } : null;
  }
  function getProfileUsername(profileBlock) {
    const name = getProfileLabelValue(profileBlock, /Name\s*:\s*([^\n\r]+)/i) || getProfileLabelValue(document.body, /Name\s*:\s*([^\n\r]+)/i);
    if (name?.text) return name;
    const fallback = profileBlock.querySelector('b a[href*="action=profile"], b') || document.querySelector('#bodyarea b a[href*="action=profile"], #bodyarea b');
    const text = textWithoutTrustBadges(fallback);
    return text ? { text, element: fallback } : { text: "", element: null };
  }
  function getProfileUid() {
    const candidates = [
      location.href,
      document.querySelector('link[rel="canonical"]')?.href,
      document.querySelector('a[href*="action=profile"][href*="u="]')?.href,
      document.querySelector('a[href*="action=profile"][href*="u="]')?.getAttribute("href"),
      document.querySelector('a[href*="action=trust"][href*="u="]')?.href,
      document.querySelector('a[href*="action=trust"][href*="u="]')?.getAttribute("href")
    ];
    for (const candidate of candidates) {
      const uid = extractUserIdFromUserUrl(candidate);
      if (uid) return uid;
    }
    return "";
  }
  function findUserForAuthor(author, data) {
    const users = data?.users || {};
    const uid = String(author.userId || "").trim();
    if (uid) {
      const uidMatch = data?.byUid instanceof Map ? data.byUid.get(uid) : null;
      if (uidMatch || users[uid]) return uidMatch || users[uid];
    }
    const username = normalizeUsername2(author.username || "");
    if (!username) return null;
    const usernameMatch = data?.byUsername instanceof Map ? data.byUsername.get(username) : null;
    return usernameMatch || users[cleanUsername(author.username || "")] || users[username] || users[data?.username_index?.[author.username]] || users[data?.username_index?.[username]] || users[`user:${username}`] || null;
  }
  function getDtBadgeLabel(user) {
    if (!user) return null;
    if (user.dt_level) {
      const label = String(user.dt_level).trim().toUpperCase().replace(/\s+/g, "");
      if (/^DT\d+$/.test(label)) return label;
    }
    const mapped = depthToDtLevel(user.depth);
    return mapped;
  }
  function logTrustDebug(author, data, user, renderedLabel) {
    if (!_settings.trustPositionBadgeDebug) return;
    const uid = String(author.userId || "").trim();
    const users = data?.users || {};
    console.debug("[BTT trustPositionBadge] badge lookup", {
      detected_username: author.username || user?.username || null,
      detected_uid: uid || null,
      uid_exists: Boolean(uid && users[uid]),
      cache_user_count: Object.keys(users).length,
      cache_updatedAt: data?.updated_at || data?.updatedAt || null,
      cacheValid: Boolean(data?.cacheValid),
      raw_dt_level: user?.dt_level || null,
      raw_depth: user?.depth || null,
      rendered_label: renderedLabel
    });
  }
  function lookupAuthor(author, data) {
    if (!data?.cacheValid) {
      logTrustDebug(author, data, null, null);
      return { status: "none", cacheValid: false };
    }
    const user = findUserForAuthor(author, data);
    if (!user) {
      logTrustDebug(author, data, null, null);
      return { status: "none", cacheValid: true };
    }
    if (user.removed) {
      logTrustDebug(author, data, user, null);
      return { status: "none", cacheValid: true };
    }
    const label = getDtBadgeLabel(user);
    logTrustDebug(author, data, user, label);
    if (label === "DT0") return { status: "dt0", user, cacheValid: true };
    if (label === "DT1") return { status: "dt1", user, cacheValid: true };
    if (label === "DT2") return { status: "dt2", user, cacheValid: true };
    if (/^DT\d+$/.test(label || "")) return { status: "dt", user, label, cacheValid: true };
    return { status: "none", user, cacheValid: true };
  }
  function shouldShow(status, cacheValid = false) {
    if (status === "none") {
      const showNotInDt = _settings.showNotInDt === true || _settings.trustPositionBadgeShowNoDt === true;
      return cacheValid && showNotInDt;
    }
    if (status === "unavailable" || status === "loading") return false;
    return true;
  }
  function upsertBadge(author, status, user = null, label = "", cacheValid = false) {
    const existing = author.posterCell.querySelector(".bct-dt-badge, .btt-trust-badge");
    if (!shouldShow(status, cacheValid)) {
      existing?.remove();
      author.posterCell.removeAttribute(APPLIED_ATTR);
      author.posterCell.setAttribute(PROCESSED_ATTR, "1");
      return;
    }
    const meta = POSITIONS[status] || POSITIONS.unavailable;
    const badge = existing || document.createElement("span");
    badge.className = `bct-dt-badge btt-trust-badge ${meta.className}`;
    const displayLabel = label || getDtBadgeLabel(user) || meta.label;
    badge.textContent = displayLabel;
    badge.dataset.position = status;
    badge.title = [
      user ? `Username: ${user.username || author.username || "unknown"}` : meta.title,
      user ? `UID: ${user.uid || user.user_id || user.userId || author.userId || "unknown"}` : "",
      user ? `Depth: ${user.depth ?? "unknown"}` : ""
    ].filter(Boolean).join("\n");
    if (!existing) {
      const rankStarPoint = author.isProfile ? findProfileUsernameInsertionPoint(author.posterCell) : findRankStarInsertionPoint(author.posterCell);
      if (rankStarPoint?.reference) {
        if (rankStarPoint.inline) badge.style.marginLeft = "4px";
        if (rankStarPoint.addBreakBefore) {
          const beforeBreak = document.createElement("br");
          rankStarPoint.reference.insertAdjacentElement(rankStarPoint.position, beforeBreak);
          beforeBreak.insertAdjacentElement("afterend", badge);
        } else {
          rankStarPoint.reference.insertAdjacentElement(rankStarPoint.position, badge);
        }
        if (rankStarPoint.addBreakAfter) badge.insertAdjacentElement("afterend", document.createElement("br"));
      } else {
        const anchor = author.anchor?.closest?.("b") || author.anchor || author.posterCell.querySelector("b") || author.posterCell.firstElementChild;
        if (anchor && author.posterCell.contains(anchor)) {
          anchor.insertAdjacentElement("afterend", badge);
          if (author.posterCell.matches("td.poster_info, .poster_info")) badge.insertAdjacentElement("afterend", document.createElement("br"));
        } else {
          author.posterCell.insertBefore(badge, author.posterCell.firstChild);
        }
      }
    }
    author.posterCell.setAttribute(APPLIED_ATTR, "1");
    author.posterCell.setAttribute(PROCESSED_ATTR, "1");
  }
  function applyBadges(data = _dtData) {
    if (_settings.trustPositionBadgeEnabled === false) return;
    injectStyles2();
    for (const author of getAuthors()) {
      const { status, user, label, cacheValid } = lookupAuthor(author, data);
      upsertBadge(author, status, user, label, cacheValid);
    }
  }
  function scheduleApplyBadges() {
    clearTimeout(_rescanTimer);
    _rescanTimer = setTimeout(() => {
      _rescanTimer = null;
      applyBadges();
    }, RESCAN_DEBOUNCE_MS);
  }
  function removeBadges() {
    document.querySelectorAll(".bct-dt-badge, .btt-trust-badge").forEach((badge) => {
      const next = badge.nextSibling;
      if (next?.nodeName === "BR") next.remove();
      badge.remove();
    });
    document.querySelectorAll(`[${APPLIED_ATTR}]`).forEach((el) => el.removeAttribute(APPLIED_ATTR));
    document.querySelectorAll(`[${PROCESSED_ATTR}]`).forEach((el) => el.removeAttribute(PROCESSED_ATTR));
    document.getElementById(STYLE_ID5)?.remove();
  }
  function getTrustRows(data, { query = "", filter = "all" } = {}) {
    const q = normalizeUsername2(query);
    const activeRows = Object.entries(data.users || {}).map(([key, user]) => ({ key, ...user, rendered_label: getDtBadgeLabel(user), removed: false }));
    const removedRows = (data.removedUsers || []).map((user) => ({
      key: user.userId || user.user_id || `removed:${normalizeUsername2(user.username)}`,
      ...user,
      rendered_label: "Removed",
      removed: true
    }));
    return [...activeRows, ...removedRows].filter((user) => {
      if (filter === "dt1") return user.rendered_label === "DT1";
      if (filter === "dt2") return user.rendered_label === "DT2";
      if (filter === "removed") return user.removed;
      return true;
    }).filter((user) => !q || normalizeUsername2(user.username).includes(q) || String(user.user_id || user.userId || "").includes(q) || normalizeUsername2(user.key).includes(q)).sort((a, b) => {
      if (a.removed !== b.removed) return a.removed ? 1 : -1;
      if (a.depth !== b.depth) return Number(a.depth || 999) - Number(b.depth || 999);
      return normalizeUsername2(a.username).localeCompare(normalizeUsername2(b.username));
    });
  }
  function referenceLinks(user) {
    const uid = user.user_id || user.userId;
    const links = [];
    if (uid) links.push(`<a href="https://bitcointalk.org/index.php?action=trust;u=${encodeURIComponent(uid)}" target="_blank" rel="noopener">Trust</a>`);
    if (uid) links.push(`<a href="https://bitcointalk.org/index.php?action=profile;u=${encodeURIComponent(uid)}" target="_blank" rel="noopener">Profile</a>`);
    return links.join(" / ") || '<span style="color:var(--text-secondary,#9ca3af)">Username only</span>';
  }
  function renderAnalyzerRows(container, data) {
    const query = container.querySelector("#btt-tpb-search")?.value || "";
    const filter = container.querySelector("#btt-tpb-filter")?.value || "all";
    const rows = getTrustRows(data, { query, filter });
    const table = container.querySelector("#btt-tpb-results");
    const count = container.querySelector("#btt-tpb-result-count");
    if (count) count.textContent = `${rows.length} shown`;
    if (!table) return rows;
    table.innerHTML = rows.slice(0, 250).map((user) => `
    <tr>
      <td><strong>${escapeHtml(user.username || user.key)}</strong></td>
      <td>${escapeHtml(user.rendered_label)}</td>
      <td>${escapeHtml(user.depth || "")}</td>
      <td>${escapeHtml(user.user_id || user.userId || "")}</td>
      <td>${user.removed ? "Removed from displayed depth; reason: strikethrough" : referenceLinks(user)}</td>
    </tr>
  `).join("") || '<tr><td colspan="5" style="color:var(--text-secondary,#9ca3af)">No matching trust users.</td></tr>';
    return rows;
  }
  var trustPositionBadge_default = {
    id: "trustPositionBadge",
    name: "Trust Position Badge",
    description: "Shows DT position badges beside post authors.",
    category: "User/Profile Tools",
    defaultEnabled: true,
    async init() {
      _settings = await getSettings();
      _messageHandler = (message, sender, sendResponse) => {
        if (message?.action === "fetchOfficialDTPage") {
          fetchOfficialDTForMessage(message.url || DEFAULT_TRUST_URL).then(sendResponse);
          return true;
        }
        if (message?.action !== "settingsChanged") return false;
        Promise.all([getSettings(), loadCachedDtData()]).then(([settings, data]) => {
          _settings = settings;
          _dtData = data;
          document.querySelectorAll(`[${PROCESSED_ATTR}]`).forEach((el) => el.removeAttribute(PROCESSED_ATTR));
          if (_settings.trustPositionBadgeEnabled === false) removeBadges();
          else applyBadges();
        });
        return false;
      };
      if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
        chrome.runtime.onMessage.addListener(_messageHandler);
      }
      if (_settings.trustPositionBadgeEnabled === false) return;
      _loggedFetchFailure = false;
      loadTrustBadgeData().then((data) => {
        _dtData = data;
        document.querySelectorAll(`[${PROCESSED_ATTR}]`).forEach((el) => el.removeAttribute(PROCESSED_ATTR));
        applyBadges(data);
      });
      _observer2 = new MutationObserver((mutations) => {
        const relevant = mutations.some(
          (mutation) => Array.from(mutation.addedNodes || []).some(
            (node) => node.nodeType === Node.ELEMENT_NODE && !node.classList?.contains("bct-dt-badge") && !node.classList?.contains("btt-trust-badge") && node.id !== STYLE_ID5
          )
        );
        if (relevant) scheduleApplyBadges();
      });
      _observer2.observe(document.body, { childList: true, subtree: true });
    },
    destroy() {
      _observer2?.disconnect();
      _observer2 = null;
      if (_messageHandler && typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
        chrome.runtime.onMessage.removeListener(_messageHandler);
      }
      _messageHandler = null;
      clearTimeout(_rescanTimer);
      _rescanTimer = null;
      removeBadges();
    },
    async renderDashboardPanel(container) {
      const settings = await getSettings();
      const data = await loadCachedDtData();
      const enabled = (settings.enabledModules || []).includes("trustPositionBadge") && settings.trustPositionBadgeEnabled !== false;
      const source = data.source_url || DEFAULT_TRUST_URL;
      const updated = data.updated_at ? new Date(data.updated_at).toLocaleString() : "Never";
      const fetchStatus = getDisplayFetchStatus(data);
      container.innerHTML = `
      <div class="btt-panel">
        <p style="font-size:13px;color:var(--text-secondary,#9ca3af)">
          Shows DT badges using the GitHub DT JSON feed (<code>${DT_DATA_URL}</code>). Cached locally under <code>${CACHE_KEY}</code> and refreshed every ${DT_REFRESH_INTERVAL_HOURS} hours.
        </p>
        <label style="display:flex;align-items:center;gap:8px;margin-top:10px;font-size:13px">
          <input type="checkbox" id="btt-tpb-enabled" ${enabled ? "checked" : ""}>
          Enable badges
        </label>
        <label style="display:flex;align-items:center;gap:8px;margin-top:8px;font-size:13px">
          <input type="checkbox" id="btt-tpb-show-none" ${settings.showNotInDt === true || settings.trustPositionBadgeShowNoDt === true ? "checked" : ""}>
          Show "Not in DT" badges
        </label>
        <label style="display:flex;align-items:center;gap:8px;margin-top:8px;font-size:13px">
          <input type="checkbox" id="btt-tpb-debug" ${settings.trustPositionBadgeDebug ? "checked" : ""}>
          Enable debug logging
        </label>
        <div style="margin-top:12px;font-size:12px;color:var(--text-secondary,#9ca3af);line-height:1.7">
          Cache key: <strong>${CACHE_KEY}</strong><br>
          Data source: <strong>${escapeHtml(source)}</strong><br>
          Last update: <strong>${escapeHtml(updated)}</strong><br>
          Fetch status: <strong>${escapeHtml(fetchStatus)}</strong><br>
          Parsed users: <strong>${data.stats.total_users}</strong><br>
          Displayable DT1: <strong>${data.stats.dt1_count}</strong> / Displayable DT2: <strong>${data.stats.dt2_count}</strong><br>
          Removed/skipped: <strong>${(data.removedUsers || []).length}</strong>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">
          <button id="btt-tpb-refresh" class="btt-btn btt-btn-sm btt-btn-secondary">Refresh DT Cache</button>
          <button id="btt-tpb-clear" class="btt-btn btt-btn-sm" style="background:#7f1d1d;color:#fff">Clear DT cache</button>
        </div>
        <div id="btt-tpb-refresh-status" style="margin-top:8px;font-size:12px;color:var(--text-secondary,#9ca3af)"></div>
        <div style="margin-top:18px">
          <h3 style="font-size:15px;margin:0 0 10px">DefaultTrust</h3>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">
            <input id="btt-tpb-search" type="search" placeholder="Search username or UID" style="flex:1;min-width:180px;padding:7px 10px;border-radius:6px;border:1px solid var(--border,#374151);background:var(--bg-secondary,#111827);color:var(--text,#e5e7eb);font-size:13px">
            <select id="btt-tpb-filter" style="padding:7px 10px;border-radius:6px;border:1px solid var(--border,#374151);background:var(--bg-secondary,#111827);color:var(--text,#e5e7eb);font-size:13px">
              <option value="all">All trusted</option>
              <option value="dt1">DT1 only</option>
              <option value="dt2">DT2 only</option>
              <option value="removed">Removed only</option>
            </select>
            <button id="btt-tpb-export-json" class="btt-btn btt-btn-sm btt-btn-secondary">Export JSON</button>
          </div>
          <div id="btt-tpb-result-count" style="font-size:12px;color:var(--text-secondary,#9ca3af);margin-bottom:8px"></div>
          <div style="overflow:auto;max-height:460px;border:1px solid var(--border,#374151);border-radius:6px">
            <table style="width:100%;border-collapse:collapse;font-size:12px">
              <thead style="position:sticky;top:0;background:var(--bg-secondary,#111827)">
                <tr>
                  <th style="text-align:left;padding:7px">User</th>
                  <th style="text-align:left;padding:7px">Status</th>
                  <th style="text-align:left;padding:7px">Depth</th>
                  <th style="text-align:left;padding:7px">User ID</th>
                  <th style="text-align:left;padding:7px">Links</th>
                </tr>
              </thead>
              <tbody id="btt-tpb-results"></tbody>
            </table>
          </div>
        </div>
      </div>
    `;
      const notifyTabs = () => {
        if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
          chrome.runtime.sendMessage({ action: "relayToTab", data: { action: "settingsChanged" } });
        }
      };
      container.querySelector("#btt-tpb-enabled").addEventListener("change", async (e) => {
        await setModuleEnabled("trustPositionBadge", e.target.checked);
        await updateSetting("trustPositionBadgeEnabled", e.target.checked);
        notifyTabs();
      });
      container.querySelector("#btt-tpb-show-none").addEventListener("change", async (e) => {
        await updateSetting("trustPositionBadgeShowNoDt", e.target.checked);
        await updateSetting("showNotInDt", e.target.checked);
        notifyTabs();
      });
      container.querySelector("#btt-tpb-debug").addEventListener("change", async (e) => {
        await updateSetting("trustPositionBadgeDebug", e.target.checked);
        notifyTabs();
      });
      container.querySelector("#btt-tpb-refresh").addEventListener("click", async (e) => {
        const btn = e.currentTarget;
        const statusEl = container.querySelector("#btt-tpb-refresh-status");
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = "Refreshing...";
        if (statusEl) statusEl.textContent = "Fetching GitHub DT JSON...";
        try {
          _loggedFetchFailure = false;
          _loadPromise = null;
          _dtData = await loadTrustBadgeData({ forceRefresh: true });
          if (_dtData.stats.total_users > 0) {
            if (statusEl) statusEl.textContent = `DT cache refreshed: ${_dtData.stats.total_users} users.`;
            showToast(`DT cache refreshed: ${_dtData.stats.total_users} users.`, "success");
          } else {
            const message = _dtData.fetch_status || "DT data unavailable. Refresh DT cache later.";
            if (statusEl) statusEl.textContent = message;
            showToast(message, "error");
          }
          notifyTabs();
          renderAnalyzerRows(container, _dtData);
        } catch (err) {
          const message = err.message || "Refresh DT cache failed.";
          if (statusEl) statusEl.textContent = message;
          showToast(message, "error");
        } finally {
          btn.disabled = false;
          btn.textContent = originalText;
        }
      });
      container.querySelector("#btt-tpb-clear").addEventListener("click", async () => {
        await clearDtCache();
        showToast("DT cache cleared.", "success");
        notifyTabs();
        renderAnalyzerRows(container, emptyDtData(""));
      });
      const rerenderAnalyzer = () => renderAnalyzerRows(container, _dtData || data);
      container.querySelector("#btt-tpb-search").addEventListener("input", rerenderAnalyzer);
      container.querySelector("#btt-tpb-filter").addEventListener("change", rerenderAnalyzer);
      container.querySelector("#btt-tpb-export-json").addEventListener("click", () => {
        const rows = renderAnalyzerRows(container, _dtData || data);
        downloadFile("btt-trust-list.json", JSON.stringify(rows, null, 2), "application/json");
      });
      renderAnalyzerRows(container, data);
    }
  };

  // src/modules/postMeritCounter.js
  var STYLE_ID6 = "btt-post-merit-counter-style";
  var PROCESSED_ATTR2 = "data-btt-post-merit-counter";
  var _observer3 = null;
  var _scanTimer = null;
  function injectStyle() {
    if (document.getElementById(STYLE_ID6)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID6;
    style.textContent = `
.btt-post-merit-badge {
  display:inline-flex;
  align-items:center;
  margin-left:6px;
  padding:1px 7px;
  border:1px solid var(--btt-border,#b8a46a);
  border-radius:4px;
  background:var(--btt-surface,#fff8df);
  color:var(--btt-text,#4b3b16);
  font:11px/1.35 Verdana,Arial,sans-serif;
  white-space:nowrap;
  vertical-align:baseline;
}
`;
    document.head.appendChild(style);
  }
  function extractMsgId2(value) {
    const text = String(value || "");
    return text.match(/(?:^|[.#])msg_?(\d+)/i)?.[1] || text.match(/[?;&]msg=(\d+)/i)?.[1] || text.match(/^msg_?(\d+)$/i)?.[1] || "";
  }
  function findMessageElement2(scope) {
    if (!scope?.querySelectorAll) return null;
    return Array.from(scope.querySelectorAll("[id], a[name]")).find((el) => extractMsgId2(el.id) || extractMsgId2(el.getAttribute?.("name"))) || null;
  }
  function findPostMainContentArea(post) {
    if (!post) return null;
    const main = post.querySelector?.('td.td_headerandpost, .td_headerandpost, div.post, [id^="msg"], [id^="msg_"]');
    if (main && !main.closest("td.poster_info, .poster_info")) return main.closest("td.td_headerandpost, .td_headerandpost") || main;
    if (post.matches?.("td.td_headerandpost, .td_headerandpost")) return post;
    const cells = Array.from(post.querySelectorAll?.("td, .windowbg, .windowbg2") || []);
    return cells.find((cell) => !cell.matches("td.poster_info, .poster_info") && !cell.closest("td.poster_info, .poster_info") && /Merited by/i.test(cell.textContent || "")) || null;
  }
  function findPostScope(node) {
    let el = node;
    while (el && el !== document.body) {
      if (el.matches?.("table") && findMessageElement2(el) && findPostMainContentArea(el)) return el;
      if (el.matches?.("tr") && findMessageElement2(el) && findPostMainContentArea(el)) return el;
      el = el.parentElement;
    }
    return node?.closest?.("table") || node?.closest?.("tr") || node;
  }
  function getPostCandidates() {
    const seen = /* @__PURE__ */ new Set();
    const posts = [];
    document.querySelectorAll('[id^="msg"], a[name^="msg"], td.td_headerandpost, .td_headerandpost, tr, table').forEach((el) => {
      const scope = findPostScope(el);
      if (!scope || seen.has(scope)) return;
      const mainArea = findPostMainContentArea(scope);
      if (!mainArea || !/Merited by/i.test(mainArea.textContent || "")) return;
      seen.add(scope);
      posts.push(scope);
    });
    return posts;
  }
  function findPostMeritedByLine(post) {
    if (!post) return null;
    const mainArea = findPostMainContentArea(post);
    if (!mainArea) return null;
    const candidates = Array.from(mainArea.querySelectorAll("div, span, td, font, small, b, i"));
    if (/Merited by/i.test(mainArea.textContent || "")) candidates.unshift(mainArea);
    for (const el of candidates) {
      const text = (el.textContent || "").trim();
      if (!text) continue;
      if (!/\bMerited by\b/i.test(text)) continue;
      if (el.closest(".poster_info")) continue;
      if (el.closest("td.poster_info")) continue;
      if (/(?:^|\b)(Activity|Trust|Ignore)\s*:/i.test(text)) continue;
      if (/\bMerit\s*:\s*\d/i.test(text) && !/\bMerited by\b/i.test(text)) continue;
      return el;
    }
    return null;
  }
  function calculateMeritedByTotal(lineEl) {
    const text = (lineEl?.textContent || "").replace(/\s+/g, " ").trim();
    const meritedPart = text.slice(Math.max(0, text.search(/\bMerited by\b/i)));
    const matches = Array.from(meritedPart.matchAll(/\((\d[\d,]*)\)/g));
    return matches.reduce((sum, match) => sum + (parseInt(match[1].replace(/,/g, ""), 10) || 0), 0);
  }
  function renderBadge(lineEl, total) {
    if (!lineEl || lineEl.querySelector?.(".btt-post-merit-badge")) return;
    const badge = document.createElement("span");
    badge.className = "btt-post-merit-badge";
    badge.textContent = `Total Merit: ${total}`;
    badge.title = `Total merit received by this exact post: ${total}`;
    lineEl.insertAdjacentText("beforeend", " ");
    lineEl.insertAdjacentElement("beforeend", badge);
  }
  function processPosts() {
    getPostCandidates().forEach((post) => {
      if (post.getAttribute(PROCESSED_ATTR2) === "1") return;
      const line = findPostMeritedByLine(post);
      if (!line) return;
      const total = calculateMeritedByTotal(line);
      if (total <= 0) return;
      post.setAttribute(PROCESSED_ATTR2, "1");
      renderBadge(line, total);
    });
  }
  function scheduleScan() {
    clearTimeout(_scanTimer);
    _scanTimer = setTimeout(processPosts, 300);
  }
  var postMeritCounter_default = {
    id: "postMeritCounter",
    name: "Post Merit Counter",
    description: "Shows total merits received by each post/reply.",
    category: "User/Profile Tools",
    defaultEnabled: false,
    init() {
      injectStyle();
      processPosts();
      _observer3 = new MutationObserver((mutations) => {
        if (mutations.some((m) => Array.from(m.addedNodes).some((node) => node.nodeType === 1 && !node.classList?.contains("btt-post-merit-badge")))) {
          scheduleScan();
        }
      });
      _observer3.observe(document.body, { childList: true, subtree: true });
    },
    destroy() {
      _observer3?.disconnect();
      _observer3 = null;
      clearTimeout(_scanTimer);
      _scanTimer = null;
      document.getElementById(STYLE_ID6)?.remove();
      document.querySelectorAll(".btt-post-merit-badge").forEach((badge) => badge.remove());
      document.querySelectorAll(`[${PROCESSED_ATTR2}="1"]`).forEach((post) => post.removeAttribute(PROCESSED_ATTR2));
    },
    renderDashboardPanel(container) {
      container.innerHTML = `
      <div class="btt-panel">
        <p>Shows <strong>Total Merit: N</strong> beside each post's own visible <strong>Merited by</strong> line.</p>
        <p style="font-size:12px;color:var(--text-secondary,#9ca3af)">It does not read profile/sidebar merit and does not call external services.</p>
      </div>
    `;
    }
  };

  // src/content/content.js
  var ALL_MODULES = [
    darkMode_default,
    codeCopyFixer_default,
    navigationBooster_default,
    quoteAssistant_default,
    localDraftSaver_default,
    clipboardSafety_default,
    addressHighlighter_default,
    boardCleaner_default,
    longQuoteCollapser_default,
    imageCollapser_default,
    userNotes_default,
    keywordAlert_default,
    antiPhishingLinkChecker_default,
    externalLinkPreview_default,
    txidHelper_default,
    selfPostFinder_default,
    ignoreEnhancer_default,
    mobileEnhancer_default,
    scraper_default,
    personalPostLibrary_default,
    mentionHelper_default,
    rankProgressTracker_default,
    postLinkCopier_default,
    trustPositionBadge_default,
    postMeritCounter_default
  ];
  function createLauncher() {
    if (document.getElementById("btt-launcher")) return;
    const launcher = document.createElement("div");
    launcher.id = "btt-launcher";
    const menu = document.createElement("div");
    menu.id = "btt-mini-menu";
    const items = [
      { icon: "Home", label: "Open Dashboard", action: () => chrome.runtime.sendMessage({ action: "openDashboard" }) },
      { icon: "BB", label: "BBCode Studio", action: () => chrome.runtime.sendMessage({ action: "openDashboard", section: "studio" }) },
      { icon: "Theme", label: "Forum Theme", action: openForumThemePanel },
      { icon: "Compact", label: "Toggle Compact Mode", action: toggleCompactMode },
      { icon: "Settings", label: "Settings", action: () => chrome.runtime.sendMessage({ action: "openDashboard", section: "settings" }) }
    ];
    items.forEach(({ icon, label, action }) => {
      const btn = document.createElement("button");
      btn.innerHTML = `<span>${escapeHtml2(icon)}</span> ${escapeHtml2(label)}`;
      btn.addEventListener("click", () => {
        menu.classList.remove("open");
        action();
      });
      menu.appendChild(btn);
    });
    const fab = document.createElement("button");
    fab.id = "btt-fab";
    fab.title = "Bitcointalk Toolkit";
    fab.textContent = "B";
    fab.addEventListener("click", (event) => {
      event.stopPropagation();
      menu.classList.toggle("open");
    });
    document.addEventListener("click", (event) => {
      if (!launcher.contains(event.target)) menu.classList.remove("open");
    });
    launcher.appendChild(menu);
    launcher.appendChild(fab);
    document.body.appendChild(launcher);
  }
  function escapeHtml2(value) {
    return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[ch]);
  }
  function hexToRgbText(hex) {
    const clean = String(hex || "").replace("#", "");
    if (!/^[0-9a-f]{6}$/i.test(clean)) return "";
    const [r, g, b] = clean.match(/.{2}/g).map((part) => parseInt(part, 16));
    return `RGB ${r}, ${g}, ${b}`;
  }
  function buildForumThemeColorControls(colors) {
    const normalized = normalizeForumCustomColors(colors || DEFAULT_FORUM_CUSTOM_COLORS);
    return FORUM_COLOR_GROUPS.map((group) => `
    <section class="btt-theme-group">
      <h4>${escapeHtml2(group.label)}</h4>
      <div class="btt-theme-color-grid">
        ${group.fields.map(([key, label]) => {
      const value = normalized[key] || DEFAULT_FORUM_CUSTOM_COLORS[key];
      return `
            <label class="btt-theme-color-row" data-theme-color-row="${escapeHtml2(key)}">
              <span>${escapeHtml2(label)}</span>
              <input type="color" value="${escapeHtml2(value)}" data-theme-color="${escapeHtml2(key)}">
              <input type="text" value="${escapeHtml2(value)}" maxlength="7" data-theme-hex="${escapeHtml2(key)}" spellcheck="false">
              <small data-theme-rgb="${escapeHtml2(key)}">${escapeHtml2(hexToRgbText(value))}</small>
            </label>
          `;
    }).join("")}
      </div>
    </section>
  `).join("");
  }
  function updateForumThemePanelValues(panel, colors) {
    const normalized = normalizeForumCustomColors(colors || DEFAULT_FORUM_CUSTOM_COLORS);
    Object.entries(normalized).forEach(([key, value]) => {
      const safeKey = CSS.escape(key);
      const color = panel.querySelector(`[data-theme-color="${safeKey}"]`);
      const hex = panel.querySelector(`[data-theme-hex="${safeKey}"]`);
      const rgb = panel.querySelector(`[data-theme-rgb="${safeKey}"]`);
      if (color) color.value = value;
      if (hex) hex.value = value;
      if (rgb) rgb.textContent = hexToRgbText(value);
    });
  }
  function collectForumThemeColors(panel) {
    const colors = {};
    panel.querySelectorAll("[data-theme-hex]").forEach((input) => {
      colors[input.dataset.themeHex] = input.value;
    });
    return validateForumCustomColors(colors);
  }
  function notifySettingsChanged() {
    try {
      const result = chrome.runtime.sendMessage({ action: "settingsChanged" });
      if (result && typeof result.catch === "function") result.catch(() => {
      });
    } catch {
    }
  }
  async function saveForumThemeSelection({ forumTheme = "custom", colors, skinId = "custom", skinName = "Custom Theme" }) {
    const current = await getSettings();
    const normalized = normalizeForumCustomColors(colors || current.forumCustomColors || DEFAULT_FORUM_CUSTOM_COLORS);
    const enabledModules = (current.enabledModules || []).filter((id) => id !== "darkMode");
    const nextSettings = {
      ...current,
      forumTheme,
      forumSkin: skinId,
      forumSkinName: skinName,
      forumCustomColors: normalized,
      darkMode: forumTheme === "dark",
      enabledModules: forumTheme === "dark" ? [.../* @__PURE__ */ new Set([...enabledModules, "darkMode"])] : enabledModules
    };
    await saveSettings(nextSettings);
    await storageSet({ [FORUM_THEME_STORAGE_KEY]: forumTheme });
    applyBitcointalkForumTheme(nextSettings);
    darkMode_default.setEnabled(forumTheme === "dark");
    notifySettingsChanged();
    return nextSettings;
  }
  async function exportForumThemeJson(panel) {
    const colors = collectForumThemeColors(panel);
    const json = JSON.stringify({
      version: 1,
      exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
      name: "Custom Forum Theme",
      colors
    }, null, 2);
    try {
      await navigator.clipboard.writeText(json);
      Toast.success("Forum theme JSON copied");
    } catch {
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "forum-theme.json";
      a.click();
      URL.revokeObjectURL(url);
      Toast.success("Forum theme JSON exported");
    }
  }
  async function applyForumThemeImport(panel) {
    const textarea = panel.querySelector(".btt-theme-import-text");
    try {
      const parsed = JSON.parse(textarea.value || "");
      const colors = validateForumCustomColors(parsed.colors || parsed);
      await saveForumThemeSelection({ colors, skinId: "custom", skinName: "Custom Theme" });
      updateForumThemePanelValues(panel, colors);
      panel.querySelectorAll("[data-skin-id]").forEach((btn) => btn.classList.remove("active"));
      panel.querySelector("[data-current-skin]").textContent = "Custom Theme";
      panel.querySelector(".btt-theme-import-area")?.classList.add("hidden");
      textarea.value = "";
      Toast.success("Forum theme imported");
    } catch (error) {
      Toast.error(error?.message || "Invalid theme JSON");
    }
  }
  async function openForumThemePanel() {
    document.getElementById("btt-forum-theme-modal")?.remove();
    const settings = await getSettings();
    const colors = normalizeForumCustomColors(settings.forumCustomColors || DEFAULT_FORUM_CUSTOM_COLORS);
    const activeSkin = settings.forumTheme === "original" ? "original" : settings.forumSkin || "custom";
    const overlay = document.createElement("div");
    overlay.id = "btt-forum-theme-modal";
    overlay.innerHTML = `
    <div class="btt-forum-theme-panel" role="dialog" aria-modal="true" aria-label="Forum Theme">
      <div class="btt-forum-theme-header">
        <div>
          <h3>Forum Theme</h3>
          <p>Customize Bitcointalk page colors. Current: <strong data-current-skin>${escapeHtml2(settings.forumSkinName || (activeSkin === "original" ? "Default Bitcointalk" : "Custom Theme"))}</strong></p>
        </div>
        <button type="button" class="btt-theme-close" aria-label="Close">x</button>
      </div>

      <section class="btt-theme-group">
        <h4>Ready Made Skins</h4>
        <div class="btt-theme-skin-grid">
          ${FORUM_SKIN_PRESETS.map((skin) => `
            <button type="button" class="${skin.id === activeSkin ? "active" : ""}" data-skin-id="${escapeHtml2(skin.id)}">
              ${escapeHtml2(skin.name)}
            </button>
          `).join("")}
        </div>
      </section>

      <section class="btt-theme-custom">
        <h4>Custom Forum Colors</h4>
        ${buildForumThemeColorControls(colors)}
      </section>

      <div class="btt-theme-actions">
        <button type="button" data-theme-action="save">Save Theme</button>
        <button type="button" data-theme-action="reset">Reset to Default Bitcointalk Theme</button>
        <button type="button" data-theme-action="export">Export Theme JSON</button>
        <button type="button" data-theme-action="import">Import Theme JSON</button>
      </div>

      <div class="btt-theme-import-area hidden">
        <textarea class="btt-theme-import-text" placeholder="Paste forum theme JSON here"></textarea>
        <div>
          <button type="button" data-theme-action="apply-import">Apply Import</button>
          <button type="button" data-theme-action="cancel-import">Cancel</button>
        </div>
      </div>
    </div>
  `;
    document.body.appendChild(overlay);
    const panel = overlay.querySelector(".btt-forum-theme-panel");
    overlay.querySelector(".btt-theme-close").addEventListener("click", () => overlay.remove());
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) overlay.remove();
    });
    panel.querySelectorAll("[data-skin-id]").forEach((button) => {
      button.addEventListener("click", async () => {
        const skin = FORUM_SKIN_PRESETS.find((item) => item.id === button.dataset.skinId);
        if (!skin) return;
        const forumTheme = skin.forumTheme || "custom";
        const saved = await saveForumThemeSelection({
          forumTheme,
          colors: skin.colors,
          skinId: skin.id,
          skinName: skin.name
        });
        panel.querySelectorAll("[data-skin-id]").forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
        panel.querySelector("[data-current-skin]").textContent = skin.name;
        updateForumThemePanelValues(panel, saved.forumCustomColors);
        Toast.success(`${skin.name} applied`);
      });
    });
    panel.querySelectorAll("[data-theme-color], [data-theme-hex]").forEach((input) => {
      input.addEventListener("input", async () => {
        const key = input.dataset.themeColor || input.dataset.themeHex;
        let value = String(input.value || "").trim();
        if (!value.startsWith("#")) value = `#${value}`;
        if (!/^#[0-9a-f]{6}$/i.test(value)) return;
        value = value.toLowerCase();
        const safeKey = CSS.escape(key);
        const colorInput = panel.querySelector(`[data-theme-color="${safeKey}"]`);
        const hexInput = panel.querySelector(`[data-theme-hex="${safeKey}"]`);
        const rgb = panel.querySelector(`[data-theme-rgb="${safeKey}"]`);
        if (colorInput) colorInput.value = value;
        if (hexInput) hexInput.value = value;
        if (rgb) rgb.textContent = hexToRgbText(value);
        const nextColors = collectForumThemeColors(panel);
        await saveForumThemeSelection({ colors: nextColors, skinId: "custom", skinName: "Custom Theme" });
        panel.querySelectorAll("[data-skin-id]").forEach((btn) => btn.classList.remove("active"));
        panel.querySelector("[data-current-skin]").textContent = "Custom Theme";
      });
    });
    panel.querySelector('[data-theme-action="save"]').addEventListener("click", async () => {
      try {
        const nextColors = collectForumThemeColors(panel);
        await saveForumThemeSelection({ colors: nextColors, skinId: "custom", skinName: "Custom Theme" });
        Toast.success("Forum theme saved");
      } catch (error) {
        Toast.error(error?.message || "Invalid color value");
      }
    });
    panel.querySelector('[data-theme-action="reset"]').addEventListener("click", async () => {
      const skin = FORUM_SKIN_PRESETS.find((item) => item.id === "original");
      await saveForumThemeSelection({
        forumTheme: "original",
        colors: skin.colors,
        skinId: skin.id,
        skinName: skin.name
      });
      panel.querySelectorAll("[data-skin-id]").forEach((btn) => btn.classList.toggle("active", btn.dataset.skinId === "original"));
      panel.querySelector("[data-current-skin]").textContent = skin.name;
      updateForumThemePanelValues(panel, skin.colors);
      Toast.success("Default Bitcointalk theme restored");
    });
    panel.querySelector('[data-theme-action="export"]').addEventListener("click", () => {
      exportForumThemeJson(panel).catch((error) => Toast.error(error?.message || "Could not export theme"));
    });
    panel.querySelector('[data-theme-action="import"]').addEventListener("click", () => {
      panel.querySelector(".btt-theme-import-area")?.classList.remove("hidden");
      panel.querySelector(".btt-theme-import-text")?.focus();
    });
    panel.querySelector('[data-theme-action="apply-import"]').addEventListener("click", () => {
      applyForumThemeImport(panel).catch((error) => Toast.error(error?.message || "Could not import theme"));
    });
    panel.querySelector('[data-theme-action="cancel-import"]').addEventListener("click", () => {
      panel.querySelector(".btt-theme-import-area")?.classList.add("hidden");
    });
  }
  async function toggleCompactMode() {
    const settings = await getSettings();
    const newVal = !settings.compactMode;
    await updateSetting("compactMode", newVal);
    document.documentElement.classList.toggle("btt-compact", newVal);
    Toast.info(newVal ? "Compact mode on" : "Compact mode off");
  }
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "settingsChanged") {
      getSettings().then(async (newSettings) => {
        applyBitcointalkForumTheme(newSettings);
        applyThemeFromSettings(newSettings);
        darkMode_default.setEnabled(newSettings.forumTheme === "dark");
        document.documentElement.classList.toggle("btt-compact", !!newSettings.compactMode);
        const enabled = new Set(newSettings.enabledModules || []);
        for (const mod of ALL_MODULES) {
          const { state } = getModuleState(mod.id);
          if (enabled.has(mod.id) && state !== "active") {
            await enableModule(mod.id);
          } else if (!enabled.has(mod.id) && state === "active") {
            await disableModule(mod.id);
          }
        }
      });
    }
  });
  async function boot() {
    const settings = await getSettings();
    applyThemeFromSettings(settings);
    applyBitcointalkForumTheme(settings);
    if (settings.forumTheme === "dark") document.documentElement.classList.add("btt-dark");
    if (settings.compactMode) document.documentElement.classList.add("btt-compact");
    createLauncher();
    await initModules(ALL_MODULES);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
