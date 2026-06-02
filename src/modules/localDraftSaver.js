// localDraftSaver.js — Auto-save reply textarea per thread, restore on page load

import { getDrafts, saveDraft, deleteDraft } from '../utils/storage.js';
import { isThreadPage, getTopicId, getReplyTextarea } from '../content/domHelpers.js';
import { Toast } from '../utils/sharedUI.js';

export default {
  id:             'localDraftSaver',
  name:           'Local Draft Saver',
  description:    'Auto-saves your reply as you type and restores it after page reload.',
  category:       'Layout & Reading',
  defaultEnabled: true,

  _interval:   null,
  _banner:     null,
  _draftKey:   null,

  async init(api) {
    if (!isThreadPage()) return;
    const topicId = getTopicId();
    if (!topicId) return;
    this._draftKey = `thread_${topicId}`;

    await this._restoreDraft();
    this._startAutoSave(api.settings?.autoSaveInterval || 5000);
  },

  destroy() {
    clearInterval(this._interval);
    this._banner?.remove();
    this._interval = null;
    this._banner   = null;
  },

  async _restoreDraft() {
    const drafts = await getDrafts();
    const draft  = drafts[this._draftKey];
    if (!draft?.content?.trim()) return;

    const ta = getReplyTextarea();
    if (!ta) return;

    // Show restore banner
    this._showBanner(draft, ta);
  },

  _showBanner(draft, ta) {
    if (document.getElementById('btt-draft-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'btt-draft-banner';
    const ago = this._timeAgo(draft.savedAt);
    banner.innerHTML = `
      <span>💾 You have an unsaved draft from ${ago}.</span>
      <button id="btt-restore-draft" style="background:#3b82f6;color:#fff">Restore</button>
      <button id="btt-discard-draft" style="background:#374151;color:#e5e7eb">Discard</button>
    `;

    ta.parentElement?.insertBefore(banner, ta);
    banner.classList.add('show');
    this._banner = banner;

    document.getElementById('btt-restore-draft').addEventListener('click', async () => {
      ta.value = draft.content;
      ta.dispatchEvent(new Event('input'));
      banner.classList.remove('show');
      setTimeout(() => banner.remove(), 300);
      Toast.success('Draft restored.');
    });

    document.getElementById('btt-discard-draft').addEventListener('click', async () => {
      await deleteDraft(this._draftKey);
      banner.classList.remove('show');
      setTimeout(() => banner.remove(), 300);
      Toast.info('Draft discarded.');
    });
  },

  _startAutoSave(intervalMs) {
    const save = async () => {
      const ta = getReplyTextarea();
      if (!ta || !ta.value.trim()) return;
      await saveDraft(this._draftKey, ta.value, `Thread ${getTopicId()}`);
    };

    this._interval = setInterval(save, intervalMs);

    // Also save on input (debounced)
    let debTimer;
    const ta = getReplyTextarea();
    if (ta) {
      ta.addEventListener('input', () => {
        clearTimeout(debTimer);
        debTimer = setTimeout(save, 2000);
      });
      // Save on before unload
      window.addEventListener('beforeunload', save);
    }
  },

  _timeAgo(ts) {
    if (!ts) return 'some time ago';
    const diff = Date.now() - ts;
    if (diff < 60000)  return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  },

  renderDashboardPanel(container, api) {
    let html = '<div class="btt-panel"><h4>Saved Drafts</h4>';
    getDrafts().then(drafts => {
      const keys = Object.keys(drafts);
      if (!keys.length) {
        container.querySelector('#btt-draft-list').textContent = 'No drafts saved.';
        return;
      }
      const list = container.querySelector('#btt-draft-list');
      list.innerHTML = '';
      keys.forEach(key => {
        const d    = drafts[key];
        const item = document.createElement('div');
        item.style.cssText = 'padding:8px;border:1px solid var(--border,#2d3340);border-radius:6px;margin-bottom:6px;';
        item.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center">
            <strong style="font-size:13px">${key}</strong>
            <span style="font-size:11px;color:var(--text-secondary,#aaa)">${new Date(d.savedAt).toLocaleString()}</span>
          </div>
          <p style="margin:4px 0;font-size:12px;color:var(--text-secondary,#aaa)">${(d.content||'').slice(0,80)}…</p>
          <button data-key="${key}" class="btt-draft-delete btt-btn btt-btn-sm" style="background:#7f1d1d">Delete</button>
        `;
        list.appendChild(item);
      });

      list.querySelectorAll('.btt-draft-delete').forEach(btn => {
        btn.addEventListener('click', async () => {
          await deleteDraft(btn.dataset.key);
          btn.closest('div[style]').remove();
          Toast.success('Draft deleted.');
        });
      });
    });

    container.innerHTML = `
      <div class="btt-panel">
        <p>Auto-saves your reply textarea every few seconds while you type on Bitcointalk thread pages. Restores automatically on reload.</p>
        <h4 style="margin-top:16px">Saved Drafts</h4>
        <div id="btt-draft-list" style="max-height:300px;overflow-y:auto">Loading…</div>
      </div>
    `;
    // Trigger the load
    getDrafts().then(drafts => {
      const list = container.querySelector('#btt-draft-list');
      const keys = Object.keys(drafts);
      if (!keys.length) { list.textContent = 'No drafts saved.'; return; }
      list.innerHTML = '';
      keys.forEach(key => {
        const d = drafts[key];
        const item = document.createElement('div');
        item.style.cssText = 'padding:8px;border:1px solid var(--border,#2d3340);border-radius:6px;margin-bottom:6px;font-size:13px;';
        item.innerHTML = `
          <div style="display:flex;justify-content:space-between">
            <strong>${key}</strong>
            <span style="color:var(--text-secondary,#aaa);font-size:11px">${new Date(d.savedAt).toLocaleString()}</span>
          </div>
          <p style="margin:4px 0;color:var(--text-secondary,#aaa);font-size:12px">${(d.content||'').slice(0,100)}…</p>
          <button data-k="${key}" class="del-draft btt-btn btt-btn-sm" style="background:#7f1d1d">🗑 Delete</button>
        `;
        list.appendChild(item);
      });
      list.querySelectorAll('.del-draft').forEach(btn => {
        btn.addEventListener('click', async () => {
          await deleteDraft(btn.dataset.k);
          btn.closest('div[style]').remove();
        });
      });
    });
  },
};
