import { DEFAULT_FORUM_CUSTOM_COLORS, FORUM_THEME_OPTIONS, THEME_DEFS, THEME_OPTIONS } from './constants.js';

const DEFAULT_THEME_ID = 'dark';
const FORUM_THEME_STYLE_ID = 'btt-forum-theme-style';

const CSS_VAR_MAP = {
  bg: '--btt-bg',
  surface: '--btt-surface',
  surface2: '--btt-surface-2',
  text: '--btt-text',
  mutedText: '--btt-muted-text',
  border: '--btt-border',
  primary: '--btt-primary',
  primaryHover: '--btt-primary-hover',
  accent: '--btt-accent',
  success: '--btt-success',
  warning: '--btt-warning',
  danger: '--btt-danger',
  link: '--btt-link',
  inputBg: '--btt-input-bg',
  buttonBg: '--btt-button-bg',
  buttonText: '--btt-button-text',
  previewBg: '--btt-preview-bg',
  previewText: '--btt-preview-text',
};

const UI_CSS_VAR_MAP = {
  bg: '--btt-ui-bg',
  surface: '--btt-ui-surface',
  surface2: '--btt-ui-surface-2',
  text: '--btt-ui-text',
  mutedText: '--btt-ui-muted-text',
  border: '--btt-ui-border',
  primary: '--btt-ui-primary',
  primaryHover: '--btt-ui-primary-hover',
  accent: '--btt-ui-accent',
  success: '--btt-ui-success',
  warning: '--btt-ui-warning',
  danger: '--btt-ui-danger',
  link: '--btt-ui-link',
  inputBg: '--btt-ui-input-bg',
  buttonBg: '--btt-ui-button-bg',
  buttonText: '--btt-ui-button-text',
  previewBg: '--btt-ui-preview-bg',
  previewText: '--btt-ui-preview-text',
};

const FORUM_CSS_VAR_MAP = Object.fromEntries(
  Object.entries(CSS_VAR_MAP).map(([key, variable]) => [key, variable.replace('--btt-', '--btt-forum-')])
);

export const FORUM_COLOR_GROUPS = [
  {
    label: 'General Forum Colors',
    fields: [
      ['pageBg', 'Page Background Color'],
      ['cardBg', 'Forum/Card Background Color'],
      ['text', 'Main Text Color'],
      ['mutedText', 'Muted/Secondary Text Color'],
      ['border', 'Border Color'],
      ['divider', 'Divider Color'],
    ],
  },
  {
    label: 'Link Colors',
    fields: [
      ['link', 'Link Color'],
      ['linkVisited', 'Visited Link Color'],
      ['linkHover', 'Link Hover Color'],
      ['linkActive', 'Active Link Color'],
    ],
  },
  {
    label: 'Header / Table Colors',
    fields: [
      ['categoryHeaderBg', 'Category Header Background'],
      ['categoryHeaderText', 'Category Header Text'],
      ['boardHeaderBg', 'Board Header Background'],
      ['boardHeaderText', 'Board Header Text'],
      ['tableHeaderBg', 'Table Header Background'],
      ['tableHeaderText', 'Table Header Text'],
    ],
  },
  {
    label: 'Post Colors',
    fields: [
      ['postBg', 'Post Background Color'],
      ['postAltBg', 'Alternate Post Background Color'],
      ['postTitle', 'Post Title Color'],
      ['postMeta', 'Post Meta Text Color'],
      ['signatureText', 'Signature Text Color'],
    ],
  },
  {
    label: 'Quote / Code Colors',
    fields: [
      ['quoteBg', 'Quote Box Background'],
      ['quoteText', 'Quote Box Text Color'],
      ['quoteBorder', 'Quote Box Border Color'],
      ['codeBg', 'Code Box Background'],
      ['codeText', 'Code Text Color'],
      ['codeBorder', 'Code Box Border Color'],
    ],
  },
  {
    label: 'Button / Input Colors',
    fields: [
      ['buttonBg', 'Button Background Color'],
      ['buttonText', 'Button Text Color'],
      ['buttonHoverBg', 'Button Hover Background'],
      ['inputBg', 'Input Background Color'],
      ['inputText', 'Input Text Color'],
      ['inputBorder', 'Input Border Color'],
    ],
  },
  {
    label: 'Status / Highlight Colors',
    fields: [
      ['selectedBg', 'Selected Text Background'],
      ['selectedText', 'Selected Text Color'],
      ['newPostHighlight', 'New Post Highlight Color'],
      ['warning', 'Warning Color'],
      ['success', 'Success Color'],
      ['danger', 'Error/Danger Color'],
      ['info', 'Info Color'],
    ],
  },
  {
    label: 'Bitcointalk Toolkit Specific Colors',
    fields: [
      ['merit', 'Merit Color'],
      ['trustPositive', 'Positive Trust Color'],
      ['trustNeutral', 'Neutral Trust Color'],
      ['trustNegative', 'Negative Trust Color'],
      ['dtBadge', 'DT Badge Color'],
      ['dt1Badge', 'DT1 Badge Color'],
      ['dt2Badge', 'DT2 Badge Color'],
      ['notificationBadge', 'Notification Badge Color'],
      ['tooltipBg', 'Tooltip Background'],
      ['tooltipText', 'Tooltip Text Color'],
    ],
  },
];

