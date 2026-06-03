// content.js - Entry point, runs on every Bitcointalk page.

import { initModules, enableModule, disableModule, getModuleState } from './moduleManager.js';
import { getSettings, saveSettings, storageSet, updateSetting } from '../utils/storage.js';
import { DEFAULT_FORUM_CUSTOM_COLORS, FORUM_THEME_STORAGE_KEY } from '../utils/constants.js';
import { Toast } from '../utils/sharedUI.js';
import {
  FORUM_COLOR_GROUPS,
  FORUM_SKIN_PRESETS,
  applyBitcointalkForumTheme,
  applyThemeFromSettings,
  normalizeForumCustomColors,
  validateForumCustomColors,
} from '../utils/theme.js';

import darkMode from '../modules/darkMode.js';
import codeCopyFixer from '../modules/codeCopyFixer.js';
import navigationBooster from '../modules/navigationBooster.js';
import quoteAssistant from '../modules/quoteAssistant.js';
import localDraftSaver from '../modules/localDraftSaver.js';
import clipboardSafety from '../modules/clipboardSafety.js';
import addressHighlighter from '../modules/addressHighlighter.js';
import boardCleaner from '../modules/boardCleaner.js';
import longQuoteCollapser from '../modules/longQuoteCollapser.js';
import imageCollapser from '../modules/imageCollapser.js';
import userNotes from '../modules/userNotes.js';
import keywordAlert from '../modules/keywordAlert.js';
import antiPhishingLinkChecker from '../modules/antiPhishingLinkChecker.js';
import externalLinkPreview from '../modules/externalLinkPreview.js';
import txidHelper from '../modules/txidHelper.js';
import selfPostFinder from '../modules/selfPostFinder.js';
import ignoreEnhancer from '../modules/ignoreEnhancer.js';
import mobileEnhancer from '../modules/mobileEnhancer.js';
import scraper from '../modules/scraper.js';
import personalPostLibrary from '../modules/personalPostLibrary.js';
import mentionHelper from '../modules/mentionHelper.js';
import rankProgressTracker from '../modules/rankProgressTracker.js';
import postLinkCopier from '../modules/postLinkCopier.js';
import trustPositionBadge from '../modules/trustPositionBadge.js';
import postMeritCounter from '../modules/postMeritCounter.js';

const ALL_MODULES = [
  darkMode, codeCopyFixer, navigationBooster, quoteAssistant,
  localDraftSaver, clipboardSafety, addressHighlighter, boardCleaner,
  longQuoteCollapser, imageCollapser, userNotes, keywordAlert,
  antiPhishingLinkChecker, externalLinkPreview, txidHelper,
  selfPostFinder, ignoreEnhancer, mobileEnhancer,
  scraper, personalPostLibrary,
  mentionHelper, rankProgressTracker, postLinkCopier,
  trustPositionBadge, postMeritCounter,
];

function createLauncher() {
  if (document.getElementById('btt-launcher')) return;

  const launcher = document.createElement('div');
  launcher.id = 'btt-launcher';

  const menu = document.createElement('div');
  menu.id = 'btt-mini-menu';

  const items = [
    { icon: 'Home', label: 'Open Dashboard', action: () => chrome.runtime.sendMessage({ action: 'openDashboard' }) },
    { icon: 'BB', label: 'BBCode Studio', action: () => chrome.runtime.sendMessage({ action: 'openDashboard', section: 'studio' }) },
    { icon: 'Theme', label: 'Forum Theme', action: openForumThemePanel },
    { icon: 'Compact', label: 'Toggle Compact Mode', action: toggleCompactMode },
    { icon: 'Settings', label: 'Settings', action: () => chrome.runtime.sendMessage({ action: 'openDashboard', section: 'settings' }) },
  ];

  items.forEach(({ icon, label, action }) => {
    const btn = document.createElement('button');
    btn.innerHTML = `<span>${escapeHtml(icon)}</span> ${escapeHtml(label)}`;
    btn.addEventListener('click', () => {
      menu.classList.remove('open');
      action();
    });
    menu.appendChild(btn);
  });

  const fab = document.createElement('button');
  fab.id = 'btt-fab';
  fab.title = 'Bitcointalk Toolkit';
  fab.textContent = 'B';

  fab.addEventListener('click', (event) => {
    event.stopPropagation();
    menu.classList.toggle('open');
  });

  document.addEventListener('click', (event) => {
    if (!launcher.contains(event.target)) menu.classList.remove('open');
  });

  launcher.appendChild(menu);
  launcher.appendChild(fab);
  document.body.appendChild(launcher);
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[ch]));
}

function hexToRgbText(hex) {
  const clean = String(hex || '').replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(clean)) return '';
  const [r, g, b] = clean.match(/.{2}/g).map(part => parseInt(part, 16));
  return `RGB ${r}, ${g}, ${b}`;
}

