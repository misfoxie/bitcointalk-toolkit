// postLinkCopier.js — Adds a 🔗 copy-link button to every post header.
// Clicking it copies the direct post URL (topic.msgXXXX#msgXXXX) to clipboard.

import { copyToClipboard, Toast } from '../utils/sharedUI.js';
import { getTopicId } from '../content/domHelpers.js';

const ATTR = 'data-btt-link-applied';

let _observer = null;

function _getPostUrl(postDiv) {
  const msgId = postDiv?.id?.replace('msg_', '');
  if (!msgId) return location.href;
  const topicId = getTopicId();
  if (!topicId) {
    // Fallback: find a #msg anchor in the post header
    const anchor = postDiv.closest('tr')?.querySelector('a[href*="#msg"]');
    return anchor ? anchor.href : location.href;
  }
  return `https://bitcointalk.org/index.php?topic=${topicId}.msg${msgId}#msg${msgId}`;
}

function _processPost(postDiv) {
  if (!postDiv || postDiv.getAttribute(ATTR)) return;
  postDiv.setAttribute(ATTR, '1');

  const row = postDiv.closest('tr');
  if (!row) return;

  // Find the header line that shows date/subject
  const header = row.querySelector('.subject, td.td_headerandpost > table .subject, b.subject')
               || row.querySelector('.smalltext')
               || row.querySelector('td.td_headerandpost > table > tbody > tr:first-child td');
  if (!header) return;

  const btn = document.createElement('button');
  btn.className = 'btt-postlink-btn';
  btn.textContent = '🔗';
  btn.title = 'Copy link to this post';
  btn.style.cssText = [
    'background:none', 'border:none', 'cursor:pointer',
    'font-size:12px', 'padding:0 4px', 'margin-left:6px',
    'color:#9ca3af', 'vertical-align:middle', 'opacity:.7',
    'transition:opacity .15s',
  ].join(';');
  btn.addEventListener('mouseenter', () => { btn.style.opacity = '1'; });
  btn.addEventListener('mouseleave', () => { btn.style.opacity = '.7'; });

  btn.addEventListener('click', async e => {
    e.stopPropagation();
    e.preventDefault();
    const url = _getPostUrl(postDiv);
    const ok  = await copyToClipboard(url);
    btn.textContent = ok ? '✓' : '✗';
    btn.style.color = ok ? '#22c55e' : '#ef4444';
    setTimeout(() => { btn.textContent = '🔗'; btn.style.color = '#9ca3af'; }, 1500);
    if (ok) Toast.success('Post link copied.');
  });

  header.appendChild(btn);
}

function _processAll() {
  document.querySelectorAll('[id^="msg_"]').forEach(_processPost);
}

export default {
  id:             'postLinkCopier',
  name:           'Post Link Copier',
  description:    'Adds a 🔗 button to every post header. Click to copy the direct post URL.',
  category:       'Thread Tools',
  defaultEnabled: true,

  init(api) {
    _processAll();
    _observer = new MutationObserver(_processAll);
    _observer.observe(document.body, { childList: true, subtree: true });
  },

  destroy() {
    _observer?.disconnect();
    _observer = null;
    document.querySelectorAll('.btt-postlink-btn').forEach(b => b.remove());
    document.querySelectorAll(`[${ATTR}]`).forEach(el => el.removeAttribute(ATTR));
  },

  renderDashboardPanel(container) {
    container.innerHTML = `
      <div class="btt-panel">
        <p style="font-size:13px;color:var(--text-secondary,#9ca3af)">
          Adds a small 🔗 icon to every post's subject line. Click it to copy the canonical post URL
          (<code>topic=X.msgY#msgY</code>) to your clipboard. Works on any thread page.
        </p>
      </div>
    `;
  },
};