export const FORUM_SKIN_PRESETS = [
  {
    id: 'original',
    name: 'Default Bitcointalk',
    colors: { ...DEFAULT_FORUM_CUSTOM_COLORS },
    forumTheme: 'original',
  },
  {
    id: 'classic-light',
    name: 'Classic Light',
    colors: {
      ...DEFAULT_FORUM_CUSTOM_COLORS,
      pageBg: '#f3f4f6',
      cardBg: '#ffffff',
      text: '#111827',
      mutedText: '#6b7280',
      link: '#1d4ed8',
      linkVisited: '#6d28d9',
      linkHover: '#b45309',
      categoryHeaderBg: '#e5e7eb',
      boardHeaderBg: '#eef2f7',
      tableHeaderBg: '#f9fafb',
      postBg: '#ffffff',
      postAltBg: '#f8fafc',
      buttonBg: '#e5e7eb',
      buttonHoverBg: '#d1d5db',
    },
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    colors: {
      ...DEFAULT_FORUM_CUSTOM_COLORS,
      pageBg: '#0f1117',
      cardBg: '#1a1d23',
      text: '#e5e7eb',
      mutedText: '#9ca3af',
      border: '#2d3340',
      divider: '#374151',
      link: '#60a5fa',
      linkVisited: '#a78bfa',
      linkHover: '#fbbf24',
      categoryHeaderBg: '#111827',
      categoryHeaderText: '#f9fafb',
      boardHeaderBg: '#1f2937',
      boardHeaderText: '#f9fafb',
      tableHeaderBg: '#111827',
      tableHeaderText: '#f9fafb',
      postBg: '#1a1d23',
      postAltBg: '#20242c',
      postTitle: '#f3f4f6',
      postMeta: '#9ca3af',
      signatureText: '#9ca3af',
      quoteBg: '#111827',
      quoteText: '#e5e7eb',
      quoteBorder: '#374151',
      codeBg: '#0b1020',
      codeText: '#e5e7eb',
      codeBorder: '#374151',
      buttonBg: '#252a35',
      buttonText: '#ffffff',
      buttonHoverBg: '#374151',
      inputBg: '#111827',
      inputText: '#f9fafb',
      inputBorder: '#374151',
      selectedBg: '#1d4ed8',
      selectedText: '#ffffff',
    },
  },
  {
    id: 'amoled',
    name: 'AMOLED Black',
    colors: {
      ...DEFAULT_FORUM_CUSTOM_COLORS,
      pageBg: '#000000',
      cardBg: '#050505',
      text: '#f5f5f5',
      mutedText: '#b8b8b8',
      border: '#2a2a2a',
      divider: '#242424',
      link: '#4da3ff',
      linkVisited: '#b48cff',
      linkHover: '#f7931a',
      categoryHeaderBg: '#000000',
      categoryHeaderText: '#ffffff',
      boardHeaderBg: '#0a0a0a',
      boardHeaderText: '#ffffff',
      tableHeaderBg: '#050505',
      tableHeaderText: '#ffffff',
      postBg: '#000000',
      postAltBg: '#090909',
      postTitle: '#ffffff',
      postMeta: '#b8b8b8',
      signatureText: '#a0a0a0',
      quoteBg: '#080808',
      quoteText: '#eeeeee',
      quoteBorder: '#303030',
      codeBg: '#050505',
      codeText: '#f0f0f0',
      codeBorder: '#303030',
      buttonBg: '#111111',
      buttonText: '#ffffff',
      buttonHoverBg: '#242424',
      inputBg: '#050505',
      inputText: '#ffffff',
      inputBorder: '#333333',
    },
  },
  {
    id: 'sepia',
    name: 'Sepia Reading',
    colors: {
      ...DEFAULT_FORUM_CUSTOM_COLORS,
      pageBg: '#f4ecd8',
      cardBg: '#fbf4e3',
      text: '#33291c',
      mutedText: '#7a6548',
      border: '#d2bd94',
      divider: '#decba5',
      link: '#6b4e16',
      linkVisited: '#7c4a1e',
      linkHover: '#b7791f',
      categoryHeaderBg: '#d8c49a',
      categoryHeaderText: '#2f2518',
      boardHeaderBg: '#ead9b8',
      boardHeaderText: '#2f2518',
      tableHeaderBg: '#f0e1c3',
      tableHeaderText: '#2f2518',
      postBg: '#fffaf0',
      postAltBg: '#f7edda',
      quoteBg: '#efe2c6',
      codeBg: '#ead9b8',
      buttonBg: '#ead9b8',
      buttonHoverBg: '#decba5',
      inputBg: '#fffaf0',
    },
  },
  {
    id: 'soft-blue',
    name: 'Soft Blue',
    colors: {
      ...DEFAULT_FORUM_CUSTOM_COLORS,
      pageBg: '#eef6ff',
      cardBg: '#f8fbff',
      text: '#172033',
      mutedText: '#5d708c',
      border: '#bfd5ee',
      divider: '#d6e7f8',
      link: '#1f65c1',
      linkVisited: '#5f4bb6',
      linkHover: '#0f766e',
      categoryHeaderBg: '#cfe4ff',
      categoryHeaderText: '#172033',
      boardHeaderBg: '#dbeafe',
      boardHeaderText: '#172033',
      tableHeaderBg: '#eaf4ff',
      tableHeaderText: '#172033',
      postBg: '#ffffff',
      postAltBg: '#f1f7ff',
      quoteBg: '#eaf4ff',
      codeBg: '#e8f1ff',
      buttonBg: '#dbeafe',
      buttonHoverBg: '#bfdbfe',
      inputBg: '#ffffff',
    },
  },
  {
    id: 'green-terminal',
    name: 'Green Terminal',
    colors: {
      ...DEFAULT_FORUM_CUSTOM_COLORS,
      pageBg: '#031006',
      cardBg: '#071a0b',
      text: '#d5ffd9',
      mutedText: '#85c98e',
      border: '#1f5e2c',
      divider: '#174722',
      link: '#70ff88',
      linkVisited: '#53d86a',
      linkHover: '#baffc4',
      categoryHeaderBg: '#06270e',
      categoryHeaderText: '#d5ffd9',
      boardHeaderBg: '#0a3313',
      boardHeaderText: '#d5ffd9',
      tableHeaderBg: '#071a0b',
      tableHeaderText: '#d5ffd9',
      postBg: '#061607',
      postAltBg: '#091f0d',
      postTitle: '#d5ffd9',
      postMeta: '#85c98e',
      signatureText: '#76b982',
      quoteBg: '#031006',
      quoteText: '#d5ffd9',
      quoteBorder: '#1f5e2c',
      codeBg: '#000000',
      codeText: '#7cff8d',
      codeBorder: '#1f5e2c',
      buttonBg: '#0a3313',
      buttonText: '#d5ffd9',
      buttonHoverBg: '#145222',
      inputBg: '#031006',
      inputText: '#d5ffd9',
      inputBorder: '#1f5e2c',
      selectedBg: '#1f5e2c',
      selectedText: '#ffffff',
      success: '#70ff88',
      info: '#53d86a',
    },
  },
  {
    id: 'bitcoin',
    name: 'Bitcoin Orange',
    colors: {
      ...DEFAULT_FORUM_CUSTOM_COLORS,
      pageBg: '#17120b',
      cardBg: '#24180d',
      text: '#fff7ed',
      mutedText: '#f1c38a',
      border: '#5b3414',
      divider: '#704616',
      link: '#fbbf24',
      linkVisited: '#fdba74',
      linkHover: '#ffad3b',
      categoryHeaderBg: '#3a2410',
      categoryHeaderText: '#fff7ed',
      boardHeaderBg: '#4a2c10',
      boardHeaderText: '#fff7ed',
      tableHeaderBg: '#302012',
      tableHeaderText: '#fff7ed',
      postBg: '#24180d',
      postAltBg: '#302012',
      postTitle: '#fff7ed',
      postMeta: '#f1c38a',
      signatureText: '#e2b978',
      quoteBg: '#1f160c',
      quoteText: '#fff7ed',
      quoteBorder: '#5b3414',
      codeBg: '#1b1209',
      codeText: '#fff7ed',
      codeBorder: '#5b3414',
      buttonBg: '#3a2410',
      buttonText: '#fff7ed',
      buttonHoverBg: '#5b3414',
      inputBg: '#1f160c',
      inputText: '#fff7ed',
      inputBorder: '#5b3414',
      selectedBg: '#f7931a',
      selectedText: '#111111',
      merit: '#facc15',
    },
  },
  {
    id: 'gray-compact',
    name: 'Gray Compact',
    colors: {
      ...DEFAULT_FORUM_CUSTOM_COLORS,
      pageBg: '#d8dbe2',
      cardBg: '#eef0f4',
      text: '#1f2937',
      mutedText: '#4b5563',
      border: '#aeb5c1',
      divider: '#c8cdd6',
      link: '#1f5d9d',
      linkVisited: '#5b4a91',
      linkHover: '#9a5b18',
      categoryHeaderBg: '#bfc5cf',
      categoryHeaderText: '#1f2937',
      boardHeaderBg: '#d4d8df',
      boardHeaderText: '#1f2937',
      tableHeaderBg: '#e5e7eb',
      tableHeaderText: '#1f2937',
      postBg: '#f4f5f7',
      postAltBg: '#e9edf2',
      quoteBg: '#e5e7eb',
      codeBg: '#dde2e8',
      buttonBg: '#d1d5db',
      buttonHoverBg: '#bfc5cf',
    },
  },
];

