// dashboard.js â€” Full-screen dashboard logic
// Handles navigation, tool cards, module enable/disable, BBCode studio,
// settings export/import, and rendering module dashboard panels.

import { getSettings, saveSettings, storageSet, updateSetting, setModuleEnabled,
  exportSettings, importSettings, getDrafts, getUserNotes, getSnippets,
  getBookmarks, getCampaignProjects, saveCampaignProject, deleteCampaignProject } from '../utils/storage.js';
import { DEFAULT_FORUM_CUSTOM_COLORS, TOOLKIT_THEME_STORAGE_KEY, FORUM_THEME_STORAGE_KEY } from '../utils/constants.js';
import { parse as parseBBCode, PREVIEW_CSS } from '../utils/bbcodeParser.js';
import { showToast, showModal, confirmDialog, copyToClipboard, downloadFile } from '../utils/sharedUI.js';
import { FORUM_COLOR_GROUPS, applyBitcointalkForumTheme, applyThemeFromSettings, forumThemeSelectOptionsHtml, normalizeForumCustomColors, themeSelectOptionsHtml, validateForumCustomColors } from '../utils/theme.js';
import { escapeHtml } from '../utils/sanitizer.js';
// Scraper module â€” loaded dynamically so a load failure doesn't break the dashboard.
let _scraperMod = null;
import('../modules/scraper.js')
  .then(m => { _scraperMod = m; })
  .catch(e => console.warn('[BTT Dashboard] scraper unavailable:', e));

// Inline duplicate-checker (replaces removed campaignHelper.findDuplicates)
function findDuplicates(applicants) {
  const usernames = {}, addresses = {};
  applicants.forEach(a => {
    if (a.username) {
      const k = a.username.toLowerCase();
      usernames[k] = usernames[k] ? usernames[k] + 1 : 1;
    }
    if (a.address) {
      addresses[a.address] = addresses[a.address] ? addresses[a.address] + 1 : 1;
    }
  });
  // Only keep entries that appear more than once
  Object.keys(usernames).forEach(k => { if (usernames[k] < 2) delete usernames[k]; });
  Object.keys(addresses).forEach(k => { if (addresses[k] < 2) delete addresses[k]; });
  return { usernames, addresses };
}

// â”€â”€ Module definitions (for dashboard display â€” no DOM manipulation here) â”€â”€â”€â”€
// We import module metadata only; actual init() runs in content scripts.
const MODULE_DEFS = [
  { id:'darkMode',           name:'Dark Mode',              category:'Layout & Reading',   description:'Dark theme for Bitcointalk pages.',           kind:'content', defaultEnabled:false },
  { id:'codeCopyFixer',      name:'Code Copy Fixer',        category:'Layout & Reading',   description:'Adds copy buttons to all code blocks.',       kind:'content', defaultEnabled:true  },
  { id:'navigationBooster',  name:'Navigation Booster',     category:'Layout & Reading',   description:'Floating arrows and jump-to-reply.',          kind:'content', defaultEnabled:true  },
  { id:'quoteAssistant',     name:'Quote Assistant',        category:'Layout & Reading',   description:'Select text and insert as BBCode quote.',     kind:'content', defaultEnabled:true  },
  { id:'localDraftSaver',    name:'Local Draft Saver',      category:'Layout & Reading',   description:'Auto-saves your reply textarea per thread.',  kind:'content', defaultEnabled:true  },
  { id:'boardCleaner',       name:'Board Cleaner',          category:'Layout & Reading',   description:'Hide avatars, signatures, compact mode.',     kind:'content', defaultEnabled:true  },
  { id:'longQuoteCollapser', name:'Long Quote Collapser',   category:'Layout & Reading',   description:'Collapses tall quote blocks.',                kind:'content', defaultEnabled:true  },
  { id:'imageCollapser',     name:'Image Collapser',        category:'Layout & Reading',   description:'Collapses large images until clicked.',       kind:'content', defaultEnabled:true  },
  { id:'mobileEnhancer',     name:'Mobile Enhancer',        category:'Layout & Reading',   description:'Better mobile experience on Bitcointalk.',    kind:'content', defaultEnabled:false },
  { id:'keywordAlert',       name:'Keyword Alert',          category:'Layout & Reading',   description:'Highlights watched keywords in posts.',       kind:'content', modulePath:'../modules/keywordAlert.js', defaultEnabled:true  },
  { id:'clipboardSafety',    name:'Clipboard Safety',       category:'Security Tools',     description:'Warns on clipboard address mismatch.',        kind:'content', defaultEnabled:true  },
  { id:'addressHighlighter', name:'Address Highlighter',    category:'Security Tools',     description:'Highlights crypto addresses in posts.',       kind:'content', defaultEnabled:true  },
  { id:'antiPhishingLinkChecker', name:'Anti-Phishing',     category:'Security Tools',     description:'Highlights suspicious external links.',       kind:'content', defaultEnabled:true  },
  { id:'externalLinkPreview',name:'External Link Preview',  category:'Security Tools',     description:'Domain tooltip on hover for external links.', kind:'content', defaultEnabled:true  },
  { id:'txidHelper',         name:'TXID Helper',            category:'Security Tools',     description:'Highlights TXIDs, click to copy.',           kind:'content', defaultEnabled:false },
  { id:'userNotes',          name:'User Notes',             category:'User/Profile Tools', description:'Private notes on any username.',              kind:'content', defaultEnabled:true  },
  { id:'trustPositionBadge', name:'Trust Position Badge',   category:'User/Profile Tools', description:'Shows DT badges beside post authors from the GitHub DT data feed.', kind:'content', modulePath:'../modules/trustPositionBadge.js', defaultEnabled:true },
  { id:'postMeritCounter',   name:'Post Merit Counter',     category:'User/Profile Tools', description:'Shows total merits received by each post/reply.', kind:'content', defaultEnabled:false },
  { id:'rankProgressTracker',name:'Rank Progress Tracker',  category:'User/Profile Tools', description:'Track your rank and merit progress.',         kind:'dashboardModule', modulePath:'../modules/rankProgressTracker.js', defaultEnabled:false },
  { id:'selfPostFinder',     name:'Self-Post Finder',       category:'Thread Tools',       description:'Highlight your own posts on current page.',   kind:'content', modulePath:'../modules/selfPostFinder.js', defaultEnabled:false },
  { id:'scraper',            name:'Thread Scraper',         category:'Thread Tools',       description:'Scrape posts, addresses, links, and campaign data from threads.', kind:'dashboard', section:'thread', tab:'scraper', defaultEnabled:false },
  { id:'bbcodeStudio',       name:'BBCode Studio',          category:'Posting & BBCode',   description:'Full BBCode editor with live preview.',       kind:'dashboard', section:'studio', defaultEnabled:false },
  { id:'tableMaker',         name:'Table Maker',            category:'Posting & BBCode',   description:'Visual Bitcointalk table generator.',         kind:'dashboardModule', modulePath:'../modules/tableMaker.js', defaultEnabled:false },
  { id:'personalPostLibrary',name:'Personal Post Library',  category:'Posting & BBCode',   description:'Save and reuse post snippets.',              kind:'content', defaultEnabled:false },
  { id:'scamReportBuilder',  name:'Scam Report Builder',    category:'Marketplace Tools',  description:'Generate BBCode scam reports.',              kind:'dashboardModule', modulePath:'../modules/scamReportBuilder.js', defaultEnabled:false },
  { id:'mentionHelper',      name:'Mention Helper',         category:'User/Profile Tools', description:'Generate profile link BBCode quickly.',      kind:'content', defaultEnabled:false },
  { id:'postLinkCopier',     name:'Post Link Copier',       category:'Thread Tools',       description:'Adds a link button to copy direct post URL.', kind:'content', defaultEnabled:true  },
];

let settings = {};

// â”€â”€ Navigation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function navigate(sectionId) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item, .mobile-nav-btn').forEach(n => n.classList.remove('active'));
  document.getElementById('main-content')?.classList.toggle('studio-active', sectionId === 'studio');

  const section = document.getElementById(`section-${sectionId}`);
  if (section) {
    section.classList.add('active');
    section.style.display = '';
  }

  document.querySelectorAll(`[data-section="${sectionId}"]`).forEach(n => n.classList.add('active'));

  // Lazy-render sections
  lazyRender(sectionId);
}

const rendered = new Set();

function lazyRender(sectionId) {
  if (rendered.has(sectionId)) return;
  rendered.add(sectionId);
  switch (sectionId) {
    case 'home':     renderHome();     break;
    case 'tools':    renderTools();    break;
    case 'studio':   renderStudio();   break;
    case 'security': renderModuleSection('security', 'Security Tools'); break;
    case 'layout':   renderModuleSection('layout',   'Layout & Reading'); break;
    case 'data':     renderDataSection(); break;
    case 'legacy':   renderLegacy();   break;
    case 'settings': renderSettings(); break;
    case 'thread':   renderThread();   break;
    case 'campaign': renderCampaign(); break;
  }
}

// â”€â”€ Home â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function renderHome() {
  const drafts   = await getDrafts();
  const notes    = await getUserNotes();
  const snippets = await getSnippets();

  document.getElementById('stat-enabled').textContent  = (settings.enabledModules || []).length;
  document.getElementById('stat-drafts').textContent   = Object.keys(drafts).length;
  document.getElementById('stat-notes').textContent    = Object.keys(notes).length;
  document.getElementById('stat-snippets').textContent = snippets.length;

  document.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.nav));
  });

  document.getElementById('btn-export-settings-quick').addEventListener('click', async () => {
    const json = await exportSettings();
    downloadFile('btt-settings.json', json, 'application/json');
    showToast('Settings exported.', 'success');
  });
}

// â”€â”€ All Tools â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function renderTools() {
  const grid = document.getElementById('tools-grid');
  const catSelect = document.getElementById('filter-category');

  // Populate category filter
  const cats = [...new Set(MODULE_DEFS.map(m => m.category))].sort();
  cats.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat; opt.textContent = cat;
    catSelect.appendChild(opt);
  });

  const render = (filterCat = '', filterText = '') => {
    grid.innerHTML = '';
    MODULE_DEFS
      .filter(m => (!filterCat || m.category === filterCat) && (!filterText || m.name.toLowerCase().includes(filterText) || m.description.toLowerCase().includes(filterText)))
      .forEach(mod => {
        const enabled = isToolEnabled(mod);
        const card = createToolCard(mod, enabled);
        grid.appendChild(card);
      });
  };

  render();

  catSelect.addEventListener('change', () => render(catSelect.value, document.getElementById('global-search').value.toLowerCase()));
}

function createToolCard(mod, enabled) {
  const card = document.createElement('div');
  const comingSoon = mod.kind === 'comingSoon';
  const toggleable = mod.kind === 'content';
  card.className = `btt-tool-card${enabled || !toggleable ? '' : ' disabled'}${comingSoon ? ' disabled' : ''}`;
  card.dataset.moduleId = mod.id;
  card.innerHTML = `
    <div class="btc-card-header">
      <span class="btt-card-name">${mod.name}</span>
      <span class="btt-card-category">${comingSoon ? 'Coming soon' : mod.category}</span>
    </div>
    <p class="btt-card-desc">${mod.description}</p>
    <div class="btt-card-footer"></div>
  `;

  const footer = card.querySelector('.btt-card-footer');
  if (toggleable) {
    footer.innerHTML = `
      <label class="switch">
        <input type="checkbox" ${enabled ? 'checked' : ''}>
        <span class="slider"></span>
      </label>
    `;
    footer.querySelector('input').addEventListener('change', async (e) => {
    const val = e.target.checked;
    if (mod.id === 'darkMode') {
      await applyForumThemeChoice(val ? 'dark' : 'original', true);
      enabled = isToolEnabled(mod);
      e.target.checked = enabled;
      card.classList.toggle('disabled', !enabled);
      return;
    }
    settings = await updateSetting('enabledModules', val
      ? [...(settings.enabledModules || []), mod.id]
      : (settings.enabledModules || []).filter(id => id !== mod.id)
    );
    card.classList.toggle('disabled', !val);
    showToast(`${mod.name} ${val ? 'enabled' : 'disabled'}.`, 'success');
    // Notify active Bitcointalk tab so modules activate/deactivate without a page refresh
    chrome.runtime.sendMessage({ action: 'relayToTab', data: { action: 'settingsChanged' } });
    });
    if (mod.modulePath) {
      const btn = document.createElement('button');
      btn.className = 'btt-btn btt-btn-sm btt-btn-secondary';
      btn.textContent = 'Settings';
      btn.addEventListener('click', () => openModulePanel(mod));
      footer.appendChild(btn);
    }
  } else if (comingSoon) {
    footer.innerHTML = '<button class="btt-btn btt-btn-sm btt-btn-secondary" disabled title="This tool is not implemented yet.">Coming soon</button>';
  } else {
    const btn = document.createElement('button');
    btn.className = 'btt-btn btt-btn-sm btt-btn-secondary';
    btn.textContent = 'Open';
    btn.addEventListener('click', () => openDashboardTool(mod));
    footer.appendChild(btn);
  }

  return card;
}

function isToolEnabled(mod) {
  if (mod.id === 'darkMode') return settings.forumTheme === 'dark';
  return (settings.enabledModules || []).includes(mod.id);
}

function openDashboardTool(mod) {
  if (mod.kind === 'dashboard') {
    navigate(mod.section);
    if (mod.tab) selectThreadTab(mod.tab);
    return;
  }
  if (mod.kind === 'dashboardModule') {
    openModulePanel(mod);
  }
}

async function openModulePanel(mod) {
  try {
    const panel = document.createElement('div');
    panel.className = 'btt-panel';
    panel.textContent = 'Loading...';
    const modal = showModal({ title: mod.name, content: panel, width: '760px' });
    const loaded = await import(mod.modulePath);
    if (typeof loaded.default?.renderDashboardPanel !== 'function') {
      panel.textContent = 'This tool does not expose a dashboard panel yet.';
      return;
    }
    await loaded.default.renderDashboardPanel(panel, {
      settings,
      close: modal.close,
      refreshSettings: async () => { settings = await getSettings(); return settings; },
    });
  } catch (err) {
    showToast(`Could not open ${mod.name}: ${err.message}`, 'error');
  }
}

// â”€â”€ Studio (BBCode editor) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

let studioAutoSave = null;

