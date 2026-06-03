// sharedUI.js — Shared UI helpers: toasts, modals, toggles, etc.

// ── Toast notifications ───────────────────────────────────────────────────────

let toastContainer = null;

function getToastContainer() {
  if (!toastContainer || !document.body.contains(toastContainer)) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'btt-toast-container';
    toastContainer.style.cssText = `
      position:fixed; bottom:20px; right:20px; z-index:2147483647;
      display:flex; flex-direction:column-reverse; gap:8px; pointer-events:none;
    `;
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

export function showToast(message, type = 'info', duration = 3000) {
  const container = getToastContainer();
  const toast = document.createElement('div');
  const colors = {
    success: 'var(--btt-success,#22c55e)',
    error: 'var(--btt-danger,#ef4444)',
    warning: 'var(--btt-warning,#f59e0b)',
    info: 'var(--btt-primary,#3b82f6)',
  };
  toast.style.cssText = `
    background:var(--btt-surface-2,#1e2025); color:var(--btt-text,#fff); padding:10px 16px; border-radius:6px;
    font-size:13px; max-width:340px; border-left:3px solid ${colors[type]||colors.info};
    box-shadow:0 4px 12px rgba(0,0,0,.4); pointer-events:all;
    animation:bttToastIn .2s ease; opacity:1; transition:opacity .3s;
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  `;
  toast.textContent = message;
  container.appendChild(toast);

  if (!document.getElementById('btt-toast-style')) {
    const s = document.createElement('style');
    s.id = 'btt-toast-style';
    s.textContent = `@keyframes bttToastIn{from{transform:translateX(20px);opacity:0}to{transform:translateX(0);opacity:1}}`;
    document.head.appendChild(s);
  }

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, duration);

  return toast;
}

export const Toast = {
  success: (msg, dur) => showToast(msg, 'success', dur),
  error:   (msg, dur) => showToast(msg, 'error',   dur || 5000),
  warning: (msg, dur) => showToast(msg, 'warning', dur),
  info:    (msg, dur) => showToast(msg, 'info',    dur),
};

// ── Modal dialog ──────────────────────────────────────────────────────────────