const FORUM_CUSTOM_CSS_VAR_MAP = {
  pageBg: '--btt-page-bg',
  cardBg: '--btt-card-bg',
  text: '--btt-text',
  mutedText: '--btt-muted-text',
  border: '--btt-border',
  divider: '--btt-divider',
  link: '--btt-link',
  linkVisited: '--btt-link-visited',
  linkHover: '--btt-link-hover',
  linkActive: '--btt-link-active',
  categoryHeaderBg: '--btt-category-header-bg',
  categoryHeaderText: '--btt-category-header-text',
  boardHeaderBg: '--btt-board-header-bg',
  boardHeaderText: '--btt-board-header-text',
  tableHeaderBg: '--btt-table-header-bg',
  tableHeaderText: '--btt-table-header-text',
  postBg: '--btt-post-bg',
  postAltBg: '--btt-post-alt-bg',
  postTitle: '--btt-post-title',
  postMeta: '--btt-post-meta',
  signatureText: '--btt-signature-text',
  quoteBg: '--btt-quote-bg',
  quoteText: '--btt-quote-text',
  quoteBorder: '--btt-quote-border',
  codeBg: '--btt-code-bg',
  codeText: '--btt-code-text',
  codeBorder: '--btt-code-border',
  buttonBg: '--btt-button-bg',
  buttonText: '--btt-button-text',
  buttonHoverBg: '--btt-button-hover-bg',
  inputBg: '--btt-input-bg',
  inputText: '--btt-input-text',
  inputBorder: '--btt-input-border',
  selectedBg: '--btt-selected-bg',
  selectedText: '--btt-selected-text',
  newPostHighlight: '--btt-new-post-highlight',
  warning: '--btt-warning',
  success: '--btt-success',
  danger: '--btt-danger',
  info: '--btt-info',
  merit: '--btt-merit',
  trustPositive: '--btt-trust-positive',
  trustNeutral: '--btt-trust-neutral',
  trustNegative: '--btt-trust-negative',
  dtBadge: '--btt-dt-badge',
  dt1Badge: '--btt-dt1-badge',
  dt2Badge: '--btt-dt2-badge',
  notificationBadge: '--btt-notification-badge',
  tooltipBg: '--btt-tooltip-bg',
  tooltipText: '--btt-tooltip-text',
};

