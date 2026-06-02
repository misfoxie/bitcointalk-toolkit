// selfPostFinder.js - Highlight your own posts on the current page.

import { getSettings, updateSetting } from '../utils/storage.js';

const STYLE_ID = 'btt-self-post-style';
const NAV_ID = 'btt-self-nav';
const USERNAME_SETTING = 'myUsername';

function normalizeUsername(username) {
  return String(username || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

function getAuthorLink(posterCell) {
  return posterCell?.querySelector('b > a[href*="action=profile"][href*="u="]')
    || posterCell?.querySelector('b a[href*="action=profile"][href*="u="]')
    || posterCell?.querySelector('a[href*="action=profile"][href*="u="]');
}

function getPostTarget(posterCell) {
  const row1 = posterCell?.closest('tr');
  const row2 = row1?.nextElementSibling;
  const post = row2?.querySelector('[id^="msg_"]')
    || row1?.querySelector('[id^="msg_"]')
    || row2?.querySelector('td.td_headerandpost')
    || row1?.querySelector('td.td_headerandpost');
  return { row1, row2, post };
}

function collectPostsForUsername(username) {
  const target = normalizeUsername(username);
  if (!target) return [];

  const posts = [];
  document.querySelectorAll('td.poster_info, .poster_info').forEach((posterCell) => {
    const authorLink = getAuthorLink(posterCell);
    const author = normalizeUsername(authorLink?.textContent);
    if (!author || author !== target) return;

    const { row1, row2, post } = getPostTarget(posterCell);
    if (!post || posts.includes(post)) return;

    post.classList.add('btt-own-post');
    row1?.classList.add('btt-own-post-row');
    row2?.classList.add('btt-own-post-row');
    posts.push(post);
  });

  return posts;
}

export default {
  id: 'selfPostFinder',
  name: 'Self-Post Finder',
  description: 'Highlights your posts on the current page and lets you jump between them.',
  category: 'Thread Tools',
  defaultEnabled: false,

  _username: '',
  _posts: [],
  _observer: null,
  _scanTimer: null,

  async init() {
    const settings = await getSettings();
    this._username = settings[USERNAME_SETTING] || '';
    this._installStyle();
    this._scan();
    this._observer = new MutationObserver(() => this._scheduleScan());
    this._observer.observe(document.body, { childList: true, subtree: true });
  },

  destroy() {
    this._observer?.disconnect();
    this._observer = null;

    if (this._scanTimer) {
      clearTimeout(this._scanTimer);
      this._scanTimer = null;
    }

    document.getElementById(STYLE_ID)?.remove();
    document.getElementById(NAV_ID)?.remove();
    document.querySelectorAll('.btt-own-post').forEach((el) => el.classList.remove('btt-own-post'));
    document.querySelectorAll('.btt-own-post-row').forEach((el) => el.classList.remove('btt-own-post-row'));
    this._posts = [];
  },

  _installStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .btt-own-post {
        outline: 2px solid #3b82f6 !important;
        outline-offset: 2px;
        background: rgba(59, 130, 246, .08) !important;
      }
      .btt-own-post-row > td {
        box-shadow: inset 3px 0 0 #3b82f6 !important;
      }
    `;
    document.head.appendChild(style);
  },

  _scheduleScan() {
    if (this._scanTimer) clearTimeout(this._scanTimer);
    this._scanTimer = setTimeout(() => {
      this._scanTimer = null;
      this._scan();
    }, 300);
  },

  _scan() {
    document.querySelectorAll('.btt-own-post').forEach((el) => el.classList.remove('btt-own-post'));
    document.querySelectorAll('.btt-own-post-row').forEach((el) => el.classList.remove('btt-own-post-row'));
    document.getElementById(NAV_ID)?.remove();

    if (!this._username) {
      this._showConfigNotice();
      return;
    }

    this._posts = collectPostsForUsername(this._username);
    this._addNav();
  },

  _showConfigNotice() {
    if (document.getElementById(NAV_ID)) return;

    const nav = document.createElement('div');
    nav.id = NAV_ID;
    nav.style.cssText = 'position:fixed;top:80px;right:20px;background:#1a1d23;border:1px solid #2d3340;border-radius:8px;padding:10px 12px;z-index:2147483638;font-size:12px;color:#e5e7eb;max-width:240px;box-shadow:0 8px 24px rgba(0,0,0,.35)';
    nav.innerHTML = `
      <div style="font-weight:600;margin-bottom:6px">Self-Post Finder</div>
      <div style="color:#cbd5e1;line-height:1.4">Set your Bitcointalk username from All Tools > Self-Post Finder > Settings.</div>
    `;
    document.body.appendChild(nav);
  },

  _addNav() {
    if (document.getElementById(NAV_ID)) return;

    const nav = document.createElement('div');
    nav.id = NAV_ID;
    nav.style.cssText = 'position:fixed;top:80px;right:20px;background:#1a1d23;border:1px solid #2d3340;border-radius:8px;padding:8px 12px;z-index:2147483638;font-size:12px;color:#e5e7eb;box-shadow:0 8px 24px rgba(0,0,0,.35)';

    let idx = 0;
    const count = this._posts.length;
    nav.innerHTML = `
      <div style="margin-bottom:6px;font-weight:600">${count} own post${count === 1 ? '' : 's'}</div>
      <div style="display:flex;gap:4px;align-items:center">
        <button type="button" data-dir="prev" style="background:#374151;color:#fff;border:none;border-radius:4px;padding:3px 8px;cursor:pointer">Up</button>
        <button type="button" data-dir="next" style="background:#374151;color:#fff;border:none;border-radius:4px;padding:3px 8px;cursor:pointer">Down</button>
      </div>
    `;

    nav.querySelector('[data-dir="prev"]').addEventListener('click', () => {
      if (!this._posts.length) return;
      idx = (idx - 1 + this._posts.length) % this._posts.length;
      this._posts[idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    nav.querySelector('[data-dir="next"]').addEventListener('click', () => {
      if (!this._posts.length) return;
      idx = (idx + 1) % this._posts.length;
      this._posts[idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    document.body.appendChild(nav);
  },

  renderDashboardPanel(container) {
    container.innerHTML = `
      <div class="btt-panel">
        <p>Enter your Bitcointalk username to highlight your own posts on topic pages.</p>
        <label style="font-size:13px">Your username:<br>
          <input type="text" id="btt-spf-user" placeholder="YourUsername"
            style="width:100%;max-width:280px;margin-top:4px;padding:6px 8px;border-radius:4px;border:1px solid var(--border,#2d3340);background:var(--bg-input,#1e2025);color:var(--text,#e5e7eb);font-size:13px;box-sizing:border-box">
        </label>
        <div style="display:flex;gap:8px;align-items:center;margin-top:8px;flex-wrap:wrap">
          <button id="btt-spf-save" class="btt-btn btt-btn-primary">Save</button>
          <span id="btt-spf-status" style="font-size:12px;color:var(--text-secondary,#9ca3af)"></span>
        </div>
        <p style="font-size:12px;color:var(--text-secondary,#9ca3af);margin-top:10px">
          After saving, enable Self-Post Finder and refresh or switch back to the Bitcointalk topic page.
        </p>
      </div>
    `;

    getSettings().then((settings) => {
      container.querySelector('#btt-spf-user').value = settings[USERNAME_SETTING] || '';
    });

    container.querySelector('#btt-spf-save').addEventListener('click', async () => {
      const value = container.querySelector('#btt-spf-user').value.trim();
      this._username = value;
      await updateSetting(USERNAME_SETTING, value);
      container.querySelector('#btt-spf-status').textContent = value ? 'Saved.' : 'Cleared.';
      this._scan?.();
    });
  },
};
