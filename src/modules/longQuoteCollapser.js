// longQuoteCollapser.js - Collapse tall quote blocks with a clean toggle button.

const QUOTE_SELECTOR = [
  'blockquote',
  'div.quote',
  '.btt-quote .btt-quote-body',
  '.quoteheader + div',
].join(',');

function stopForumHandlers(e) {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
}

function isInjectedUi(el) {
  return !!el.closest('.btt-quote-expand-btn, #btt-launcher, #btt-toast-container');
}

export default {
  id:             'longQuoteCollapser',
  name:           'Long Quote Collapser',
  description:    'Collapses quote blocks taller than 200px. Click to expand.',
  category:       'Layout & Reading',
  defaultEnabled: true,

  COLLAPSE_HEIGHT: 100,

  _observer: null,
  _scanTimer: null,

  init(api) {
    this.COLLAPSE_HEIGHT = api.settings?.quoteCollapseHeight || 100;
    this._processAll();
    this._observer = new MutationObserver(mutations => {
      if (mutations.some(m => Array.from(m.addedNodes).some(node => node.nodeType === 1 && !isInjectedUi(node)))) {
        this._scheduleScan();
      }
    });
    this._observer.observe(document.body, { childList: true, subtree: true });
  },

  destroy() {
    this._observer?.disconnect();
    this._observer = null;
    clearTimeout(this._scanTimer);
    this._scanTimer = null;

    document.querySelectorAll('.btt-quote-collapsed').forEach(el => {
      el.classList.remove('btt-quote-collapsed');
    });
    document.querySelectorAll('[data-btt-quote-processed="1"]').forEach(el => {
      delete el.dataset.bttQuoteProcessed;
      delete el.dataset.bttQuoteExpanded;
      el.style.removeProperty('--btt-quote-collapse-height');
    });
    document.querySelectorAll('.btt-quote-expand-btn').forEach(btn => btn.remove());
  },

  _scheduleScan() {
    clearTimeout(this._scanTimer);
    this._scanTimer = setTimeout(() => this._processAll(), 350);
  },

  _processAll() {
    document.querySelectorAll(QUOTE_SELECTOR).forEach(el => {
      if (el.dataset.bttQuoteProcessed === '1') return;
      if (isInjectedUi(el)) return;
      el.dataset.bttQuoteProcessed = '1';

      requestAnimationFrame(() => {
        if (!el.isConnected) return;
        if (el.scrollHeight > this.COLLAPSE_HEIGHT) this._collapseQuote(el);
      });
    });
  },

  _collapseQuote(el) {
    if (el.nextElementSibling?.classList.contains('btt-quote-expand-btn')) return;
    el.dataset.bttQuoteExpanded = '0';
    el.style.setProperty('--btt-quote-collapse-height', `${this.COLLAPSE_HEIGHT}px`);
    el.classList.add('btt-quote-collapsed');

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btt-quote-expand-btn';
    btn.textContent = 'Show full quote';
    btn.setAttribute('aria-expanded', 'false');

    ['pointerdown', 'mousedown', 'mouseup'].forEach(type => {
      btn.addEventListener(type, stopForumHandlers, true);
    });

    btn.addEventListener('click', e => {
      stopForumHandlers(e);
      const expanded = el.dataset.bttQuoteExpanded === '1';
      el.dataset.bttQuoteExpanded = expanded ? '0' : '1';
      el.classList.toggle('btt-quote-collapsed', expanded);
      btn.textContent = expanded ? 'Show full quote' : 'Collapse quote';
      btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    }, true);

    el.insertAdjacentElement('afterend', btn);
  },

  renderDashboardPanel(container) {
    container.innerHTML = `
      <div class="btt-panel">
        <p>Automatically collapses quote blocks that exceed the height threshold. Click "Show full quote" to expand without triggering Bitcointalk's quote popup.</p>
        <label style="font-size:13px;display:flex;align-items:center;gap:8px;margin-top:10px;">
          Collapse height threshold:
          <input type="number" id="btt-collapse-h" value="${this.COLLAPSE_HEIGHT}" min="50" max="1000" step="50"
            style="width:80px;padding:4px 6px;border-radius:4px;border:1px solid var(--border,#2d3340);background:var(--bg-input,#1e2025);color:var(--text,#e5e7eb)">
          px
        </label>
        <button id="btt-save-collapse-h" class="btt-btn btt-btn-primary" style="margin-top:8px">Save</button>
      </div>
    `;

    container.querySelector('#btt-save-collapse-h').addEventListener('click', async () => {
      const val = parseInt(container.querySelector('#btt-collapse-h').value, 10);
      if (val > 0) {
        this.COLLAPSE_HEIGHT = val;
        const { updateSetting } = await import('../utils/storage.js');
        await updateSetting('quoteCollapseHeight', val);
      }
    });
  },
};