const FORUM_CUSTOM_ALIASES = {
  '--btt-forum-bg': '--btt-page-bg',
  '--btt-forum-surface': '--btt-card-bg',
  '--btt-forum-surface-2': '--btt-post-alt-bg',
  '--btt-forum-text': '--btt-text',
  '--btt-forum-muted-text': '--btt-muted-text',
  '--btt-forum-border': '--btt-border',
  '--btt-forum-link': '--btt-link',
  '--btt-forum-primary': '--btt-link',
  '--btt-forum-input-bg': '--btt-input-bg',
  '--btt-forum-button-bg': '--btt-button-bg',
  '--btt-forum-button-text': '--btt-button-text',
};

const HEX_RE = /^#[0-9a-f]{6}$/i;

const LEGACY_ALIASES = {
  '--bg': '--btt-bg',
  '--bg-panel': '--btt-surface',
  '--bg-card': '--btt-surface-2',
  '--bg-input': '--btt-input-bg',
  '--border': '--btt-border',
  '--text': '--btt-text',
  '--text-secondary': '--btt-muted-text',
  '--accent': '--btt-primary',
  '--accent-2': '--btt-accent',
  '--success': '--btt-success',
  '--danger': '--btt-danger',
  '--warning': '--btt-warning',
};

function setThemeVariables(values, map, root) {
  Object.entries(map).forEach(([key, variable]) => {
    root.style.setProperty(variable, values[key]);
  });
}

