// domHelpers.js — Bitcointalk DOM helpers
// Centralises all knowledge of Bitcointalk's HTML structure so modules
// don't need to repeat these selectors.

// ── Thread detection ──────────────────────────────────────────────────────────

export function isThreadPage() {
  return /[?&]topic=\d+/.test(location.href);
}

export function isBoardPage() {
  return /[?&]board=\d+/.test(location.href);
}

export function isProfilePage() {
  return /[?&]action=profile/.test(location.href);
}

export function isTrustPage() {
  return /[?&]action=trust/.test(location.href);
}

export function getTopicId() {
  const m = location.href.match(/topic=(\d+)/);
  return m ? m[1] : null;
}

export function getPageNumber() {
  const m = location.href.match(/topic=\d+\.(\d+)/);
  return m ? Math.floor(parseInt(m[1], 10) / 20) + 1 : 1;
}

// ── Posts ─────────────────────────────────────────────────────────────────────

// Returns all post containers on the current page.
// Bitcointalk SMF uses a 2-row structure per post:
//   Row 1: td.poster_info (rowspan=2) + td.td_headerandpost (subject/date header)
//   Row 2: td.td_headerandpost containing div#msg_XXXXX (actual post body)
export function getAllPosts() {
  return Array.from(document.querySelectorAll('td.poster_info')).map(posterCell => {
    const row1        = posterCell.closest('tr');
    const row2        = row1?.nextElementSibling;
    const contentCell = row2?.querySelector('td.td_headerandpost') || row2?.querySelector('td');
    const postDiv     = row2?.querySelector('[id^="msg_"]');
    return { posterCell, contentCell, postDiv, row: row1 };
  }).filter(p => p.postDiv);
}

// Get username from a poster_info cell
export function getUsernameFromPosterCell(posterCell) {
  return posterCell.querySelector('b > a')?.textContent?.trim()
    || posterCell.querySelector('a')?.textContent?.trim()
    || 'Unknown';
}

// Get profile link from a poster_info cell
export function getProfileLinkFromPosterCell(posterCell) {
  return posterCell.querySelector('b > a')?.href
    || posterCell.querySelector('a')?.href
    || '';
}

// Get rank from poster_info
export function getRankFromPosterCell(posterCell) {
  const texts = Array.from(posterCell.querySelectorAll('span')).map(s => s.textContent.trim());
  return texts[0] || '';
}

// Get activity from poster_info
export function getActivityFromPosterCell(posterCell) {
  const html = posterCell.innerHTML;
  const m    = html.match(/Activity:\s*<\/b>\s*(\d+)/i);
  return m ? m[1] : '';
}

// Get merit from poster_info
export function getMeritFromPosterCell(posterCell) {
  const html = posterCell.innerHTML;
  const m    = html.match(/Merit:\s*<\/b>\s*([\d,]+)/i);
  return m ? m[1].replace(/,/g, '') : '';
}

// Get post date from content cell
export function getPostDate(contentCell) {
  const html = contentCell?.innerHTML || '';
  const m    = html.match(/on:\s*<\/b>\s*([A-Za-z]+ \d{2}, \d{4}, \d{2}:\d{2}:\d{2} (?:AM|PM))/i)
              || html.match(/on:\s*<b>([^<]+)<\/b>/i);
  return m ? m[1].trim() : '';
}

// Get message ID from a post div (id="msg_12345")
export function getMsgId(postDiv) {
  return postDiv?.id?.replace('msg_', '') || '';
}

// Get full post URL
export function getPostUrl(msgId) {
  const topicId = getTopicId();
  if (!topicId || !msgId) return '';
  return `https://bitcointalk.org/index.php?topic=${topicId}.msg${msgId}#msg${msgId}`;
}

// Get plain text content from a post div
export function getPostText(postDiv) {
  if (!postDiv) return '';
  const clone = postDiv.cloneNode(true);
  // Remove quote headers and inner-quote divs for clean text
  clone.querySelectorAll('.quoteheader, .quote').forEach(q => q.remove());
  return clone.textContent?.trim() || '';
}

// ── Reply textarea ────────────────────────────────────────────────────────────

export function isUsableTextarea(textarea) {
  if (!textarea) return false;
  if (!(textarea instanceof HTMLTextAreaElement)) return false;

  const style = window.getComputedStyle(textarea);
  if (style.display === 'none') return false;
  if (style.visibility === 'hidden') return false;
  if (textarea.disabled || textarea.readOnly) return false;

  return true;
}

export function getReplyTextarea() {
  const selectors = [
    "textarea[name='message']",
    'textarea#message',
    '#message',
    "textarea[name='body']",
    'textarea.editor',
    'textarea.sceditor-textarea',
    '.sceditor-container textarea',
    "form[action*='action=post'] textarea",
    "form textarea[name='message']",
    '#quickReplyOptions textarea',
    '#quickreply textarea',
    '#quick_reply textarea',
    'textarea',
  ];

  for (const selector of selectors) {
    const textarea = document.querySelector(selector);
    if (isUsableTextarea(textarea)) return textarea;
  }

  return null;
}

export function insertIntoReplyTextarea(text, prepend = false) {
  const ta = getReplyTextarea();
  if (!ta) return false;
  if (prepend) {
    ta.value = text + ta.value;
  } else {
    const start  = ta.selectionStart;
    const end    = ta.selectionEnd;
    ta.value     = ta.value.slice(0, start) + text + ta.value.slice(end);
    const newPos = start + text.length;
    ta.selectionStart = ta.selectionEnd = newPos;
  }
  ta.dispatchEvent(new Event('input'));
  ta.focus();
  return true;
}

// ── Code blocks ───────────────────────────────────────────────────────────────

export function getAllCodeBlocks() {
  return Array.from(document.querySelectorAll('.post code, .post pre, td.td_headerandpost code, td.td_headerandpost pre'));
}

// ── Quotes ────────────────────────────────────────────────────────────────────

export function getAllQuoteBlocks() {
  return Array.from(document.querySelectorAll('.quoteheader, blockquote, .quote'));
}

// ── Navigation ────────────────────────────────────────────────────────────────

export function getNavLinks() {
  return {
    prev: document.querySelector('a[rel="prev"]') || null,
    next: document.querySelector('a[rel="next"]') || null,
  };
}
