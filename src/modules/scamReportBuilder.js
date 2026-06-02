// scamReportBuilder.js — Generate well-formatted BBCode scam/accusation reports.
// Dashboard-only: form → BBCode output.

export default {
  id: 'scamReportBuilder',
  name: 'Scam Report Builder',
  description: 'Generate well-formatted BBCode scam reports.',
  category: 'Marketplace Tools',
  defaultEnabled: false,

  init(api) { /* dashboard-only */ },
  destroy() {},

  renderDashboardPanel(container) {
    _renderScamBuilder(container);
  },
};

function _renderScamBuilder(container) {
  container.innerHTML = `
<div style="display:flex;gap:16px;flex-wrap:wrap;max-width:960px">

  <!-- Form -->
  <div style="flex:1;min-width:280px;display:flex;flex-direction:column;gap:12px">
    <h4 style="margin:0;font-size:13px;color:var(--text,#e5e7eb)">Report Details</h4>

    <div>
      <label class="sr-label">Accused username</label>
      <input id="sr-accused"  class="sr-input" placeholder="Username">
    </div>
    <div>
      <label class="sr-label">Accused profile URL (optional)</label>
      <input id="sr-profile-url" class="sr-input" type="url" placeholder="https://bitcointalk.org/index.php?action=profile;u=…">
    </div>
    <div>
      <label class="sr-label">Scam type</label>
      <select id="sr-type" class="sr-input">
        <option value="Non-payment">Non-payment</option>
        <option value="Non-delivery">Non-delivery of goods/service</option>
        <option value="Fake escrow">Fake escrow</option>
        <option value="Impersonation">Impersonation / Fake account</option>
        <option value="Phishing">Phishing / Malicious link</option>
        <option value="Rug pull">Rug pull / Exit scam</option>
        <option value="Fake investment">Fake investment / HYIP</option>
        <option value="Other">Other</option>
      </select>
    </div>
    <div>
      <label class="sr-label">Amount / value lost (optional)</label>
      <input id="sr-amount" class="sr-input" placeholder="e.g. 0.05 BTC, $200 USDT">
    </div>
    <div>
      <label class="sr-label">Date of incident</label>
      <input id="sr-date" class="sr-input" type="date" value="${new Date().toISOString().slice(0,10)}">
    </div>
    <div>
      <label class="sr-label">Transaction ID(s) / TXID (optional)</label>
      <input id="sr-txid" class="sr-input" placeholder="Comma-separated TXIDs">
    </div>
    <div>
      <label class="sr-label">Evidence links (one per line)</label>
      <textarea id="sr-evidence" class="sr-input" rows="3" placeholder="https://…&#10;https://…"></textarea>
    </div>
    <div>
      <label class="sr-label">Description</label>
      <textarea id="sr-description" class="sr-input" rows="4" placeholder="Describe what happened in detail…"></textarea>
    </div>
    <div>
      <label class="sr-label">Contact / other notes (optional)</label>
      <input id="sr-notes" class="sr-input" placeholder="How to contact you or other relevant info">
    </div>

    <button id="sr-generate" class="btt-btn btt-btn-primary" style="align-self:flex-start">Generate BBCode</button>
  </div>

  <!-- Output -->
  <div style="flex:1;min-width:280px;display:flex;flex-direction:column;gap:8px">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <h4 style="margin:0;font-size:13px;color:var(--text,#e5e7eb)">BBCode Output</h4>
      <div style="display:flex;gap:6px">
        <button id="sr-copy"   class="btt-btn btt-btn-sm btt-btn-secondary" disabled>📋 Copy</button>
        <button id="sr-studio" class="btt-btn btt-btn-sm btt-btn-secondary" disabled>✏️ Studio</button>
      </div>
    </div>
    <textarea id="sr-output" readonly rows="20" style="width:100%;padding:10px;border-radius:6px;border:1px solid var(--border,#374151);background:var(--bg-secondary,#111827);color:var(--text,#e5e7eb);font-size:12px;font-family:monospace;resize:vertical;box-sizing:border-box" placeholder="Fill in the form and click Generate BBCode…"></textarea>
  </div>

</div>

<style>
.sr-label { display:block; font-size:11px; color:var(--text-secondary,#9ca3af); font-weight:500; margin-bottom:5px; }
.sr-input { width:100%; padding:7px 10px; border-radius:6px; border:1px solid var(--border,#374151); background:var(--bg-secondary,#111827); color:var(--text,#e5e7eb); font-size:12px; box-sizing:border-box; font-family:inherit; }
textarea.sr-input { resize:vertical; }
</style>`;

  const get = id => container.querySelector(`#${id}`)?.value?.trim() || '';

  container.querySelector('#sr-generate').addEventListener('click', () => {
    const accused     = get('sr-accused') || 'Unknown';
    const profileUrl  = get('sr-profile-url');
    const type        = get('sr-type') || 'Other';
    const amount      = get('sr-amount');
    const date        = get('sr-date');
    const txids       = get('sr-txid').split(',').map(t => t.trim()).filter(Boolean);
    const evidences   = container.querySelector('#sr-evidence')?.value?.trim().split('\n').map(l => l.trim()).filter(Boolean) || [];
    const description = container.querySelector('#sr-description')?.value?.trim() || '';
    const notes       = get('sr-notes');

    const accusedRef = profileUrl ? `[url=${profileUrl}]${accused}[/url]` : `[b]${accused}[/b]`;

    const lines = [
      `[color=red][b]⚠ SCAM REPORT — ${type.toUpperCase()}[/b][/color]`,
      `[hr]`,
      `[b]Accused:[/b] ${accusedRef}`,
      `[b]Scam Type:[/b] ${type}`,
      date        ? `[b]Date:[/b] ${date}` : null,
      amount      ? `[b]Amount Lost:[/b] ${amount}` : null,
      ``,
      `[b]Description:[/b]`,
      description || '(no description provided)',
      ``,
    ];

    if (txids.length) {
      lines.push(`[b]Transaction ID(s):[/b]`);
      txids.forEach(t => lines.push(`[code]${t}[/code]`));
      lines.push('');
    }

    if (evidences.length) {
      lines.push(`[b]Evidence:[/b]`);
      evidences.forEach((url, i) => lines.push(`[url=${url}]Evidence ${i + 1}[/url]`));
      lines.push('');
    }

    if (notes) {
      lines.push(`[b]Additional Notes:[/b] ${notes}`);
    }

    lines.push(`[hr]`);
    lines.push(`[i]Report generated using Bitcointalk Toolkit[/i]`);

    const bbcode = lines.filter(l => l !== null).join('\n');
    container.querySelector('#sr-output').value = bbcode;

    const copyBtn   = container.querySelector('#sr-copy');
    const studioBtn = container.querySelector('#sr-studio');
    copyBtn.disabled   = false;
    studioBtn.disabled = false;
  });

  container.querySelector('#sr-copy').addEventListener('click', () => {
    const val = container.querySelector('#sr-output').value;
    navigator.clipboard.writeText(val).then(() => {
      const btn = container.querySelector('#sr-copy');
      btn.textContent = '✓ Copied'; setTimeout(() => { btn.textContent = '📋 Copy'; }, 2000);
    });
  });

  container.querySelector('#sr-studio').addEventListener('click', () => {
    const val = container.querySelector('#sr-output').value;
    const studioEditor = document.getElementById('studio-editor');
    if (studioEditor) {
      studioEditor.value += (studioEditor.value ? '\n\n' : '') + val;
      studioEditor.dispatchEvent(new Event('input'));
      document.querySelector('[data-section="studio"]')?.click();
    } else {
      navigator.clipboard.writeText(val);
    }
  });
}