export function normalizeForumCustomColors(colors = {}) {
  const normalized = { ...DEFAULT_FORUM_CUSTOM_COLORS };
  Object.keys(DEFAULT_FORUM_CUSTOM_COLORS).forEach((key) => {
    const value = String(colors?.[key] || '').trim();
    if (HEX_RE.test(value)) normalized[key] = value.toLowerCase();
  });
  return normalized;
}

export function validateForumCustomColors(colors) {
  if (!colors || typeof colors !== 'object' || Array.isArray(colors)) {
    throw new Error('Theme JSON must be an object.');
  }
  Object.keys(colors).forEach((key) => {
    if (!(key in DEFAULT_FORUM_CUSTOM_COLORS)) return;
    if (!HEX_RE.test(String(colors[key]).trim())) {
      throw new Error(`Invalid color for ${key}. Use #rrggbb format.`);
    }
  });
  return normalizeForumCustomColors(colors);
}

function applyForumCustomVariables(colors, root) {
  const values = normalizeForumCustomColors(colors);
  setThemeVariables(values, FORUM_CUSTOM_CSS_VAR_MAP, root);
  Object.entries(FORUM_CUSTOM_ALIASES).forEach(([alias, variable]) => {
    root.style.setProperty(alias, `var(${variable})`);
  });
  return values;
}

export function resolveThemeId(themeId) {
  return THEME_DEFS[themeId] ? themeId : DEFAULT_THEME_ID;
}

export function resolveForumThemeId(themeId) {
  if (themeId === 'original') return 'original';
  if (themeId === 'custom') return 'custom';
  return resolveThemeId(themeId);
}

export function getThemeOptions() {
  return THEME_OPTIONS;
}

export function getForumThemeOptions() {
  return FORUM_THEME_OPTIONS;
}

export function getTheme(themeId) {
  const id = resolveThemeId(themeId);
  return { id, ...THEME_DEFS[id] };
}

export function applyTheme(themeId, root = document.documentElement) {
  if (!root) return getTheme(themeId);
  const theme = getTheme(themeId);
  const { values } = theme;

  const lightish = ['light', 'forum-gray', 'soft-blue', 'sepia'].includes(theme.id);
  root.dataset.bttTheme = theme.id;
  root.dataset.theme = lightish ? 'light' : 'dark';
  root.classList.toggle('btt-theme-lightish', lightish);
  root.classList.toggle('btt-theme-high-contrast', theme.id === 'high-contrast');

  setThemeVariables(values, CSS_VAR_MAP, root);
  setThemeVariables(values, UI_CSS_VAR_MAP, root);
  Object.entries(LEGACY_ALIASES).forEach(([alias, variable]) => {
    root.style.setProperty(alias, `var(${variable})`);
  });

  return theme;
}

export function applyThemeFromSettings(settings, root = document.documentElement) {
  const legacyTheme = settings?.dashboardDarkMode === false ? 'light' : 'dark';
  return applyTheme(settings?.toolkitTheme || settings?.theme || legacyTheme, root);
}

