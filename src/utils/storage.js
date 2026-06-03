// storage.js — Unified storage API using chrome.storage.local with localStorage fallback

import { DEFAULT_SETTINGS, BTT_STORAGE_PREFIX, TOOLKIT_THEME_STORAGE_KEY, FORUM_THEME_STORAGE_KEY } from './constants.js';

const USE_CHROME = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;

// ── Low-level get/set ────────────────────────────────────────────────────────

export function storageGet(keys) {
  return new Promise(resolve => {
    if (USE_CHROME) {
      chrome.storage.local.get(keys, result => resolve(result));
    } else {
      // localStorage fallback for dashboard when chrome API unavailable
      const result = {};
      const arr = Array.isArray(keys) ? keys : (typeof keys === 'string' ? [keys] : Object.keys(keys));
      arr.forEach(k => {
        const raw = localStorage.getItem(BTT_STORAGE_PREFIX + k);
        if (raw !== null) {
          try { result[k] = JSON.parse(raw); }
          catch { result[k] = raw; }
        } else if (typeof keys === 'object' && !Array.isArray(keys)) {
          result[k] = keys[k]; // default value
        }
      });
      resolve(result);
    }
  });
}

export function storageSet(items) {
  return new Promise(resolve => {
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

export function storageRemove(keys) {
  const arr = Array.isArray(keys) ? keys : [keys];
  return new Promise(resolve => {
    if (USE_CHROME) {
      chrome.storage.local.remove(arr, resolve);
    } else {
      arr.forEach(k => localStorage.removeItem(BTT_STORAGE_PREFIX + k));
      resolve();
    }
  });
}

// ── Settings API ─────────────────────────────────────────────────────────────

export async function getSettings() {
  const result = await storageGet(['btt_settings', TOOLKIT_THEME_STORAGE_KEY, FORUM_THEME_STORAGE_KEY]);
  const saved = result['btt_settings'] || {};
  // Merge with defaults so new settings always have a value
  const settings = { ...DEFAULT_SETTINGS, ...saved };
  settings.toolkitTheme = result[TOOLKIT_THEME_STORAGE_KEY] || saved.toolkitTheme || saved.theme || DEFAULT_SETTINGS.toolkitTheme;
  settings.forumTheme = result[FORUM_THEME_STORAGE_KEY] || saved.forumTheme || DEFAULT_SETTINGS.forumTheme;
  settings.theme = settings.toolkitTheme;
  settings.darkMode = settings.forumTheme === 'dark';
  settings.trustPositionBadgeSourceMode = 'custom-thread';
  if (!settings.trustPositionBadgeCustomThreadUrl) {
    settings.trustPositionBadgeCustomThreadUrl = DEFAULT_SETTINGS.trustPositionBadgeCustomThreadUrl;
  }
  if (!settings.trustPositionBadgeCustomAuthor) {
    settings.trustPositionBadgeCustomAuthor = DEFAULT_SETTINGS.trustPositionBadgeCustomAuthor;
  }
  if (Array.isArray(settings.enabledModules)) {
    settings.enabledModules = settings.darkMode
      ? [...new Set([...settings.enabledModules, 'darkMode'])]
      : settings.enabledModules.filter(id => id !== 'darkMode');
  }
  if (saved.boardCleanerDefaultsV2 !== true) {
    settings.hideAvatars = true;
    settings.hideSignatures = true;
    settings.boardCleanerDefaultsV2 = true;
    await storageSet({ btt_settings: settings });
  }

  if (
    saved.trustPositionBadgeEnabled !== false
    && Array.isArray(settings.enabledModules)
    && !settings.enabledModules.includes('trustPositionBadge')
  ) {
    settings.enabledModules = [...settings.enabledModules, 'trustPositionBadge'];
  }
  if (
    saved.quoteAssistantEnabled !== false
    && Array.isArray(settings.enabledModules)
    && !settings.enabledModules.includes('quoteAssistant')
  ) {
    settings.enabledModules = [...settings.enabledModules, 'quoteAssistant'];
  }

  return settings;
}

export async function saveSettings(settings) {
  await storageSet({ btt_settings: settings });
}

export async function updateSetting(key, value) {
  const settings = await getSettings();
  settings[key] = value;
  await saveSettings(settings);
  return settings;
}

export async function resetSettings() {
  await saveSettings({ ...DEFAULT_SETTINGS });
  return { ...DEFAULT_SETTINGS };
}

// ── Import / Export ──────────────────────────────────────────────────────────

export async function exportSettings() {
  const settings = await getSettings();
  return JSON.stringify({
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    settings,
  }, null, 2);
}

export async function importSettings(jsonString) {
  let data;
  try { data = JSON.parse(jsonString); }
  catch { throw new Error('Invalid JSON — the file could not be parsed.'); }

  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid format — expected a JSON object.');
  }

  const incoming = (data.settings && typeof data.settings === 'object') ? data.settings : data;

  // Type-validate known critical fields before merging
  if ('enabledModules' in incoming && !Array.isArray(incoming.enabledModules)) {
    throw new Error('Invalid settings: "enabledModules" must be an array.');
  }
  if ('enabledModules' in incoming) {
    // Only allow string module IDs, max 100 entries
    incoming.enabledModules = incoming.enabledModules
      .filter(id => typeof id === 'string' && /^[a-zA-Z0-9_]+$/.test(id))
      .slice(0, 100);
  }
  if ('watchedKeywords' in incoming && !Array.isArray(incoming.watchedKeywords)) {
    delete incoming.watchedKeywords; // drop invalid, use current/default
  }
  if ('ignoredUsers' in incoming && !Array.isArray(incoming.ignoredUsers)) {
    delete incoming.ignoredUsers;
  }

  const current = await getSettings();
  const merged  = { ...DEFAULT_SETTINGS, ...current, ...incoming };
  await saveSettings(merged);
  return merged;
}

// ── Convenience helpers ───────────────────────────────────────────────────────

export async function isModuleEnabled(moduleId) {
  const settings = await getSettings();
  return (settings.enabledModules || []).includes(moduleId);
}

export async function setModuleEnabled(moduleId, enabled) {
  const settings = await getSettings();
  let list = settings.enabledModules || [];
  if (enabled) {
    if (!list.includes(moduleId)) list = [...list, moduleId];
  } else {
    list = list.filter(id => id !== moduleId);
  }
  return updateSetting('enabledModules', list);
}

// ── Drafts ────────────────────────────────────────────────────────────────────

export async function getDrafts() {
  const result = await storageGet('btt_drafts');
  return result['btt_drafts'] || {};
}

export async function saveDraft(key, content, name) {
  const drafts = await getDrafts();
  drafts[key] = { content, name: name || key, savedAt: Date.now() };
  await storageSet({ btt_drafts: drafts });
}

export async function deleteDraft(key) {
  const drafts = await getDrafts();
  delete drafts[key];
  await storageSet({ btt_drafts: drafts });
}

// ── User Notes ───────────────────────────────────────────────────────────────

export async function getUserNotes() {
  const result = await storageGet('btt_user_notes');
  return result['btt_user_notes'] || {};
}

export async function setUserNote(username, note) {
  const notes = await getUserNotes();
  notes[username.toLowerCase()] = { ...note, updatedAt: Date.now() };
  await storageSet({ btt_user_notes: notes });
}

export async function deleteUserNote(username) {
  const notes = await getUserNotes();
  delete notes[username.toLowerCase()];
  await storageSet({ btt_user_notes: notes });
}

// ── Snippets ──────────────────────────────────────────────────────────────────

export async function getSnippets() {
  const result = await storageGet('btt_snippets');
  return result['btt_snippets'] || [];
}

export async function saveSnippet(snippet) {
  const snippets = await getSnippets();
  const existing = snippets.findIndex(s => s.id === snippet.id);
  if (existing >= 0) snippets[existing] = snippet;
  else snippets.push({ ...snippet, id: snippet.id || Date.now().toString(), createdAt: Date.now() });
  await storageSet({ btt_snippets: snippets });
}

export async function deleteSnippet(id) {
  const snippets = await getSnippets();
  await storageSet({ btt_snippets: snippets.filter(s => s.id !== id) });
}

// ── Bookmarks ────────────────────────────────────────────────────────────────

export async function getBookmarks() {
  const result = await storageGet('btt_bookmarks');
  return result['btt_bookmarks'] || [];
}

export async function saveBookmark(bookmark) {
  const bookmarks = await getBookmarks();
  bookmarks.unshift({ ...bookmark, id: Date.now().toString(), savedAt: Date.now() });
  await storageSet({ btt_bookmarks: bookmarks });
}

export async function deleteBookmark(id) {
  const bookmarks = await getBookmarks();
  await storageSet({ btt_bookmarks: bookmarks.filter(b => b.id !== id) });
}

// ── Campaign projects ─────────────────────────────────────────────────────────

export async function getCampaignProjects() {
  const result = await storageGet('btt_campaigns');
  return result['btt_campaigns'] || [];
}

export async function saveCampaignProject(project) {
  const projects = await getCampaignProjects();
  const idx = projects.findIndex(p => p.id === project.id);
  if (idx >= 0) projects[idx] = { ...projects[idx], ...project, updatedAt: Date.now() };
  else projects.unshift({ ...project, id: Date.now().toString(), createdAt: Date.now(), updatedAt: Date.now() });
  await storageSet({ btt_campaigns: projects });
  return projects;
}

export async function deleteCampaignProject(id) {
  const projects = await getCampaignProjects();
  await storageSet({ btt_campaigns: projects.filter(p => p.id !== id) });
}