export function showModal({ title, content, actions = [], width = '480px' }) {
  const overlay = document.createElement('div');
  overlay.className = 'btt-modal-overlay';
  overlay.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:2147483646;
    display:flex;align-items:center;justify-content:center;padding:16px;
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  `;

  const modal = document.createElement('div');
  modal.style.cssText = `
    background:var(--btt-surface-2,#1e2025);color:var(--btt-text,#e5e7eb);border-radius:10px;max-width:${width};
    width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.5);
  `;

  const header = document.createElement('div');
  header.style.cssText = 'padding:16px 20px;border-bottom:1px solid var(--btt-border,#2d3340);display:flex;justify-content:space-between;align-items:center;';
  header.innerHTML = `<h3 style="margin:0;font-size:16px;font-weight:600">${title}</h3>`;
  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Close';
  closeBtn.style.cssText = 'background:none;border:none;color:var(--btt-muted-text,#aaa);font-size:12px;cursor:pointer;padding:0;';
  closeBtn.onclick = () => overlay.remove();
  header.appendChild(closeBtn);

  const body = document.createElement('div');
  body.style.cssText = 'padding:20px;';
  if (typeof content === 'string') body.innerHTML = content;
  else if (content instanceof HTMLElement) body.appendChild(content);

  const footer = document.createElement('div');
  footer.style.cssText = 'padding:12px 20px;border-top:1px solid var(--btt-border,#2d3340);display:flex;gap:8px;justify-content:flex-end;';

  actions.forEach(({ label, type = 'secondary', onClick }) => {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.style.cssText = `
      padding:8px 16px;border-radius:6px;border:none;cursor:pointer;font-size:13px;
      background:${type === 'primary' ? 'var(--btt-primary,#3b82f6)' : 'var(--btt-button-bg,#374151)'};
      color:var(--btt-button-text,#fff);font-weight:${type === 'primary' ? '600' : '400'};
    `;
    btn.addEventListener('click', () => {
      onClick && onClick();
      overlay.remove();
    });
    footer.appendChild(btn);
  });

  modal.appendChild(header);
  modal.appendChild(body);
  if (actions.length) modal.appendChild(footer);
  overlay.appendChild(modal);

  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
  return { overlay, modal, close: () => overlay.remove() };
}

// ── Confirm dialog ────────────────────────────────────────────────────────────

export function confirmDialog(message) {
  return new Promise(resolve => {
    showModal({
      title: 'Confirm',
      content: `<p style="margin:0">${message}</p>`,
      actions: [
        { label: 'Cancel',  type: 'secondary', onClick: () => resolve(false) },
        { label: 'Confirm', type: 'primary',   onClick: () => resolve(true) },
      ],
    });
  });
}

// ── Clipboard ─────────────────────────────────────────────────────────────────

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      el.remove();
      return true;
    } catch { return false; }
  }
}

// ── File download ─────────────────────────────────────────────────────────────

export function downloadFile(filename, content, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ── Toggle widget ─────────────────────────────────────────────────────────────

export function createToggle(label, checked, onChange) {
  const wrap = document.createElement('label');
  wrap.style.cssText = 'display:flex;align-items:center;gap:10px;cursor:pointer;user-select:none;';

  const input = document.createElement('input');
  input.type    = 'checkbox';
  input.checked = checked;
  input.style.display = 'none';

  const track = document.createElement('span');
  track.style.cssText = `
    width:36px;height:20px;border-radius:10px;display:inline-flex;align-items:center;
    padding:2px;transition:background .2s;flex-shrink:0;
    background:${checked ? 'var(--btt-primary,#3b82f6)' : 'var(--btt-button-bg,#374151)'};
  `;
  const knob = document.createElement('span');
  knob.style.cssText = `
    width:16px;height:16px;border-radius:50%;background:#fff;
    transition:transform .2s;transform:${checked ? 'translateX(16px)' : 'translateX(0)'};
  `;
  track.appendChild(knob);

  const text = document.createElement('span');
  text.style.cssText = 'font-size:13px;';
  text.textContent = label;

  input.addEventListener('change', () => {
    const val = input.checked;
    track.style.background = val ? 'var(--btt-primary,#3b82f6)' : 'var(--btt-button-bg,#374151)';
    knob.style.transform = val ? 'translateX(16px)' : 'translateX(0)';
    onChange && onChange(val);
  });

  wrap.addEventListener('click', () => {
    input.checked = !input.checked;
    input.dispatchEvent(new Event('change'));
  });

  wrap.appendChild(input);
  wrap.appendChild(track);
  wrap.appendChild(text);
  return wrap;
}

// ── Tool card ─────────────────────────────────────────────────────────────────

export function createToolCard(module, enabled, onToggle, onOpen) {
  const card = document.createElement('div');
  card.className = 'btt-tool-card';
  card.dataset.moduleId = module.id;
  card.innerHTML = `
    <div class="btc-card-header">
      <span class="btt-card-name">${module.name}</span>
      <span class="btt-card-category">${module.category || ''}</span>
    </div>
    <p class="btt-card-desc">${module.description || ''}</p>
    <div class="btt-card-footer"></div>
  `;

  const footer = card.querySelector('.btt-card-footer');
  const toggle = createToggle('', enabled, (val) => onToggle && onToggle(module.id, val));
  footer.appendChild(toggle);

  if (onOpen) {
    const openBtn = document.createElement('button');
    openBtn.className = 'btt-btn btt-btn-sm';
    openBtn.textContent = 'Open';
    openBtn.addEventListener('click', () => onOpen(module.id));
    footer.appendChild(openBtn);
  }

  return card;
}

// ── Inject shared styles ──────────────────────────────────────────────────────

export function injectStyles(id, css) {
  if (document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);
}