function ensureForumThemeStyle() {
  if (document.getElementById(FORUM_THEME_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = FORUM_THEME_STYLE_ID;
  style.textContent = `
html.btt-forum-theme body,
html.btt-forum-theme #bodyarea,
html.btt-forum-theme #top_section,
html.btt-forum-theme #middle_section,
html.btt-forum-theme #bot_section,
html.btt-forum-theme #footerarea,
html.btt-forum-theme .windowbg,
html.btt-forum-theme .windowbg2,
html.btt-forum-theme .windowbg3,
html.btt-forum-theme .approvebg,
html.btt-forum-theme .approvebg2 {
  background: var(--btt-forum-bg) !important;
  color: var(--btt-forum-text) !important;
}

html.btt-forum-theme table,
html.btt-forum-theme td,
html.btt-forum-theme th,
html.btt-forum-theme .tborder,
html.btt-forum-theme .bordercolor {
  border-color: var(--btt-forum-border) !important;
  color: var(--btt-forum-text) !important;
}

html.btt-forum-theme td.windowbg,
html.btt-forum-theme td.windowbg2,
html.btt-forum-theme td.windowbg3,
html.btt-forum-theme tr.windowbg td,
html.btt-forum-theme tr.windowbg2 td,
html.btt-forum-theme .post,
html.btt-forum-theme .post_wrapper,
html.btt-forum-theme .poster_info {
  background: var(--btt-forum-surface) !important;
  color: var(--btt-forum-text) !important;
  border-color: var(--btt-forum-border) !important;
}

html.btt-forum-theme .catbg,
html.btt-forum-theme .catbg2,
html.btt-forum-theme .cat_bg,
html.btt-forum-theme .cat_bar,
html.btt-forum-theme .titlebg,
html.btt-forum-theme .titlebg2,
html.btt-forum-theme .maintab_first,
html.btt-forum-theme .maintab_back,
html.btt-forum-theme .maintab_last,
html.btt-forum-theme .mirrortab_first,
html.btt-forum-theme .mirrortab_back,
html.btt-forum-theme .mirrortab_last,
html.btt-forum-theme #menu_main,
html.btt-forum-theme #menu_main td {
  background: var(--btt-forum-surface-2) !important;
  color: var(--btt-forum-text) !important;
  border-color: var(--btt-forum-border) !important;
}

html.btt-forum-theme a,
html.btt-forum-theme a:link,
html.btt-forum-theme .nav {
  color: var(--btt-forum-link) !important;
}

html.btt-forum-theme a:visited {
  color: color-mix(in srgb, var(--btt-forum-link) 72%, var(--btt-forum-muted-text)) !important;
}

html.btt-forum-theme input,
html.btt-forum-theme textarea,
html.btt-forum-theme select,
html.btt-forum-theme button {
  background: var(--btt-forum-input-bg) !important;
  color: var(--btt-forum-text) !important;
  border-color: var(--btt-forum-border) !important;
}

html.btt-forum-theme input[type="button"],
html.btt-forum-theme input[type="submit"],
html.btt-forum-theme button {
  background: var(--btt-forum-button-bg) !important;
  color: var(--btt-forum-button-text) !important;
}

html.btt-forum-theme blockquote,
html.btt-forum-theme .quote,
html.btt-forum-theme .code,
html.btt-forum-theme pre {
  background: var(--btt-forum-surface-2) !important;
  color: var(--btt-forum-text) !important;
  border-color: var(--btt-forum-border) !important;
}

html.btt-forum-theme .quoteheader,
html.btt-forum-theme .codeheader,
html.btt-forum-theme .smalltext,
html.btt-forum-theme .middletext {
  color: var(--btt-forum-muted-text) !important;
}

html.btt-forum-theme .subject,
html.btt-forum-theme .subject a {
  color: var(--btt-forum-primary) !important;
}

html.btt-forum-theme hr,
html.btt-forum-theme .hrcolor {
  border-color: var(--btt-forum-border) !important;
  background: var(--btt-forum-border) !important;
}

html.btt-forum-theme img {
  filter: none !important;
}

html.btt-forum-theme.btt-forum-custom body,
html.btt-forum-theme.btt-forum-custom #bodyarea,
html.btt-forum-theme.btt-forum-custom #top_section,
html.btt-forum-theme.btt-forum-custom #middle_section,
html.btt-forum-theme.btt-forum-custom #bot_section,
html.btt-forum-theme.btt-forum-custom #footerarea {
  background: var(--btt-page-bg) !important;
  color: var(--btt-text) !important;
}

html.btt-forum-theme.btt-forum-custom .windowbg,
html.btt-forum-theme.btt-forum-custom .windowbg3,
html.btt-forum-theme.btt-forum-custom td.windowbg,
html.btt-forum-theme.btt-forum-custom tr.windowbg td,
html.btt-forum-theme.btt-forum-custom .post,
html.btt-forum-theme.btt-forum-custom .post_wrapper,
html.btt-forum-theme.btt-forum-custom .poster_info {
  background: var(--btt-post-bg) !important;
  color: var(--btt-text) !important;
}

html.btt-forum-theme.btt-forum-custom .windowbg2,
html.btt-forum-theme.btt-forum-custom td.windowbg2,
html.btt-forum-theme.btt-forum-custom tr.windowbg2 td,
html.btt-forum-theme.btt-forum-custom .approvebg,
html.btt-forum-theme.btt-forum-custom .approvebg2 {
  background: var(--btt-post-alt-bg) !important;
  color: var(--btt-text) !important;
}

html.btt-forum-theme.btt-forum-custom table,
html.btt-forum-theme.btt-forum-custom td,
html.btt-forum-theme.btt-forum-custom th,
html.btt-forum-theme.btt-forum-custom .tborder,
html.btt-forum-theme.btt-forum-custom .bordercolor {
  border-color: var(--btt-border) !important;
}

html.btt-forum-theme.btt-forum-custom hr,
html.btt-forum-theme.btt-forum-custom .hrcolor {
  border-color: var(--btt-divider) !important;
  background: var(--btt-divider) !important;
}

html.btt-forum-theme.btt-forum-custom a,
html.btt-forum-theme.btt-forum-custom a:link,
html.btt-forum-theme.btt-forum-custom .nav {
  color: var(--btt-link) !important;
}

html.btt-forum-theme.btt-forum-custom a:visited {
  color: var(--btt-link-visited) !important;
}

html.btt-forum-theme.btt-forum-custom a:hover {
  color: var(--btt-link-hover) !important;
}

html.btt-forum-theme.btt-forum-custom a:active {
  color: var(--btt-link-active) !important;
}

html.btt-forum-theme.btt-forum-custom .catbg,
html.btt-forum-theme.btt-forum-custom .catbg2,
html.btt-forum-theme.btt-forum-custom .cat_bg,
html.btt-forum-theme.btt-forum-custom .cat_bar {
  background: var(--btt-category-header-bg) !important;
  color: var(--btt-category-header-text) !important;
}

html.btt-forum-theme.btt-forum-custom .titlebg,
html.btt-forum-theme.btt-forum-custom .titlebg2 {
  background: var(--btt-board-header-bg) !important;
  color: var(--btt-board-header-text) !important;
}

html.btt-forum-theme.btt-forum-custom thead,
html.btt-forum-theme.btt-forum-custom th,
html.btt-forum-theme.btt-forum-custom .table_grid th {
  background: var(--btt-table-header-bg) !important;
  color: var(--btt-table-header-text) !important;
}

html.btt-forum-theme.btt-forum-custom .subject,
html.btt-forum-theme.btt-forum-custom .subject a {
  color: var(--btt-post-title) !important;
}

html.btt-forum-theme.btt-forum-custom .smalltext,
html.btt-forum-theme.btt-forum-custom .middletext,
html.btt-forum-theme.btt-forum-custom .modified {
  color: var(--btt-post-meta) !important;
}

html.btt-forum-theme.btt-forum-custom .signature,
html.btt-forum-theme.btt-forum-custom td.signature {
  color: var(--btt-signature-text) !important;
}

html.btt-forum-theme.btt-forum-custom blockquote,
html.btt-forum-theme.btt-forum-custom .quote {
  background: var(--btt-quote-bg) !important;
  color: var(--btt-quote-text) !important;
  border-color: var(--btt-quote-border) !important;
}

html.btt-forum-theme.btt-forum-custom .quoteheader {
  color: var(--btt-quote-text) !important;
}

html.btt-forum-theme.btt-forum-custom .code,
html.btt-forum-theme.btt-forum-custom pre,
html.btt-forum-theme.btt-forum-custom code {
  background: var(--btt-code-bg) !important;
  color: var(--btt-code-text) !important;
  border-color: var(--btt-code-border) !important;
}

html.btt-forum-theme.btt-forum-custom input,
html.btt-forum-theme.btt-forum-custom textarea,
html.btt-forum-theme.btt-forum-custom select {
  background: var(--btt-input-bg) !important;
  color: var(--btt-input-text) !important;
  border-color: var(--btt-input-border) !important;
}

html.btt-forum-theme.btt-forum-custom input[type="button"],
html.btt-forum-theme.btt-forum-custom input[type="submit"],
html.btt-forum-theme.btt-forum-custom button {
  background: var(--btt-button-bg) !important;
  color: var(--btt-button-text) !important;
  border-color: var(--btt-input-border) !important;
}

html.btt-forum-theme.btt-forum-custom input[type="button"]:hover,
html.btt-forum-theme.btt-forum-custom input[type="submit"]:hover,
html.btt-forum-theme.btt-forum-custom button:hover {
  background: var(--btt-button-hover-bg) !important;
}

html.btt-forum-theme.btt-forum-custom ::selection {
  background: var(--btt-selected-bg) !important;
  color: var(--btt-selected-text) !important;
}

html.btt-forum-theme.btt-forum-custom .highlight,
html.btt-forum-theme.btt-forum-custom .btt-keyword-highlight {
  background: var(--btt-new-post-highlight) !important;
  color: var(--btt-text) !important;
}

html.btt-forum-theme.btt-forum-custom .btt-post-merit-badge {
  color: var(--btt-merit) !important;
  border-color: var(--btt-merit) !important;
}

html.btt-forum-theme.btt-forum-custom .btt-trust-dt1 {
  background: var(--btt-dt1-badge) !important;
}

html.btt-forum-theme.btt-forum-custom .btt-trust-dt2 {
  background: var(--btt-dt2-badge) !important;
}

html.btt-forum-theme.btt-forum-custom .btt-trust-badge {
  border-color: var(--btt-dt-badge) !important;
}

html.btt-forum-theme.btt-forum-custom .btt-phish-warn {
  border-bottom-color: var(--btt-danger) !important;
}

html.btt-forum-theme.btt-forum-custom .btt-phish-tooltip,
html.btt-forum-theme.btt-forum-custom .btt-link-preview-tooltip,
html.btt-forum-theme.btt-forum-custom .btt-ext-link-tooltip {
  background: var(--btt-tooltip-bg) !important;
  color: var(--btt-tooltip-text) !important;
  border-color: var(--btt-border) !important;
}

html.btt-forum-theme.btt-forum-high-contrast a,
html.btt-forum-theme.btt-forum-high-contrast .subject,
html.btt-forum-theme.btt-forum-high-contrast .subject a {
  text-decoration: underline !important;
}

html.btt-forum-theme.btt-forum-high-contrast *:focus-visible {
  outline: 2px solid var(--btt-forum-primary) !important;
  outline-offset: 2px !important;
}
`;
  (document.head || document.documentElement).appendChild(style);
}

export function applyBitcointalkForumTheme(settings, root = document.documentElement) {
  const themeId = resolveForumThemeId(settings?.forumTheme || 'original');
  if (themeId === 'original') {
    root.classList.remove('btt-forum-theme', 'btt-forum-high-contrast', 'btt-forum-custom');
    delete root.dataset.bttForumTheme;
    document.getElementById(FORUM_THEME_STYLE_ID)?.remove();
    return null;
  }

  if (themeId === 'custom') {
    const colors = applyForumCustomVariables(settings?.forumCustomColors, root);
    ensureForumThemeStyle();
    root.classList.add('btt-forum-theme', 'btt-forum-custom');
    root.classList.remove('btt-forum-high-contrast');
    root.dataset.bttForumTheme = 'custom';
    return { id: 'custom', name: 'Custom Forum Theme', values: colors };
  }

  const theme = getTheme(themeId);
  setThemeVariables(theme.values, FORUM_CSS_VAR_MAP, root);
  ensureForumThemeStyle();
  root.classList.add('btt-forum-theme');
  root.classList.remove('btt-forum-custom');
  root.classList.toggle('btt-forum-high-contrast', theme.id === 'high-contrast');
  root.dataset.bttForumTheme = theme.id;
  return theme;
}

export function themeSelectOptionsHtml(selectedTheme, { includeOriginal = false } = {}) {
  const selected = resolveThemeId(selectedTheme);
  if (includeOriginal) return forumThemeSelectOptionsHtml(selectedTheme);
  const groups = [
    { label: 'General', ids: ['dark', 'light'] },
    { label: 'Other Useful Themes', ids: ['bitcoin', 'forum-gray', 'soft-blue', 'sepia', 'high-contrast'] },
  ];
  return groups.map(group => `
    <optgroup label="${group.label}">
      ${group.ids
        .map(id => getThemeOptions().find(theme => theme.id === id))
        .filter(Boolean)
        .map(theme => `<option value="${theme.id}" ${theme.id === selected ? 'selected' : ''}>${theme.name}</option>`)
        .join('')}
    </optgroup>
  `).join('');
}

export function flatThemeSelectOptionsHtml(selectedTheme) {
  const selected = resolveThemeId(selectedTheme);
  return getThemeOptions()
    .map(theme => `<option value="${theme.id}" ${theme.id === selected ? 'selected' : ''}>${theme.name}</option>`)
    .join('');
}

export function forumThemeSelectOptionsHtml(selectedTheme) {
  const selected = resolveForumThemeId(selectedTheme);
  return `
    <optgroup label="General">
      ${FORUM_THEME_OPTIONS
        .filter(theme => ['original', 'custom', 'dark', 'light'].includes(theme.id))
        .map(theme => `<option value="${theme.id}" ${theme.id === selected ? 'selected' : ''}>${theme.name}</option>`)
        .join('')}
    </optgroup>
    <optgroup label="Other Useful Themes">
      ${FORUM_THEME_OPTIONS
        .filter(theme => !['original', 'custom', 'dark', 'light'].includes(theme.id))
        .map(theme => `<option value="${theme.id}" ${theme.id === selected ? 'selected' : ''}>${theme.name}</option>`)
        .join('')}
    </optgroup>
  `;
}
