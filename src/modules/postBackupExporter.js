// postBackupExporter.js - Coming soon metadata for post backup export.

export default {
  id:             'postBackupExporter',
  name:           'Post Backup Exporter',
  description:    'Save posts locally and export as TXT/JSON.',
  category:       'Thread Tools',
  defaultEnabled: false,
  status:         'comingSoon',

  init() {},

  destroy() {},

  renderDashboardPanel(container) {
    container.innerHTML = `<div class="btt-panel">
      <p><strong>Coming soon.</strong></p>
      <p style="color:var(--text-secondary,#9ca3af);font-size:12px">
        Post backup export is not active yet.
      </p>
    </div>`;
  },
};
