// multiQuoteBasket.js - Coming soon metadata for multi-quote support.

export default {
  id:             'multiQuoteBasket',
  name:           'Multi-Quote Basket',
  description:    'Collect multiple quotes and insert them into the reply box.',
  category:       'Thread Tools',
  defaultEnabled: false,
  status:         'comingSoon',

  init() {},

  destroy() {},

  renderDashboardPanel(container) {
    container.innerHTML = `<div class="btt-panel">
      <p><strong>Coming soon.</strong></p>
      <p style="color:var(--text-secondary,#9ca3af);font-size:12px">
        Multi-quote collection is not active yet.
      </p>
    </div>`;
  },
};
