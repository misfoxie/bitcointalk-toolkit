// personalPostLibrary.js — Save and reuse BBCode snippets from a dashboard library.
// On-page: adds a quick-insert button near Bitcointalk's reply textarea.

import { getSnippets, saveSnippet, deleteSnippet } from '../utils/storage.js';

let _btn     = null;
let _popup   = null;
let _api     = null;

export default {
  id: 'personalPostLibrary',
  name: 'Personal Post Library',
  description: 'Save and reuse BBCode snippets quickly.',
  category: 'Posting & BBCode',
  defaultEnabled: false,

  init(api) {
    _api = api;
    // Inject a "📚 Snippets" button near the reply box when on a thread page
    _injectPageButton();
  },

  destroy() {
    _btn?.remove();   _btn   = null;
    _popup?.remove(); _popup = null;
    _api = null;
  },

  renderDashboardPanel(container) {
    _renderLibraryUI(container);
  },
};

// ── On-page quick-insert ──────────────────────────────────────────────────────

function _injectPageButton() {
  const ta = document.querySelector('#message') || document.querySelector('textarea[name="message"]');
  if (!ta) return;

  const wrap = ta.closest('td') || ta.parentElement;
  if (!wrap || document.getElementById('btt-snippets-btn')) return;

  _btn = document.createElement('button');
  _btn.id = 'btt-snippets-btn';
  _btn.textContent = '📚 Snippets';
  _btn.title = 'Insert a saved BBCode snippet';
  Object.assign(_btn.style, {
    marginTop: '6px', padding: '5px 10px', borderRadius: '4px',
    border: '1px solid #4b5563', background: '#1f2937', color: '#e5e7eb',
    cursor: 'pointer', fontSize: '12px', display: 'block',
  });

  _btn.addEventListener('click', e => { e.preventDefault(); _togglePopup(ta); });
  wrap.appendChild(_btn);
}

function _togglePopup(ta) {
  if (_popup) { _popup.remove(); _popup = null; return; }

  _popup = document.createElement('div');
  Object.assign(_popup.style, {
    position: 'absolute', zIndex: '999990',
    background: '#1a1b2e', border: '1px solid #374151', borderRadius: '8px',
    boxShadow: '0 8px 32px rgba(0,0,0,.6)',
    width: '320px', maxHeight: '360px',
    display: 'flex', flexDirection: 'column',
  });

  _popup.innerHTML = `
<div style="padding:10px 12px;border-bottom:1px solid #374151;display:flex;justify-content:space-between;align-items:center">
  <strong style="font-size:13px;color:#e5e7eb">📚 Snippets</strong>
  <button id="btt-snip-close" style="background:none;border:none;color:#9ca3af;font-size:18px;cursor:pointer;line-height:1">×</button>
</div>
<div style="padding:8px 10px;border-bottom:1px solid #374151">
  <input id="btt-snip-search" type="search" placeholder="Search snippets…" style="width:100%;padding:5px 8px;border-radius:4px;border:1px solid #374151;background:#374151;color:#e5e7eb;font-size:12px;box-sizing:border-box">
</div>
<div id="btt-snip-list" style="overflow-y:auto;flex:1;padding:4px 0"></div>`;

  document.body.appendChild(_popup);

  // Position below the button
  const rect = _btn.getBoundingClientRect();
  _popup.style.top  = (rect.bottom + window.scrollY + 4) + 'px';
  _popup.style.left = (rect.left  + window.scrollX)     + 'px';

  _popup.querySelector('#btt-snip-close').addEventListener('click', () => { _popup.remove(); _popup = null; });

  document.addEventListener('click', function handler(e) {
    if (_popup && !_popup.contains(e.target) && e.target !== _btn) {
      _popup.remove(); _popup = null;
      document.removeEventListener('click', handler);
    }
  }, { capture: true });

  const loadList = async (query = '') => {
    const snippets = await getSnippets();
    const filtered = query
      ? snippets.filter(s => s.name.toLowerCase().includes(query) || (s.content||'').toLowerCase().includes(query))
      : snippets;
    const listEl = _popup?.querySelector('#btt-snip-list');
    if (!listEl) return;

    if (!filtered.length) {
      listEl.innerHTML = `<p style="padding:12px;text-align:center;font-size:12px;color:#6b7280">${query ? 'No results.' : 'No snippets saved yet.\nCreate them in the Dashboard → Data → Snippets.'}</p>`;
      return;
    }

    listEl.innerHTML = '';
    filtered.forEach(s => {
      const item = document.createElement('div');
      item.style.cssText = 'padding:8px 12px;cursor:pointer;border-radius:4px;margin:2px 6px;transition:background .1s';
      item.innerHTML = `
        <div style="font-size:12px;font-weight:600;color:#e5e7eb">${_esc(s.name)}</div>
        <div style="font-size:11px;color:#6b7280;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${_esc((s.content||'').slice(0,60))}</div>`;
      item.addEventListener('mouseenter', () => item.style.background = 'rgba(59,130,246,.15)');
      item.addEventListener('mouseleave', () => item.style.background = '');
      item.addEventListener('click', () => {
        _insertIntoTextarea(ta, s.content || '');
        _popup.remove(); _popup = null;
      });
      listEl.appendChild(item);
    });
  };

  _popup.querySelector('#btt-snip-search').addEventListener('input', e => loadList(e.target.value.toLowerCase()));
  loadList();
}

