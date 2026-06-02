// postMeritCounter.js - Sums the visible "Merited by ..." line for each post.

const STYLE_ID = 'btt-post-merit-counter-style';
const PROCESSED_ATTR = 'data-btt-post-merit-counter';

let _observer = null;
let _scanTimer = null;

function injectStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
.btt-post-merit-badge {
  display:inline-flex;
  align-items:center;
  margin-left:6px;
  padding:1px 7px;
  border:1px solid var(--btt-border,#b8a46a);
  border-radius:4px;
  background:var(--btt-surface,#fff8df);
  color:var(--btt-text,#4b3b16);
  font:11px/1.35 Verdana,Arial,sans-serif;
  white-space:nowrap;
  vertical-align:baseline;
}
`;
  document.head.appendChild(style);
}

function extractMsgId(value) {
  const text = String(value || '');
  return text.match(/(?:^|[.#])msg_?(\d+)/i)?.[1]
    || text.match(/[?;&]msg=(\d+)/i)?.[1]
    || text.match(/^msg_?(\d+)$/i)?.[1]
    || '';
}

function findMessageElement(scope) {
  if (!scope?.querySelectorAll) return null;
  return Array.from(scope.querySelectorAll('[id], a[name]')).find(el => (
    extractMsgId(el.id) || extractMsgId(el.getAttribute?.('name'))
  )) || null;
}

function findPostMainContentArea(post) {
  if (!post) return null;
  const main = post.querySelector?.('td.td_headerandpost, .td_headerandpost, div.post, [id^="msg"], [id^="msg_"]');
  if (main && !main.closest('td.poster_info, .poster_info')) return main.closest('td.td_headerandpost, .td_headerandpost') || main;

  if (post.matches?.('td.td_headerandpost, .td_headerandpost')) return post;
  const cells = Array.from(post.querySelectorAll?.('td, .windowbg, .windowbg2') || []);
  return cells.find(cell => !cell.matches('td.poster_info, .poster_info') && !cell.closest('td.poster_info, .poster_info') && /Merited by/i.test(cell.textContent || ''))
    || null;
}

function findPostScope(node) {
  let el = node;
  while (el && el !== document.body) {
    if (el.matches?.('table') && findMessageElement(el) && findPostMainContentArea(el)) return el;
    if (el.matches?.('tr') && findMessageElement(el) && findPostMainContentArea(el)) return el;
    el = el.parentElement;
  }
  return node?.closest?.('table') || node?.closest?.('tr') || node;
}

function getPostCandidates() {
  const seen = new Set();
  const posts = [];
  document.querySelectorAll('[id^="msg"], a[name^="msg"], td.td_headerandpost, .td_headerandpost, tr, table').forEach(el => {
    const scope = findPostScope(el);
    if (!scope || seen.has(scope)) return;
    const mainArea = findPostMainContentArea(scope);
    if (!mainArea || !/Merited by/i.test(mainArea.textContent || '')) return;
    seen.add(scope);
    posts.push(scope);
  });
  return posts;
}

function findPostMeritedByLine(post) {
  if (!post) return null;

  const mainArea = findPostMainContentArea(post);
  if (!mainArea) return null;

  const candidates = Array.from(mainArea.querySelectorAll('div, span, td, font, small, b, i'));
  if (/Merited by/i.test(mainArea.textContent || '')) candidates.unshift(mainArea);

  for (const el of candidates) {
    const text = (el.textContent || '').trim();
    if (!text) continue;
    if (!/\bMerited by\b/i.test(text)) continue;

    if (el.closest('.poster_info')) continue;
    if (el.closest('td.poster_info')) continue;
    if (/(?:^|\b)(Activity|Trust|Ignore)\s*:/i.test(text)) continue;
    if (/\bMerit\s*:\s*\d/i.test(text) && !/\bMerited by\b/i.test(text)) continue;

    return el;
  }

  return null;
}

function calculateMeritedByTotal(lineEl) {
  const text = (lineEl?.textContent || '').replace(/\s+/g, ' ').trim();
  const meritedPart = text.slice(Math.max(0, text.search(/\bMerited by\b/i)));
  const matches = Array.from(meritedPart.matchAll(/\((\d[\d,]*)\)/g));
  return matches.reduce((sum, match) => sum + (parseInt(match[1].replace(/,/g, ''), 10) || 0), 0);
}

function renderBadge(lineEl, total) {
  if (!lineEl || lineEl.querySelector?.('.btt-post-merit-badge')) return;
  const badge = document.createElement('span');
  badge.className = 'btt-post-merit-badge';
  badge.textContent = `Total Merit: ${total}`;
  badge.title = `Total merit received by this exact post: ${total}`;
  lineEl.insertAdjacentText('beforeend', ' ');
  lineEl.insertAdjacentElement('beforeend', badge);
}

function processPosts() {
  getPostCandidates().forEach(post => {
    if (post.getAttribute(PROCESSED_ATTR) === '1') return;
    const line = findPostMeritedByLine(post);
    if (!line) return;

    const total = calculateMeritedByTotal(line);
    if (total <= 0) return;

    post.setAttribute(PROCESSED_ATTR, '1');
    renderBadge(line, total);
  });
}

function scheduleScan() {
  clearTimeout(_scanTimer);
  _scanTimer = setTimeout(processPosts, 300);
}

export default {
  id: 'postMeritCounter',
  name: 'Post Merit Counter',
  description: 'Shows total merits received by each post/reply.',
  category: 'User/Profile Tools',
  defaultEnabled: false,

  init() {
    injectStyle();
    processPosts();
    _observer = new MutationObserver(mutations => {
      if (mutations.some(m => Array.from(m.addedNodes).some(node => node.nodeType === 1 && !node.classList?.contains('btt-post-merit-badge')))) {
        scheduleScan();
      }
    });
    _observer.observe(document.body, { childList: true, subtree: true });
  },

  destroy() {
    _observer?.disconnect();
    _observer = null;
    clearTimeout(_scanTimer);
    _scanTimer = null;
    document.getElementById(STYLE_ID)?.remove();
    document.querySelectorAll('.btt-post-merit-badge').forEach(badge => badge.remove());
    document.querySelectorAll(`[${PROCESSED_ATTR}="1"]`).forEach(post => post.removeAttribute(PROCESSED_ATTR));
  },

  renderDashboardPanel(container) {
    container.innerHTML = `
      <div class="btt-panel">
        <p>Shows <strong>Total Merit: N</strong> beside each post's own visible <strong>Merited by</strong> line.</p>
        <p style="font-size:12px;color:var(--text-secondary,#9ca3af)">It does not read profile/sidebar merit and does not call external services.</p>
      </div>
    `;
  },
};
