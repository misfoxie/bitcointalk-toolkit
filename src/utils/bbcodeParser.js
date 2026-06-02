// bbcodeParser.js — BBCode to HTML converter, Bitcointalk-accurate
// Security: HTML is escaped FIRST, then BBCode transforms are applied.
// Scripts and raw HTML are never executed.

import { escapeHtml, safeUrl, safeColor, safeFontSize, safeImageUrl } from './sanitizer.js';

// ── Code block placeholder system ─────────────────────────────────────────────
// Extract [code] blocks before processing so BBCode inside them is not parsed.
function extractCodeBlocks(text) {
  const blocks = [];
  const out = text.replace(/\[code(?:=[^\]]+)?\]([\s\S]*?)\[\/code\]/gi, (_, content) => {
    const id = `\x00CODE${blocks.length}\x00`;
    blocks.push(content);
    return id;
  });
  return { text: out, blocks };
}

function restoreCodeBlocks(text, blocks) {
  return text.replace(/\x00CODE(\d+)\x00/g, (_, i) => {
    const content = blocks[parseInt(i, 10)];
    return `<div class="btt-code-block"><pre><code>${content}</code></pre><button class="btt-code-copy" title="Copy code">Copy</button></div>`;
  });
}

// ── Nested quote handler ──────────────────────────────────────────────────────
function processQuotes(text) {
  let prev = '';
  let depth = 0;
  while (prev !== text && depth < 10) {
    prev = text;
    depth++;
    // [quote author=X link=Y date=Z]...[/quote]
    text = text.replace(
      /\[quote\s+author=([^\]\n]+?)(?:\s+link=[^\]\n]*?)?(?:\s+date=(\d+))?\]((?:(?!\[quote).)*?)\[\/quote\]/gis,
      (_, author, date, content) => {
        const safeAuthor = escapeHtml(author.trim().replace(/['"]/g, ''));
        const dateStr = date ? new Date(parseInt(date, 10) * 1000).toLocaleDateString() : '';
        return `<div class="btt-quote"><div class="btt-quote-header">Quote from: <strong>${safeAuthor}</strong>${dateStr ? ` — ${dateStr}` : ''}</div><div class="btt-quote-body">${content}</div></div>`;
      }
    );
    // [quote]...[/quote]
    text = text.replace(
      /\[quote\]((?:(?!\[quote).)*?)\[\/quote\]/gis,
      (_, content) => `<div class="btt-quote"><div class="btt-quote-body">${content}</div></div>`
    );
  }
  return text;
}

// ── List handler ──────────────────────────────────────────────────────────────
function processLists(text) {
  // Numbered list
  text = text.replace(/\[list=1\]([\s\S]*?)\[\/list\]/gi, (_, content) => {
    const items = content.replace(/\[li\]([\s\S]*?)\[\/li\]/gi, '<li>$1</li>');
    const starItems = items.split(/\[\*\]/i).filter(s => s.trim());
    if (starItems.length > 1) return `<ol>${starItems.map(i => `<li>${i.trim()}</li>`).join('')}</ol>`;
    return `<ol>${items}</ol>`;
  });
  // Unordered list with [li]
  text = text.replace(/\[list\]([\s\S]*?)\[\/list\]/gi, (_, content) => {
    const withLi = content.replace(/\[li\]([\s\S]*?)\[\/li\]/gi, '<li>$1</li>');
    // Also handle [*] style
    const parts = withLi.split(/\[\*\]/i).filter(s => s.trim());
    if (parts.length > 1) return `<ul>${parts.map(i => `<li>${i.trim()}</li>`).join('')}</ul>`;
    return `<ul>${withLi}</ul>`;
  });
  return text;
}

// ── Main parse function ───────────────────────────────────────────────────────
export function parse(rawText, options = {}) {
  if (!rawText) return '';

  // 1. Escape all HTML — security critical
  let html = escapeHtml(rawText);

  // 2. Protect code blocks
  const { text: noCode, blocks } = extractCodeBlocks(html);
  html = noCode;

  // 3. Basic inline formatting
  html = html.replace(/\[b\]([\s\S]*?)\[\/b\]/gi,   '<strong>$1</strong>');
  html = html.replace(/\[i\]([\s\S]*?)\[\/i\]/gi,   '<em>$1</em>');
  html = html.replace(/\[u\]([\s\S]*?)\[\/u\]/gi,   '<u>$1</u>');
  html = html.replace(/\[s\]([\s\S]*?)\[\/s\]/gi,   '<s>$1</s>');
  html = html.replace(/\[sup\]([\s\S]*?)\[\/sup\]/gi, '<sup>$1</sup>');
  html = html.replace(/\[sub\]([\s\S]*?)\[\/sub\]/gi, '<sub>$1</sub>');
  html = html.replace(/\[tt\]([\s\S]*?)\[\/tt\]/gi,   '<code class="btt-tt">$1</code>');
  html = html.replace(/\[pre\]([\s\S]*?)\[\/pre\]/gi, '<pre class="btt-pre">$1</pre>');

  // 4. Color, size, font
  html = html.replace(/\[color=([^\]]+)\]([\s\S]*?)\[\/color\]/gi,
    (_, color, content) => `<span style="color:${safeColor(color)}">${content}</span>`);
  html = html.replace(/\[size=([^\]]+)\]([\s\S]*?)\[\/size\]/gi,
    (_, size, content) => `<span style="font-size:${safeFontSize(size)}">${content}</span>`);
  html = html.replace(/\[font=([^\]]+)\]([\s\S]*?)\[\/font\]/gi,
    (_m, _font, content) => `<span>${content}</span>`); // font-family omitted for safety

  // 5. Glow, shadow (visual effects — safe span wrappers)
  html = html.replace(/\[glow=([^\]]+)\]([\s\S]*?)\[\/glow\]/gi,
    (_, params, content) => `<span class="btt-glow">${content}</span>`);
  html = html.replace(/\[shadow=([^\]]+)\]([\s\S]*?)\[\/shadow\]/gi,
    (_, params, content) => `<span class="btt-shadow">${content}</span>`);
  html = html.replace(/\[move\]([\s\S]*?)\[\/move\]/gi,
    (_, content) => `<span class="btt-move-label">[marquee preview]</span> ${content}`);

  // 6. Alignment
  html = html.replace(/\[center\]([\s\S]*?)\[\/center\]/gi, '<div class="btt-center">$1</div>');
  html = html.replace(/\[left\]([\s\S]*?)\[\/left\]/gi,     '<div class="btt-left">$1</div>');
  html = html.replace(/\[right\]([\s\S]*?)\[\/right\]/gi,   '<div class="btt-right">$1</div>');

  // 7. URLs
  html = html.replace(
    /\[url=([^\]]+)\]([\s\S]*?)\[\/url\]/gi,
    (_, url, text) => `<a href="${safeUrl(url)}" target="_blank" rel="noopener noreferrer">${text}</a>`
  );
  html = html.replace(
    /\[url\](https?:\/\/[^\[\]]+?)\[\/url\]/gi,
    (_, url) => `<a href="${safeUrl(url)}" target="_blank" rel="noopener noreferrer">${url}</a>`
  );

  // 8. Images
  html = html.replace(/\[img\]\s*(https?:\/\/[^\[\]\s]+?)\s*\[\/img\]/gi,
    (_, url) => `<img src="${safeUrl(url)}" alt="" loading="lazy" class="btt-img" class="btt-img-safe">`);
  html = html.replace(/\[img\s+width=(\d+)\]\s*(https?:\/\/[^\[\]\s]+?)\s*\[\/img\]/gi,
    (_, w, url) => `<img src="${safeUrl(url)}" alt="" loading="lazy" style="max-width:100%;width:${w}px" class="btt-img" class="btt-img-safe">`);

  // 9. Tables
  html = html.replace(/\[table(?:=[^\]]*)?\]([\s\S]*?)\[\/table\]/gi, '<table class="btt-table">$1</table>');
  html = html.replace(/\[tr\]([\s\S]*?)\[\/tr\]/gi, '<tr>$1</tr>');
  html = html.replace(/\[th\]([\s\S]*?)\[\/th\]/gi, '<th>$1</th>');
  html = html.replace(/\[td(?:=[^\]]*)?\]([\s\S]*?)\[\/td\]/gi, '<td>$1</td>');

  // 10. Lists
  html = processLists(html);

  // 11. Quotes (innermost first)
  html = processQuotes(html);

  // 12. HR
  html = html.replace(/\[hr\]/gi, '<hr class="btt-hr">');

  // 13. Auto-link plain URLs (if not already linked)
  if (options.autoLink !== false) {
    html = html.replace(
      /(?<!href=["'])(?<!src=["'])(https?:\/\/[^\s<>"']+)/g,
      url => `<a href="${safeUrl(url)}" target="_blank" rel="noopener noreferrer">${url}</a>`
    );
  }

  // 14. Restore code blocks
  html = restoreCodeBlocks(html, blocks);

  // 15. Newlines → <br>
  html = html.replace(/\n/g, '<br>');

  return html;
}