function _insertIntoTextarea(ta, text) {
  const start = ta.selectionStart;
  const end   = ta.selectionEnd;
  ta.value    = ta.value.slice(0, start) + text + ta.value.slice(end);
  ta.selectionStart = ta.selectionEnd = start + text.length;
  ta.dispatchEvent(new Event('input'));
  ta.focus();
}

function _esc(s) {
  return s ? String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : '';
}

// ── Dashboard library UI ──────────────────────────────────────────────────────

function _renderLibraryUI(container) {
  container.innerHTML = `
<div style="display:flex;flex-direction:column;gap:14px;max-width:800px">
  <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
    <input id="ppl-search" type="search" placeholder="Search snippets…" style="flex:1;min-width:180px;padding:7px 10px;border-radius:6px;border:1px solid var(--border,#374151);background:var(--bg-secondary,#111827);color:var(--text,#e5e7eb);font-size:13px">
    <button id="ppl-add" style="padding:7px 14px;border-radius:6px;border:none;background:var(--accent,#3b82f6);color:#fff;cursor:pointer;font-size:13px;white-space:nowrap">+ New Snippet</button>
  </div>
  <div id="ppl-list" style="display:flex;flex-direction:column;gap:8px"></div>
</div>`;

  const loadList = async (query = '') => {
    const snippets = await getSnippets();
    const filtered = query
      ? snippets.filter(s => s.name.toLowerCase().includes(query) || (s.content||'').toLowerCase().includes(query))
      : snippets;
    _renderSnippetList(filtered, container.querySelector('#ppl-list'), loadList);
  };

  container.querySelector('#ppl-search').addEventListener('input', e => loadList(e.target.value.toLowerCase()));

  container.querySelector('#ppl-add').addEventListener('click', () => {
    _showSnippetEditor(null, () => loadList());
  });

  loadList();
}

