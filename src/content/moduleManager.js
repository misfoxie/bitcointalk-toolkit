// moduleManager.js — Module lifecycle manager
// Tracks state, prevents double-init, handles errors, provides shared API.

import { getSettings, updateSetting, setModuleEnabled } from '../utils/storage.js';
import { Toast, showModal, copyToClipboard, downloadFile } from '../utils/sharedUI.js';
import { parse as parseBBCode } from '../utils/bbcodeParser.js';
import * as domHelpers from './domHelpers.js';

// ── Module state map ──────────────────────────────────────────────────────────
// state: 'unloaded' | 'loading' | 'active' | 'disabled' | 'error'
const moduleStates = new Map(); // moduleId → { state, error, module }

// ── Shared API passed to every module's init() ────────────────────────────────
let sharedApi = null;

function buildApi(settings) {
  return {
    settings,
    storage: {
      get:    key => chrome.storage.local.get(key),
      set:    items => chrome.storage.local.set(items),
    },
    dom:     domHelpers,
    toast:   Toast,
    modal:   showModal,
    copy:    copyToClipboard,
    download: downloadFile,
    bbcode:  { parse: parseBBCode },
    // Convenience: navigate to a dashboard section
    openDashboard: (section) => {
      chrome.runtime.sendMessage({ action: 'openDashboard', section });
    },
    // Check if a module is active
    isModuleActive: (id) => {
      const entry = moduleStates.get(id);
      return entry?.state === 'active';
    },
  };
}

// ── Registry ──────────────────────────────────────────────────────────────────
const registeredModules = new Map(); // id → module definition

export function registerModule(mod) {
  if (!mod?.id) { console.warn('[BTT] Module missing id, skipping.'); return; }
  registeredModules.set(mod.id, mod);
  if (!moduleStates.has(mod.id)) moduleStates.set(mod.id, { state: 'unloaded', error: null, module: mod });
}

export function getRegisteredModules() {
  return [...registeredModules.values()];
}

export function getModuleState(id) {
  return moduleStates.get(id) || { state: 'unloaded', error: null };
}

// ── Init ──────────────────────────────────────────────────────────────────────
export async function initModules(modules) {
  const settings = await getSettings();
  sharedApi = buildApi(settings);
  const enabled = new Set(settings.enabledModules || []);

  for (const mod of modules) {
    registerModule(mod);
    if (enabled.has(mod.id)) {
      await initModule(mod.id);
    } else {
      moduleStates.set(mod.id, { state: 'disabled', error: null, module: mod });
    }
  }

  console.log(`[BTT] Initialized. Active: ${[...moduleStates.values()].filter(s => s.state === 'active').length}`);
}

async function initModule(id) {
  const entry = moduleStates.get(id);
  if (!entry) return;
  if (entry.state === 'active' || entry.state === 'loading') return; // prevent double-init

  const mod = entry.module;
  moduleStates.set(id, { ...entry, state: 'loading' });

  const DEV = false; // set to true to enable performance logging
  const t0  = DEV ? performance.now() : 0;

  try {
    await mod.init(sharedApi);
    moduleStates.set(id, { ...entry, state: 'active', error: null });
    if (DEV) console.log(`[BTT] ${id} init in ${(performance.now() - t0).toFixed(1)}ms`);
  } catch (err) {
    console.error(`[BTT] Module ${id} init failed:`, err);
    moduleStates.set(id, { ...entry, state: 'error', error: err.message });
  }
}

async function destroyModule(id) {
  const entry = moduleStates.get(id);
  if (!entry || entry.state !== 'active') return;
  try {
    await entry.module.destroy?.();
    moduleStates.set(id, { ...entry, state: 'disabled', error: null });
  } catch (err) {
    console.error(`[BTT] Module ${id} destroy failed:`, err);
    moduleStates.set(id, { ...entry, state: 'error', error: err.message });
  }
}

// ── Enable / disable from content script ─────────────────────────────────────
export async function enableModule(id) {
  const entry = moduleStates.get(id);
  if (!entry) return;
  await setModuleEnabled(id, true);
  if (entry.state !== 'active') await initModule(id);
}

export async function disableModule(id) {
  const entry = moduleStates.get(id);
  if (!entry) return;
  await setModuleEnabled(id, false);
  if (entry.state === 'active') await destroyModule(id);
}

export async function reloadModule(id) {
  await destroyModule(id);
  await initModule(id);
}

// ── MutationObserver helper with debounce ─────────────────────────────────────
const observerTimers = new Map();

export function watchDom(selector, callback, debounceMs = 300) {
  const run = () => {
    const els = document.querySelectorAll(selector);
    if (els.length) callback(Array.from(els));
  };

  const observer = new MutationObserver(() => {
    clearTimeout(observerTimers.get(observer));
    observerTimers.set(observer, setTimeout(run, debounceMs));
  });

  observer.observe(document.body, { childList: true, subtree: true });
  run(); // run immediately for existing elements
  return observer; // caller can disconnect when module is destroyed
}
