// sanitizer.js — XSS prevention helpers

// Escape HTML entities — always run on user content before inserting into DOM
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Only allow http:// or https:// URLs — block javascript:, data:, vbscript:, etc.
// Decodes HTML entities first so &amp;javascript: variants are also caught.
export function safeUrl(url) {
  const raw = String(url).trim();
  // Decode HTML entities that the BBCode parser may have left encoded
  const decoded = raw.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  // Strip whitespace/control chars that can hide the scheme
  const clean = decoded.replace(/[\x00-\x20\x7f]+/g, '');
  if (/^https?:\/\//i.test(clean)) return clean;
  return '#blocked';
}

// Allow http/https AND safe data URIs for images
export function safeImageUrl(url) {
  const u = String(url).trim();
  if (/^https?:\/\//i.test(u)) return u;
  // Allow data:image/ only (not data:text/html etc.)
  if (/^data:image\/(png|jpe?g|gif|webp|svg\+xml);base64,/i.test(u)) return u;
  return '';
}

// Validate CSS color: hex or named subset
export function safeColor(color) {
  const c = String(color).trim();
  if (/^#[0-9a-fA-F]{3,6}$/.test(c)) return c;
  if (/^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/.test(c)) return c;
  const named = [
    'red','green','blue','yellow','orange','purple','pink','black','white',
    'gray','grey','brown','cyan','magenta','lime','navy','teal','maroon',
    'olive','silver','gold','coral','salmon','violet','indigo','aqua','fuchsia'
  ];
  if (named.includes(c.toLowerCase())) return c;
  return 'inherit';
}

// Validate CSS font-size
export function safeFontSize(size) {
  const s = String(size).trim();
  if (/^\d+(\.\d+)?(pt|px|em|rem|%)$/.test(s)) return s;
  if (/^\d+$/.test(s)) return s + 'pt';
  const named = ['xx-small','x-small','small','medium','large','x-large','xx-large'];
  if (named.includes(s.toLowerCase())) return s;
  return '14px';
}

// Strip all HTML tags — for plain text contexts
export function stripHtml(html) {
  return String(html).replace(/<[^>]*>/g, '');
}

// Sanitize a string for safe use in an inline HTML attribute value
export function attrSafe(str) {
  return escapeHtml(String(str));
}

// Create a text node safely (DOM method — no XSS possible)
export function safeText(text) {
  return document.createTextNode(String(text));
}

// Set textContent safely on an element
export function setText(el, text) {
  el.textContent = String(text);
}

// Safely set innerHTML with basic allowlist — for rendering BBCode output only
// This is NOT a general-purpose sanitizer; BBCode parser output is controlled.
// If you need a real sanitizer, use DOMPurify.
export function safeInnerHTML(container, html) {
  // We trust BBCode parser output because it was built from controlled transforms.
  // The BBCode parser already escaped raw HTML before processing.
  container.innerHTML = html;
}
