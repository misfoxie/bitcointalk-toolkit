// popup.js — Extension popup logic

// ── Storage helpers (inline to avoid import issues in popup context) ──────────

import { FORUM_THEME_STORAGE_KEY, TOOLKIT_THEME_STORAGE_KEY } from '../utils/constants.js';
import { applyThemeFromSettings, forumThemeSelectOptionsHtml, themeSelectOptionsHtml } from '../utils/theme.js';

async function getSettings() {
  return new Promise(resolve => {
    chrome.storage.local.get(['btt_settings', TOOLKIT_THEME_STORAGE_KEY, FORUM_THEME_STORAGE_KEY], result => {
      const defaults = {
        enabledModules: ['codeCopyFixer','navigationBooster','quoteAssistant','localDraftSaver','clipboardSafety'],
        darkMode: false,
        theme: 'dark',
        toolkitTheme: 'dark',
        forumTheme: 'original',
      };
      const saved = { ...defaults, ...(result.btt_settings || {}) };
      saved.toolkitTheme = result[TOOLKIT_THEME_STORAGE_KEY] || saved.toolkitTheme || saved.theme || 'dark';
      saved.forumTheme = result[FORUM_THEME_STORAGE_KEY] || saved.forumTheme || 'original';
      saved.theme = saved.toolkitTheme;
      saved.darkMode = saved.forumTheme === 'dark';
      saved.enabledModules = saved.darkMode
        ? [...new Set([...(saved.enabledModules || []), 'darkMode'])]
        : (saved.enabledModules || []).filter(id => id !== 'darkMode');
      resolve(saved);
    });
  });
}

async function saveSettings(settings) {
  return new Promise(resolve => chrome.storage.local.set({ btt_settings: settings }, resolve));
}

async function saveThemeKeys(settings) {
  return new Promise(resolve => chrome.storage.local.set({
    [TOOLKIT_THEME_STORAGE_KEY]: settings.toolkitTheme,
    [FORUM_THEME_STORAGE_KEY]: settings.forumTheme,
    btt_settings: settings,
  }, resolve));
}

function notifyActiveTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { action: 'settingsChanged' });
  });
}

// ── Boot ──────────────────────────────────────────────────────────────────────

async function boot() {
  const settings = await getSettings();
  applyThemeFromSettings(settings);

  const toolkitThemeSelect = document.getElementById('popup-toolkit-theme-select');
  const forumThemeSelect = document.getElementById('popup-forum-theme-select');
  if (toolkitThemeSelect) {
    toolkitThemeSelect.innerHTML = themeSelectOptionsHtml(settings.toolkitTheme);
    toolkitThemeSelect.value = settings.toolkitTheme || 'dark';
    toolkitThemeSelect.addEventListener('change', async () => {
      const s = await getSettings();
      s.toolkitTheme = toolkitThemeSelect.value;
      s.theme = s.toolkitTheme;
      s.dashboardDarkMode = s.toolkitTheme !== 'light';
      await saveThemeKeys(s);
      applyThemeFromSettings(s);
      notifyActiveTab();
    });
  }

  if (forumThemeSelect) {
    forumThemeSelect.innerHTML = forumThemeSelectOptionsHtml(settings.forumTheme);
    forumThemeSelect.value = settings.forumTheme || 'original';
    forumThemeSelect.addEventListener('change', async () => {
      const s = await getSettings();
      s.forumTheme = forumThemeSelect.value;
      s.darkMode = s.forumTheme === 'dark';
      s.enabledModules = s.darkMode
        ? [...new Set([...(s.enabledModules || []), 'darkMode'])]
        : (s.enabledModules || []).filter(id => id !== 'darkMode');
      await saveThemeKeys(s);
      const darkCheck = document.querySelector('input[data-key="darkMode"]');
      if (darkCheck) darkCheck.checked = s.darkMode;
      notifyActiveTab();
    });
  }

  // Site status
  const statusEl = document.getElementById('site-status');
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const url = tabs[0]?.url || '';
    if (url.includes('bitcointalk.org')) {
      statusEl.textContent = '✓ Active on Bitcointalk';
      statusEl.classList.add('active');
    } else {
      statusEl.textContent = 'Not on Bitcointalk';
    }
  });

  // Open dashboard button
  document.getElementById('btn-open-dashboard').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('src/ui/dashboard.html') });
    window.close();
  });

  // Settings button
  document.getElementById('btn-settings').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('src/ui/dashboard.html') + '#settings' });
    window.close();
  });

  // Quick toggles
  document.querySelectorAll('.toggle-row [data-module]').forEach(checkbox => {
    const moduleId = checkbox.dataset.module;
    const isEnabled = settings.enabledModules?.includes(moduleId) ?? false;
    checkbox.checked = isEnabled;

    checkbox.addEventListener('change', async () => {
      const s = await getSettings();
      let list = s.enabledModules || [];
      if (checkbox.checked) {
        if (!list.includes(moduleId)) list = [...list, moduleId];
      } else {
        list = list.filter(id => id !== moduleId);
      }
      s.enabledModules = list;
      await saveSettings(s);
      // Notify active tab
      notifyActiveTab();
    });
  });

  // Dark mode toggle (special — uses darkMode setting not enabledModules)
  const darkCheck = document.querySelector('input[data-key="darkMode"]');
  if (darkCheck) {
    darkCheck.checked = settings.forumTheme === 'dark';
    darkCheck.addEventListener('change', async () => {
      const s = await getSettings();
      s.darkMode = darkCheck.checked;
      s.forumTheme = darkCheck.checked ? 'dark' : 'original';
      s.enabledModules = darkCheck.checked
        ? [...new Set([...(s.enabledModules || []), 'darkMode'])]
        : (s.enabledModules || []).filter(id => id !== 'darkMode');
      await saveThemeKeys(s);
      if (forumThemeSelect) forumThemeSelect.value = s.forumTheme;
      notifyActiveTab();
    });
  }
}

boot();
