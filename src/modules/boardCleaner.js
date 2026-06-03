// boardCleaner.js — Hide avatars, signatures, images, compact mode

const STYLE_ID = 'btt-board-cleaner-style';

function buildCss(settings) {
  const rules = [];
  if (settings.hideAvatars) {
    rules.push(`
      td.poster_info img.avatar,
      td.poster_info img[src*="avatar"],
      td.poster_info img[src*="avatars"],
      td.poster_info img[alt*="avatar" i],
      td.poster_info a[href*="action=profile"] > img,
      .poster_info img.avatar,
      .poster_info img[src*="avatar"],
      .poster_info img[src*="avatars"],
      .poster_info img[alt*="avatar" i],
      .poster_info a[href*="action=profile"] > img {
        display:none!important;
      }
    `);
  }
  if (settings.hideSignatures) {
    rules.push(`
      .signature,
      div.signature,
      td.signature,
      table.signature,
      [class~="signature"],
      td.td_headerandpost .signature,
      td.td_headerandpost div[id^="msg_"] + .signature {
        display:none!important;
      }
    `);
  }
  if (settings.hidePersonalText) {
    rules.push(`
      .custom_title,
      td.poster_info .smalltext:not(:first-child),
      .poster_info .smalltext:not(:first-child) {
        display:none!important;
      }
    `);
  }
  if (settings.collapseImages)   rules.push('td.td_headerandpost img { display:none!important; }');
  if (settings.compactMode) {
    rules.push(`
      .post { padding:4px!important; }
      td.td_headerandpost { padding:4px!important; }
      td.poster_info { padding:4px!important; min-width:80px!important; }
      #bodyarea { padding:4px!important; }
    `);
  }
  return rules.join('\n');
}

export default {
  id:             'boardCleaner',
  name:           'Board Cleaner',
  description:    'Hide avatars, signatures, images, and enable compact post spacing.',
  category:       'Layout & Reading',
  defaultEnabled: true,

  _style: null,

  async init(api) {
    await this._apply(api.settings);
  },

  destroy() {
    document.getElementById(STYLE_ID)?.remove();
  },

  async _apply(settings) {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement('style');
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = buildCss(settings);
  },

  renderDashboardPanel(container, api) {
    const settings = api?.settings || {};
    container.innerHTML = `
      <div class="btt-panel">
        <p>Toggle individual layout cleanup options below.</p>
        <div id="btt-bc-options" style="display:flex;flex-direction:column;gap:10px;margin-top:10px;"></div>
      </div>
    `;

    const opts = container.querySelector('#btt-bc-options');
    const { createToggle } = window.BTT_UI || {};
    if (!createToggle) return;

    const options = [
      { key: 'hideAvatars',      label: 'Hide Avatars'       },
      { key: 'hideSignatures',   label: 'Hide Signatures'    },
      { key: 'hidePersonalText', label: 'Hide Personal Text' },
      { key: 'collapseImages',   label: 'Hide Post Images'   },
      { key: 'compactMode',      label: 'Compact Mode'       },
    ];

    options.forEach(({ key, label }) => {
      const toggle = createToggle(label, !!settings[key], async (val) => {
        const { updateSetting } = await import('../utils/storage.js');
        const newSettings = await updateSetting(key, val);
        this._apply(newSettings);
      });
      opts.appendChild(toggle);
    });
  },
};
