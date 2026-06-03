// selfPostFinder.js - Highlight your own posts and find them across a whole thread.

import { getSettings, updateSetting, storageGet, storageSet } from '../utils/storage.js';

const STYLE_ID = 'btt-self-post-style';
const NAV_ID = 'btt-self-nav';
const USERNAME_SETTING = 'myUsername';
const CACHE_PREFIX = 'btt_self_post_results_';
const REQUEST_DELAY_MS = 400;

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
  const post = row2?.querySelector('[id^="msg_"], [id^="msg"]')
    || row1?.querySelector('[id^="msg_"], [id^="msg"]')
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

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = String(value || '');
  return div.innerHTML;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function absoluteUrl(url) {
  try {
    return new URL(url, location.href).href;
  } catch {
    return url;
  }
}

function extractTopicFromUrl(url) {
  try {
    const parsed = new URL(url, location.href);
    const topic = parsed.searchParams.get('topic') || '';
    const match = topic.match(/^(\d+)(?:\.(\d+|msg\d+))?/i);
    if (!match) return null;
    return {
      threadId: match[1],
      start: /^\d+$/.test(match[2] || '') ? Number(match[2]) : null,
      rawTopic: topic,
    };
  } catch {
    return null;
  }
}

function getCurrentThreadInfo(doc = document) {
  const info = extractTopicFromUrl(location.href);
  if (!info) return null;
  const title = doc.querySelector('td.titlebg, .nav, title')?.textContent?.trim() || '';
  return { ...info, title, url: location.href };
}

