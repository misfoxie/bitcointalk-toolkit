// threadBookmarkManager.js - Coming soon metadata for thread bookmarks.

export default {
  id:             'threadBookmarks',
  name:           'Thread Bookmarks',
  description:    'Save and organize Bitcointalk thread bookmarks.',
  category:       'Thread Tools',
  defaultEnabled: false,
  status:         'comingSoon',

  init() {},

  destroy() {},

  renderDashboardPanel(container) {
    container.innerHTML = `<div class="btt-panel">
      <p><strong>Coming soon.</strong></p>
      <p style="color:var(--text-secondary,#9ca3af);font-size:12px">
        Thread bookmark management is not active yet.
      </p>
    </div>`;
  },
};
