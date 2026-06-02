// mobileEnhancer.js — Better tap targets, sticky reply, bigger buttons on mobile

const STYLE_ID = 'btt-mobile-style';

const MOBILE_CSS = `
@media (max-width: 768px) {
  /* Bigger tap targets for buttons */
  input[type=submit], .button_submit, .button { min-height:44px!important; font-size:16px!important; padding:10px 16px!important; }
  /* Larger code blocks */
  code, pre { font-size:12px!important; }
  /* Better post spacing */
  td.poster_info { display:none!important; }
  td.td_headerandpost { width:100%!important; }
  /* Sticky reply box */
  #btt-sticky-reply-bar { display:flex!important; }
}
#btt-sticky-reply-bar {
  display:none;
  position:fixed;bottom:0;left:0;right:0;
  background:#1a1d23;border-top:1px solid #2d3340;
  padding:8px 12px;z-index:2147483638;
  align-items:center;justify-content:center;gap:10px;
}
#btt-sticky-reply-bar button {
  padding:8px 18px;border-radius:6px;border:none;cursor:pointer;
  font-size:14px;font-family:inherit;
}
`;

export default {
  id: 'mobileEnhancer', name: 'Mobile Enhancer',
  description: 'Improves Bitcointalk usability on mobile devices.',
  category: 'Layout & Reading', defaultEnabled: true,

  _style: null, _bar: null,

  init(api) {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
    if (!isMobile && !api.settings?.mobileEnhancer) return;
    this._applyStyles();
    this._addStickyBar();
  },

  destroy() {
    document.getElementById(STYLE_ID)?.remove();
    document.getElementById('btt-sticky-reply-bar')?.remove();
  },

  _applyStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = MOBILE_CSS;
    document.head.appendChild(style);
  },

  _addStickyBar() {
    if (document.getElementById('btt-sticky-reply-bar')) return;
    const bar = document.createElement('div');
    bar.id = 'btt-sticky-reply-bar';
    bar.innerHTML = `
      <button onclick="document.querySelector('#message,textarea[name=message]')?.scrollIntoView({behavior:'smooth',block:'center'})" style="background:#3b82f6;color:#fff">Reply</button>
      <button onclick="window.scrollTo({top:0,behavior:'smooth'})" style="background:#374151;color:#e5e7eb">Top ↑</button>
    `;
    document.body.appendChild(bar);
    this._bar = bar;
  },

  renderDashboardPanel(container) {
    container.innerHTML = `<div class="btt-panel"><p>Adds mobile-friendly improvements: sticky reply button, larger tap targets, better layout on small screens.</p></div>`;
  },
};