// ── Strip BBCode to plain text ─────────────────────────────────────────────────
export function toPlainText(bbcode) {
  return bbcode
    .replace(/\[\/?(b|i|u|s|center|left|right|sup|sub|tt|pre|glow|move|shadow|hr)[^\]]*\]/gi, '')
    .replace(/\[color=[^\]]+\]|\[\/color\]/gi, '')
    .replace(/\[size=[^\]]+\]|\[\/size\]/gi, '')
    .replace(/\[font=[^\]]+\]|\[\/font\]/gi, '')
    .replace(/\[url=[^\]]+\]([\s\S]*?)\[\/url\]/gi, '$1')
    .replace(/\[url\]([\s\S]*?)\[\/url\]/gi, '$1')
    .replace(/\[img[^\]]*\][^\[]*\[\/img\]/gi, '[image]')
    .replace(/\[quote(?:[^\]]+)?\]([\s\S]*?)\[\/quote\]/gi, '> $1')
    .replace(/\[code[^\]]*\]([\s\S]*?)\[\/code\]/gi, '$1')
    .replace(/\[table\]|\[\/table\]|\[tr\]|\[\/tr\]|\[td[^\]]*\]|\[\/td\]|\[th\]|\[\/th\]/gi, '')
    .replace(/\[li\]([\s\S]*?)\[\/li\]/gi, '• $1')
    .replace(/\[\*\]/g, '• ')
    .replace(/\[list[^\]]*\]|\[\/list\]/gi, '')
    .trim();
}

