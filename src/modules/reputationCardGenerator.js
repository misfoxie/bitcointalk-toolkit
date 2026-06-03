// reputationCardGenerator.js - Coming soon metadata for reputation cards.

export default {
  id:             'reputationCard',
  name:           'Reputation Card',
  description:    'Generate BBCode reputation cards for users.',
  category:       'User/Profile Tools',
  defaultEnabled: false,
  status:         'comingSoon',

  init() {},

  destroy() {},

  renderDashboardPanel(container) {
    container.innerHTML = `<div class="btt-panel">
      <p><strong>Coming soon.</strong></p>
      <p style="color:var(--text-secondary,#9ca3af);font-size:12px">
        Reputation card generation is not active yet.
      </p>
    </div>`;
  },
};
