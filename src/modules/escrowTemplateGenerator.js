// escrowTemplateGenerator.js - Coming soon metadata for escrow templates.

export default {
  id:             'escrowTemplate',
  name:           'Escrow Template',
  description:    'Generate BBCode escrow deal agreements.',
  category:       'Marketplace Tools',
  defaultEnabled: false,
  status:         'comingSoon',

  init() {},

  destroy() {},

  renderDashboardPanel(container) {
    container.innerHTML = `<div class="btt-panel">
      <p><strong>Coming soon.</strong></p>
      <p style="color:var(--text-secondary,#9ca3af);font-size:12px">
        Escrow agreement generation is not active yet.
      </p>
    </div>`;
  },
};
