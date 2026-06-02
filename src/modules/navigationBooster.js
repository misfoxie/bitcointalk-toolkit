// navigationBooster.js — Back-to-top, go-to-bottom, jump-to-reply arrows

export default {
  id:             'navigationBooster',
  name:           'Navigation Booster',
  description:    'Floating ↑ and ↓ arrows for quick page navigation, plus jump-to-reply.',
  category:       'Layout & Reading',
  defaultEnabled: true,

  _goTop:    null,
  _goBottom: null,
  _scrollHandler: null,
  _observer: null,

  init(api) {
    this._injectArrows();
    this._bindScroll();
  },

  destroy() {
    this._goTop?.remove();
    this._goBottom?.remove();
    if (this._scrollHandler) window.removeEventListener('scroll', this._scrollHandler, { passive: true });
    this._goTop = this._goBottom = this._scrollHandler = null;
  },

  _injectArrows() {
    // Remove any accidental duplicates
    document.getElementById('btt-go-top')?.remove();
    document.getElementById('btt-go-bottom')?.remove();

    this._goTop = this._makeArrow('btt-go-top', '↑', 'Back to top', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    this._goBottom = this._makeArrow('btt-go-bottom', '↓', 'Go to bottom', () => {
      // Try to jump to reply box first; fall back to page bottom
      const textarea = document.querySelector('#message, textarea[name="message"]');
      if (textarea) {
        textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
        textarea.focus();
      } else {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }
    });

    document.body.appendChild(this._goTop);
    document.body.appendChild(this._goBottom);
  },

  _makeArrow(id, symbol, title, onClick) {
    const btn = document.createElement('button');
    btn.id        = id;
    btn.className = 'btt-nav-arrow';
    btn.title     = title;
    btn.textContent = symbol;
    btn.setAttribute('aria-label', title);
    btn.addEventListener('click', onClick);
    return btn;
  },

  _bindScroll() {
    let ticking = false;

    this._scrollHandler = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollY    = window.scrollY;
        const maxScroll  = document.documentElement.scrollHeight - window.innerHeight;
        const atBottom   = maxScroll > 0 && scrollY >= maxScroll - 10;

        // go-top is always visible; go-bottom hides only when already at the bottom
        this._goBottom?.classList.toggle('hidden', atBottom);
        ticking = false;
      });
    };

    window.addEventListener('scroll', this._scrollHandler, { passive: true });
    this._scrollHandler(); // initial check
  },

  renderDashboardPanel(container) {
    container.innerHTML = `
      <div class="btt-panel">
        <p>Adds floating ↑ and ↓ navigation arrows to Bitcointalk pages.</p>
        <ul style="font-size:13px;color:var(--text-secondary,#aaa);padding-left:16px;line-height:1.7">
          <li><strong>↑</strong> — scrolls back to the top of the page</li>
          <li><strong>↓</strong> — jumps to reply box, or page bottom if no reply box</li>
          <li>Arrows appear after scrolling 300px down</li>
          <li>Arrows disappear when you are near the bottom (↓) or top (↑)</li>
        </ul>
        <p style="font-size:12px;color:var(--text-secondary,#aaa)">
          The arrows are positioned bottom-right, above the toolkit FAB button.
        </p>
      </div>
    `;
  },
};
