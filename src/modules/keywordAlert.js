// keywordAlert.js - Highlight watched keywords in posts.

import { getSettings, updateSetting } from '../utils/storage.js';
import { escapeHtml } from '../utils/sanitizer.js';
import { Toast } from '../utils/sharedUI.js';

const SCAN_SELECTOR = 'td.td_headerandpost, .post, .postarea, .postbody';
const SKIP_SELECTOR = [
  'script',
  'style',
  'textarea',
  'input',
  'select',
  'button',
  'a',
  '.btt-keyword-highlight',
  '#btt-toolkit-root',
].join(',');

function normalizeKeywordList(keywords) {
  return Array.from(new Set(
    (Array.isArray(keywords) ? keywords : [])
      .map((kw) => String(kw || '').trim())
      .filter(Boolean),
  ));
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildKeywordRegex(keywords, caseSensitive) {
  const pattern = normalizeKeywordList(keywords)
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join('|');
  if (!pattern) return null;
  return new RegExp(pattern, caseSensitive ? 'g' : 'gi');
}

function isSkippableTextNode(node) {
  const parent = node.parentElement;
  if (!parent) return true;
  if (!node.textContent || !node.textContent.trim()) return true;
  return Boolean(parent.closest(SKIP_SELECTOR));
}

export default {
  id: 'keywordAlert',
  name: 'Keyword Alert',
  description: 'Highlight your watched keywords in post content.',
  category: 'Layout & Reading',
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
      if (areaName !== 'local' || !changes.btt_settings) return;
      this._loadSettings().then(() => {
        this._clearHighlights();
        this._processAll();
      });
    };
    if (typeof chrome !== 'undefined' && chrome.storage?.onChanged) {
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
      if (typeof chrome !== 'undefined' && chrome.storage?.onChanged) {
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
    document.querySelectorAll('.btt-keyword-highlight').forEach((el) => {
      el.replaceWith(document.createTextNode(el.textContent || ''));
    });
  },

  _processAll() {
    const regex = buildKeywordRegex(this._keywords, this._caseSensitive);
    if (!regex) return;

    document.querySelectorAll(SCAN_SELECTOR).forEach((container) => {
      this._highlightKeywords(container, regex);
    });
  },

  _highlightKeywords(container, regex) {
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          return isSkippableTextNode(node)
            ? NodeFilter.FILTER_REJECT
            : NodeFilter.FILTER_ACCEPT;
        },
      },
    );

    const nodes = [];
    let node;
    while ((node = walker.nextNode())) nodes.push(node);

    nodes.forEach((textNode) => {
      const text = textNode.textContent || '';
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

        const mark = document.createElement('mark');
        mark.className = 'btt-keyword-highlight';
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
          <input type="checkbox" id="btt-kw-case" ${caseSensitive ? 'checked' : ''}>
          Case-sensitive matching
        </label>
        <div id="btt-kw-list" style="margin-top:10px;display:flex;flex-wrap:wrap;gap:6px"></div>
      </div>
    `;

    const save = async () => {
      await updateSetting('watchedKeywords', keywords);
      await updateSetting('keywordsCaseSensitive', caseSensitive);
    };

    const renderList = () => {
      const list = container.querySelector('#btt-kw-list');
      if (!list) return;

      if (!keywords.length) {
        list.innerHTML = '<span style="font-size:12px;color:var(--text-secondary,#aaa)">No keywords saved.</span>';
        return;
      }

      list.innerHTML = '';
      keywords.forEach((kw, index) => {
        const chip = document.createElement('span');
        chip.style.cssText = 'background:#374151;padding:3px 10px;border-radius:14px;font-size:12px;display:inline-flex;align-items:center;gap:6px;';
        chip.innerHTML = `${escapeHtml(kw)} <button data-i="${index}" class="del-kw" style="background:none;border:none;color:#d1d5db;cursor:pointer;font-size:14px;padding:0;line-height:1">x</button>`;
        list.appendChild(chip);
      });

      list.querySelectorAll('.del-kw').forEach((btn) => {
        btn.addEventListener('click', async () => {
          keywords.splice(parseInt(btn.dataset.i, 10), 1);
          this._keywords = keywords;
          await save();
          renderList();
        });
      });
    };

    container.querySelector('#btt-kw-add').addEventListener('click', async () => {
      const input = container.querySelector('#btt-kw-input');
      const value = input.value.trim();
      if (!value || keywords.includes(value)) return;
      keywords.push(value);
      this._keywords = keywords;
      input.value = '';
      await save();
      renderList();
      Toast.success(`Keyword "${value}" added.`);
    });

    container.querySelector('#btt-kw-input').addEventListener('keydown', (event) => {
      if (event.key === 'Enter') container.querySelector('#btt-kw-add').click();
    });

    container.querySelector('#btt-kw-case').addEventListener('change', async (event) => {
      caseSensitive = event.target.checked;
      this._caseSensitive = caseSensitive;
      await save();
      Toast.success('Keyword settings saved.');
    });

    renderList();
  },
};