function buildForumThemeColorControls(colors) {
  const normalized = normalizeForumCustomColors(colors || DEFAULT_FORUM_CUSTOM_COLORS);
  return FORUM_COLOR_GROUPS.map(group => `
    <section class="btt-theme-group">
      <h4>${escapeHtml(group.label)}</h4>
      <div class="btt-theme-color-grid">
        ${group.fields.map(([key, label]) => {
          const value = normalized[key] || DEFAULT_FORUM_CUSTOM_COLORS[key];
          return `
            <label class="btt-theme-color-row" data-theme-color-row="${escapeHtml(key)}">
              <span>${escapeHtml(label)}</span>
              <input type="color" value="${escapeHtml(value)}" data-theme-color="${escapeHtml(key)}">
              <input type="text" value="${escapeHtml(value)}" maxlength="7" data-theme-hex="${escapeHtml(key)}" spellcheck="false">
              <small data-theme-rgb="${escapeHtml(key)}">${escapeHtml(hexToRgbText(value))}</small>
            </label>
          `;
        }).join('')}
      </div>
    </section>
  `).join('');
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
  panel.querySelectorAll('[data-theme-hex]').forEach(input => {
    colors[input.dataset.themeHex] = input.value;
  });
  return validateForumCustomColors(colors);
}

function notifySettingsChanged() {
  try {
    const result = chrome.runtime.sendMessage({ action: 'settingsChanged' });
    if (result && typeof result.catch === 'function') result.catch(() => {});
  } catch {
    // The content page already applied the change; cross-context refresh is best effort.
  }
}

async function saveForumThemeSelection({ forumTheme = 'custom', colors, skinId = 'custom', skinName = 'Custom Theme' }) {
  const current = await getSettings();
  const normalized = normalizeForumCustomColors(colors || current.forumCustomColors || DEFAULT_FORUM_CUSTOM_COLORS);
  const enabledModules = (current.enabledModules || []).filter(id => id !== 'darkMode');
  const nextSettings = {
    ...current,
    forumTheme,
    forumSkin: skinId,
    forumSkinName: skinName,
    forumCustomColors: normalized,
    darkMode: forumTheme === 'dark',
    enabledModules: forumTheme === 'dark' ? [...new Set([...enabledModules, 'darkMode'])] : enabledModules,
  };

  await saveSettings(nextSettings);
  await storageSet({ [FORUM_THEME_STORAGE_KEY]: forumTheme });
  applyBitcointalkForumTheme(nextSettings);
  darkMode.setEnabled(forumTheme === 'dark');
  notifySettingsChanged();
  return nextSettings;
}

async function exportForumThemeJson(panel) {
  const colors = collectForumThemeColors(panel);
  const json = JSON.stringify({
    version: 1,
    exportedAt: new Date().toISOString(),
    name: 'Custom Forum Theme',
    colors,
  }, null, 2);

  try {
    await navigator.clipboard.writeText(json);
    Toast.success('Forum theme JSON copied');
  } catch {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'forum-theme.json';
    a.click();
    URL.revokeObjectURL(url);
    Toast.success('Forum theme JSON exported');
  }
}

async function applyForumThemeImport(panel) {
  const textarea = panel.querySelector('.btt-theme-import-text');
  try {
    const parsed = JSON.parse(textarea.value || '');
    const colors = validateForumCustomColors(parsed.colors || parsed);
    await saveForumThemeSelection({ colors, skinId: 'custom', skinName: 'Custom Theme' });
    updateForumThemePanelValues(panel, colors);
    panel.querySelectorAll('[data-skin-id]').forEach(btn => btn.classList.remove('active'));
    panel.querySelector('[data-current-skin]').textContent = 'Custom Theme';
    panel.querySelector('.btt-theme-import-area')?.classList.add('hidden');
    textarea.value = '';
    Toast.success('Forum theme imported');
  } catch (error) {
    Toast.error(error?.message || 'Invalid theme JSON');
  }
}

