// mentionHelper.js — Generate profile link BBCode for any username quickly.
// On-page: click on any username to get ready-to-copy BBCode.
// Dashboard: manual lookup tool.

let _api = null;

export default {
  id: 'mentionHelper',
  name: 'Mention Helper',
  description: 'Generate profile link BBCode for any username.',
  category: 'User/Profile Tools',
  defaultEnabled: false,

  init(api) {
    _api = api;
    _injectClickHandlers();
  },

  destroy() {
    document.querySelectorAll('.btt-mention-tooltip').forEach(el => el.remove());
    _api = null;
  },

  renderDashboardPanel(container) {
    _renderMentionUI(container);
  },
};

function _injectClickHandlers() {
  // On shift+click of any poster username link, show a small tooltip with BBCode
  document.querySelectorAll('td.poster_info b > a, td.poster_info > a').forEach(link => {
    link.addEventListener('click', e => {
      if (!e.shiftKey) return;
      e.preventDefault();
      const username    = link.textContent.trim();
      const profileHref = link.getAttribute('href') || '';
      const profileUrl  = profileHref.startsWith('http') ? profileHref
        : profileHref ? 'https://bitcointalk.org' + (profileHref.startsWith('/') ? '' : '/') + profileHref : '';
      _showMentionTooltip(link, username, profileUrl);
    });
  });
}

let _tooltip = null;

function _showMentionTooltip(anchor, username, profileUrl) {
  _tooltip?.remove();

  const bbcodeLink = profileUrl ? `[url=${profileUrl}]${username}[/url]` : username;
  const bbcodeMention = `@${username}`;

  _tooltip = document.createElement('div');
  Object.assign(_tooltip.style, {
    position: 'fixed', zIndex: '999993',
    background: '#1a1b2e', border: '1px solid #374151',
    borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,.6)',
    padding: '10px 12px', fontSize: '12px', color: '#e5e7eb', minWidth: '240px',
  });

  _tooltip.innerHTML = `
<div style="font-size:11px;color:#9ca3af;margin-bottom:6px">Mention BBCode for <strong style="color:#e5e7eb">${_esc(username)}</strong></div>
<div style="display:flex;flex-direction:column;gap:5px">
  <div style="display:flex;gap:6px;align-items:center">
    <code style="flex:1;background:#374151;padding:4px 7px;border-radius:4px;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${_esc(bbcodeLink)}</code>
    <button data-copy="${_esc(bbcodeLink)}" style="padding:3px 8px;border-radius:4px;border:1px solid #4b5563;background:none;color:#e5e7eb;cursor:pointer;font-size:10px;white-space:nowrap">Copy</button>
  </div>
  <div style="display:flex;gap:6px;align-items:center">
    <code style="flex:1;background:#374151;padding:4px 7px;border-radius:4px;font-size:11px">${_esc(bbcodeMention)}</code>
    <button data-copy="${_esc(bbcodeMention)}" style="padding:3px 8px;border-radius:4px;border:1px solid #4b5563;background:none;color:#e5e7eb;cursor:pointer;font-size:10px;white-space:nowrap">Copy</button>
  </div>
</div>`;

  document.body.appendChild(_tooltip);

  const rect = anchor.getBoundingClientRect();
  _tooltip.style.top  = Math.min(rect.bottom + 6, window.innerHeight - _tooltip.offsetHeight - 8) + 'px';
  _tooltip.style.left = Math.min(rect.left, window.innerWidth - _tooltip.offsetWidth - 8) + 'px';

  _tooltip.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(btn.dataset.copy).then(() => {
        btn.textContent = '✓'; setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
      });
    });
  });

  const dismiss = e => {
    if (!_tooltip.contains(e.target)) { _tooltip.remove(); _tooltip = null; document.removeEventListener('click', dismiss, true); }
  };
  setTimeout(() => document.addEventListener('click', dismiss, true), 50);
}

function _esc(s) {
  return s ? String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') : '';
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

  container.querySelector('#mh-generate').addEventListener('click', () => {
    const username = container.querySelector('#mh-username').value.trim();
    const uid      = container.querySelector('#mh-uid').value.trim();
    if (!username) return;

    const profileUrl = uid
      ? `https://bitcointalk.org/index.php?action=profile;u=${uid}`
      : `https://bitcointalk.org/index.php?action=profile;u=USERNAME_UID`;

    const variants = [
      { label: 'Profile link (with name)',  value: `[url=${profileUrl}]${username}[/url]` },
      { label: 'Bold mention',             value: `[b]${username}[/b]` },
      { label: '@mention (plain)',         value: `@${username}` },
      { label: 'Quote reference',          value: `[quote author=${username}]` },
    ];

    const resultsEl = container.querySelector('#mh-results');
    resultsEl.style.display = 'flex';
    resultsEl.innerHTML = variants.map(v => `
      <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--bg-secondary,#111827);border:1px solid var(--border,#374151);border-radius:6px">
        <span style="font-size:11px;color:var(--text-secondary,#9ca3af);flex:0 0 160px">${_esc(v.label)}</span>
        <code style="flex:1;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${_esc(v.value)}</code>
        <button data-val="${_esc(v.value)}" class="mh-copy-btn" style="padding:4px 10px;border-radius:4px;border:1px solid var(--border,#374151);background:none;color:var(--text,#e5e7eb);cursor:pointer;font-size:11px;white-space:nowrap">Copy</button>
      </div>`).join('');

    resultsEl.querySelectorAll('.mh-copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(btn.dataset.val).then(() => {
          btn.textContent = '✓'; setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
        });
      });
    });
  });

  // Generate on Enter
  container.querySelector('#mh-uid').addEventListener('keydown', e => {
    if (e.key === 'Enter') container.querySelector('#mh-generate').click();
  });
  container.querySelector('#mh-username').addEventListener('keydown', e => {
    if (e.key === 'Enter') container.querySelector('#mh-generate').click();
  });
}
