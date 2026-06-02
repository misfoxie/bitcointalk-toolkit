// darkMode.js — Dark theme for Bitcointalk pages

const STYLE_ID = 'btt-dark-mode-style';

const DARK_CSS = `
html.btt-dark body,
html.btt-dark #bodyarea,
html.btt-dark .windowbg,
html.btt-dark .windowbg2,
html.btt-dark #top_section,
html.btt-dark #middle_section,
html.btt-dark #bot_section {
  background: #0f1117 !important;
  color: #e5e7eb !important;
}
html.btt-dark table, html.btt-dark td, html.btt-dark th {
  background: #1a1d23 !important;
  border-color: #2d3340 !important;
  color: #e5e7eb !important;
}
html.btt-dark .cat_bg, html.btt-dark .catbg, html.btt-dark .catbg2 {
  background: #1e2530 !important;
}
html.btt-dark .titlebg, html.btt-dark .titlebg2 {
  background: #1e2c40 !important;
}
html.btt-dark a { color: #60a5fa !important; }
html.btt-dark a:visited { color: #a78bfa !important; }
html.btt-dark input, html.btt-dark textarea, html.btt-dark select {
  background: #1e2025 !important;
  color: #e5e7eb !important;
  border-color: #2d3340 !important;
}
html.btt-dark .post { background: #1a1d23 !important; }
html.btt-dark .quoteheader { background: #252a35 !important; color: #9ca3af !important; }
html.btt-dark blockquote, html.btt-dark .quote {
  background: #1e2530 !important;
  border-color: #4b5563 !important;
  color: #d1d5db !important;
}
html.btt-dark code, html.btt-dark pre {
  background: #111827 !important;
  color: #86efac !important;
  border-color: #374151 !important;
}
html.btt-dark .subject { color: #93c5fd !important; }
html.btt-dark hr { border-color: #2d3340 !important; }
html.btt-dark .poster_info { background: #161a21 !important; border-color: #2d3340 !important; }
html.btt-dark #menu_main, html.btt-dark #menu_main td { background: #111520 !important; }
html.btt-dark .nav { color: #9ca3af !important; }
/* Images — never darken or filter; give transparent PNGs a white backing */
html.btt-dark img { background-color: #fff !important; filter: none !important; }
/* Compact mode */
html.btt-compact .post { padding: 4px !important; }
html.btt-compact .poster_info { min-width: 80px !important; }
`;

export default {
  id:             'darkMode',
  name:           'Dark Mode',
  description:    'Apply a dark theme to all Bitcointalk pages.',
  category:       'Layout & Reading',
  defaultEnabled: false,

  async init(api) {
    const settings = await api.settings;
    if (settings.darkMode) this._apply();
  },

  destroy() {
    this._remove();
  },

  setEnabled(on) {
    if (on) this._apply();
    else    this._remove();
  },

  _apply() {
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = DARK_CSS;
      document.head.appendChild(style);
    }
    document.documentElement.classList.add('btt-dark');
  },

  _remove() {
    document.getElementById(STYLE_ID)?.remove();
    document.documentElement.classList.remove('btt-dark');
  },

  renderDashboardPanel(container, api) {
    container.innerHTML = `
      <div class="btt-panel">
        <p>Applies a dark theme to all Bitcointalk pages. Toggle from the popup or the floating FAB menu.</p>
        <p style="font-size:12px;color:var(--text-secondary,#aaa)">
          The dark theme targets the main layout, posts, quotes, code blocks, navigation, and form inputs.
        </p>
      </div>
    `;
  },
};