async function openForumThemePanel() {
  document.getElementById('btt-forum-theme-modal')?.remove();

  const settings = await getSettings();
  const colors = normalizeForumCustomColors(settings.forumCustomColors || DEFAULT_FORUM_CUSTOM_COLORS);
  const activeSkin = settings.forumTheme === 'original' ? 'original' : (settings.forumSkin || 'custom');

  const overlay = document.createElement('div');
  overlay.id = 'btt-forum-theme-modal';
  overlay.innerHTML = `
    <div class="btt-forum-theme-panel" role="dialog" aria-modal="true" aria-label="Forum Theme">
      <div class="btt-forum-theme-header">
        <div>
          <h3>Forum Theme</h3>
          <p>Customize Bitcointalk page colors. Current: <strong data-current-skin>${escapeHtml(settings.forumSkinName || (activeSkin === 'original' ? 'Default Bitcointalk' : 'Custom Theme'))}</strong></p>
        </div>
        <button type="button" class="btt-theme-close" aria-label="Close">x</button>
      </div>

      <section class="btt-theme-group">
        <h4>Ready Made Skins</h4>
        <div class="btt-theme-skin-grid">
          ${FORUM_SKIN_PRESETS.map(skin => `
            <button type="button" class="${skin.id === activeSkin ? 'active' : ''}" data-skin-id="${escapeHtml(skin.id)}">
              ${escapeHtml(skin.name)}
            </button>
          `).join('')}
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
  const panel = overlay.querySelector('.btt-forum-theme-panel');

  overlay.querySelector('.btt-theme-close').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) overlay.remove();
  });

  panel.querySelectorAll('[data-skin-id]').forEach(button => {
    button.addEventListener('click', async () => {
      const skin = FORUM_SKIN_PRESETS.find(item => item.id === button.dataset.skinId);
      if (!skin) return;
      const forumTheme = skin.forumTheme || 'custom';
      const saved = await saveForumThemeSelection({
        forumTheme,
        colors: skin.colors,
        skinId: skin.id,
        skinName: skin.name,
      });
      panel.querySelectorAll('[data-skin-id]').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      panel.querySelector('[data-current-skin]').textContent = skin.name;
      updateForumThemePanelValues(panel, saved.forumCustomColors);
      Toast.success(`${skin.name} applied`);
    });
  });

  panel.querySelectorAll('[data-theme-color], [data-theme-hex]').forEach(input => {
    input.addEventListener('input', async () => {
      const key = input.dataset.themeColor || input.dataset.themeHex;
      let value = String(input.value || '').trim();
      if (!value.startsWith('#')) value = `#${value}`;
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
      await saveForumThemeSelection({ colors: nextColors, skinId: 'custom', skinName: 'Custom Theme' });
      panel.querySelectorAll('[data-skin-id]').forEach(btn => btn.classList.remove('active'));
      panel.querySelector('[data-current-skin]').textContent = 'Custom Theme';
    });
  });

  panel.querySelector('[data-theme-action="save"]').addEventListener('click', async () => {
    try {
      const nextColors = collectForumThemeColors(panel);
      await saveForumThemeSelection({ colors: nextColors, skinId: 'custom', skinName: 'Custom Theme' });
      Toast.success('Forum theme saved');
    } catch (error) {
      Toast.error(error?.message || 'Invalid color value');
    }
  });

  panel.querySelector('[data-theme-action="reset"]').addEventListener('click', async () => {
    const skin = FORUM_SKIN_PRESETS.find(item => item.id === 'original');
    await saveForumThemeSelection({
      forumTheme: 'original',
      colors: skin.colors,
      skinId: skin.id,
      skinName: skin.name,
    });
    panel.querySelectorAll('[data-skin-id]').forEach(btn => btn.classList.toggle('active', btn.dataset.skinId === 'original'));
    panel.querySelector('[data-current-skin]').textContent = skin.name;
    updateForumThemePanelValues(panel, skin.colors);
    Toast.success('Default Bitcointalk theme restored');
  });

  panel.querySelector('[data-theme-action="export"]').addEventListener('click', () => {
    exportForumThemeJson(panel).catch(error => Toast.error(error?.message || 'Could not export theme'));
  });
  panel.querySelector('[data-theme-action="import"]').addEventListener('click', () => {
    panel.querySelector('.btt-theme-import-area')?.classList.remove('hidden');
    panel.querySelector('.btt-theme-import-text')?.focus();
  });
  panel.querySelector('[data-theme-action="apply-import"]').addEventListener('click', () => {
    applyForumThemeImport(panel).catch(error => Toast.error(error?.message || 'Could not import theme'));
  });
  panel.querySelector('[data-theme-action="cancel-import"]').addEventListener('click', () => {
    panel.querySelector('.btt-theme-import-area')?.classList.add('hidden');
  });
}

async function toggleCompactMode() {
  const settings = await getSettings();
  const newVal = !settings.compactMode;
  await updateSetting('compactMode', newVal);
  document.documentElement.classList.toggle('btt-compact', newVal);
  Toast.info(newVal ? 'Compact mode on' : 'Compact mode off');
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'settingsChanged') {
    getSettings().then(async newSettings => {
      applyBitcointalkForumTheme(newSettings);
      applyThemeFromSettings(newSettings);
      darkMode.setEnabled(newSettings.forumTheme === 'dark');
      document.documentElement.classList.toggle('btt-compact', !!newSettings.compactMode);

      const enabled = new Set(newSettings.enabledModules || []);
      for (const mod of ALL_MODULES) {
        const { state } = getModuleState(mod.id);
        if (enabled.has(mod.id) && state !== 'active') {
          await enableModule(mod.id);
        } else if (!enabled.has(mod.id) && state === 'active') {
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

  if (settings.forumTheme === 'dark') document.documentElement.classList.add('btt-dark');
  if (settings.compactMode) document.documentElement.classList.add('btt-compact');

  createLauncher();
  await initModules(ALL_MODULES);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