// ── CSS for BBCode preview output ─────────────────────────────────────────────
export const PREVIEW_CSS = `
.btt-preview { font-family: Verdana,Arial,sans-serif; font-size:13px; line-height:1.5; color:#000; background:#fff; padding:12px; }
.btt-quote { border-left:3px solid #a08040; background:#fffbe8; margin:6px 0; padding:6px 10px; border-radius:0 4px 4px 0; }
.btt-quote-header { font-size:11px; color:#888; margin-bottom:4px; }
.btt-code-block { position:relative; background:#1e1e1e; border-radius:4px; margin:6px 0; }
.btt-code-block pre { margin:0; padding:10px 40px 10px 12px; overflow-x:auto; }
.btt-code-block code { color:#ddd; font-family:Consolas,monospace; font-size:12px; white-space:pre; }
.btt-code-copy { position:absolute; top:6px; right:6px; padding:2px 8px; font-size:11px; background:#444; color:#fff; border:none; border-radius:3px; cursor:pointer; }
.btt-code-copy:hover { background:#666; }
.btt-table { border-collapse:collapse; margin:6px 0; }
.btt-table td,.btt-table th { border:1px solid #bbb; padding:4px 8px; }
.btt-table th { background:#eee; font-weight:700; }
.btt-center { text-align:center; }
.btt-left { text-align:left; }
.btt-right { text-align:right; }
.btt-hr { border:none; border-top:1px solid #ccc; margin:8px 0; }
.btt-img { max-width:100%; height:auto; }
.btt-img-safe { max-width:100%; height:auto; }
.btt-img-safe[data-error] { opacity:.3; }
.btt-glow { text-shadow:0 0 6px gold; }
.btt-shadow { text-shadow:2px 2px 3px #888; }
.btt-move-label { font-size:10px; background:#ff9; color:#333; padding:0 4px; border-radius:2px; }
.btt-tt { font-family:monospace; background:#f0f0f0; padding:1px 4px; border-radius:2px; }
.btt-pre { background:#f8f8f8; padding:8px; border-radius:4px; overflow-x:auto; font-family:monospace; }
`;
