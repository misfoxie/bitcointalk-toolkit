// ignoreEnhancer.js — Locally hide/collapse posts from ignored users

import { getSettings, updateSetting } from '../utils/storage.js';
import { escapeHtml } from '../utils/sanitizer.js';

export default {
  id: 'ignoreEnhancer', name: 'Ignore Enhancer',
  description: 'Locally hide or collapse posts from specific users without using Bitcointalk\'s ignore system.',
  category: 'Layout & Reading', defaultEnabled: false,

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
    document.querySelectorAll('[data-btt-ignored="1"]').forEach(el => el.style.display = '');
    this._observer = null;
  },

  _processAll() {
    if (!this._ignored.length) return;
    const ignLower = this._ignored.map(u => u.toLowerCase());
    document.querySelectorAll('td.poster_info b > a, td.poster_info a').forEach(a => {
      const username = a.textContent.trim().toLowerCase();
      if (!ignLower.includes(username)) return;
      const row = a.closest('tr');
      if (row && !row.dataset.bttIgnored) {
        row.dataset.bttIgnored = '1';
        row.style.opacity = '.3';
        row.title = 'Hidden by Ignore Enhancer — click to show';
        row.style.cursor = 'pointer';
        row.addEventListener('click', () => { row.style.opacity = '1'; row.style.cursor = ''; row.title = ''; });
      }
    });
  },

  renderDashboardPanel(container) {
    let ignored = [];
    getSettings().then(s => { ignored = s.ignoredUsers || []; renderList(); });

    container.innerHTML = `
      <div class="btt-panel">
        <p>Posts from ignored users will be dimmed. Click a dimmed post to reveal it.</p>
        <div style="display:flex;gap:8px;margin-top:10px">
          <input type="text" id="btt-ign-input" placeholder="Username to ignore…" style="flex:1;padding:6px 8px;border-radius:4px;border:1px solid var(--border,#2d3340);background:var(--bg-input,#1e2025);color:var(--text,#e5e7eb);font-size:13px">
          <button id="btt-ign-add" class="btt-btn btt-btn-primary">Add</button>
        </div>
        <div id="btt-ign-list" style="margin-top:10px;display:flex;flex-wrap:wrap;gap:6px"></div>
      </div>
    `;

    const renderList = () => {
      const list = container.querySelector('#btt-ign-list');
      if (!list) return;
      list.innerHTML = '';
      ignored.forEach((u, i) => {
        const chip = document.createElement('span');
        chip.style.cssText = 'background:#374151;padding:3px 10px;border-radius:14px;font-size:12px;display:inline-flex;align-items:center;gap:6px;';
        chip.innerHTML = `${escapeHtml(u)} <button data-i="${i}" class="del-ign" style="background:none;border:none;color:#9ca3af;cursor:pointer;font-size:14px;padding:0">×</button>`;
        list.appendChild(chip);
      });
      list.querySelectorAll('.del-ign').forEach(btn => {
        btn.addEventListener('click', async () => {
          ignored.splice(parseInt(btn.dataset.i, 10), 1);
          this._ignored = ignored;
          await updateSetting('ignoredUsers', ignored);
          renderList();
        });
      });
    };

    container.querySelector('#btt-ign-add').addEventListener('click', async () => {
      const val = container.querySelector('#btt-ign-input').value.trim();
      if (!val || ignored.includes(val)) return;
      ignored.push(val);
      this._ignored = ignored;
      await updateSetting('ignoredUsers', ignored);
      container.querySelector('#btt-ign-input').value = '';
      renderList();
    });
  },
};
