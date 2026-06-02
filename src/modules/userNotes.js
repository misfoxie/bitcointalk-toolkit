// userNotes.js — Private notes on Bitcointalk usernames, shown as badge icons

import { getUserNotes, setUserNote, deleteUserNote } from '../utils/storage.js';
import { showModal, Toast } from '../utils/sharedUI.js';
import { escapeHtml } from '../utils/sanitizer.js';

const TAGS = ['trusted','buyer','seller','campaign manager','avoid','helpful','scammer','friend'];
const PROFILE_LINK_RE = /(?:[?;&]action=profile\b|\/index\.php\?action=profile\b)/i;

function isProfileLink(link) {
  if (!link) return false;
  const href = link.getAttribute('href') || link.href || '';
  return PROFILE_LINK_RE.test(href) && /[?;&]u=\d+/i.test(href);
}

function findUsernameLink(posterInfo) {
  const preferred = posterInfo.querySelector('b > a[href*="action=profile"][href*="u="]');
  if (isProfileLink(preferred)) return preferred;

  return Array.from(posterInfo.querySelectorAll('a[href*="action=profile"][href*="u="]'))
    .find((link) => {
      if (!isProfileLink(link)) return false;
      const text = (link.textContent || '').trim();
      if (!text) return false;
      if (/^(ignore|trust|show posts|send pm)$/i.test(text)) return false;
      return true;
    }) || null;
}

export default {
  id:             'userNotes',
  name:           'User Notes',
  description:    'Add private notes to any username. A badge icon appears next to noted users.',
  category:       'User/Profile Tools',
  defaultEnabled: true,

  _notes:    {},
  _observer: null,

  async init(api) {
    this._notes = await getUserNotes();
    this._processAll();
    this._observer = new MutationObserver(() => this._processAll());
    this._observer.observe(document.body, { childList: true, subtree: true });
  },

  destroy() {
    this._observer?.disconnect();
    document.querySelectorAll('.btt-note-badge').forEach(b => b.remove());
    document.querySelectorAll('[data-btt-note-done]').forEach(el => delete el.dataset.bttNoteDone);
    this._observer = null;
  },

  _processAll() {
    document.querySelectorAll('td.poster_info, .poster_info').forEach(posterInfo => {
      if (posterInfo.dataset.bttNoteDone) return;
      if (posterInfo.querySelector('.btt-note-badge')) {
        posterInfo.dataset.bttNoteDone = '1';
        return;
      }

      const usernameLink = findUsernameLink(posterInfo);
      if (!usernameLink) return;

      posterInfo.dataset.bttNoteDone = '1';
      this._addBadge(usernameLink);
    });
  },

  _addBadge(usernameEl) {
    const username = usernameEl.textContent.trim().toLowerCase();
    if (!username) return;

    const badge = document.createElement('span');
    badge.className = 'btt-note-badge';
    const note = this._notes[username];
    badge.textContent = note ? '★' : '+';
    badge.title       = note ? `Note: ${note.text || ''} [${(note.tags||[]).join(', ')}]` : 'Add note';
    badge.style.background = note ? '#22c55e' : '#f7931a';

    badge.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._openNoteModal(username, note, badge);
    });

    usernameEl.parentElement.appendChild(badge);
  },

  _openNoteModal(username, existing, badge) {
    const content = document.createElement('div');
    content.innerHTML = `
      <p style="margin-top:0;color:var(--text-secondary,#aaa);font-size:13px">Username: <strong>${escapeHtml(username)}</strong></p>
      <label style="font-size:13px;display:block;margin-bottom:4px">Note:</label>
      <textarea id="btt-note-text" rows="3" style="width:100%;box-sizing:border-box;padding:6px;border-radius:4px;border:1px solid #2d3340;background:#1e2025;color:#e5e7eb;font-size:13px;resize:vertical">${escapeHtml(existing?.text || '')}</textarea>
      <div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:6px" id="btt-note-tags">
        ${TAGS.map(t => `<label style="font-size:12px;display:flex;align-items:center;gap:4px;cursor:pointer">
          <input type="checkbox" value="${t}" ${(existing?.tags||[]).includes(t) ? 'checked' : ''}> ${t}
        </label>`).join('')}
      </div>
    `;

    showModal({
      title: `Note for ${username}`,
      content,
      actions: [
        existing ? { label: '🗑 Delete', type: 'secondary', onClick: async () => {
          await deleteUserNote(username);
          delete this._notes[username];
          if (badge) { badge.textContent = '+'; badge.style.background = '#f7931a'; badge.title = 'Add note'; }
          Toast.success('Note deleted.');
        }} : null,
        { label: 'Cancel', type: 'secondary', onClick: () => {} },
        { label: 'Save',   type: 'primary',   onClick: async () => {
          const text = document.getElementById('btt-note-text')?.value.trim() || '';
          const tags = [...document.querySelectorAll('#btt-note-tags input:checked')].map(c => c.value);
          const note = { text, tags, updatedAt: Date.now() };
          await setUserNote(username, note);
          this._notes[username.toLowerCase()] = note;
          if (badge) { badge.textContent = '★'; badge.style.background = '#22c55e'; badge.title = `Note: ${text}`; }
          Toast.success('Note saved.');
        }},
      ].filter(Boolean),
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
        <div id="btt-notes-list" style="margin-top:10px;max-height:400px;overflow-y:auto">Loading…</div>
      </div>
    `;

    getUserNotes().then(notes => {
      const list = container.querySelector('#btt-notes-list');
      const entries = Object.entries(notes);
      if (!entries.length) { list.textContent = 'No notes yet.'; return; }
      list.innerHTML = '';
      entries.forEach(([username, note]) => {
        const div = document.createElement('div');
        div.style.cssText = 'padding:8px 10px;border:1px solid var(--border,#2d3340);border-radius:6px;margin-bottom:6px;';
        div.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center">
            <strong style="font-size:13px">${escapeHtml(username)}</strong>
            <span style="font-size:11px;color:var(--text-secondary,#aaa)">${new Date(note.updatedAt||0).toLocaleDateString()}</span>
          </div>
          <p style="margin:4px 0;font-size:12px">${escapeHtml(note.text||'')}</p>
          ${(note.tags||[]).map(t => `<span style="font-size:10px;background:#374151;padding:1px 6px;border-radius:9px;margin-right:3px">${t}</span>`).join('')}
          <div style="margin-top:6px">
            <button class="btt-btn btt-btn-sm del-note" data-u="${escapeHtml(username)}" style="background:#7f1d1d">Delete</button>
          </div>
        `;
        list.appendChild(div);
      });
      list.querySelectorAll('.del-note').forEach(btn => {
        btn.addEventListener('click', async () => {
          await deleteUserNote(btn.dataset.u);
          btn.closest('div[style]').remove();
        });
      });
    });

    container.querySelector('#btt-notes-export').addEventListener('click', async () => {
      const { downloadFile } = await import('../utils/sharedUI.js');
      const notes = await getUserNotes();
      downloadFile('btt-notes.json', JSON.stringify(notes, null, 2), 'application/json');
    });
  },
};