function renderStudio() {
  // Inject BBCode preview styles
  if (!document.getElementById('btt-preview-css')) {
    const s = document.createElement('style');
    s.id = 'btt-preview-css';
    s.textContent = PREVIEW_CSS;
    document.head.appendChild(s);
  }

  const TEMPLATES = {
    // â”€â”€ General â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    'ANN Thread': `[center][b][size=18pt]PROJECT NAME[/size][/b]
[i]Tagline goes here[/i][/center]
[hr]
[b]About[/b]
Describe the project here.
[hr]
[b]Features[/b]
[list][li]Feature 1[/li][li]Feature 2[/li][/list]
[hr]
[b]Links[/b]
[url=https://]Website[/url] | [url=https://]Whitepaper[/url]`,
    'Reserved Post': `[b]Reserved[/b]

[i]This post is reserved for future content.[/i]`,
    'Beginner Warning': `[b][color=orange]Note for beginners:[/color][/b]

Before attempting this, please make sure you:
[list]
[li]Understand the risks involved[/li]
[li]Have tested with a small amount first[/li]
[li]Have backups of your wallet[/li]
[li]Never share your private keys or seed phrase[/li]
[/list]`,
    'Source Request': `Could you please share the source for this claim? I'd like to verify this information before sharing it further.

[b]Specifically looking for:[/b]
[b]Claimed at:[/b] `,
    // â”€â”€ Campaigns â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    'Campaign Application': `[b]Username:[/b]
[b]Profile:[/b] [url=https://bitcointalk.org/index.php?action=profile;u=]Link[/url]
[b]Current Rank:[/b]
[b]Post Count:[/b]
[b]Merit:[/b]
[b]BTC Address:[/b]
[b]Wearing signature:[/b] Yes/No`,
    // â”€â”€ Reputation / Marketplace â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    'Scam Warning': `[color=red][b]âš  SCAM WARNING[/b][/color]

[b]Accused:[/b] [url=]Username[/url]
[b]Type:[/b] Describe the scam type
[b]Evidence:[/b]
[url=]Evidence link 1[/url]
[b]TXID:[/b]
[b]Notes:[/b] Additional details here`,
    'Trade Feedback': `[b]Trade Feedback[/b]

[b]User:[/b] [url=https://bitcointalk.org/]Username[/url]
[b]Trade Type:[/b] Buy/Sell
[b]Amount:[/b]
[b]Payment Method:[/b]
[b]Communication:[/b] â˜…â˜…â˜…â˜…â˜…
[b]Delivery:[/b] â˜…â˜…â˜…â˜…â˜…
[b]Overall:[/b] â˜…â˜…â˜…â˜…â˜…

[i]Comment here.[/i]`,
    'Service Review': `[b]Rating:[/b] â˜…â˜…â˜…â˜…â˜†
[b]Speed:[/b] Fast
[b]Communication:[/b] Excellent
[b]Reliability:[/b] Good

[i]Add your review here.[/i]`,
    'Service Thread': `[b]SERVICE NAME[/b]
[hr]
[b]Description:[/b] What you offer
[b]Pricing:[/b]
[table][tr][td][b]Service[/b][/td][td][b]Price[/b][/td][/tr][tr][td]Basic[/td][td]0.001 BTC[/td][/tr][/table]
[b]Contact:[/b] Reply or PM`,
    'Escrow Suggestion': `[b]Escrow Suggestion[/b]

I recommend using a trusted escrow for this trade to protect both parties.

[b]Suggested escrow:[/b]
[b]Their profile:[/b]

[i]Never trade without escrow for amounts above your risk tolerance.[/i]`,
    // â”€â”€ Technical â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    'Bug Report': `[b]Bug Report[/b]

[b]Version:[/b]
[b]OS:[/b]
[b]Steps to reproduce:[/b]
[list]
[li]Step 1[/li]
[li]Step 2[/li]
[li]Step 3[/li]
[/list]

[b]Expected:[/b]
[b]Actual:[/b]

[b]Error log:[/b]
[code]
Paste error here
[/code]`,
    'Mining Setup': `[b]Mining Setup Question[/b]

[b]Hardware:[/b]
[b]Software:[/b]
[b]Pool:[/b]
[b]OS:[/b]
[b]Hashrate:[/b]
[b]Problem:[/b]

[code]
Paste error/config here
[/code]`,
    'Wallet Support': `[b]Wallet Issue[/b]

[b]Wallet:[/b]
[b]Version:[/b]
[b]OS:[/b]
[b]Issue:[/b]

[b]What I tried:[/b]
[list]
[li][/li]
[/list]

[b]Transaction ID (if applicable):[/b]
[code]
TXID here
[/code]`,
    'TX Fee Explanation': `[b]About Bitcoin Transaction Fees:[/b]

Bitcoin transaction fees depend on:
[list]
[li]Network congestion (mempool size)[/li]
[li]Transaction size in bytes (inputs/outputs)[/li]
[li]Priority you set (sat/vByte)[/li]
[/list]

Check current estimates at: [url=https://mempool.space]mempool.space[/url]`,
    // â”€â”€ Security â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    'Not Your Keys': `[b][color=red]Not your keys, not your coins.[/color][/b]

If you do not control the private keys, you do not truly own the funds. Exchanges can freeze withdrawals, get hacked, or go insolvent.

[b]Best practice:[/b] Move your Bitcoin to a wallet where you control the private keys. Use a hardware wallet for larger amounts.`,
    // â”€â”€ Meta â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    'Meta Suggestion': `[b]Suggestion:[/b] [Title]

[b]Problem:[/b]
Describe the current issue.

[b]Proposed Solution:[/b]
Describe what you suggest.

[b]Benefits:[/b]
[list]
[li]Benefit 1[/li]
[li]Benefit 2[/li]
[/list]

[b]Potential drawbacks:[/b]
[i]Acknowledge any cons.[/i]`,
  };

  const TOOLBAR_BUTTONS = [
    { label: 'B',       tag: '[b]',        close: '[/b]',      title: 'Bold' },
    { label: 'I',       tag: '[i]',        close: '[/i]',      title: 'Italic' },
    { label: 'U',       tag: '[u]',        close: '[/u]',      title: 'Underline' },
    { label: 'S',       tag: '[s]',        close: '[/s]',      title: 'Strike' },
    { label: 'Quote',   tag: '[quote]',    close: '[/quote]',  title: 'Quote' },
    { label: 'Code',    tag: '[code]',     close: '[/code]',   title: 'Code block' },
    { label: 'URL',     tag: '[url=https://]', close: '[/url]', title: 'URL', placeholder: 'Link text' },
    { label: 'IMG',     tag: '[img]',      close: '[/img]',    title: 'Image URL' },
    { label: 'List',    tag: '[list]\n[li]', close: '[/li]\n[/list]', title: 'List' },
    { label: 'Center',  tag: '[center]',   close: '[/center]', title: 'Center' },
    { label: 'HR',      tag: '[hr]',       close: '',          title: 'Horizontal rule' },
    { label: 'Color',   special: 'color',  title: 'Color' },
    { label: 'Size',    special: 'size',   title: 'Font size' },
    { label: 'Table',   special: 'table',  title: 'Insert table' },
  ];

  document.getElementById('studio-panel').innerHTML = `
    <div class="studio-toolbar-row" style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap;align-items:center">
      <select id="studio-template" class="form-select" style="font-size:12px;padding:5px 8px">
        <option value="">Insert template...</option>
        ${Object.keys(TEMPLATES).map(t => `<option value="${t}">${t}</option>`).join('')}
      </select>
      <select id="studio-snippet" class="form-select" style="font-size:12px;padding:5px 8px;min-width:150px">
        <option value="">Insert snippet...</option>
      </select>
      <select id="studio-draft" class="form-select" style="font-size:12px;padding:5px 8px;min-width:150px">
        <option value="">Load draft...</option>
      </select>
      <button id="btn-studio-copy" class="btt-btn btt-btn-sm btt-btn-secondary">Copy</button>
      <button id="btn-studio-save" class="btt-btn btt-btn-sm btt-btn-secondary">Save Draft</button>
      <button id="btn-studio-clear" class="btt-btn btt-btn-sm" style="background:#7f1d1d;color:#fff">Clear</button>
      <span id="studio-save-status" style="font-size:11px;color:var(--text-secondary,#9ca3af)"></span>
    </div>
    <div class="studio-layout">
      <div class="studio-editor-pane">
        <div class="bbcode-toolbar">
          ${TOOLBAR_BUTTONS.map(b => `<button class="toolbar-btn" data-tag="${b.tag||''}" data-close="${b.close||''}" data-special="${b.special||''}" title="${b.title}">${b.label}</button>`).join('')}
        </div>
        <div class="pane-header">BBCode Editor <span id="char-count" style="font-size:11px;color:var(--text-secondary,#9ca3af)">0 chars</span></div>
        <textarea class="studio-textarea" id="studio-editor" placeholder="Type your BBCode here..."></textarea>
      </div>
      <div class="studio-preview-pane">
        <div class="pane-header">Live Preview <span style="font-size:11px;color:var(--text-secondary,#9ca3af)">(approximate)</span></div>
        <div class="studio-preview-body btt-preview" id="studio-preview"></div>
      </div>
    </div>
    <p style="font-size:11px;color:var(--text-secondary,#9ca3af);margin-top:8px">
      Preview is approximate. Verify the final result using Bitcointalk's built-in preview before posting.
    </p>
  `;

  const editor  = document.getElementById('studio-editor');
  const preview = document.getElementById('studio-preview');
  const counter = document.getElementById('char-count');

  // Load last draft
  const draftKey = 'studio_main';
  const drafts = {};
  chrome.storage.local.get('btt_drafts', result => {
    const d = result.btt_drafts?.[draftKey];
    if (d?.content) { editor.value = d.content; updatePreview(); }
  });

  function updatePreview() {
    preview.innerHTML = parseBBCode(editor.value);
    counter.textContent = `${editor.value.length} chars`;
    // Wire copy buttons in preview code blocks
    preview.querySelectorAll('.btt-code-copy').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.previousElementSibling?.querySelector('code')?.textContent || '';
        copyToClipboard(code).then(ok => showToast(ok ? 'Code copied.' : 'Copy failed.', ok ? 'success' : 'error'));
      });
    });
  }

  function insertStudioContent(content) {
    const start = editor.selectionStart ?? editor.value.length;
    const end = editor.selectionEnd ?? editor.value.length;
    const before = editor.value.slice(0, start);
    const after = editor.value.slice(end);
    const prefix = before && !before.endsWith('\n') ? '\n\n' : '';
    const suffix = after && !content.endsWith('\n') ? '\n\n' : '';
    editor.value = before + prefix + content + suffix + after;
    const pos = (before + prefix + content).length;
    editor.selectionStart = editor.selectionEnd = pos;
    editor.focus();
    editor.dispatchEvent(new Event('input'));
  }

  function setSelectPlaceholder(select, text) {
    select.innerHTML = `<option value="">${escapeHtml(text)}</option>`;
  }

  async function populateStudioLibraryControls() {
    const snippetSelect = document.getElementById('studio-snippet');
    const draftSelect = document.getElementById('studio-draft');
    if (!snippetSelect || !draftSelect) return;

    const [snippets, savedDrafts] = await Promise.all([getSnippets(), getDrafts()]);

    setSelectPlaceholder(snippetSelect, snippets.length ? 'Insert snippet...' : 'No snippets saved');
    snippets.forEach((snippet, index) => {
      const option = document.createElement('option');
      option.value = String(index);
      option.textContent = snippet.name || `Snippet ${index + 1}`;
      snippetSelect.appendChild(option);
    });
    snippetSelect.disabled = !snippets.length;

    const draftEntries = Object.entries(savedDrafts)
      .filter(([, draft]) => draft?.content)
      .sort((a, b) => (b[1].savedAt || 0) - (a[1].savedAt || 0));

    setSelectPlaceholder(draftSelect, draftEntries.length ? 'Load draft...' : 'No drafts saved');
    draftEntries.forEach(([key, draft], index) => {
      const option = document.createElement('option');
      option.value = key;
      const name = draft.name || (key === draftKey ? 'Posting Studio autosave' : `Draft ${index + 1}`);
      const saved = draft.savedAt ? ` - ${new Date(draft.savedAt).toLocaleString()}` : '';
      option.textContent = `${name}${saved}`;
      draftSelect.appendChild(option);
    });
    draftSelect.disabled = !draftEntries.length;

    snippetSelect.onchange = (event) => {
      const snippet = snippets[Number(event.target.value)];
      if (snippet?.content) {
        insertStudioContent(snippet.content);
        showToast('Snippet inserted.', 'success');
      }
      event.target.value = '';
    };

    draftSelect.onchange = async (event) => {
      const key = event.target.value;
      const draft = savedDrafts[key];
      event.target.value = '';
      if (!draft?.content) return;

      if (editor.value.trim()) {
        const ok = await confirmDialog('Load this draft and replace the current editor content?');
        if (!ok) return;
      }

      editor.value = draft.content;
      editor.focus();
      editor.dispatchEvent(new Event('input'));
      showToast('Draft loaded.', 'success');
    };
  }

  editor.addEventListener('input', () => {
    updatePreview();
    clearTimeout(studioAutoSave);
    studioAutoSave = setTimeout(() => {
      chrome.storage.local.get('btt_drafts', result => {
        const drafts = result.btt_drafts || {};
        drafts[draftKey] = { content: editor.value, savedAt: Date.now() };
        chrome.storage.local.set({ btt_drafts: drafts }, () => {
          document.getElementById('studio-save-status').textContent = 'Auto-saved ' + new Date().toLocaleTimeString();
        });
      });
    }, 3000);
  });

  // Toolbar
  document.querySelector('.bbcode-toolbar').addEventListener('click', e => {
    const btn = e.target.closest('.toolbar-btn');
    if (!btn) return;
    const special = btn.dataset.special;
    if (special === 'color') {
      const color = prompt('Color name or hex (e.g. red, #ff0000):', 'red');
      if (color) insertTag(editor, `[color=${color}]`, '[/color]');
    } else if (special === 'size') {
      const size = prompt('Font size (e.g. 14pt, 18pt):', '14pt');
      if (size) insertTag(editor, `[size=${size}]`, '[/size]');
    } else if (special === 'table') {
      const rows = parseInt(prompt('Number of rows:', '3') || '3', 10);
      const cols = parseInt(prompt('Number of columns:', '3') || '3', 10);
      let bbcode = '[table]\n';
      for (let r = 0; r < rows; r++) {
        bbcode += '[tr]';
        for (let c = 0; c < cols; c++) bbcode += `[td]Cell ${r+1}.${c+1}[/td]`;
        bbcode += '[/tr]\n';
      }
      bbcode += '[/table]';
      insertTag(editor, bbcode, '');
    } else if (btn.dataset.tag) {
      insertTag(editor, btn.dataset.tag, btn.dataset.close);
    }
    updatePreview();
  });

  // Templates
  document.getElementById('studio-template').addEventListener('change', e => {
    const tpl = TEMPLATES[e.target.value];
    if (tpl) { editor.value += (editor.value ? '\n\n' : '') + tpl; updatePreview(); }
    e.target.value = '';
  });

  document.getElementById('btn-studio-copy').addEventListener('click', async () => {
    const ok = await copyToClipboard(editor.value);
    showToast(ok ? 'BBCode copied.' : 'Copy failed.', ok ? 'success' : 'error');
  });

  document.getElementById('btn-studio-save').addEventListener('click', async () => {
    const name = prompt('Draft name:', 'My draft') || 'Draft';
    chrome.storage.local.get('btt_drafts', result => {
      const drafts = result.btt_drafts || {};
      drafts[`studio_${Date.now()}`] = { content: editor.value, name, savedAt: Date.now() };
      chrome.storage.local.set({ btt_drafts: drafts }, () => {
        showToast('Draft saved.', 'success');
        populateStudioLibraryControls();
      });
    });
  });

  document.getElementById('btn-studio-clear').addEventListener('click', async () => {
    if (await confirmDialog('Clear the editor? Unsaved content will be lost.')) {
      editor.value = '';
      updatePreview();
    }
  });

  populateStudioLibraryControls();
  updatePreview();
}

function insertTag(textarea, open, close, placeholder = '') {
  const start = textarea.selectionStart;
  const end   = textarea.selectionEnd;
  const sel   = textarea.value.slice(start, end) || placeholder;
  textarea.value = textarea.value.slice(0, start) + open + sel + close + textarea.value.slice(end);
  const pos = start + open.length + sel.length + (close ? close.length : 0);
  textarea.selectionStart = textarea.selectionEnd = pos;
  textarea.focus();
  textarea.dispatchEvent(new Event('input'));
}

// â”€â”€ Module sections â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function renderModuleSection(sectionId, category) {
  const container = document.getElementById(`${sectionId}-modules`);
  if (!container) return;
  const mods = MODULE_DEFS.filter(m => m.category === category);
  mods.forEach(mod => {
    const enabled = isToolEnabled(mod);
    const wrap = document.createElement('div');
    wrap.className = 'module-panel-wrapper';
    wrap.innerHTML = `
      <div class="module-panel-header">
        <span>${mod.name}</span>
        <label class="switch">
          <input type="checkbox" ${enabled ? 'checked' : ''}>
          <span class="slider"></span>
        </label>
      </div>
      <div class="module-panel-body">
        <p style="font-size:12px;color:var(--text-secondary,#9ca3af)">${mod.description}</p>
      </div>
    `;
    wrap.querySelector('input').addEventListener('change', async e => {
      if (mod.id === 'darkMode') {
        await applyForumThemeChoice(e.target.checked ? 'dark' : 'original', true);
        e.target.checked = isToolEnabled(mod);
        return;
      }
      settings = await updateSetting('enabledModules', e.target.checked
        ? [...(settings.enabledModules || []), mod.id]
        : (settings.enabledModules || []).filter(id => id !== mod.id)
      );
      showToast(`${mod.name} ${e.target.checked ? 'enabled' : 'disabled'}.`, 'success');
    });
    container.appendChild(wrap);
  });
}

// â”€â”€ Thread section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function renderThread() {
  const content = document.getElementById('thread-tab-content');
  document.querySelectorAll('#section-thread .tab-btn').forEach(btn => {
    if (['bookmarks', 'multiquote', 'backup'].includes(btn.dataset.tab)) {
      btn.disabled = true;
      btn.title = 'Coming soon';
    }
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      document.querySelectorAll('#section-thread .tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderThreadTab(btn.dataset.tab, content);
    });
  });
  renderThreadTab('scraper', content);
}

function selectThreadTab(tab) {
  const content = document.getElementById('thread-tab-content');
  const btn = document.querySelector(`#section-thread .tab-btn[data-tab="${tab}"]`);
  if (!btn || btn.disabled || !content) return;
  document.querySelectorAll('#section-thread .tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderThreadTab(tab, content);
}

function renderThreadTab(tab, container) {
  if (tab === 'scraper') {
    _renderDashboardScraper(container);
  } else if (tab === 'bookmarks') {
    getBookmarks().then(bookmarks => {
      container.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <h4>Saved Bookmarks (${bookmarks.length})</h4>
          <button id="btn-add-bookmark" class="btt-btn btt-btn-sm btt-btn-secondary">+ Add</button>
        </div>
        <div id="bookmark-list"></div>
      `;
      renderBookmarkList(bookmarks, container.querySelector('#bookmark-list'));
      container.querySelector('#btn-add-bookmark').addEventListener('click', () => showAddBookmarkModal());
    });
  } else {
    container.innerHTML = `<div class="btt-panel"><p>${tab} panel â€” enable the corresponding module for full functionality.</p></div>`;
  }
}

// â”€â”€ Dashboard Thread Scraper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

let _scraperResults   = [];
let _scraperCtrl      = null;   // { paused, abort } â€” shared with scrapeThread()
let _scraperDisplayed = [];     // currently displayed (filtered) results
let _scraperContainer = null;   // ref to the main scraper container div
let _scraperSortField = null;   // null = original insertion order
let _scraperSortDir   = 'asc';

const SS = s => `padding:6px 10px;border-radius:5px;border:1px solid var(--border,#374151);background:var(--bg-secondary,#111827);color:var(--text,#e5e7eb);font-size:12px;${s||''}`;

// Field definitions â€” each has a group for the column-selector UI
const EXPORT_FIELD_DEFS = [
  // Post Info
  { key: 'msgId',         label: 'Post ID',             default: true,  group: 'post' },
  { key: 'postUrl',       label: 'Post / Reply URL',    default: true,  group: 'post' },
  { key: 'replyNumber',   label: 'Reply #',             default: false, group: 'post' },
  { key: 'pageNumber',    label: 'Page #',              default: false, group: 'post' },
  { key: 'postDate',      label: 'Post Date',           default: true,  group: 'post' },
  { key: 'editedBy',      label: 'Edited Info',         default: false, group: 'post' },
  { key: 'contentText',   label: 'Post Content',        default: true,  group: 'post' },
  { key: 'fullContentText', label: 'Full Content',      default: false, group: 'post' },
  { key: 'signatureText', label: 'Signature',           default: false, group: 'post' },
  { key: 'codeBlocks',    label: 'Code Blocks',         default: false, group: 'post' },
  { key: 'quotes',        label: 'Quoted Text',         default: false, group: 'post' },
  // User Info
  { key: 'username',      label: 'Username',            default: true,  group: 'user' },
  { key: 'userId',        label: 'User ID',             default: false, group: 'user' },
  { key: 'profileLink',   label: 'Profile URL',         default: false, group: 'user' },
  { key: 'rank',          label: 'Rank',                default: true,  group: 'user' },
  { key: 'activity',      label: 'Activity',            default: true,  group: 'user' },
  { key: 'merit',         label: 'Merit',               default: true,  group: 'user' },
  { key: 'avatarUrl',     label: 'Avatar URL',          default: false, group: 'user' },
  // Crypto & Links
  { key: 'btcAddresses',  label: 'BTC Addresses',       default: true,  group: 'crypto' },
  { key: 'evmAddresses',  label: 'EVM Addresses',       default: true,  group: 'crypto' },
  { key: 'txids',         label: 'TXIDs / Hashes',      default: false, group: 'crypto' },
  { key: 'explorerLinks', label: 'Explorer Links',      default: false, group: 'crypto' },
  { key: 'links',         label: 'All Links',           default: false, group: 'crypto' },
  { key: 'externalLinks', label: 'External Links',      default: false, group: 'crypto' },
  { key: 'internalLinks', label: 'Internal Links',      default: false, group: 'crypto' },
  { key: 'imageLinks',    label: 'Image URLs',          default: false, group: 'crypto' },
  { key: 'valueMatches',  label: 'Value Matches',       default: false, group: 'crypto' },
  // Campaign / Social
  { key: 'telegram',      label: 'Telegram',            default: true,  group: 'campaign' },
  { key: 'twitter',       label: 'Twitter / X',         default: false, group: 'campaign' },
  { key: 'discord',       label: 'Discord',             default: false, group: 'campaign' },
  { key: 'slot',          label: 'Slot Number',         default: false, group: 'campaign' },
  { key: 'postStatus',    label: 'Post Status',         default: false, group: 'campaign' },
  { key: 'paymentAmount', label: 'Payment Amount',      default: false, group: 'campaign' },
  { key: 'weekNumber',    label: 'Week Number',         default: false, group: 'campaign' },
];

// Group display metadata for the column selector panel
const FIELD_GROUP_META = [
  { key: 'post',     label: 'Post Info',         color: '#60a5fa' },
  { key: 'user',     label: 'User Info',         color: '#34d399' },
  { key: 'crypto',   label: 'Crypto & Links',    color: '#f7931a' },
  { key: 'campaign', label: 'Campaign / Social', color: '#c084fc' },
];

// Quick-select presets â€” each maps a name to an array of field keys
const FIELD_PRESETS = {
  'Basic':    ['username', 'rank', 'merit', 'postDate', 'postUrl', 'contentText'],
  'Campaign': ['username', 'profileLink', 'rank', 'merit', 'postUrl',
               'btcAddresses', 'evmAddresses', 'telegram', 'twitter', 'slot', 'postStatus', 'paymentAmount'],
  'Crypto':   ['username', 'postUrl', 'postDate', 'btcAddresses', 'evmAddresses', 'txids', 'explorerLinks'],
  'Content':  ['username', 'postUrl', 'postDate', 'fullContentText', 'codeBlocks', 'valueMatches', 'links'],
  'Social':   ['username', 'rank', 'merit', 'postUrl', 'telegram', 'twitter', 'discord'],
};

// Returns the list of field keys currently selected (null = all when nothing is checked)
function _getSelectedFields(container) {
  const boxes = container?.querySelectorAll('.ds-field-cb:checked');
  if (!boxes || !boxes.length) return null;
  return Array.from(boxes).map(b => b.dataset.field);
}

function _renderDashboardScraper(container) {
  _scraperContainer = container;

  const FGRP = 'margin-bottom:6px;display:flex;flex-wrap:wrap;gap:6px;align-items:center';
  const FLBL = 'font-size:11px;color:var(--text-secondary,#9ca3af);min-width:70px;flex-shrink:0';
  const FHDG = 'font-size:11px;font-weight:700;color:var(--accent,#60a5fa);margin:8px 0 4px;text-transform:uppercase;letter-spacing:.5px';

  // Build grouped column-selector HTML
  const _buildGroupHtml = (gmeta) => {
    const fields = EXPORT_FIELD_DEFS.filter(f => f.group === gmeta.key);
    return `
<div style="flex:1;min-width:210px;background:var(--bg-card,#1e2025);border:1px solid var(--border,#374151);border-radius:6px;overflow:hidden">
  <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:rgba(0,0,0,.15);border-bottom:1px solid var(--border,#374151)">
    <span style="font-size:11px;font-weight:700;color:${gmeta.color};letter-spacing:.3px">${gmeta.label}</span>
    <button data-group-toggle="${gmeta.key}" class="btt-btn btt-btn-sm" style="padding:1px 8px;font-size:10px;background:transparent;border:1px solid ${gmeta.color}33;color:${gmeta.color};border-radius:4px">Toggle</button>
  </div>
  <div style="padding:8px 10px;display:flex;flex-direction:column;gap:5px">
    ${fields.map(f => `
    <label style="display:flex;align-items:center;gap:7px;cursor:pointer;padding:2px 0">
      <input type="checkbox" class="ds-field-cb" data-field="${f.key}" data-group="${gmeta.key}" ${f.default ? 'checked' : ''} style="width:14px;height:14px;cursor:pointer;accent-color:${gmeta.color}">
      <span style="font-size:12px">${f.label}</span>
    </label>`).join('')}
  </div>
</div>`;
  };
  const columnSelectorHtml = FIELD_GROUP_META.map(_buildGroupHtml).join('');

  container.innerHTML = `
<div style="display:flex;flex-direction:column;gap:10px;padding:4px 0">

  <!-- URL row -->
  <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
    <input id="ds-url" type="url" placeholder="Bitcointalk thread URL - e.g. https://bitcointalk.org/index.php?topic=5000.0"
      style="flex:1;min-width:260px;padding:7px 10px;border-radius:6px;border:1px solid var(--border,#374151);background:var(--bg-secondary,#111827);color:var(--text,#e5e7eb);font-size:13px">
  </div>

  <!-- Options row -->
  <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
    <label style="font-size:11px;color:var(--text-secondary,#9ca3af)">From page</label>
    <input id="ds-from-page" type="number" min="1" value="1" style="${SS('width:60px;text-align:center')}">
    <label style="font-size:11px;color:var(--text-secondary,#9ca3af)">To page</label>
    <input id="ds-to-page" type="number" min="1" placeholder="all" style="${SS('width:60px;text-align:center')}">
    <select id="ds-delay" style="${SS()}">
      <option value="1500">1.5s delay</option>
      <option value="2000" selected>2s delay</option>
      <option value="3000">3s delay</option>
      <option value="5000">5s delay</option>
    </select>
    <button id="ds-run"    class="btt-btn btt-btn-primary">Scrape</button>
    <button id="ds-pause"  class="btt-btn btt-btn-sm btt-btn-secondary" style="display:none">Pause</button>
    <button id="ds-resume" class="btt-btn btt-btn-sm btt-btn-secondary" style="display:none">Resume</button>
    <button id="ds-stop"   class="btt-btn btt-btn-sm" style="background:#7f1d1d;color:#fff;display:none">Stop</button>
  </div>
  <div style="display:flex;align-items:center;gap:8px">
    <div id="ds-progress-bar-wrap" style="display:none;flex:1;height:4px;background:var(--border,#374151);border-radius:2px">
      <div id="ds-progress-bar" style="height:100%;width:0%;background:var(--accent,#3b82f6);border-radius:2px;transition:width .3s"></div>
    </div>
    <span id="ds-status" style="font-size:11px;color:var(--text-secondary,#9ca3af);flex:1">Enter a URL and click Scrape.</span>
  </div>

  <!-- Advanced Filters (collapsible) -->
  <details id="ds-filters-panel" style="border:1px solid var(--border,#374151);border-radius:6px;padding:8px 12px">
    <summary style="font-size:12px;font-weight:600;cursor:pointer;user-select:none">Advanced Filters</summary>
    <div style="margin-top:10px">

      <div style="${FHDG}">User</div>
      <div style="${FGRP}">
        <span style="${FLBL}">Username</span>
        <input id="ds-f-user" placeholder="username..." style="${SS('width:140px')}">
        <select id="ds-f-user-mode" style="${SS()}"><option value="include">Include only</option><option value="exclude">Exclude</option></select>
        <input id="ds-f-rank" placeholder="rank contains..." style="${SS('width:140px')}">
      </div>
      <div style="${FGRP}">
        <span style="${FLBL}">Merit</span>
        <input id="ds-f-merit-min" type="number" placeholder="min" style="${SS('width:70px')}">
        <span style="font-size:11px;color:var(--text-secondary,#9ca3af)">-</span>
        <input id="ds-f-merit-max" type="number" placeholder="max" style="${SS('width:70px')}">
        <span style="${FLBL}">Activity</span>
        <input id="ds-f-act-min" type="number" placeholder="min" style="${SS('width:70px')}">
        <span style="font-size:11px;color:var(--text-secondary,#9ca3af)">-</span>
        <input id="ds-f-act-max" type="number" placeholder="max" style="${SS('width:70px')}">
      </div>

      <div style="${FHDG}">Content</div>
      <div style="${FGRP}">
        <span style="${FLBL}">Keyword</span>
        <input id="ds-f-kw" placeholder="keyword or regex..." style="${SS('width:180px')}">
        <select id="ds-f-kw-mode" style="${SS()}"><option value="include">With keyword</option><option value="exclude">Without keyword</option></select>
        <label style="font-size:11px;display:flex;align-items:center;gap:3px"><input type="checkbox" id="ds-f-kw-regex"> Regex</label>
      </div>
      <div style="${FGRP}">
        <span style="${FLBL}">Exact phrase</span>
        <input id="ds-f-phrase" placeholder="exact phrase..." style="${SS('width:220px')}">
      </div>
      <div style="${FGRP}">
        <span style="${FLBL}">Page range</span>
        <input id="ds-f-page-from" type="number" placeholder="from" style="${SS('width:65px')}">
        <span style="font-size:11px;color:var(--text-secondary)">-</span>
        <input id="ds-f-page-to"   type="number" placeholder="to"   style="${SS('width:65px')}">
        <span style="${FLBL}">Reply #</span>
        <input id="ds-f-reply-from" type="number" placeholder="from" style="${SS('width:65px')}">
        <span style="font-size:11px;color:var(--text-secondary)">-</span>
        <input id="ds-f-reply-to"   type="number" placeholder="to"   style="${SS('width:65px')}">
      </div>
      <div style="${FGRP}">
        ${['ds-f-img:Has image','ds-f-link:Has link','ds-f-quote:Has quote','ds-f-code:Has code block','ds-f-edited:Has edited','ds-f-int-link:Internal link','ds-f-ext-link:External link','ds-f-table:Has table','ds-f-value:Has value'].map(s => {
          const [id, lbl] = s.split(':');
          return `<label style="font-size:11px;display:flex;align-items:center;gap:3px;white-space:nowrap"><input type="checkbox" id="${id}"> ${lbl}</label>`;
        }).join('')}
      </div>
      <div style="${FGRP}">
        <span style="${FLBL}">Value</span>
        <input id="ds-f-value-search" placeholder="$40000, BTC, USDT..." style="${SS('width:180px')}">
        <input id="ds-f-value-min" type="number" placeholder="min amount" style="${SS('width:95px')}">
        <span style="font-size:11px;color:var(--text-secondary,#9ca3af)">-</span>
        <input id="ds-f-value-max" type="number" placeholder="max amount" style="${SS('width:95px')}">
      </div>

      <div style="${FHDG}">Crypto</div>
      <div style="${FGRP}">
        ${['ds-f-btc:Has BTC address','ds-f-evm:Has EVM address','ds-f-txid:Has TXID','ds-f-explorer:Explorer link'].map(s => {
          const [id, lbl] = s.split(':');
          return `<label style="font-size:11px;display:flex;align-items:center;gap:3px;white-space:nowrap"><input type="checkbox" id="${id}"> ${lbl}</label>`;
        }).join('')}
      </div>
      <div style="${FGRP}">
        <span style="${FLBL}">BTC addr</span>
        <input id="ds-f-btc-search" placeholder="search BTC address..." style="${SS('width:200px')}">
        <span style="${FLBL}">EVM addr</span>
        <input id="ds-f-evm-search" placeholder="search EVM address..." style="${SS('width:200px')}">
      </div>
      <div style="${FGRP}">
        <span style="${FLBL}">TXID</span>
        <input id="ds-f-txid-search" placeholder="search TXID..." style="${SS('width:200px')}">
      </div>

      <div style="${FHDG}">Campaign / Social</div>
      <div style="${FGRP}">
        ${['ds-f-tg:Has Telegram','ds-f-tw:Has Twitter/X','ds-f-dc:Has Discord','ds-f-campaign:Has app form','ds-f-slot:Has slot','ds-f-payment:Has payment','ds-f-week:Has week #'].map(s => {
          const [id, lbl] = s.split(':');
          return `<label style="font-size:11px;display:flex;align-items:center;gap:3px;white-space:nowrap"><input type="checkbox" id="${id}"> ${lbl}</label>`;
        }).join('')}
      </div>
      <div style="${FGRP}">
        <span style="${FLBL}">Status</span>
        <select id="ds-f-status" style="${SS()}">
          <option value="">Any status</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <div style="display:flex;gap:8px;margin-top:10px;border-top:1px solid var(--border,#374151);padding-top:10px">
        <button id="ds-apply-filter" class="btt-btn btt-btn-sm btt-btn-secondary">Apply Filters</button>
        <button id="ds-clear-filter" class="btt-btn btt-btn-sm">Clear Filters</button>
        <span id="ds-filter-count" style="font-size:11px;color:var(--text-secondary,#9ca3af);align-self:center"></span>
      </div>
    </div>
  </details>

  <!-- â”€â”€ Output Columns Selector â”€â”€ -->
  <div id="ds-columns-panel" style="border:1px solid var(--border,#374151);border-radius:8px;overflow:hidden">

    <!-- Header -->
    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:var(--bg-secondary,#111827);border-bottom:1px solid var(--border,#374151)">
      <div>
        <strong style="font-size:13px">Output Columns</strong>
        <span style="margin-left:8px;font-size:11px;color:var(--text-secondary,#9ca3af)">Select which fields appear in exported files</span>
      </div>
        <span id="ds-col-count" style="font-size:12px;font-weight:600;color:var(--accent,#60a5fa)">loading...</span>
    </div>

    <!-- Preset quick-selects -->
    <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:8px 14px;border-bottom:1px solid var(--border,#374151);background:rgba(255,255,255,.02)">
      <span style="font-size:11px;color:var(--text-secondary,#9ca3af);flex-shrink:0">Preset:</span>
      ${Object.keys(FIELD_PRESETS).map(name =>
        `<button class="btt-btn btt-btn-sm btt-btn-secondary ds-preset-btn" data-preset="${name}" style="font-size:11px">${name}</button>`
      ).join('')}
      <span style="border-left:1px solid var(--border,#374151);height:16px;margin:0 2px"></span>
      <button id="ds-fields-all"     class="btt-btn btt-btn-sm btt-btn-secondary" style="font-size:11px">All</button>
      <button id="ds-fields-none"    class="btt-btn btt-btn-sm btt-btn-secondary" style="font-size:11px">None</button>
      <button id="ds-fields-default" class="btt-btn btt-btn-sm btt-btn-secondary" style="font-size:11px">Defaults</button>
    </div>

    <!-- Live selected-column tags -->
    <div style="padding:8px 14px;border-bottom:1px solid var(--border,#374151);min-height:36px;display:flex;flex-wrap:wrap;align-items:center;gap:4px;background:rgba(59,130,246,.03)">
      <span style="font-size:10px;color:var(--text-secondary,#9ca3af);flex-shrink:0;margin-right:2px">Columns</span>
      <div id="ds-col-tags" style="display:flex;flex-wrap:wrap;gap:4px;flex:1"></div>
    </div>

    <!-- Four grouped column lists -->
    <div style="display:flex;flex-wrap:wrap;gap:10px;padding:12px 14px">
      ${columnSelectorHtml}
    </div>

  </div>

  <!-- Export row (disabled until results exist) -->
  <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
    <span style="font-size:11px;color:var(--text-secondary,#9ca3af)">Export:</span>
    <button id="ds-exp-csv"       class="btt-btn btt-btn-sm btt-btn-secondary" disabled>CSV</button>
    <button id="ds-exp-json"      class="btt-btn btt-btn-sm btt-btn-secondary" disabled>JSON</button>
    <button id="ds-exp-txt"       class="btt-btn btt-btn-sm btt-btn-secondary" disabled>TXT</button>
    <button id="ds-exp-md"        class="btt-btn btt-btn-sm btt-btn-secondary" disabled>Markdown</button>
    <button id="ds-exp-bbtable"   class="btt-btn btt-btn-sm btt-btn-secondary" disabled>BBCode Table</button>
    <button id="ds-exp-bbcode"    class="btt-btn btt-btn-sm btt-btn-secondary" disabled>BBCode Quotes</button>
    <button id="ds-exp-links"     class="btt-btn btt-btn-sm btt-btn-secondary" disabled>Post links</button>
    <button id="ds-exp-code"      class="btt-btn btt-btn-sm btt-btn-secondary" disabled>Code sections</button>
    <button id="ds-exp-content"   class="btt-btn btt-btn-sm btt-btn-secondary" disabled>All content</button>
    <button id="ds-clear-res"     class="btt-btn btt-btn-sm" style="margin-left:auto;background:#7f1d1d;color:#fff" disabled>Clear results</button>
  </div>

  <!-- Helper tools (collapsible) -->
  <details id="ds-helpers" style="display:none;border:1px solid var(--border,#374151);border-radius:6px;padding:8px 12px">
    <summary style="font-size:12px;font-weight:600;cursor:pointer;user-select:none">Helper Tools &amp; Stats</summary>
    <div id="ds-helpers-inner" style="margin-top:10px"></div>
  </details>

  <!-- Result search + sort controls -->
  <div id="ds-result-controls" style="display:none;gap:8px;align-items:center;flex-wrap:wrap">
    <input id="ds-result-search" placeholder="Search within results..." style="${SS('flex:1;min-width:160px')}">
    <span style="font-size:11px;color:var(--text-secondary,#9ca3af)">Sort:</span>
    <select id="ds-sort-field" style="${SS()}">
      <option value="">Default order</option>
      <option value="username">Username</option>
      <option value="rank">Rank</option>
      <option value="merit">Merit</option>
      <option value="activity">Activity</option>
      <option value="postDate">Date</option>
      <option value="pageNumber">Page</option>
    </select>
    <select id="ds-sort-dir" style="${SS()}">
      <option value="asc">Asc</option>
      <option value="desc">Desc</option>
    </select>
  </div>

  <!-- Results table -->
  <div style="overflow-x:auto;border:1px solid var(--border,#374151);border-radius:6px">
    <table style="width:100%;border-collapse:collapse;font-size:12px">
      <thead style="background:var(--bg-secondary,#111827)">
        <tr>
          <th style="padding:5px 8px;width:54px"></th>
          <th style="padding:5px 8px;text-align:left;border-bottom:1px solid var(--border,#374151);color:var(--text-secondary,#6b7280);font-weight:500">#</th>
          <th style="padding:5px 8px;text-align:left;border-bottom:1px solid var(--border,#374151);color:var(--text-secondary,#6b7280);font-weight:500">Username</th>
          <th style="padding:5px 8px;text-align:left;border-bottom:1px solid var(--border,#374151);color:var(--text-secondary,#6b7280);font-weight:500">Rank</th>
          <th style="padding:5px 8px;text-align:left;border-bottom:1px solid var(--border,#374151);color:var(--text-secondary,#6b7280);font-weight:500">Merit</th>
          <th style="padding:5px 8px;text-align:left;border-bottom:1px solid var(--border,#374151);color:var(--text-secondary,#6b7280);font-weight:500">Date</th>
          <th style="padding:5px 8px;text-align:left;border-bottom:1px solid var(--border,#374151);color:var(--text-secondary,#6b7280);font-weight:500">BTC</th>
          <th style="padding:5px 8px;text-align:left;border-bottom:1px solid var(--border,#374151);color:var(--text-secondary,#6b7280);font-weight:500">EVM</th>
          <th style="padding:5px 8px;text-align:left;border-bottom:1px solid var(--border,#374151);color:var(--text-secondary,#6b7280);font-weight:500">Post</th>
        </tr>
      </thead>
      <tbody id="ds-tbody">
        <tr><td colspan="9" style="padding:24px;text-align:center;color:var(--text-secondary,#6b7280)">Enter a thread URL above and click Scrape.</td></tr>
      </tbody>
    </table>
  </div>

  <!-- Campaign application extractor (hidden until results) -->
  <div id="ds-camp-section" style="display:none;border:1px solid var(--border,#374151);border-radius:6px;padding:12px">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
      <strong style="font-size:13px">Campaign Application Extractor</strong>
      <button id="ds-extract-apps" class="btt-btn btt-btn-sm btt-btn-secondary">Extract from results</button>
      <button id="ds-build-table"  class="btt-btn btt-btn-sm btt-btn-secondary" style="display:none">Build BBCode table</button>
      <button id="ds-copy-table"   class="btt-btn btt-btn-sm btt-btn-secondary" style="display:none">Copy table</button>
    </div>
    <div id="ds-apps-out" style="font-size:12px;color:var(--text-secondary,#9ca3af)">Click "Extract from results" to parse application data from scraped posts.</div>
  </div>

  <!-- Manual HTML import -->
  <details style="border:1px solid var(--border,#374151);border-radius:6px;padding:8px 12px">
    <summary style="font-size:12px;font-weight:600;cursor:pointer;user-select:none">Manual HTML Import <span style="font-size:11px;color:var(--text-secondary,#9ca3af)">(offline / CORS fallback)</span></summary>
    <div style="margin-top:8px;display:flex;flex-direction:column;gap:6px">
      <p style="font-size:11px;color:var(--text-secondary,#9ca3af)">Open the thread in a browser tab, press Ctrl+U, copy all source, then paste below.</p>
      <textarea id="ds-manual-html" rows="4" placeholder="Paste raw page HTML here..."
        style="width:100%;padding:7px;border-radius:5px;border:1px solid var(--border,#374151);background:var(--bg-secondary,#111827);color:var(--text,#e5e7eb);font-size:12px;resize:vertical;box-sizing:border-box"></textarea>
      <input id="ds-manual-url" placeholder="Thread URL (optional, for correct post links)"
        style="${SS('width:100%;box-sizing:border-box')}">
      <button id="ds-import-html" class="btt-btn btt-btn-sm btt-btn-secondary" style="align-self:flex-start">Import HTML</button>
    </div>
  </details>

  <!-- Sessions -->
  <details style="border:1px solid var(--border,#374151);border-radius:6px;padding:8px 12px">
    <summary style="font-size:12px;font-weight:600;cursor:pointer;user-select:none">Recent Sessions</summary>
    <div id="ds-sessions" style="margin-top:8px"></div>
  </details>

</div>`;

  // â”€â”€ Restore previous results on revisit â”€â”€
  if (_scraperResults.length) {
    _scraperDisplayed = _scraperResults;
    _renderScraperTable(container, _scraperDisplayed);
    container.querySelector('#ds-status').textContent = `${_scraperResults.length} posts (last scrape)`;
    _setExportEnabled(container, true);
    container.querySelector('#ds-camp-section').style.display = '';
    container.querySelector('#ds-helpers').style.display = '';
    container.querySelector('#ds-result-controls').style.display = 'flex';
    _renderHelperTools(container);
  }

  // Load sessions
  _loadScraperSessions(container.querySelector('#ds-sessions'));

  // â”€â”€ Column selector controls â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  // Helper: sync the tags strip and count badge after any checkbox change
  const _syncColumnTags = () => {
    const checked = Array.from(container.querySelectorAll('.ds-field-cb:checked'));
    const tagsEl  = container.querySelector('#ds-col-tags');
    const countEl = container.querySelector('#ds-col-count');

    if (countEl) countEl.textContent = `${checked.length} selected`;

    if (tagsEl) {
      if (!checked.length) {
        tagsEl.innerHTML = `<span style="font-size:11px;color:var(--text-secondary,#9ca3af);font-style:italic">No columns selected - nothing will be exported</span>`;
        return;
      }
      tagsEl.innerHTML = checked.map(cb => {
        const def   = EXPORT_FIELD_DEFS.find(f => f.key === cb.dataset.field);
        const gmeta = FIELD_GROUP_META.find(g => g.key === cb.dataset.group);
        const color = gmeta?.color || '#9ca3af';
        return `<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:10px;font-size:11px;background:${color}18;border:1px solid ${color}44;color:${color}">
          ${def?.label || cb.dataset.field}
          <button class="ds-col-remove" data-field="${cb.dataset.field}" style="background:none;border:none;cursor:pointer;color:${color};font-size:10px;line-height:1;padding:0;margin-left:1px" title="Remove">Remove</button>
        </span>`;
      }).join('');

      // Wire remove buttons on the tags
      tagsEl.querySelectorAll('.ds-col-remove').forEach(btn => {
        btn.addEventListener('click', () => {
          const cb = container.querySelector(`.ds-field-cb[data-field="${btn.dataset.field}"]`);
          if (cb) { cb.checked = false; _syncColumnTags(); }
        });
      });
    }
  };

  // Any checkbox toggle â†’ refresh tags
  container.querySelectorAll('.ds-field-cb').forEach(cb => {
    cb.addEventListener('change', _syncColumnTags);
  });

  // Preset buttons
  container.querySelectorAll('.ds-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const keys = new Set(FIELD_PRESETS[btn.dataset.preset] || []);
      container.querySelectorAll('.ds-field-cb').forEach(cb => { cb.checked = keys.has(cb.dataset.field); });
      _syncColumnTags();
    });
  });

  // Group toggle: if any in group unchecked â†’ check all; else uncheck all
  container.querySelectorAll('[data-group-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const groupCbs   = container.querySelectorAll(`.ds-field-cb[data-group="${btn.dataset.groupToggle}"]`);
      const anyUnchecked = Array.from(groupCbs).some(cb => !cb.checked);
      groupCbs.forEach(cb => { cb.checked = anyUnchecked; });
      _syncColumnTags();
    });
  });

  // All / None / Defaults
  container.querySelector('#ds-fields-all').addEventListener('click', () => {
    container.querySelectorAll('.ds-field-cb').forEach(cb => { cb.checked = true; });
    _syncColumnTags();
  });
  container.querySelector('#ds-fields-none').addEventListener('click', () => {
    container.querySelectorAll('.ds-field-cb').forEach(cb => { cb.checked = false; });
    _syncColumnTags();
  });
  container.querySelector('#ds-fields-default').addEventListener('click', () => {
    const defaults = new Set(EXPORT_FIELD_DEFS.filter(f => f.default).map(f => f.key));
    container.querySelectorAll('.ds-field-cb').forEach(cb => { cb.checked = defaults.has(cb.dataset.field); });
    _syncColumnTags();
  });

  // Initial paint
  _syncColumnTags();

  // â”€â”€ Scrape â”€â”€
  container.querySelector('#ds-run').addEventListener('click', async () => {
    const urlVal = container.querySelector('#ds-url').value.trim();
    if (!urlVal || !urlVal.includes('topic=')) {
      showToast('Please enter a valid Bitcointalk thread URL (must contain topic=...).', 'error'); return;
    }

    if (!_scraperMod) {
      try { _scraperMod = await import('../modules/scraper.js'); }
      catch (e) { showToast('Scraper failed to load: ' + e.message, 'error'); return; }
    }

    const fromPage = parseInt(container.querySelector('#ds-from-page').value, 10) || 1;
    const toPageEl = container.querySelector('#ds-to-page').value.trim();
    const toPage   = toPageEl ? parseInt(toPageEl, 10) : null;
    const delay    = parseInt(container.querySelector('#ds-delay').value, 10) || 2000;
    const maxPages = toPage ? (toPage - fromPage + 1) : 9999;

    _scraperCtrl    = { paused: false, abort: false };
    _scraperResults = [];
    _scraperDisplayed = [];

    _setBusy(container, true);
    container.querySelector('#ds-status').textContent = 'Starting...';
    container.querySelector('#ds-progress-bar-wrap').style.display = '';
    _setExportEnabled(container, false);
    container.querySelector('#ds-helpers').style.display = 'none';
    container.querySelector('#ds-result-controls').style.display = 'none';

    try {
      const results = await _scraperMod.scrapeThread(
        urlVal,
        { startPage: fromPage, endPage: toPage, maxPages, delay, ctrl: _scraperCtrl },
        ({ pagesScraped, pagesTotal, postsFound, status }) => {
          const ptStr = pagesTotal ? `/${pagesTotal}` : '';
          container.querySelector('#ds-status').textContent =
            `Page ${pagesScraped}${ptStr} - ${postsFound} posts - ${status}`;
          if (pagesTotal) {
            const pct = Math.min(100, Math.round((pagesScraped / pagesTotal) * 100));
            container.querySelector('#ds-progress-bar').style.width = pct + '%';
          }
        }
      );

      _scraperResults   = results;
      _scraperDisplayed = _applyDisplayFilters(container, results);
      _renderScraperTable(container, _scraperDisplayed);

      const st = _scraperCtrl.abort ? 'Stopped' : 'Done';
      container.querySelector('#ds-status').textContent = `${st} - ${results.length} posts scraped`;
      container.querySelector('#ds-filter-count').textContent =
        _scraperDisplayed.length < results.length ? `${_scraperDisplayed.length} after filter` : '';

      if (results.length) {
        _setExportEnabled(container, true);
        container.querySelector('#ds-camp-section').style.display = '';
        container.querySelector('#ds-helpers').style.display = '';
        container.querySelector('#ds-result-controls').style.display = 'flex';
        _renderHelperTools(container);
        _loadScraperSessions(container.querySelector('#ds-sessions'));
      }
    } catch (e) {
      showToast('Scrape failed: ' + e.message, 'error');
      container.querySelector('#ds-status').textContent = 'Error: ' + e.message;
    }

    container.querySelector('#ds-progress-bar-wrap').style.display = 'none';
    _setBusy(container, false);
  });

  // â”€â”€ Pause / Resume / Stop â”€â”€
  container.querySelector('#ds-pause').addEventListener('click', () => {
    if (_scraperCtrl) _scraperCtrl.paused = true;
    container.querySelector('#ds-pause').style.display  = 'none';
    container.querySelector('#ds-resume').style.display = '';
    container.querySelector('#ds-status').textContent   = 'Paused.';
  });

  container.querySelector('#ds-resume').addEventListener('click', () => {
    if (_scraperCtrl) _scraperCtrl.paused = false;
    container.querySelector('#ds-resume').style.display = 'none';
    container.querySelector('#ds-pause').style.display  = '';
    container.querySelector('#ds-status').textContent   = 'Resuming...';
  });

  container.querySelector('#ds-stop').addEventListener('click', () => {
    if (_scraperCtrl) { _scraperCtrl.abort = true; _scraperCtrl.paused = false; }
  });

  // â”€â”€ Apply / clear filters â”€â”€
  container.querySelector('#ds-apply-filter').addEventListener('click', () => {
    if (!_scraperResults.length) return;
    _scraperDisplayed = _applyDisplayFilters(container, _scraperResults);
    _renderScraperTable(container, _scraperDisplayed);
    container.querySelector('#ds-filter-count').textContent =
      _scraperDisplayed.length < _scraperResults.length
        ? `${_scraperDisplayed.length} of ${_scraperResults.length} shown`
        : '';
  });

  container.querySelector('#ds-clear-filter').addEventListener('click', () => {
    // Clear all text inputs and selects in the filter panel
    container.querySelectorAll('#ds-filters-panel input[type="text"], #ds-filters-panel input[type="number"], #ds-filters-panel input[type="url"]').forEach(el => { el.value = ''; });
    container.querySelectorAll('#ds-filters-panel input[type="checkbox"]').forEach(el => { el.checked = false; });
    container.querySelectorAll('#ds-filters-panel select').forEach(el => { el.selectedIndex = 0; });
    // Also clear text inputs specifically
    ['#ds-f-user','#ds-f-rank','#ds-f-kw','#ds-f-phrase','#ds-f-value-search','#ds-f-btc-search','#ds-f-evm-search','#ds-f-txid-search'].forEach(s => {
      const el = container.querySelector(s); if (el) el.value = '';
    });
    container.querySelector('#ds-filter-count').textContent = '';
    if (_scraperResults.length) {
      _scraperDisplayed = _scraperResults;
      _renderScraperTable(container, _scraperDisplayed);
    }
  });

  // â”€â”€ Sort controls â”€â”€
  const _applySortAndRender = () => {
    _scraperSortField = container.querySelector('#ds-sort-field').value || null;
    _scraperSortDir   = container.querySelector('#ds-sort-dir').value   || 'asc';
    _renderScraperTable(container, _scraperDisplayed);
  };
  container.querySelector('#ds-sort-field').addEventListener('change', _applySortAndRender);
  container.querySelector('#ds-sort-dir').addEventListener('change',   _applySortAndRender);

  // â”€â”€ Result search â”€â”€
  container.querySelector('#ds-result-search').addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase();
    if (!q) { _renderScraperTable(container, _scraperDisplayed); return; }
    const filtered = _scraperDisplayed.filter(p =>
      p.username.toLowerCase().includes(q) ||
      p.contentText.toLowerCase().includes(q) ||
      (p.fullContentText || '').toLowerCase().includes(q) ||
      (p.codeBlocks || []).some(code => code.toLowerCase().includes(q)) ||
      (p.valueMatches || []).some(v => String(v.raw || '').toLowerCase().includes(q)) ||
      (p.btcAddresses || []).some(a => a.toLowerCase().includes(q)) ||
      (p.evmAddresses || []).some(a => a.toLowerCase().includes(q)) ||
      (p.postDate || '').toLowerCase().includes(q)
    );
    _renderScraperTable(container, filtered, true /* suppress re-sort */);
  });

  // â”€â”€ Clear results â”€â”€
  container.querySelector('#ds-clear-res').addEventListener('click', () => {
    _scraperResults   = [];
    _scraperDisplayed = [];
    _scraperCtrl      = null;
    _renderScraperTable(container, []);
    _setExportEnabled(container, false);
    container.querySelector('#ds-camp-section').style.display = 'none';
    container.querySelector('#ds-helpers').style.display = 'none';
    container.querySelector('#ds-result-controls').style.display = 'none';
    container.querySelector('#ds-status').textContent = 'Cleared.';
  });

  // â”€â”€ Export buttons â”€â”€
  const _getExportData = () => ({
    data:   _scraperDisplayed.length ? _scraperDisplayed : _scraperResults,
    fields: _getSelectedFields(container),
  });

  container.querySelector('#ds-exp-csv').addEventListener('click', () => {
    if (!_scraperMod || !_scraperResults.length) return;
    const { data, fields } = _getExportData();
    downloadFile('scraper-results.csv', _scraperMod.exportToCsvWithFields(data, fields));
    showToast('CSV downloaded.', 'success');
  });
  container.querySelector('#ds-exp-json').addEventListener('click', () => {
    if (!_scraperMod || !_scraperResults.length) return;
    downloadFile('scraper-results.json', _scraperMod.exportToJson(_getExportData().data), 'application/json');
    showToast('JSON downloaded.', 'success');
  });
  container.querySelector('#ds-exp-txt').addEventListener('click', () => {
    if (!_scraperMod || !_scraperResults.length) return;
    const { data, fields } = _getExportData();
    downloadFile('scraper-results.txt', _scraperMod.exportToTxt(data, fields));
    showToast('TXT downloaded.', 'success');
  });
  container.querySelector('#ds-exp-md').addEventListener('click', () => {
    if (!_scraperMod || !_scraperResults.length) return;
    downloadFile('scraper-results.md', _scraperMod.exportToMarkdown(_getExportData().data));
    showToast('Markdown downloaded.', 'success');
  });
  container.querySelector('#ds-exp-bbtable').addEventListener('click', () => {
    if (!_scraperMod || !_scraperResults.length) return;
    const { data, fields } = _getExportData();
    const bb = _scraperMod.exportToBBCodeTable(data, fields);
    copyToClipboard(bb).then(ok => showToast(ok ? 'BBCode table copied to clipboard.' : 'Copy failed.', ok ? 'success' : 'error'));
  });
  container.querySelector('#ds-exp-bbcode').addEventListener('click', () => {
    if (!_scraperMod || !_scraperResults.length) return;
    const bb = _scraperMod.exportToBBCode(_getExportData().data);
    copyToClipboard(bb).then(ok => showToast(ok ? 'BBCode quotes copied.' : 'Copy failed.', ok ? 'success' : 'error'));
  });
  container.querySelector('#ds-exp-links').addEventListener('click', () => {
    if (!_scraperMod || !_scraperResults.length) return;
    downloadFile('post-links.txt', _scraperMod.exportSelectedLinks(_getExportData().data));
    showToast('Post links downloaded.', 'success');
  });
  container.querySelector('#ds-exp-code').addEventListener('click', () => {
    if (!_scraperMod || !_scraperResults.length) return;
    const text = _scraperMod.exportCodeSections(_getExportData().data);
    if (!text) { showToast('No code sections found in current results.', 'error'); return; }
    downloadFile('scraper-code-sections.txt', text);
    showToast('Code sections downloaded.', 'success');
  });
  container.querySelector('#ds-exp-content').addEventListener('click', () => {
    if (!_scraperMod || !_scraperResults.length) return;
    downloadFile('scraper-all-content.txt', _scraperMod.exportFullContent(_getExportData().data));
    showToast('All content downloaded.', 'success');
  });

  // â”€â”€ Campaign extraction â”€â”€
  let _extractedApps = [];
  container.querySelector('#ds-extract-apps').addEventListener('click', () => {
    if (!_scraperMod || !_scraperResults.length) return;
    const src = _scraperDisplayed.length ? _scraperDisplayed : _scraperResults;
    _extractedApps = src.map(p => {
      const app = _scraperMod.extractApplicationData(p.contentText);
      app.profileLink = app.profileLink || p.profileLink;
      app.postUrl     = p.postUrl;
      if (!app.username) app.username = p.username;
      if (!app.rank)     app.rank     = p.rank;
      if (!app.merit)    app.merit    = p.merit;
      return app;
    }).filter(a => a.username || a.btcAddress || a.rank);
    _renderAppsTable(container.querySelector('#ds-apps-out'), _extractedApps);
    container.querySelector('#ds-build-table').style.display = _extractedApps.length ? '' : 'none';
    container.querySelector('#ds-copy-table').style.display  = _extractedApps.length ? '' : 'none';
    showToast(`Extracted ${_extractedApps.length} application(s).`, 'success');
  });

  container.querySelector('#ds-build-table').addEventListener('click', () => {
    if (!_scraperMod || !_extractedApps.length) return;
    const bb = _scraperMod.buildCampaignTable(_extractedApps);
    container.querySelector('#ds-apps-out').insertAdjacentHTML('afterbegin',
      `<textarea rows="6" style="width:100%;font-family:monospace;font-size:11px;padding:6px;border-radius:4px;border:1px solid var(--border,#374151);background:var(--bg-secondary,#111827);color:var(--text,#e5e7eb);margin-bottom:8px;box-sizing:border-box" readonly>${_dashEsc(bb)}</textarea>`
    );
  });

  container.querySelector('#ds-copy-table').addEventListener('click', () => {
    if (!_scraperMod || !_extractedApps.length) return;
    copyToClipboard(_scraperMod.buildCampaignTable(_extractedApps))
      .then(ok => showToast(ok ? 'BBCode table copied.' : 'Copy failed.', ok ? 'success' : 'error'));
  });

  // â”€â”€ Manual HTML import â”€â”€
  container.querySelector('#ds-import-html').addEventListener('click', () => {
    if (!_scraperMod) { showToast('Scraper not loaded yet.', 'error'); return; }
    const html    = container.querySelector('#ds-manual-html').value.trim();
    const urlHint = container.querySelector('#ds-manual-url').value.trim() || 'https://bitcointalk.org/index.php?topic=0.0';
    if (!html) { showToast('Paste the page HTML first.', 'error'); return; }
    try {
      const { posts } = _scraperMod.parseThreadHtml(html, urlHint);
      if (!posts.length) { showToast('No posts found in the pasted HTML.', 'error'); return; }
      _scraperResults   = _scraperMod.deduplicateResults([..._scraperResults, ...posts]);
      _scraperDisplayed = _scraperResults;
      _renderScraperTable(container, _scraperDisplayed);
      _setExportEnabled(container, true);
      container.querySelector('#ds-camp-section').style.display = '';
      container.querySelector('#ds-helpers').style.display = '';
      container.querySelector('#ds-result-controls').style.display = 'flex';
      container.querySelector('#ds-status').textContent = `${_scraperResults.length} posts (manual import)`;
      _renderHelperTools(container);
      showToast(`Imported ${posts.length} posts.`, 'success');
    } catch (e) {
      showToast('Import failed: ' + e.message, 'error');
    }
  });
}

// â”€â”€ Scraper helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function _setBusy(container, busy) {
  const run    = container.querySelector('#ds-run');
  const pause  = container.querySelector('#ds-pause');
  const resume = container.querySelector('#ds-resume');
  const stop   = container.querySelector('#ds-stop');
  run.disabled    = busy;
  run.textContent = busy ? 'Scraping...' : 'Scrape';
  pause.style.display  = busy ? '' : 'none';
  resume.style.display = 'none';
  stop.style.display   = busy ? '' : 'none';
}

function _setExportEnabled(container, on) {
  ['#ds-exp-csv','#ds-exp-json','#ds-exp-txt','#ds-exp-md','#ds-exp-bbtable','#ds-exp-bbcode','#ds-exp-links','#ds-exp-code','#ds-exp-content','#ds-clear-res'].forEach(s => {
    const el = container.querySelector(s);
    if (el) el.disabled = !on;
  });
}

function _v(container, id)   { return (container.querySelector(id)?.value  || '').trim(); }
function _cb(container, id)  { return !!container.querySelector(id)?.checked; }

function _getFilters(container) {
  return {
    // User
    username:          _v(container, '#ds-f-user'),
    usernameMode:      container.querySelector('#ds-f-user-mode')?.value || 'include',
    rank:              _v(container, '#ds-f-rank'),
    minMerit:          _v(container, '#ds-f-merit-min'),
    maxMerit:          _v(container, '#ds-f-merit-max'),
    minActivity:       _v(container, '#ds-f-act-min'),
    maxActivity:       _v(container, '#ds-f-act-max'),
    // Content / keyword
    keyword:           _v(container, '#ds-f-kw'),
    keywordMode:       container.querySelector('#ds-f-kw-mode')?.value || 'include',
    keywordRegex:      _cb(container, '#ds-f-kw-regex'),
    exactPhrase:       _v(container, '#ds-f-phrase'),
    // Page/reply ranges
    startPage:         _v(container, '#ds-f-page-from'),
    endPage:           _v(container, '#ds-f-page-to'),
    startReply:        _v(container, '#ds-f-reply-from'),
    endReply:          _v(container, '#ds-f-reply-to'),
    // Content presence
    hasImage:          _cb(container, '#ds-f-img'),
    hasLink:           _cb(container, '#ds-f-link'),
    hasQuote:          _cb(container, '#ds-f-quote'),
    hasCode:           _cb(container, '#ds-f-code'),
    hasEdited:         _cb(container, '#ds-f-edited'),
    hasInternalLink:   _cb(container, '#ds-f-int-link'),
    hasExternalLink:   _cb(container, '#ds-f-ext-link'),
    hasTable:          _cb(container, '#ds-f-table'),
    hasValue:          _cb(container, '#ds-f-value'),
    valueSearch:       _v(container, '#ds-f-value-search'),
    minValue:          _v(container, '#ds-f-value-min'),
    maxValue:          _v(container, '#ds-f-value-max'),
    // Crypto
    hasBtc:            _cb(container, '#ds-f-btc'),
    hasEvm:            _cb(container, '#ds-f-evm'),
    hasTxid:           _cb(container, '#ds-f-txid'),
    hasExplorerLink:   _cb(container, '#ds-f-explorer'),
    btcAddressSearch:  _v(container, '#ds-f-btc-search'),
    evmAddressSearch:  _v(container, '#ds-f-evm-search'),
    txidSearch:        _v(container, '#ds-f-txid-search'),
    // Campaign / social
    hasTelegram:       _cb(container, '#ds-f-tg'),
    hasTwitter:        _cb(container, '#ds-f-tw'),
    hasDiscord:        _cb(container, '#ds-f-dc'),
    hasCampaign:       _cb(container, '#ds-f-campaign'),
    hasSlot:           _cb(container, '#ds-f-slot'),
    hasPayment:        _cb(container, '#ds-f-payment'),
    hasWeekNumber:     _cb(container, '#ds-f-week'),
    postStatus:        container.querySelector('#ds-f-status')?.value || '',
  };
}

function _applyDisplayFilters(container, results) {
  if (!_scraperMod) return results;
  const filters = _getFilters(container);
  const hasAny = Object.entries(filters).some(([k, v]) =>
    k !== 'usernameMode' && k !== 'keywordMode' && k !== 'postStatus' && (v === true || (typeof v === 'string' && v !== ''))
  );
  return hasAny ? _scraperMod.applyFilters(results, filters) : results;
}

function _renderScraperTable(container, results, suppressSort = false) {
  const tbody = container.querySelector('#ds-tbody');
  const esc   = s => s ? String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') : '';

  if (!results.length) {
    tbody.innerHTML = `<tr><td colspan="9" style="padding:24px;text-align:center;color:var(--text-secondary,#6b7280)">No results.</td></tr>`;
    return;
  }

  // Apply sort
  let sorted = [...results];
  if (!suppressSort && _scraperSortField) {
    sorted.sort((a, b) => {
      let av = a[_scraperSortField] ?? '';
      let bv = b[_scraperSortField] ?? '';
      // Numeric sort for merit/activity
      if (_scraperSortField === 'merit' || _scraperSortField === 'activity') {
        av = parseInt(String(av).replace(/,/g, ''), 10) || 0;
        bv = parseInt(String(bv).replace(/,/g, ''), 10) || 0;
        return _scraperSortDir === 'asc' ? av - bv : bv - av;
      }
      av = String(av).toLowerCase();
      bv = String(bv).toLowerCase();
      return _scraperSortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }

  tbody.innerHTML = sorted.map((p, i) => {
    const btc0 = (p.btcAddresses || [])[0] || '';
    const evm0 = (p.evmAddresses || [])[0] || '';
    return `
<tr class="ds-result-row" data-idx="${i}" style="border-bottom:1px solid var(--border,rgba(55,65,81,.4));${i%2===1?'background:rgba(255,255,255,.02)':''}">
  <td style="padding:4px 6px;cursor:pointer;color:var(--text-secondary,#6b7280);font-size:10px;user-select:none" class="ds-expand-btn" title="Expand post detail">Details</td>
  <td style="padding:4px 8px;color:var(--text-secondary,#6b7280);font-size:11px">${i + 1}</td>
  <td style="padding:4px 8px">
    <div style="display:flex;align-items:center;gap:3px">
      <a href="${esc(p.profileLink)}" target="_blank" style="color:var(--accent,#60a5fa);text-decoration:none;font-size:12px">${esc(p.username)}</a>
      <button class="ds-copy-val btt-btn btt-btn-sm" data-val="${esc(p.username)}" title="Copy username" style="padding:1px 5px;font-size:10px;flex-shrink:0">Copy</button>
    </div>
  </td>
  <td style="padding:4px 8px;font-size:11px;color:var(--text-secondary,#9ca3af)">${esc(p.rank)}</td>
  <td style="padding:4px 8px;font-size:11px;color:var(--text-secondary,#9ca3af)">${esc(p.merit)}</td>
  <td style="padding:4px 8px;font-size:10px;color:var(--text-secondary,#9ca3af);white-space:nowrap">${esc(p.postDate)}</td>
  <td style="padding:4px 8px;font-family:monospace;font-size:10px;max-width:120px">
    ${btc0 ? `<div style="display:flex;align-items:center;gap:2px;overflow:hidden"><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${esc(btc0)}">${esc(btc0.slice(0,14))}...</span><button class="ds-copy-val btt-btn btt-btn-sm" data-val="${esc(btc0)}" title="Copy BTC" style="padding:1px 4px;font-size:10px;flex-shrink:0">Copy</button></div>` : ''}
  </td>
  <td style="padding:4px 8px;font-family:monospace;font-size:10px;max-width:100px">
    ${evm0 ? `<div style="display:flex;align-items:center;gap:2px;overflow:hidden"><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${esc(evm0)}">${esc(evm0.slice(0,10))}...</span><button class="ds-copy-val btt-btn btt-btn-sm" data-val="${esc(evm0)}" title="Copy EVM" style="padding:1px 4px;font-size:10px;flex-shrink:0">Copy</button></div>` : ''}
  </td>
  <td style="padding:4px 8px">
    <div style="display:flex;align-items:center;gap:3px">
      <a href="${esc(p.postUrl)}" target="_blank" style="color:var(--accent,#60a5fa);font-size:11px;text-decoration:none">#${esc(p.msgId)}</a>
      ${p.postUrl ? `<button class="ds-copy-val btt-btn btt-btn-sm" data-val="${esc(p.postUrl)}" title="Copy post URL" style="padding:1px 4px;font-size:10px;flex-shrink:0">Copy</button>` : ''}
    </div>
  </td>
</tr>
<tr class="ds-detail-row" data-idx="${i}" style="display:none;background:var(--bg-secondary,rgba(17,24,39,.6))">
  <td colspan="9" style="padding:10px 16px 14px">
    ${_buildDetailContent(p, esc)}
  </td>
</tr>`;
  }).join('');

  // Expand/collapse rows
  tbody.querySelectorAll('.ds-expand-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx    = btn.closest('tr').dataset.idx;
      const detail = tbody.querySelector(`.ds-detail-row[data-idx="${idx}"]`);
      if (!detail) return;
      const open = detail.style.display !== 'none';
      detail.style.display = open ? 'none' : '';
      btn.textContent = open ? 'Details' : 'Hide';
    });
  });

  // Copy buttons
  tbody.querySelectorAll('.ds-copy-val').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      copyToClipboard(btn.dataset.val || '').then(ok =>
        showToast(ok ? 'Copied!' : 'Copy failed', ok ? 'success' : 'error')
      );
    });
  });
}

function _buildDetailContent(p, esc) {
  const parts = [];
  const tag  = (label, val) => val ? `<div style="margin:3px 0;font-size:11px"><strong style="color:var(--text-secondary,#9ca3af);min-width:80px;display:inline-block">${label}:</strong> ${val}</div>` : '';

  if (p.contentText) parts.push(
    `<div style="margin-bottom:8px;white-space:pre-wrap;line-height:1.5;max-height:180px;overflow-y:auto;border:1px solid var(--border,#374151);border-radius:4px;padding:8px;font-size:11px">${esc(p.contentText.slice(0, 1500))}</div>`
  );
  if (p.btcAddresses?.length) parts.push(tag('BTC', p.btcAddresses.map(a => `<code style="font-size:10px;background:var(--bg-panel,#1a1d23);padding:1px 4px;border-radius:3px">${esc(a)}</code>`).join(' ')));
  if (p.evmAddresses?.length) parts.push(tag('EVM', p.evmAddresses.map(a => `<code style="font-size:10px;background:var(--bg-panel,#1a1d23);padding:1px 4px;border-radius:3px">${esc(a)}</code>`).join(' ')));
  if (p.txids?.length)        parts.push(tag('TXIDs', p.txids.map(t => `<code style="font-size:9px;background:var(--bg-panel,#1a1d23);padding:1px 4px;border-radius:3px">${esc(t.slice(0, 20))}â€¦</code>`).join(' ')));
  if (p.valueMatches?.length) parts.push(tag('Values', p.valueMatches.map(v => `<code style="font-size:10px;background:var(--bg-panel,#1a1d23);padding:1px 4px;border-radius:3px">${esc(v.raw)}</code>`).join(' ')));
  if (p.codeBlocks?.length)   parts.push(tag(`Code blocks (${p.codeBlocks.length})`, p.codeBlocks.slice(0, 3).map(code => `<pre style="white-space:pre-wrap;max-height:130px;overflow:auto;border:1px solid var(--border,#374151);border-radius:4px;padding:6px;background:var(--bg-panel,#1a1d23);font-size:10px">${esc(code.slice(0, 1200))}</pre>`).join('')));
  if (p.explorerLinks?.length) parts.push(tag('Explorers', p.explorerLinks.map(l => `<a href="${esc(l)}" target="_blank" style="color:var(--accent,#60a5fa);font-size:10px">${esc(new URL(l).hostname)}</a>`).join(' ')));
  if (p.telegram?.length)     parts.push(tag('Telegram', p.telegram.map(t => '@' + esc(t)).join(', ')));
  if (p.twitter?.length)      parts.push(tag('Twitter/X', p.twitter.map(t => '@' + esc(t)).join(', ')));
  if (p.discord?.length)      parts.push(tag('Discord', p.discord.map(d => esc(d)).join(', ')));
  if (p.slot)                 parts.push(tag('Slot', esc(p.slot)));
  if (p.postStatus)           parts.push(tag('Status', `<span style="color:${p.postStatus==='accepted'?'#10b981':p.postStatus==='rejected'?'#ef4444':'#9ca3af'}">${esc(p.postStatus)}</span>`));
  if (p.paymentAmount)        parts.push(tag('Payment', esc(p.paymentAmount)));
  if (p.weekNumber)           parts.push(tag('Week', esc(p.weekNumber)));
  if (p.quotes?.length)       parts.push(tag('Quotes from', p.quotes.map(q => esc(q.author)).join(', ')));
  if (p.links?.length)        parts.push(tag(`Links (${p.links.length})`, p.links.slice(0, 4).map(l => `<a href="${esc(l)}" target="_blank" style="color:var(--accent,#60a5fa);font-size:10px">${esc(l.slice(0, 55))}</a>`).join(' ')));
  if (p.editedBy)             parts.push(`<div style="margin-top:4px;font-size:10px;color:var(--text-secondary,#6b7280);font-style:italic">Edited: ${esc(p.editedBy)}</div>`);
  if (p.signatureText)        parts.push(`<div style="margin-top:6px;border-top:1px dashed var(--border,#374151);padding-top:6px;font-size:10px;color:var(--text-secondary,#6b7280)">Sig: ${esc(p.signatureText.slice(0, 200))}</div>`);

  // Row copy helper
  parts.push(`<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">
    <button class="ds-copy-val btt-btn btt-btn-sm btt-btn-secondary" data-val="${esc(p.username)}" style="font-size:10px">Copy username</button>
    ${p.postUrl ? `<button class="ds-copy-val btt-btn btt-btn-sm btt-btn-secondary" data-val="${esc(p.postUrl)}" style="font-size:10px">Copy URL</button>` : ''}
    ${(p.btcAddresses||[]).length ? `<button class="ds-copy-val btt-btn btt-btn-sm btt-btn-secondary" data-val="${esc((p.btcAddresses||[]).join(', '))}" style="font-size:10px">Copy BTC</button>` : ''}
    ${(p.evmAddresses||[]).length ? `<button class="ds-copy-val btt-btn btt-btn-sm btt-btn-secondary" data-val="${esc((p.evmAddresses||[]).join(', '))}" style="font-size:10px">Copy EVM</button>` : ''}
  </div>`);

  return parts.join('\n') || '<em style="color:var(--text-secondary);font-size:11px">No additional detail available.</em>';
}

function _renderHelperTools(container) {
  if (!_scraperMod || !_scraperResults.length) return;
  const inner = container.querySelector('#ds-helpers-inner');
  if (!inner) return;

  const stats = _scraperMod.countStats(_scraperResults);
  const esc   = _dashEsc;

  inner.innerHTML = `
<!-- Stats row -->
<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px">
  ${[
    ['Total posts', stats.totalPosts],
    ['Unique users', stats.uniqueUsernames],
    ['BTC addresses', stats.uniqueBtcAddresses],
    ['EVM addresses', stats.uniqueEvmAddresses],
    ['Posts with BTC', stats.postsWithBtc],
    ['Posts with EVM', stats.postsWithEvm],
    ['Posts edited', stats.postsEdited],
    ['Campaign posts', stats.postsWithCampaign],
  ].map(([l, v]) => `<div style="padding:6px 12px;background:var(--bg-card,#1e2025);border:1px solid var(--border,#374151);border-radius:6px;text-align:center;min-width:90px">
    <div style="font-size:18px;font-weight:700;color:var(--accent-2,#f7931a)">${v}</div>
    <div style="font-size:10px;color:var(--text-secondary,#9ca3af);text-transform:uppercase;letter-spacing:.4px">${l}</div>
  </div>`).join('')}
</div>

<!-- Copy helpers -->
<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
  <button id="ds-copy-usernames" class="btt-btn btt-btn-sm btt-btn-secondary">Copy all usernames</button>
  <button id="ds-copy-btc-all"   class="btt-btn btt-btn-sm btt-btn-secondary">Copy all BTC</button>
  <button id="ds-copy-evm-all"   class="btt-btn btt-btn-sm btt-btn-secondary">Copy all EVM</button>
  <button id="ds-copy-urls-all"  class="btt-btn btt-btn-sm btt-btn-secondary">Copy all post URLs</button>
  <button id="ds-copy-tg-all"    class="btt-btn btt-btn-sm btt-btn-secondary">Copy all Telegram</button>
</div>

<!-- Top posters -->
<div>
  <strong style="font-size:12px">Top Posters</strong>
  <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px">
    ${stats.topPosters.slice(0, 10).map(({ username, count }) =>
      `<span style="padding:2px 8px;background:var(--bg-card,#1e2025);border:1px solid var(--border,#374151);border-radius:10px;font-size:11px">
        ${esc(username)} <strong>${count}</strong>
      </span>`
    ).join('')}
  </div>
</div>`;

  // Wire copy helper buttons
  const _cp = (id, field) => {
    inner.querySelector(id)?.addEventListener('click', () => {
      const vals = _scraperMod.getUniqueValues(_scraperResults, field);
      copyToClipboard(vals.join('\n')).then(ok =>
        showToast(ok ? `${vals.length} ${field} copied.` : 'Copy failed.', ok ? 'success' : 'error')
      );
    });
  };
  _cp('#ds-copy-usernames', 'username');
  _cp('#ds-copy-btc-all',   'btcAddresses');
  _cp('#ds-copy-evm-all',   'evmAddresses');
  _cp('#ds-copy-tg-all',    'telegram');
  inner.querySelector('#ds-copy-urls-all')?.addEventListener('click', () => {
    const urls = _scraperResults.map(p => p.postUrl).filter(Boolean);
    copyToClipboard([...new Set(urls)].join('\n')).then(ok =>
      showToast(ok ? `${urls.length} URLs copied.` : 'Copy failed.', ok ? 'success' : 'error')
    );
  });
}

function _renderAppsTable(container, apps) {
  const esc = _dashEsc;
  if (!apps.length) { container.innerHTML = '<p style="color:var(--text-secondary,#9ca3af)">No structured application data found in the scraped posts.</p>'; return; }
  container.innerHTML = `
<table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:8px">
  <thead><tr style="background:var(--bg-secondary,rgba(255,255,255,.03))">
    ${['#','Username','Rank','Posts','Merit','BTC Address','Telegram','Slot','Campaign'].map(h =>
      `<th style="padding:5px 8px;text-align:left;border-bottom:1px solid var(--border,#374151);color:var(--text-secondary,#6b7280);font-weight:500">${h}</th>`
    ).join('')}
  </tr></thead>
  <tbody>
    ${apps.map((a, i) => `<tr style="border-bottom:1px solid var(--border,rgba(55,65,81,.3));${i%2===1?'background:rgba(255,255,255,.02)':''}">
      <td style="padding:4px 8px;color:var(--text-secondary)">${i+1}</td>
      <td style="padding:4px 8px">${a.profileLink ? `<a href="${esc(a.profileLink)}" target="_blank" style="color:var(--accent,#60a5fa);text-decoration:none">${esc(a.username||'?')}</a>` : esc(a.username||'?')}</td>
      <td style="padding:4px 8px;font-size:11px;color:var(--text-secondary)">${esc(a.rank||'')}</td>
      <td style="padding:4px 8px;font-size:11px">${esc(a.postCount||'')}</td>
      <td style="padding:4px 8px;font-size:11px">${esc(a.merit||'')}</td>
      <td style="padding:4px 8px;font-family:monospace;font-size:10px;max-width:140px;overflow:hidden;text-overflow:ellipsis" title="${esc(a.btcAddress||'')}">${esc(a.btcAddress||'')}</td>
      <td style="padding:4px 8px;font-size:11px">${esc(a.telegram||'')}</td>
      <td style="padding:4px 8px;font-size:11px">${esc(a.slot||'')}</td>
      <td style="padding:4px 8px;font-size:11px">${esc(a.campaign||'')}</td>
    </tr>`).join('')}
  </tbody>
</table>`;
}

async function _loadScraperSessions(sessContainer) {
  if (!_scraperMod) {
    sessContainer.innerHTML = '<p style="font-size:12px;color:var(--text-secondary,#9ca3af)">Scraper not loaded.</p>';
    return;
  }
  const sessions = await _scraperMod.loadSessions();
  if (!sessions.length) {
    sessContainer.innerHTML = '<p style="font-size:12px;color:var(--text-secondary,#9ca3af)">No sessions yet.</p>';
    return;
  }
  const esc = _dashEsc;
  sessContainer.innerHTML = sessions.map(s => `
<div data-sess-id="${esc(s.id)}" style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid var(--border,rgba(55,65,81,.3));font-size:12px">
  <div>
    <a href="${esc(s.url)}" target="_blank" style="color:var(--accent,#60a5fa);text-decoration:none">${esc(s.topicTitle || ('topic=' + s.topicId) || s.url)}</a>
    <span style="margin-left:8px;color:var(--text-secondary,#9ca3af)">${s.postCount} posts Â· ${new Date(s.scrapeDate).toLocaleDateString()}</span>
    ${s.boardName ? `<span style="margin-left:6px;font-size:10px;color:var(--text-secondary,#6b7280)">[${esc(s.boardName)}]</span>` : ''}
  </div>
  <div style="display:flex;gap:6px">
    <button class="sess-load btt-btn btt-btn-sm btt-btn-secondary">Load</button>
    <button class="sess-del  btt-btn btt-btn-sm" style="background:#7f1d1d;color:#fff">Delete</button>
  </div>
</div>`).join('');

  sessContainer.querySelectorAll('[data-sess-id]').forEach((row, idx) => {
    row.querySelector('.sess-load').addEventListener('click', () => {
      _scraperResults   = sessions[idx].results || [];
      _scraperDisplayed = _scraperResults;
      const c = _scraperContainer;
      if (c) {
        _renderScraperTable(c, _scraperDisplayed);
        _setExportEnabled(c, !!_scraperResults.length);
        if (_scraperResults.length) {
          c.querySelector('#ds-camp-section').style.display = '';
          c.querySelector('#ds-helpers').style.display = '';
          c.querySelector('#ds-result-controls').style.display = 'flex';
          _renderHelperTools(c);
        }
        c.querySelector('#ds-status').textContent = `Loaded ${_scraperResults.length} posts from session.`;
      }
      showToast(`Loaded ${_scraperResults.length} posts.`, 'success');
    });
    row.querySelector('.sess-del').addEventListener('click', async () => {
      await _scraperMod.deleteSession(sessions[idx].id);
      row.remove();
      showToast('Session deleted.', 'success');
    });
  });
}

function renderBookmarkList(bookmarks, container) {
  if (!bookmarks.length) { container.textContent = 'No bookmarks yet.'; return; }
  container.innerHTML = '';
  bookmarks.forEach(b => {
    const div = document.createElement('div');
    div.style.cssText = 'padding:10px;border:1px solid var(--border);border-radius:6px;margin-bottom:8px;';
    div.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div>
          <a href="${b.url}" target="_blank" style="color:var(--accent);text-decoration:none;font-size:13px;font-weight:600">${b.title || b.url}</a>
          ${b.note ? `<p style="font-size:12px;color:var(--text-secondary);margin:2px 0">${b.note}</p>` : ''}
        </div>
        <button class="btt-btn btt-btn-sm" data-id="${b.id}" style="background:#7f1d1d;color:#fff;flex-shrink:0">Delete</button>
      </div>
    `;
    div.querySelector('button').addEventListener('click', async () => {
      const { deleteBookmark } = await import('../utils/storage.js');
      await deleteBookmark(b.id);
      div.remove();
    });
    container.appendChild(div);
  });
}

function showAddBookmarkModal() {
  showModal({
    title: 'Add Bookmark',
    content: `
      <div style="display:flex;flex-direction:column;gap:10px">
        <input id="bm-url"   class="form-input" placeholder="Thread URL" type="url">
        <input id="bm-title" class="form-input" placeholder="Title (optional)">
        <input id="bm-note"  class="form-input" placeholder="Note (optional)">
      </div>
    `,
    actions: [
      { label: 'Cancel', type: 'secondary', onClick: () => {} },
      { label: 'Save',   type: 'primary',   onClick: async () => {
        const url   = document.getElementById('bm-url')?.value.trim();
        const title = document.getElementById('bm-title')?.value.trim();
        const note  = document.getElementById('bm-note')?.value.trim();
        if (!url) return;
        const { saveBookmark } = await import('../utils/storage.js');
        await saveBookmark({ url, title: title || url, note });
        showToast('Bookmark saved.', 'success');
      }},
    ],
  });
}

// â”€â”€ Campaign â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function renderCampaign() {
  const panel = document.getElementById('campaign-panel');

  panel.innerHTML = `
<div style="display:flex;flex-direction:column;gap:16px">
  <div style="background:rgba(247,147,26,.08);border:1px solid rgba(247,147,26,.3);border-radius:6px;padding:12px 14px;font-size:12px;color:var(--text-secondary,#9ca3af)">
    <strong style="color:#f59e0b">How to extract applicants:</strong>
    Use the <strong>Thread Scraper</strong> (Thread Tools &gt; Thread section) to scrape the application thread, then click <strong>Extract Campaign Applications</strong> in the scraper results area to parse structured application data and build a BBCode table.
  </div>
  <div style="display:flex;justify-content:space-between;align-items:center">
    <h4 style="margin:0">Saved Projects</h4>
    <button id="cm-refresh" class="btt-btn btt-btn-sm btt-btn-secondary">Refresh</button>
  </div>
  <div id="cm-project-list"></div>
</div>`;

  const loadProjects = () => {
    getCampaignProjects().then(projects => {
      const listEl = panel.querySelector('#cm-project-list');
      if (!projects.length) {
        listEl.innerHTML = `<p style="color:var(--text-secondary,#9ca3af);font-size:13px">No saved projects yet. Projects saved by previous versions of the Campaign Manager module will appear here.</p>`;
        return;
      }
      listEl.innerHTML = '';
      projects.forEach(p => _renderProjectCard(p, listEl, loadProjects));
    });
  };

  panel.querySelector('#cm-refresh').addEventListener('click', loadProjects);
  loadProjects();
}

function _renderProjectCard(project, container, reload) {
  const card = document.createElement('div');
  card.style.cssText = 'border:1px solid var(--border,#374151);border-radius:8px;overflow:hidden;margin-bottom:10px';

  const dupes       = findDuplicates(project.applicants || []);
  const dupeCount   = Object.keys(dupes.usernames).length + Object.keys(dupes.addresses).length;
  const accepted    = (project.applicants || []).filter(a => a.status === 'accepted').length;
  const rejected    = (project.applicants || []).filter(a => a.status === 'rejected').length;
  const pending     = (project.applicants || []).filter(a => a.status === 'pending').length;

  card.innerHTML = `
<div class="cm-card-header" style="padding:12px 14px;background:var(--bg-secondary,rgba(255,255,255,.03));display:flex;justify-content:space-between;align-items:center;cursor:pointer">
  <div>
    <strong style="font-size:13px">${_dashEsc(project.name || 'Unnamed')}</strong>
    <div style="font-size:11px;color:var(--text-secondary,#9ca3af);margin-top:2px">
      ${(project.applicants||[]).length} applicants |
      <span style="color:#10b981">${accepted} accepted</span> |
      <span style="color:#ef4444">${rejected} rejected</span> |
      ${pending} pending
      ${dupeCount ? ` | <span style="color:#f59e0b">${dupeCount} duplicate(s)</span>` : ''}
      | Updated ${new Date(project.updatedAt || project.createdAt).toLocaleDateString()}
    </div>
  </div>
  <span class="cm-chevron" style="color:var(--text-secondary,#9ca3af);font-size:12px">v</span>
</div>
<div class="cm-card-body" style="display:none;padding:12px 14px;border-top:1px solid var(--border,#374151)">
  <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
    <button class="cm-export-csv  btt-btn btt-btn-sm btt-btn-secondary">CSV</button>
    <button class="cm-export-bbcode btt-btn btt-btn-sm btt-btn-secondary">BBCode Table</button>
    <button class="cm-delete btt-btn btt-btn-sm" style="background:#7f1d1d;color:#fff;margin-left:auto">Delete Project</button>
  </div>
  <div class="cm-applicant-table" style="overflow-x:auto"></div>
</div>`;

  // Toggle expand
  card.querySelector('.cm-card-header').addEventListener('click', () => {
    const body    = card.querySelector('.cm-card-body');
    const chevron = card.querySelector('.cm-chevron');
    const isOpen  = body.style.display !== 'none';
    body.style.display = isOpen ? 'none' : 'block';
    chevron.textContent = isOpen ? 'v' : '^';
    if (!isOpen) _renderApplicantTable(project, card.querySelector('.cm-applicant-table'), reload);
  });

  card.querySelector('.cm-export-csv').addEventListener('click', () => {
    const cols = ['username','profileLink','rank','activity','address','addrType','postUrl','status'];
    const q    = v => `"${String(v||'').replace(/"/g,'""')}"`;
    const rows = (project.applicants||[]).map(a => cols.map(c => q(a[c])).join(','));
    downloadFile(`${project.name||'campaign'}-applicants.csv`, [cols.join(','), ...rows].join('\n'));
    showToast('CSV downloaded.', 'success');
  });

  card.querySelector('.cm-export-bbcode').addEventListener('click', () => {
    const rows = (project.applicants||[])
      .filter(a => a.status !== 'rejected')
      .map((a, i) => `[tr][td]${i+1}[/td][td][url=${a.profileLink}]${a.username}[/url][/td][td]${a.rank}[/td][td]${a.address||'-'}[/td][td]${a.status||'pending'}[/td][/tr]`)
      .join('\n');
    const bb = `[table]\n[tr][td][b]#[/b][/td][td][b]Username[/b][/td][td][b]Rank[/b][/td][td][b]Address[/b][/td][td][b]Status[/b][/td][/tr]\n${rows}\n[/table]`;
    copyToClipboard(bb).then(() => showToast('BBCode copied.', 'success'));
  });

  card.querySelector('.cm-delete').addEventListener('click', async () => {
    if (await confirmDialog(`Delete project "${project.name}"? This cannot be undone.`)) {
      await deleteCampaignProject(project.id);
      card.remove();
      showToast('Project deleted.', 'success');
      reload();
    }
  });

  container.appendChild(card);
}

function _renderApplicantTable(project, container, reload) {
  const applicants = project.applicants || [];
  if (!applicants.length) { container.innerHTML = '<p style="color:var(--text-secondary,#9ca3af);font-size:12px">No applicants.</p>'; return; }

  const dupes     = findDuplicates(applicants);
  const dupeUsers = new Set(Object.keys(dupes.usernames));
  const dupeAddrs = new Set(Object.keys(dupes.addresses));
  const esc       = _dashEsc;

  container.innerHTML = `
<table style="width:100%;border-collapse:collapse;font-size:12px">
  <thead>
    <tr style="background:var(--bg-secondary,rgba(255,255,255,.03))">
      <th style="padding:6px 8px;text-align:left;border-bottom:1px solid var(--border,#374151);color:var(--text-secondary,#6b7280);font-weight:500">Username</th>
      <th style="padding:6px 8px;text-align:left;border-bottom:1px solid var(--border,#374151);color:var(--text-secondary,#6b7280);font-weight:500">Rank</th>
      <th style="padding:6px 8px;text-align:left;border-bottom:1px solid var(--border,#374151);color:var(--text-secondary,#6b7280);font-weight:500">Address</th>
      <th style="padding:6px 8px;text-align:left;border-bottom:1px solid var(--border,#374151);color:var(--text-secondary,#6b7280);font-weight:500">Post</th>
      <th style="padding:6px 8px;text-align:left;border-bottom:1px solid var(--border,#374151);color:var(--text-secondary,#6b7280);font-weight:500">Status</th>
    </tr>
  </thead>
  <tbody>
    ${applicants.map((a, i) => {
      const isDupeUser = dupeUsers.has(a.username.toLowerCase());
      const isDupeAddr = a.address && dupeAddrs.has(a.address);
      const sColor = { accepted:'#10b981', rejected:'#ef4444', pending:'#9ca3af' }[a.status] || '#9ca3af';
      return `<tr style="border-bottom:1px solid var(--border,rgba(55,65,81,.3));${i%2===1?'background:rgba(255,255,255,.02)':''}">
        <td style="padding:5px 8px">
          ${isDupeUser ? '<span title="Duplicate username" style="color:#f59e0b;margin-right:4px">Duplicate</span>':''}<a href="${esc(a.profileLink)}" target="_blank" style="color:var(--accent,#60a5fa);text-decoration:none">${esc(a.username)}</a>
        </td>
        <td style="padding:5px 8px;font-size:11px;color:var(--text-secondary,#9ca3af)">${esc(a.rank)}</td>
        <td style="padding:5px 8px;font-family:monospace;font-size:10px">
          ${isDupeAddr?'<span style="color:#f59e0b;margin-right:2px">Duplicate</span>':''}${esc(a.address)}${a.addrType ? ` <span style="color:#6b7280">(${a.addrType})</span>` : ''}
        </td>
        <td style="padding:5px 8px"><a href="${esc(a.postUrl)}" target="_blank" style="color:var(--accent,#60a5fa);font-size:11px;text-decoration:none">View</a></td>
        <td style="padding:5px 8px">
          <select data-aid="${esc(a.id)}" style="padding:3px 6px;border-radius:4px;border:1px solid ${sColor};background:var(--bg,#1a1b2e);color:${sColor};font-size:11px;cursor:pointer">
            <option value="pending"  ${a.status==='pending' ?'selected':''}>Pending</option>
            <option value="accepted" ${a.status==='accepted'?'selected':''}>Accepted</option>
            <option value="rejected" ${a.status==='rejected'?'selected':''}>Rejected</option>
          </select>
        </td>
      </tr>`;
    }).join('')}
  </tbody>
</table>`;

  // Status change persists immediately.
  container.querySelectorAll('[data-aid]').forEach(sel => {
    sel.addEventListener('change', async () => {
      const idx = applicants.findIndex(a => a.id === sel.dataset.aid);
      if (idx >= 0) {
        applicants[idx].status = sel.value;
        await saveCampaignProject(project);
        const c = { accepted:'#10b981', rejected:'#ef4444', pending:'#9ca3af' }[sel.value] || '#9ca3af';
        sel.style.borderColor = c; sel.style.color = c;
      }
    });
  });
}

function _dashEsc(s) {
  return s ? String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') : '';
}

// â”€â”€ My Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function renderDataSection() {
  const content = document.getElementById('data-tab-content');
  document.querySelectorAll('#section-data .tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#section-data .tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderDataTab(btn.dataset.tab, content);
    });
  });
  renderDataTab('drafts', content);
}

