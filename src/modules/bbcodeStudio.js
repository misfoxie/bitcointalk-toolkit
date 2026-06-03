// bbcodeStudio.js - Dashboard-only BBCode editor.
// The working editor lives in src/ui/dashboard.js (Posting Studio).

export default {
  id:             'bbcodeStudio',
  name:           'BBCode Studio',
  description:    'Full BBCode editor with live preview. Available in the dashboard Posting Studio.',
  category:       'Posting & BBCode',
  defaultEnabled: false,

  init(api) {
    api?.openDashboard?.('studio');
  },

  destroy() {},

  renderDashboardPanel(container) {
    container.innerHTML = `<div class="btt-panel">
      <p>Full BBCode editor with live preview. Available in the dashboard Posting Studio.</p>
      <p style="color:var(--text-secondary,#9ca3af);font-size:12px">
        Open the dashboard Posting Studio to use the editor.
      </p>
    </div>`;
  },
};