function _renderSnippetList(snippets, listEl, reload) {
  listEl.innerHTML = '';
  if (!snippets.length) {
    listEl.innerHTML = `<p style="color:var(--text-secondary,#9ca3af);font-size:13px">No snippets yet. Click <strong>+ New Snippet</strong> to create one.</p>`;
    return;
  }
  snippets.forEach(s => {
    const card = document.createElement('div');
    card.style.cssText = 'border:1px solid var(--border,#374151);border-radius:8px;padding:12px 14px;display:flex;gap:12px;align-items:flex-start;';
    card.innerHTML = `
      <div style="flex:1;min-width:0">
        <div style="font-weight:600;font-size:13px;margin-bottom:4px">${_esc(s.name)}</div>
        <div style="font-size:11px;color:var(--text-secondary,#9ca3af);font-family:monospace;white-space:pre-wrap;overflow:hidden;max-height:60px;text-overflow:ellipsis">${_esc((s.content||'').slice(0,200))}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:5px;flex-shrink:0">
        <button class="ppl-copy" style="padding:4px 10px;border-radius:4px;border:1px solid var(--border,#374151);background:none;color:var(--text,#e5e7eb);cursor:pointer;font-size:11px">Copy</button>
        <button class="ppl-edit" style="padding:4px 10px;border-radius:4px;border:1px solid var(--border,#374151);background:none;color:var(--text,#e5e7eb);cursor:pointer;font-size:11px">Edit</button>
        <button class="ppl-del"  style="padding:4px 10px;border-radius:4px;border:1px solid #7f1d1d;background:none;color:#ef4444;cursor:pointer;font-size:11px">Delete</button>
      </div>`;

    card.querySelector('.ppl-copy').addEventListener('click', () => {
      navigator.clipboard.writeText(s.content || '').then(() => {
        const btn = card.querySelector('.ppl-copy');
        btn.textContent = '✓'; setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
      });
    });
    card.querySelector('.ppl-edit').addEventListener('click', () => _showSnippetEditor(s, reload));
    card.querySelector('.ppl-del').addEventListener('click', async () => {
      if (confirm(`Delete snippet "${s.name}"?`)) { await deleteSnippet(s.id); reload(); }
    });

    listEl.appendChild(card);
  });
}

function _showSnippetEditor(existing, onSave) {
  const modal = document.createElement('div');
  Object.assign(modal.style, {
    position: 'fixed', inset: '0', zIndex: '999995',
    background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
  });
  modal.innerHTML = `
<div style="background:var(--bg,#1a1b2e);border:1px solid var(--border,#374151);border-radius:10px;padding:20px;width:min(96vw,560px);display:flex;flex-direction:column;gap:12px">
  <h3 style="margin:0;font-size:14px">${existing ? 'Edit' : 'New'} Snippet</h3>
  <input id="se-name" class="form-input" value="${_esc(existing?.name||'')}" placeholder="Snippet name" style="padding:8px 10px;border-radius:6px;border:1px solid var(--border,#374151);background:var(--bg-secondary,#111827);color:var(--text,#e5e7eb);font-size:13px">
  <textarea id="se-content" rows="8" style="padding:8px 10px;border-radius:6px;border:1px solid var(--border,#374151);background:var(--bg-secondary,#111827);color:var(--text,#e5e7eb);font-size:12px;font-family:monospace;resize:vertical" placeholder="BBCode content…">${_esc(existing?.content||'')}</textarea>
  <div style="display:flex;gap:8px;justify-content:flex-end">
    <button id="se-cancel" style="padding:7px 16px;border-radius:5px;border:1px solid var(--border,#374151);background:none;color:var(--text,#e5e7eb);cursor:pointer">Cancel</button>
    <button id="se-save"   style="padding:7px 16px;border-radius:5px;border:none;background:var(--accent,#3b82f6);color:#fff;cursor:pointer;font-weight:600">Save</button>
  </div>
</div>`;

  document.body.appendChild(modal);

  modal.querySelector('#se-cancel').addEventListener('click', () => modal.remove());
  modal.querySelector('#se-save').addEventListener('click', async () => {
    const name    = modal.querySelector('#se-name').value.trim();
    const content = modal.querySelector('#se-content').value;
    if (!name) { alert('Please enter a name.'); return; }
    await saveSnippet({ id: existing?.id, name, content });
    modal.remove();
    onSave();
  });
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}