function renderDataTab(tab, container) {
  if (tab === 'drafts') {
    chrome.storage.local.get('btt_drafts', result => {
      const drafts = result.btt_drafts || {};
      const entries = Object.entries(drafts);
      container.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><h4>Saved Drafts (${entries.length})</h4></div><div id="drafts-list"></div>`;
      const list = container.querySelector('#drafts-list');
      if (!entries.length) { list.textContent = 'No drafts.'; return; }
      entries.forEach(([key, d]) => {
        const div = document.createElement('div');
        div.style.cssText = 'padding:10px;border:1px solid var(--border);border-radius:6px;margin-bottom:8px;';
        div.innerHTML = `
          <div style="display:flex;justify-content:space-between">
            <strong style="font-size:13px">${key}</strong>
            <span style="font-size:11px;color:var(--text-secondary)">${new Date(d.savedAt||0).toLocaleString()}</span>
          </div>
          <p style="font-size:12px;color:var(--text-secondary);margin:4px 0">${(d.content||'').slice(0,120)}â€¦</p>
          <div style="display:flex;gap:6px;margin-top:6px">
            <button class="btt-btn btt-btn-sm btt-btn-secondary copy-draft">Copy BBCode</button>
            <button class="btt-btn btt-btn-sm" style="background:#7f1d1d;color:#fff" class="del-draft">Delete</button>
          </div>
        `;
        div.querySelector('.copy-draft').addEventListener('click', () => copyToClipboard(d.content || '').then(ok => showToast(ok ? 'Copied.' : 'Failed.', ok ? 'success' : 'error')));
        div.querySelectorAll('.btt-btn')[1].addEventListener('click', async () => {
          const { deleteDraft } = await import('../utils/storage.js');
          await deleteDraft(key);
          div.remove();
        });
        list.appendChild(div);
      });
    });
  } else if (tab === 'notes') {
    getUserNotes().then(notes => {
      const entries = Object.entries(notes);
      container.innerHTML = `<h4 style="margin-bottom:12px">User Notes (${entries.length})</h4>`;
      if (!entries.length) { container.innerHTML += '<p style="color:var(--text-secondary)">No notes yet.</p>'; return; }
      entries.forEach(([user, note]) => {
        const div = document.createElement('div');
        div.style.cssText = 'padding:10px;border:1px solid var(--border);border-radius:6px;margin-bottom:8px;';
        div.innerHTML = `<strong>${user}</strong> ${(note.tags||[]).map(t => `<span style="font-size:10px;background:#374151;padding:1px 6px;border-radius:9px">${t}</span>`).join(' ')}<p style="font-size:12px;color:var(--text-secondary);margin-top:4px">${note.text||''}</p>`;
        container.appendChild(div);
      });
    });
  } else if (tab === 'snippets') {
    getSnippets().then(snippets => {
      container.innerHTML = `<div style="display:flex;justify-content:space-between;margin-bottom:12px"><h4>Snippets (${snippets.length})</h4><button id="btn-add-snippet" class="btt-btn btt-btn-sm btt-btn-secondary">+ Add</button></div><div id="snippet-list"></div>`;
      const list = container.querySelector('#snippet-list');
      if (!snippets.length) { list.textContent = 'No snippets saved.'; }
      snippets.forEach(s => {
        const div = document.createElement('div');
        div.style.cssText = 'padding:10px;border:1px solid var(--border);border-radius:6px;margin-bottom:8px;';
        div.innerHTML = `<strong style="font-size:13px">${s.name||'Snippet'}</strong><p style="font-size:12px;color:var(--text-secondary)">${(s.content||'').slice(0,100)}â€¦</p>`;
        list.appendChild(div);
      });
      container.querySelector('#btn-add-snippet').addEventListener('click', () => showAddSnippetModal());
    });
  } else {
    container.innerHTML = '<p style="color:var(--text-secondary)">Tab coming soon.</p>';
  }
}

function showAddSnippetModal() {
  showModal({
    title: 'Add Snippet',
    content: `<div style="display:flex;flex-direction:column;gap:10px"><input id="sn-name" class="form-input" placeholder="Snippet name"><textarea id="sn-content" class="form-input" rows="5" placeholder="BBCode contentâ€¦"></textarea></div>`,
    actions: [
      { label: 'Cancel', type: 'secondary', onClick: () => {} },
      { label: 'Save',   type: 'primary',   onClick: async () => {
        const name    = document.getElementById('sn-name')?.value.trim();
        const content = document.getElementById('sn-content')?.value;
        if (!name || !content) return;
        const { saveSnippet } = await import('../utils/storage.js');
        await saveSnippet({ name, content });
        showToast('Snippet saved.', 'success');
      }},
    ],
  });
}

// â”€â”€ Legacy Scripts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function renderLegacy() {
  document.getElementById('legacy-panel').innerHTML = `
    <div class="btt-panel">
      <p>Import your old Tampermonkey/Greasemonkey scripts here.</p>
      <div style="background:rgba(247,147,26,.1);border:1px solid var(--accent-2);border-radius:6px;padding:12px;margin:12px 0;font-size:13px;">
        <strong>How to integrate your old scripts:</strong><br>
        <ol style="padding-left:16px;margin-top:6px;line-height:1.8;color:var(--text-secondary)">
          <li>Copy your script into <code>src/legacy-scripts/myScript.js</code></li>
          <li>Wrap it using <code>exampleLegacyWrapper.js</code> as a template</li>
          <li>Replace <code>GM_getValue/setValue</code> with <code>await GM_API.GM_getValue/setValue</code></li>
          <li>Register in <code>legacyRegistry.js</code></li>
          <li>Enable from this section</li>
        </ol>
      </div>
      <div id="legacy-modules-list">
        <p style="color:var(--text-secondary);font-size:13px">No legacy scripts registered yet. See <code>src/legacy-scripts/README.md</code> for instructions.</p>
      </div>
    </div>
  `;
}

// â”€â”€ Settings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function getForumCustomColors() {
  return normalizeForumCustomColors(settings.forumCustomColors || DEFAULT_FORUM_CUSTOM_COLORS);
}

function buildForumColorControls(colors) {
  return FORUM_COLOR_GROUPS.map(group => `
    <details open style="border:1px solid var(--border,#374151);border-radius:8px;padding:10px 12px;background:var(--bg-card,rgba(255,255,255,.03))">
      <summary style="cursor:pointer;font-size:13px;font-weight:700;color:var(--text,#e5e7eb)">${escapeHtml(group.label)}</summary>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px;margin-top:10px">
        ${group.fields.map(([key, label]) => `
          <label style="display:grid;grid-template-columns:1fr auto 92px;gap:8px;align-items:center;font-size:12px">
            <span>${escapeHtml(label)}</span>
            <input type="color" class="forum-color-picker" data-color-key="${key}" value="${colors[key]}"
              style="width:38px;height:30px;padding:0;border:1px solid var(--border,#374151);border-radius:4px;background:transparent;cursor:pointer">
            <input type="text" class="forum-color-hex" data-color-key="${key}" value="${colors[key]}" maxlength="7"
              style="width:92px;padding:5px 7px;border-radius:4px;border:1px solid var(--border,#374151);background:var(--bg-input,#1e2025);color:var(--text,#e5e7eb);font-size:12px;font-family:monospace;box-sizing:border-box">
          </label>
        `).join('')}
      </div>
    </details>
  `).join('');
}

async function saveForumCustomColors(colors, { notifyTabs = true } = {}) {
  const normalized = normalizeForumCustomColors(colors);
  settings = {
    ...settings,
    forumTheme: 'custom',
    darkMode: false,
    forumCustomColors: normalized,
    enabledModules: (settings.enabledModules || []).filter(id => id !== 'darkMode'),
  };
  await storageSet({ [FORUM_THEME_STORAGE_KEY]: 'custom' });
  await saveSettings(settings);
  applyBitcointalkForumTheme(settings);
  updateThemeToggleButton();
  if (notifyTabs) chrome.runtime.sendMessage({ action: 'relayToTab', data: { action: 'settingsChanged' } });
  return normalized;
}

function bindForumColorControls(panel) {
  const setControlValue = (key, value) => {
    panel.querySelectorAll(`[data-color-key="${key}"]`).forEach(input => { input.value = value; });
  };

  const handleColorChange = async (key, value) => {
    if (!/^#[0-9a-f]{6}$/i.test(value)) return;
    const colors = { ...getForumCustomColors(), [key]: value.toLowerCase() };
    setControlValue(key, colors[key]);
    await saveForumCustomColors(colors);
  };

  panel.querySelectorAll('.forum-color-picker').forEach(input => {
    input.addEventListener('input', async e => {
      await handleColorChange(e.target.dataset.colorKey, e.target.value);
    });
  });

  panel.querySelectorAll('.forum-color-hex').forEach(input => {
    input.addEventListener('change', async e => {
      await handleColorChange(e.target.dataset.colorKey, e.target.value.trim());
    });
  });

  panel.querySelector('#forum-theme-save-colors')?.addEventListener('click', async () => {
    const colors = {};
    panel.querySelectorAll('.forum-color-hex').forEach(input => {
      colors[input.dataset.colorKey] = input.value.trim();
    });
    try {
      const normalized = validateForumCustomColors(colors);
      await saveForumCustomColors(normalized);
      showToast('Forum theme saved.', 'success');
    } catch (err) {
      showToast('Theme save failed: ' + err.message, 'error');
    }
  });

  panel.querySelector('#forum-theme-reset-colors')?.addEventListener('click', async () => {
    if (!await confirmDialog('Reset custom forum colors to the default Bitcointalk theme?')) return;
    const normalized = normalizeForumCustomColors(DEFAULT_FORUM_CUSTOM_COLORS);
    settings = {
      ...settings,
      forumTheme: 'original',
      darkMode: false,
      forumCustomColors: normalized,
      enabledModules: (settings.enabledModules || []).filter(id => id !== 'darkMode'),
    };
    await storageSet({ [FORUM_THEME_STORAGE_KEY]: 'original' });
    await saveSettings(settings);
    applyBitcointalkForumTheme(settings);
    updateThemeToggleButton();
    chrome.runtime.sendMessage({ action: 'relayToTab', data: { action: 'settingsChanged' } });
    Object.entries(normalized).forEach(([key, value]) => setControlValue(key, value));
    showToast('Forum theme reset.', 'success');
  });

  panel.querySelector('#forum-theme-export-colors')?.addEventListener('click', () => {
    const json = JSON.stringify(getForumCustomColors(), null, 2);
    downloadFile('forum-theme.json', json, 'application/json');
    copyToClipboard(json).then(ok => {
      showToast(ok ? 'Forum theme exported and copied.' : 'Forum theme exported.', 'success');
    });
  });

  panel.querySelector('#forum-theme-import-colors')?.addEventListener('click', () => {
    const content = document.createElement('div');
    content.innerHTML = `
      <p style="font-size:12px;color:var(--text-secondary,#9ca3af);margin-top:0">Paste exported forum-theme.json below.</p>
      <textarea id="forum-theme-import-json" rows="12" style="width:100%;box-sizing:border-box;padding:8px;border-radius:6px;border:1px solid var(--border,#374151);background:var(--bg-input,#1e2025);color:var(--text,#e5e7eb);font-family:monospace;font-size:12px"></textarea>
    `;
    const modal = showModal({
      title: 'Import Forum Theme JSON',
      content,
      width: '720px',
      actions: [
        { label: 'Cancel', type: 'secondary', onClick: () => {} },
        { label: 'Import Theme', type: 'primary', onClick: async () => {
          try {
            const parsed = JSON.parse(content.querySelector('#forum-theme-import-json').value || '{}');
            const normalized = validateForumCustomColors(parsed.colors || parsed);
            await saveForumCustomColors(normalized);
            Object.entries(normalized).forEach(([key, value]) => setControlValue(key, value));
            showToast('Forum theme imported.', 'success');
            modal.close();
          } catch (err) {
            showToast('Import failed: ' + err.message, 'error');
          }
        }},
      ],
    });
  });
}

function renderSettings() {
  const panel = document.getElementById('settings-panel');
  const forumCustomColors = getForumCustomColors();
  panel.innerHTML = `
    <div class="settings-group">
      <h4>Appearance</h4>
      <div class="settings-row">
        <span>
          Toolkit Theme
          <small style="display:block;color:var(--text-secondary);font-size:11px;margin-top:2px">Applies to the toolkit dashboard, popup, settings page, Posting Studio, scraper, tools, panels, and extension-created UI.</small>
        </span>
        <select id="toolkit-theme-select" class="form-select">
          ${themeSelectOptionsHtml(settings.toolkitTheme)}
        </select>
      </div>
      <div class="settings-row">
        <span>
          Forum Theme
          <small style="display:block;color:var(--text-secondary);font-size:11px;margin-top:2px">Applies only to Bitcointalk.org page styling. Choose Original Bitcointalk to keep the forum unchanged.</small>
        </span>
        <select id="forum-theme-select" class="form-select">
          ${forumThemeSelectOptionsHtml(settings.forumTheme)}
        </select>
      </div>
    </div>

    <div class="settings-group">
      <h4>Forum Theme</h4>
      <p style="font-size:12px;color:var(--text-secondary);margin:0 0 12px">
        Customize Bitcointalk forum colors with RGB/HEX color selectors. Changing any color switches the Forum Theme dropdown to Custom Forum Theme and applies immediately.
      </p>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">
        <button id="forum-theme-save-colors" class="btt-btn btt-btn-sm btt-btn-primary">Save Theme</button>
        <button id="forum-theme-reset-colors" class="btt-btn btt-btn-sm btt-btn-secondary">Reset to Default Bitcointalk Theme</button>
        <button id="forum-theme-export-colors" class="btt-btn btt-btn-sm btt-btn-secondary">Export Theme JSON</button>
        <button id="forum-theme-import-colors" class="btt-btn btt-btn-sm btt-btn-secondary">Import Theme JSON</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${buildForumColorControls(forumCustomColors)}
      </div>
    </div>

    <div class="settings-group">
      <h4>Data Management</h4>
      <div class="settings-row">
        <span>Export all settings & data</span>
        <button id="btn-export" class="btt-btn btt-btn-sm btt-btn-secondary">Export JSON</button>
      </div>
      <div class="settings-row">
        <span>Import settings from file</span>
        <div style="display:flex;gap:6px">
          <input type="file" id="import-file" accept=".json" style="display:none">
          <button id="btn-import" class="btt-btn btt-btn-sm btt-btn-secondary">Import JSON</button>
        </div>
      </div>
      <div class="settings-row">
        <span>Reset all settings to defaults</span>
        <button id="btn-reset" class="btt-btn btt-btn-sm btt-btn-danger">Reset All</button>
      </div>
    </div>

    <div class="settings-group">
      <h4>Privacy & Permissions</h4>
      <p style="font-size:12px;color:var(--text-secondary)">
        This extension stores all data locally using <code>chrome.storage.local</code>. No data is sent to any external server. The Thread Scraper only fetches publicly accessible Bitcointalk pages using your existing browser session.
      </p>
      <p style="font-size:12px;color:var(--text-secondary);margin-top:8px">
        <strong>Permissions used:</strong> storage, activeTab, scripting, clipboardWrite, host access to bitcointalk.org.
      </p>
    </div>

    <div class="settings-group">
      <h4>About</h4>
      <p style="font-size:12px;color:var(--text-secondary)">Bitcointalk All-in-One Toolkit v1.0.0</p>
      <p style="font-size:12px;color:var(--text-secondary)">Built for Bitcointalk.org users. Open source. No tracking.</p>
    </div>
  `;

  panel.querySelector('#toolkit-theme-select').addEventListener('change', async e => {
    await applyToolkitThemeChoice(e.target.value, true);
  });

  panel.querySelector('#forum-theme-select').addEventListener('change', async e => {
    await applyForumThemeChoice(e.target.value, true);
  });

  bindForumColorControls(panel);

  panel.querySelector('#btn-export').addEventListener('click', async () => {
    const json = await exportSettings();
    downloadFile('btt-settings-backup.json', json, 'application/json');
    showToast('Settings exported.', 'success');
  });

  panel.querySelector('#btn-import').addEventListener('click', () => {
    panel.querySelector('#import-file').click();
  });

  panel.querySelector('#import-file').addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    try {
      settings = await importSettings(text);
      await storageSet({
        [TOOLKIT_THEME_STORAGE_KEY]: settings.toolkitTheme,
        [FORUM_THEME_STORAGE_KEY]: settings.forumTheme,
      });
      applyThemeFromSettings(settings);
      updateThemeToggleButton();
      showToast('Settings imported. Reload the extension for all changes to take effect.', 'success', 5000);
    } catch (err) {
      showToast('Import failed: ' + err.message, 'error');
    }
    e.target.value = '';
  });

  panel.querySelector('#btn-reset').addEventListener('click', async () => {
    if (await confirmDialog('Reset all settings to defaults? This cannot be undone.')) {
      const { resetSettings } = await import('../utils/storage.js');
      settings = await resetSettings();
      await storageSet({
        [TOOLKIT_THEME_STORAGE_KEY]: settings.toolkitTheme,
        [FORUM_THEME_STORAGE_KEY]: settings.forumTheme,
      });
      applyThemeFromSettings(settings);
      updateThemeToggleButton();
      rendered.clear();
      showToast('Settings reset to defaults.', 'success');
    }
  });
}

// â”€â”€ Global search â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

document.getElementById('global-search').addEventListener('input', e => {
  const query = e.target.value.trim().toLowerCase();
  if (!query) {
    document.getElementById('section-search').style.display = 'none';
    navigate(getCurrentSection());
    return;
  }

  // Show search results section
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById('main-content')?.classList.remove('studio-active');
  const searchSection = document.getElementById('section-search');
  searchSection.style.display = '';
  searchSection.classList.add('active');

  const results = MODULE_DEFS.filter(m =>
    m.name.toLowerCase().includes(query) || m.description.toLowerCase().includes(query) || m.category.toLowerCase().includes(query)
  );

  const grid = document.getElementById('search-results');
  grid.innerHTML = '';
  if (!results.length) {
    grid.innerHTML = '<p style="color:var(--text-secondary)">No tools found.</p>';
    return;
  }
  results.forEach(mod => {
    grid.appendChild(createToolCard(mod, isToolEnabled(mod)));
  });
});

function getCurrentSection() {
  const active = document.querySelector('.nav-item.active');
  return active?.dataset.section || 'home';
}

// â”€â”€ Theme toggle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function updateThemeToggleButton() {
  const button = document.getElementById('btn-theme-toggle');
  const forumIsDark = settings.forumTheme === 'dark';
  if (button) {
    button.textContent = forumIsDark ? 'Original' : 'Dark Forum';
    button.title = forumIsDark ? 'Restore Original Bitcointalk forum theme' : 'Switch forum to Dark Mode';
  }
  document.querySelectorAll('#toolkit-theme-select, #toolkit-theme-top-select').forEach(select => {
    if (!select.innerHTML.trim()) select.innerHTML = themeSelectOptionsHtml(settings.toolkitTheme);
    select.value = settings.toolkitTheme;
  });
  document.querySelectorAll('#forum-theme-select, #forum-theme-top-select').forEach(select => {
    if (!select.innerHTML.trim()) select.innerHTML = forumThemeSelectOptionsHtml(settings.forumTheme);
    select.value = settings.forumTheme;
  });
  document.querySelectorAll('.btt-tool-card[data-module-id="darkMode"]').forEach(card => {
    const enabled = isToolEnabled({ id: 'darkMode' });
    const input = card.querySelector('input[type="checkbox"]');
    if (input) input.checked = enabled;
    card.classList.toggle('disabled', !enabled);
  });
}

async function applyToolkitThemeChoice(theme, showNotice = false) {
  settings = { ...settings, toolkitTheme: theme, theme, dashboardDarkMode: theme !== 'light' };
  await storageSet({ [TOOLKIT_THEME_STORAGE_KEY]: theme });
  await saveSettings(settings);
  applyThemeFromSettings(settings);
  updateThemeToggleButton();
  chrome.runtime.sendMessage({ action: 'relayToTab', data: { action: 'settingsChanged' } });
  if (showNotice) showToast('Toolkit theme updated.', 'success');
}

async function applyForumThemeChoice(theme, showNotice = false) {
  const currentModules = settings.enabledModules || [];
  const enabledModules = theme === 'dark'
    ? [...new Set([...currentModules, 'darkMode'])]
    : currentModules.filter(id => id !== 'darkMode');
  settings = { ...settings, forumTheme: theme, darkMode: theme === 'dark', enabledModules };
  await storageSet({ [FORUM_THEME_STORAGE_KEY]: theme });
  await saveSettings(settings);
  updateThemeToggleButton();
  chrome.runtime.sendMessage({ action: 'relayToTab', data: { action: 'settingsChanged' } });
  if (showNotice) showToast('Forum theme updated.', 'success');
}

document.getElementById('btn-theme-toggle').addEventListener('click', async () => {
  const nextTheme = settings.forumTheme === 'dark' ? 'original' : 'dark';
  await applyForumThemeChoice(nextTheme);
});

document.getElementById('toolkit-theme-top-select').addEventListener('change', async e => {
  await applyToolkitThemeChoice(e.target.value, true);
});

document.getElementById('forum-theme-top-select').addEventListener('change', async e => {
  await applyForumThemeChoice(e.target.value, true);
});

// â”€â”€ Sidebar toggle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

document.getElementById('sidebar-toggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('collapsed');
});

// â”€â”€ Nav item clicks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

document.querySelectorAll('.nav-item, .mobile-nav-btn').forEach(item => {
  item.addEventListener('click', () => navigate(item.dataset.section));
});

// â”€â”€ Handle URL hash for direct links â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function handleHash() {
  const hash = location.hash.slice(1);
  if (hash) navigate(hash);
}

// â”€â”€ Init â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function init() {
  settings = await getSettings();
  settings.toolkitTheme = settings.toolkitTheme || settings.theme || 'dark';
  settings.forumTheme = settings.forumTheme || 'original';
  settings.theme = settings.toolkitTheme;
  applyThemeFromSettings(settings);
  updateThemeToggleButton();

  // Migration: remove deleted module IDs from saved enabledModules so they
  // don't appear as phantom entries in the module list.
  const removedIds = [
    'threadScraper', 'campaignHelper', 'slotExtractor',
    'bbcodeStudio', 'tableMaker', 'scamReportBuilder', 'escrowTemplate',
    'giveawayPicker', 'reputationCard', 'multiQuoteBasket',
    'threadBookmarks', 'postBackupExporter',
  ];
  const currentEnabled = settings.enabledModules || [];
  const cleaned = currentEnabled.filter(id => !removedIds.includes(id));
  if (cleaned.length !== currentEnabled.length) {
    settings = await updateSetting('enabledModules', cleaned);
    chrome.runtime.sendMessage({ action: 'relayToTab', data: { action: 'settingsChanged' } });
  }

  navigate('home');
  handleHash();
  window.addEventListener('hashchange', handleHash);
}

init();