function makeThreadPageUrl(threadId, start) {
  const url = new URL(location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('topic', `${threadId}.${start}`);
  return url.href;
}

function getThreadPageUrls(threadInfo, doc = document) {
  if (!threadInfo?.threadId) return [];

  const starts = new Set();
  doc.querySelectorAll(`a[href*="topic=${threadInfo.threadId}."]`).forEach((link) => {
    const linkInfo = extractTopicFromUrl(link.href);
    if (linkInfo?.threadId === threadInfo.threadId && Number.isFinite(linkInfo.start)) {
      starts.add(linkInfo.start);
    }
  });

  if (Number.isFinite(threadInfo.start)) starts.add(threadInfo.start);
  starts.add(0);

  // Bitcointalk thread URLs use topic=THREAD_ID.START_NUMBER where START_NUMBER is
  // the first post offset for the page. Pagination links are authoritative, so we
  // collect them first. Some long threads show a shortened page list, so if the
  // highest detected offset is beyond page 1, fill missing offsets using the
  // detected step size. Bitcointalk normally advances by 20 posts per page.
  const sortedStarts = [...starts].sort((a, b) => a - b);
  const positiveDiffs = sortedStarts
    .map((start, index) => index ? start - sortedStarts[index - 1] : 0)
    .filter(diff => diff > 0);
  const detectedStep = positiveDiffs.length ? Math.min(...positiveDiffs) : 20;
  const step = detectedStep > 20 ? 20 : detectedStep;
  const maxStart = sortedStarts[sortedStarts.length - 1] || 0;

  for (let start = 0; step > 0 && start <= maxStart; start += step) {
    starts.add(start);
  }

  return [...starts].sort((a, b) => a - b).map((start, index) => ({
    pageNumber: index + 1,
    start,
    url: makeThreadPageUrl(threadInfo.threadId, start),
  }));
}

async function fetchThreadPage(url) {
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

function findPostContainerFromMessage(messageEl) {
  return messageEl?.closest('td.td_headerandpost')
    || messageEl?.closest('td')
    || messageEl;
}

function getPostIdFromElement(element) {
  const direct = element?.id?.match(/^msg_?(\d+)$/i)?.[1];
  if (direct) return direct;
  const anchor = element?.querySelector?.('[id^="msg_"], [id^="msg"], a[name^="msg"]');
  const anchorId = (anchor?.id || anchor?.getAttribute('name') || '').match(/^msg_?(\d+)$/i)?.[1];
  if (anchorId) return anchorId;
  const link = element?.querySelector?.('a[href*="#msg"], a[href*="msg"]');
  return link?.href?.match(/msg_?(\d+)/i)?.[1] || '';
}

function getPostLink(container, postId) {
  const direct = container?.querySelector?.(`a[href*="#msg${postId}"], a[href*="msg${postId}"]`);
  if (direct?.href) return absoluteUrl(direct.href);
  if (postId) {
    const base = new URL(location.href);
    base.hash = `msg${postId}`;
    base.searchParams.set('topic', `${extractTopicFromUrl(location.href)?.threadId || ''}.msg${postId}`);
    return base.href;
  }
  return absoluteUrl(location.href);
}

function getPostNumber(container, postId) {
  const link = container?.querySelector?.('a[href*="#msg"], a[href*="msg"]');
  const text = link?.textContent?.trim();
  return text || (postId ? `#${postId}` : 'Post');
}

function getPostDate(container) {
  const text = container?.closest('tr')?.textContent || container?.parentElement?.textContent || '';
  const match = text.match(/on:\s*([^\n\r]+)/i);
  return match ? match[1].replace(/\s{2,}.*/, '').trim() : '';
}

function getPostPreview(container) {
  const quoteClonesRemoved = container?.cloneNode(true);
  quoteClonesRemoved?.querySelectorAll('.quote, blockquote, .edited').forEach(el => el.remove());
  const text = (quoteClonesRemoved?.textContent || '').replace(/\s+/g, ' ').trim();
  return text.length > 180 ? `${text.slice(0, 177)}...` : text;
}

function parsePostsFromPage(html, pageNumber) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const posts = [];

  doc.querySelectorAll('td.poster_info, .poster_info').forEach((posterCell) => {
    const authorLink = getAuthorLink(posterCell);
    const username = authorLink?.textContent?.trim() || '';
    const { post } = getPostTarget(posterCell);
    const container = findPostContainerFromMessage(post);
    if (!username || !container) return;

    const postId = getPostIdFromElement(container) || getPostIdFromElement(post);
    posts.push({
      id: postId || `${pageNumber}-${posts.length}`,
      username,
      pageNumber,
      postNumber: getPostNumber(container, postId),
      date: getPostDate(container),
      link: getPostLink(container, postId),
      preview: getPostPreview(container),
    });
  });

  return posts;
}

function findPostsByUsername(posts, username) {
  const target = normalizeUsername(username);
  if (!target) return [];

  const seen = new Set();
  return posts.filter((post) => {
    if (normalizeUsername(post.username) !== target) return false;
    const key = post.id || post.link;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getCacheKey(threadId, username) {
  return `${CACHE_PREFIX}${threadId}_${normalizeUsername(username).replace(/[^a-z0-9_-]/g, '_')}`;
}

async function getCachedSelfPostResults(threadId, username) {
  const key = getCacheKey(threadId, username);
  const result = await storageGet(key);
  return result[key] || null;
}

async function cacheSelfPostResults(threadId, username, results, warnings = []) {
  const key = getCacheKey(threadId, username);
  await storageSet({
    [key]: {
      threadId,
      username,
      results,
      warnings,
      savedAt: Date.now(),
    },
  });
}

function detectLoggedInUsername() {
  const saved = document.querySelector('#hellomember b')?.textContent?.trim()
    || document.querySelector('#hellomember a[href*="action=profile"]')?.textContent?.trim();
  if (saved) return saved;

  const profileLinks = [...document.querySelectorAll('a[href*="action=profile"][href*="u="]')]
    .filter(link => !link.closest('td.poster_info, .poster_info'));
  return profileLinks[0]?.textContent?.trim() || '';
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
  _wholeThreadResults: [],
  _wholeThreadWarnings: [],
  _isWholeThreadScanning: false,
  _cancelWholeThreadScan: false,

  async init() {
    const settings = await getSettings();
    this._username = settings[USERNAME_SETTING] || detectLoggedInUsername() || '';
    this._installStyle();
    this._scan();
    this._observer = new MutationObserver((mutations) => {
      if (mutations.every(mutation => this._isSelfPostFinderMutation(mutation))) return;
      this._scheduleScan();
    });
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
    this._cancelWholeThreadScan = true;
    this._isWholeThreadScanning = false;
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
      #${NAV_ID} {
        position: fixed;
        top: 80px;
        right: 20px;
        width: min(285px, calc(100vw - 24px));
        max-height: calc(100vh - 110px);
        overflow: auto;
        background: #1a1d23;
        border: 1px solid #2d3340;
        border-radius: 6px;
        padding: 7px 8px;
        z-index: 2147483638;
        font-size: 11px;
        color: #e5e7eb;
        box-shadow: 0 8px 24px rgba(0,0,0,.35);
        box-sizing: border-box;
      }
      #${NAV_ID} button,
      #${NAV_ID} a.btt-spf-button {
        background: #374151;
        color: #fff;
        border: none;
        border-radius: 4px;
        padding: 3px 6px;
        cursor: pointer;
        text-decoration: none;
        line-height: 1.2;
        font-size: 11px;
      }
      #${NAV_ID} button.btt-spf-primary {
        background: #2563eb;
      }
      #${NAV_ID} button.btt-spf-danger {
        background: #991b1b;
      }
      #${NAV_ID} input {
        width: 100%;
        margin-top: 2px;
        padding: 4px 6px;
        border: 1px solid #374151;
        border-radius: 4px;
        background: #111827;
        color: #e5e7eb;
        box-sizing: border-box;
        font-size: 11px;
      }
      #${NAV_ID} details {
        border-top: 1px solid #2d3340;
        padding-top: 5px;
        margin-top: 5px;
      }
      #${NAV_ID} summary {
        cursor: pointer;
        font-weight: 600;
      }
      .btt-spf-result {
        border-top: 1px solid #2d3340;
        padding: 6px 0;
      }
      .btt-spf-preview {
        color: #cbd5e1;
        line-height: 1.35;
        margin: 4px 0;
      }
      .btt-spf-muted {
        color: #9ca3af;
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

  _isSelfPostFinderMutation(mutation) {
    const isOwnNode = (node) => {
      const element = node?.nodeType === Node.ELEMENT_NODE ? node : node?.parentElement;
      return Boolean(element?.closest?.(`#${NAV_ID}, #${STYLE_ID}`));
    };

    const changedNodes = [...mutation.addedNodes, ...mutation.removedNodes];
    if (changedNodes.length) return changedNodes.every(isOwnNode);
    return isOwnNode(mutation.target);
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
    this._addNav();
  },

  _addNav() {
    if (document.getElementById(NAV_ID)) return;

    const nav = document.createElement('div');
    nav.id = NAV_ID;

    let idx = 0;
    const count = this._posts.length;
    nav.innerHTML = `
      <div style="display:flex;justify-content:space-between;gap:6px;align-items:center;margin-bottom:5px">
        <div style="font-weight:600">Self Posts</div>
        <div class="btt-spf-muted">${count} here</div>
      </div>
      <label style="display:block;margin-bottom:5px">
        Username
        <input type="text" data-role="username" placeholder="Username" value="${escapeHtml(this._username)}">
      </label>
      <div style="display:flex;gap:4px;align-items:center;flex-wrap:wrap">
        <button type="button" data-dir="prev">Up</button>
        <button type="button" data-dir="next">Down</button>
        <button type="button" class="btt-spf-primary" data-role="scan-thread">Find</button>
        <button type="button" data-role="refresh-thread">Rescan</button>
        <button type="button" class="btt-spf-danger" data-role="cancel" style="display:none">Stop</button>
      </div>
      <div data-role="progress" class="btt-spf-muted" style="margin-top:5px;line-height:1.3"></div>
      <div data-role="results"></div>
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
    nav.querySelector('[data-role="username"]').addEventListener('change', async (event) => {
      this._username = event.target.value.trim();
      await updateSetting(USERNAME_SETTING, this._username);
      this._scan();
    });
    nav.querySelector('[data-role="scan-thread"]').addEventListener('click', () => this._scanWholeThread(false));
    nav.querySelector('[data-role="refresh-thread"]').addEventListener('click', () => this._scanWholeThread(true));
    nav.querySelector('[data-role="cancel"]').addEventListener('click', () => {
      this._cancelWholeThreadScan = true;
      this._setProgress('Stopping after the current page...');
    });
  },

  async _scanWholeThread(forceRefresh = false) {
    const nav = document.getElementById(NAV_ID);
    const input = nav?.querySelector('[data-role="username"]');
    const username = input?.value?.trim() || this._username;
    const threadInfo = getCurrentThreadInfo();

    if (!threadInfo) {
      this._setProgress('Open a Bitcointalk thread before scanning.');
      return;
    }
    if (!username) {
      this._setProgress('Enter a username to find.');
      return;
    }

    this._username = username;
    await updateSetting(USERNAME_SETTING, username);

    if (!forceRefresh) {
      const cached = await getCachedSelfPostResults(threadInfo.threadId, username);
      if (cached?.results) {
        this._wholeThreadResults = cached.results;
        this._wholeThreadWarnings = cached.warnings || [];
        this._setProgress(`Loaded cached scan from ${new Date(cached.savedAt).toLocaleString()}.`);
        this._renderSelfPostResults(cached.results, username, cached.warnings || []);
        return;
      }
    }

    const pages = getThreadPageUrls(threadInfo);
    if (!pages.length) {
      this._setProgress('Could not detect thread pages.');
      return;
    }

    this._isWholeThreadScanning = true;
    this._cancelWholeThreadScan = false;
    this._toggleScanButtons(true);

    const allPosts = [];
    const warnings = [];
    const canUseCurrentDocument = Number.isFinite(threadInfo.start);

    for (let i = 0; i < pages.length; i += 1) {
      if (this._cancelWholeThreadScan) break;
      const page = pages[i];
      this._setProgress(`Scanning page ${i + 1} of ${pages.length}...`);

      try {
        const html = (canUseCurrentDocument && page.start === threadInfo.start) || (!canUseCurrentDocument && pages.length === 1)
          ? document.documentElement.outerHTML
          : await fetchThreadPage(page.url);
        allPosts.push(...parsePostsFromPage(html, page.pageNumber));
      } catch (error) {
        warnings.push(`Page ${page.pageNumber} could not be scanned (${error.message}).`);
      }

      if (i < pages.length - 1) await sleep(REQUEST_DELAY_MS);
    }

    const results = findPostsByUsername(allPosts, username);
    this._wholeThreadResults = results;
    this._wholeThreadWarnings = warnings;
    if (!this._cancelWholeThreadScan) {
      await cacheSelfPostResults(threadInfo.threadId, username, results, warnings);
    }

    this._toggleScanButtons(false);
    this._isWholeThreadScanning = false;
    this._setProgress(this._cancelWholeThreadScan ? 'Scan stopped. Showing partial results.' : 'Scan complete.');
    this._renderSelfPostResults(results, username, warnings);
  },

  _toggleScanButtons(scanning) {
    const nav = document.getElementById(NAV_ID);
    nav?.querySelectorAll('[data-role="scan-thread"], [data-role="refresh-thread"]').forEach((button) => {
      button.disabled = scanning;
      button.style.opacity = scanning ? '.65' : '1';
    });
    const cancel = nav?.querySelector('[data-role="cancel"]');
    if (cancel) cancel.style.display = scanning ? '' : 'none';
  },

  _setProgress(message) {
    const target = document.getElementById(NAV_ID)?.querySelector('[data-role="progress"]');
    if (target) target.textContent = message;
  },

  _renderSelfPostResults(results, username, warnings = []) {
    const target = document.getElementById(NAV_ID)?.querySelector('[data-role="results"]');
    if (!target) return;

    const safeUser = escapeHtml(username);
    const warningsHtml = warnings.length
      ? `<div style="color:#fbbf24;margin-top:7px">${warnings.map(escapeHtml).join('<br>')}</div>`
      : '';

    if (!results.length) {
      target.innerHTML = `
        <div style="margin-top:10px;font-weight:600">Found 0 posts by ${safeUser} in this thread</div>
        <div class="btt-spf-muted" style="margin-top:6px">No posts found by this user in this thread.</div>
        ${warningsHtml}
      `;
      return;
    }

    target.innerHTML = `
      <div style="margin-top:10px;font-weight:600">Found ${results.length} post${results.length === 1 ? '' : 's'} by ${safeUser} in this thread</div>
      ${warningsHtml}
      <details open>
        <summary>Posts</summary>
        ${results.map((post) => `
          <div class="btt-spf-result">
            <div><strong>Page ${post.pageNumber}</strong> <a href="${escapeHtml(post.link)}">${escapeHtml(post.postNumber)}</a></div>
            ${post.date ? `<div class="btt-spf-muted">${escapeHtml(post.date)}</div>` : ''}
            <div class="btt-spf-preview">${escapeHtml(post.preview || 'No preview available.')}</div>
            <a class="btt-spf-button" href="${escapeHtml(post.link)}">Open post</a>
          </div>
        `).join('')}
      </details>
    `;
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
