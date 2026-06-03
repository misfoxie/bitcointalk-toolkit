// rankProgressTracker.js - Show Bitcointalk rank progress.

import { BTC_RANKS } from '../utils/constants.js';
import { getSettings, updateSetting } from '../utils/storage.js';

function getCurrentRank(activity, merit) {
  let rank = BTC_RANKS[0];
  for (const item of BTC_RANKS) {
    if (activity >= item.minActivity && merit >= item.minMerit) rank = item;
    else break;
  }
  return rank;
}

function getNextRank(activity, merit) {
  for (const item of BTC_RANKS) {
    if (activity < item.minActivity || merit < item.minMerit) return item;
  }
  return null;
}

function renderProgressBar(percent, color) {
  return `
    <div style="background:#374151;border-radius:4px;height:8px;overflow:hidden">
      <div style="height:100%;background:${color};width:${percent}%;transition:width .3s;border-radius:4px"></div>
    </div>
  `;
}

export default {
  id: 'rankProgressTracker',
  name: 'Rank Progress Tracker',
  description: 'Enter your activity and merit to see your current rank and progress to the next.',
  category: 'User/Profile Tools',
  defaultEnabled: false,

  init() {
    // Dashboard-only tool.
  },

  destroy() {},

  async renderDashboardPanel(container) {
    container.innerHTML = `
      <div class="btt-panel">
        <p style="font-size:13px;color:var(--text-secondary,#aaa)">
          Bitcointalk ranks depend on activity and merit. Enter yours below.
        </p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin-top:10px;">
          <label style="font-size:13px;">Activity<br>
            <input type="number" id="btt-rpt-activity" placeholder="e.g. 300" min="0"
              style="width:100%;padding:6px 8px;border-radius:4px;border:1px solid var(--border,#2d3340);background:var(--bg-input,#1e2025);color:var(--text,#e5e7eb);margin-top:4px;box-sizing:border-box">
          </label>
          <label style="font-size:13px;">Merit<br>
            <input type="number" id="btt-rpt-merit" placeholder="e.g. 50" min="0"
              style="width:100%;padding:6px 8px;border-radius:4px;border:1px solid var(--border,#2d3340);background:var(--bg-input,#1e2025);color:var(--text,#e5e7eb);margin-top:4px;box-sizing:border-box">
          </label>
        </div>
        <div style="display:flex;gap:8px;align-items:center;margin-top:10px;flex-wrap:wrap">
          <button id="btt-rpt-check" class="btt-btn btt-btn-primary">Check Rank</button>
          <button id="btt-rpt-save" class="btt-btn btt-btn-secondary">Save Values</button>
          <span id="btt-rpt-save-status" style="font-size:12px;color:var(--text-secondary,#9ca3af)"></span>
        </div>
        <div id="btt-rpt-result" style="margin-top:14px;display:none;"></div>

        <hr style="margin:16px 0;border-color:var(--border,#2d3340)">
        <h4 style="font-size:13px;">All Rank Thresholds</h4>
        <table style="width:100%;border-collapse:collapse;font-size:12px;margin-top:6px;">
          <thead>
            <tr style="background:var(--bg-panel,#161a21);">
              <th style="padding:5px 8px;text-align:left;border:1px solid var(--border,#2d3340)">Rank</th>
              <th style="padding:5px 8px;text-align:right;border:1px solid var(--border,#2d3340)">Min Activity</th>
              <th style="padding:5px 8px;text-align:right;border:1px solid var(--border,#2d3340)">Min Merit</th>
            </tr>
          </thead>
          <tbody>
            ${BTC_RANKS.map((rank) => `
              <tr>
                <td style="padding:5px 8px;border:1px solid var(--border,#2d3340);color:${rank.color}">${rank.name}</td>
                <td style="padding:5px 8px;border:1px solid var(--border,#2d3340);text-align:right">${rank.minActivity}</td>
                <td style="padding:5px 8px;border:1px solid var(--border,#2d3340);text-align:right">${rank.minMerit}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <p style="font-size:11px;color:var(--text-secondary,#aaa);margin-top:8px">
          Activity is not exactly equal to post count. These thresholds are approximate.
        </p>
      </div>
    `;

    const activityInput = container.querySelector('#btt-rpt-activity');
    const meritInput = container.querySelector('#btt-rpt-merit');
    const result = container.querySelector('#btt-rpt-result');
    const saveStatus = container.querySelector('#btt-rpt-save-status');

    const calculate = () => {
      const activity = parseInt(activityInput.value, 10) || 0;
      const merit = parseInt(meritInput.value, 10) || 0;
      const current = getCurrentRank(activity, merit);
      const next = getNextRank(activity, merit);

      result.style.display = 'block';

      let html = `
        <div style="background:var(--bg-panel,#161a21);border-radius:8px;padding:12px;border:1px solid var(--border,#2d3340)">
          <div style="font-size:16px;font-weight:700;color:${current.color}">${current.name}</div>
          <div style="font-size:12px;color:var(--text-secondary,#aaa);margin-top:2px">Activity: ${activity} | Merit: ${merit}</div>
      `;

      if (next) {
        const needActivity = Math.max(0, next.minActivity - activity);
        const needMerit = Math.max(0, next.minMerit - merit);
        const actPct = Math.min(100, next.minActivity > 0 ? Math.round((activity / next.minActivity) * 100) : 100);
        const meritPct = Math.min(100, next.minMerit > 0 ? Math.round((merit / next.minMerit) * 100) : 100);

        html += `
          <div style="margin-top:10px;font-size:13px;color:var(--text,#e5e7eb)">Next rank: <strong style="color:${next.color}">${next.name}</strong></div>
          <div style="margin-top:6px;font-size:12px;color:var(--text-secondary,#aaa)">
            Need ${needActivity > 0 ? `+${needActivity} activity` : 'enough activity'} and ${needMerit > 0 ? `+${needMerit} merit` : 'enough merit'}
          </div>
          <div style="margin-top:8px">
            <div style="font-size:11px;margin-bottom:2px;color:var(--text-secondary,#aaa)">Activity progress: ${actPct}%</div>
            ${renderProgressBar(actPct, '#3b82f6')}
          </div>
          <div style="margin-top:6px">
            <div style="font-size:11px;margin-bottom:2px;color:var(--text-secondary,#aaa)">Merit progress: ${meritPct}%</div>
            ${renderProgressBar(meritPct, '#f7931a')}
          </div>
        `;
      } else {
        html += '<div style="margin-top:8px;color:#f7931a;font-size:14px">You have reached the highest rank: Legendary.</div>';
      }

      result.innerHTML = `${html}</div>`;
    };

    const settings = await getSettings();
    if (settings.rankProgressActivity != null) activityInput.value = settings.rankProgressActivity;
    if (settings.rankProgressMerit != null) meritInput.value = settings.rankProgressMerit;
    if (activityInput.value || meritInput.value) calculate();

    container.querySelector('#btt-rpt-check').addEventListener('click', calculate);
    activityInput.addEventListener('input', calculate);
    meritInput.addEventListener('input', calculate);
    container.querySelector('#btt-rpt-save').addEventListener('click', async () => {
      await updateSetting('rankProgressActivity', parseInt(activityInput.value, 10) || 0);
      await updateSetting('rankProgressMerit', parseInt(meritInput.value, 10) || 0);
      saveStatus.textContent = 'Saved.';
      calculate();
    });
  },
};
