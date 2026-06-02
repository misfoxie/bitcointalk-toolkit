// giveawayPicker.js — Random winner picker for giveaways and campaigns.
// Dashboard-only tool: paste participant list, pick seeded random winners.

export default {
  id: 'giveawayPicker',
  name: 'Giveaway Picker',
  description: 'Random winner picker from a list of participants.',
  category: 'Campaign Tools',
  defaultEnabled: false,

  init(api) { /* dashboard-only */ },
  destroy() {},

  renderDashboardPanel(container) {
    _renderGiveawayUI(container);
  },
};

function _renderGiveawayUI(container) {
  container.innerHTML = `
<div style="display:flex;flex-direction:column;gap:16px;padding:4px 0;max-width:800px">
  <div style="display:flex;gap:12px;flex-wrap:wrap">
    <div style="flex:1;min-width:260px;display:flex;flex-direction:column;gap:8px">
      <label style="font-size:12px;color:var(--text-secondary,#9ca3af);font-weight:500">PARTICIPANTS (one username per line)</label>
      <textarea id="gp-input" rows="10" style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--border,#374151);background:var(--bg-secondary,#111827);color:var(--text,#e5e7eb);font-size:12px;font-family:monospace;resize:vertical;box-sizing:border-box" placeholder="username1&#10;username2&#10;username3&#10;&#10;Paste a list or type names one per line."></textarea>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <button id="gp-paste" style="padding:5px 10px;border-radius:4px;border:1px solid var(--border,#374151);background:none;color:var(--text,#e5e7eb);cursor:pointer;font-size:11px">📋 Paste</button>
        <button id="gp-dedup" style="padding:5px 10px;border-radius:4px;border:1px solid var(--border,#374151);background:none;color:var(--text,#e5e7eb);cursor:pointer;font-size:11px">⊕ Remove Duplicates</button>
        <button id="gp-clear" style="padding:5px 10px;border-radius:4px;border:1px solid var(--border,#374151);background:none;color:var(--text-secondary,#9ca3af);cursor:pointer;font-size:11px">Clear</button>
      </div>
      <div id="gp-count" style="font-size:11px;color:var(--text-secondary,#9ca3af)">0 participants</div>
    </div>
    <div style="flex:0 0 220px;display:flex;flex-direction:column;gap:12px">
      <div>
        <label style="font-size:12px;color:var(--text-secondary,#9ca3af);font-weight:500;display:block;margin-bottom:6px">NUMBER OF WINNERS</label>
        <input id="gp-num" type="number" value="1" min="1" max="100" style="width:100%;padding:7px 10px;border-radius:6px;border:1px solid var(--border,#374151);background:var(--bg-secondary,#111827);color:var(--text,#e5e7eb);font-size:14px;box-sizing:border-box">
      </div>
      <div>
        <label style="font-size:12px;color:var(--text-secondary,#9ca3af);font-weight:500;display:block;margin-bottom:6px">SEED (optional, for reproducibility)</label>
        <input id="gp-seed" type="text" placeholder="Leave blank for random" style="width:100%;padding:7px 10px;border-radius:6px;border:1px solid var(--border,#374151);background:var(--bg-secondary,#111827);color:var(--text,#e5e7eb);font-size:12px;box-sizing:border-box">
      </div>
      <button id="gp-pick" style="padding:11px;border-radius:6px;border:none;background:var(--accent,#3b82f6);color:#fff;cursor:pointer;font-size:14px;font-weight:700">🎲 Pick Winners</button>
      <button id="gp-bbcode" disabled style="padding:8px;border-radius:6px;border:1px solid var(--border,#374151);background:none;color:var(--text-secondary,#9ca3af);cursor:pointer;font-size:12px">📋 Copy as BBCode</button>
    </div>
  </div>
  <div id="gp-results" style="display:none;border-top:1px solid var(--border,#374151);padding-top:16px">
    <h4 style="margin:0 0 12px;font-size:13px">🏆 Winners</h4>
    <div id="gp-winners" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px"></div>
    <div style="background:var(--bg-secondary,#111827);border:1px solid var(--border,#374151);border-radius:6px;padding:10px">
      <div style="font-size:11px;color:var(--text-secondary,#6b7280);margin-bottom:4px;font-weight:500">AUDIT LOG</div>
      <pre id="gp-audit" style="font-size:11px;color:var(--text-secondary,#9ca3af);margin:0;white-space:pre-wrap;font-family:monospace"></pre>
    </div>
  </div>
</div>`;

  const inputEl  = container.querySelector('#gp-input');
  const countEl  = container.querySelector('#gp-count');
  const resultsEl = container.querySelector('#gp-results');
  const winnersEl = container.querySelector('#gp-winners');
  const auditEl  = container.querySelector('#gp-audit');
  const bbcodeBtn = container.querySelector('#gp-bbcode');
  let lastWinners = [];

  inputEl.addEventListener('input', () => {
    const n = _parseNames(inputEl.value).length;
    countEl.textContent = `${n} participant${n !== 1 ? 's' : ''}`;
  });

  container.querySelector('#gp-paste').addEventListener('click', async () => {
    try {
      inputEl.value = await navigator.clipboard.readText();
      inputEl.dispatchEvent(new Event('input'));
    } catch { alert('Clipboard read failed. Please paste manually (Ctrl+V).'); }
  });

  container.querySelector('#gp-dedup').addEventListener('click', () => {
    const names  = _parseNames(inputEl.value);
    const unique = [...new Map(names.map(n => [n.toLowerCase(), n])).values()];
    const removed = names.length - unique.length;
    inputEl.value = unique.join('\n');
    countEl.textContent = `${unique.length} participant${unique.length !== 1 ? 's' : ''}${removed ? ` · ${removed} duplicate${removed!==1?'s':''} removed` : ''}`;
  });

  container.querySelector('#gp-clear').addEventListener('click', () => {
    inputEl.value = '';
    countEl.textContent = '0 participants';
    resultsEl.style.display = 'none';
    bbcodeBtn.disabled = true;
    bbcodeBtn.style.color = 'var(--text-secondary,#9ca3af)';
  });

  container.querySelector('#gp-pick').addEventListener('click', () => {
    const names = _parseNames(inputEl.value);
    if (!names.length) { alert('Add at least one participant first.'); return; }

    const num  = Math.min(parseInt(container.querySelector('#gp-num').value, 10) || 1, names.length);
    const seed = container.querySelector('#gp-seed').value.trim() || String(Date.now());

    lastWinners = _seededPick([...names], num, seed);

    winnersEl.innerHTML = lastWinners.map((w, i) => `
      <div style="background:linear-gradient(135deg,#1d4ed8,#2563eb);border-radius:8px;padding:10px 16px;display:flex;align-items:center;gap:10px;box-shadow:0 2px 8px rgba(59,130,246,.3)">
        <span style="font-size:20px">${['🥇','🥈','🥉'][i] || '🏅'}</span>
        <span style="font-weight:700;color:#fff;font-size:13px">${_esc(w)}</span>
      </div>`).join('');

    auditEl.textContent =
      `Drawn at:  ${new Date().toISOString()}\n` +
      `Seed:      ${seed}\n` +
      `Pool size: ${names.length}\n` +
      `Winners:   ${num}\n` +
      `─────────────\n` +
      lastWinners.map((w, i) => `#${i + 1}  ${w}`).join('\n');

    resultsEl.style.display = 'block';
    bbcodeBtn.disabled = false;
    bbcodeBtn.style.color = 'var(--text,#e5e7eb)';
    resultsEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  bbcodeBtn.addEventListener('click', () => {
    if (!lastWinners.length) return;
    const medals = ['🥇','🥈','🥉'];
    const bbcode = `[b]🏆 Giveaway Winners[/b]\n[list]\n` +
      lastWinners.map((w, i) => `[li]${medals[i] || `#${i+1}`} [b]${w}[/b][/li]`).join('\n') +
      `\n[/list]\n\n[i]Drawn: ${new Date().toLocaleDateString()} · Seed: ${container.querySelector('#gp-seed').value.trim() || 'random'}[/i]`;
    navigator.clipboard.writeText(bbcode).then(() => {
      bbcodeBtn.textContent = '✓ Copied!';
      setTimeout(() => { bbcodeBtn.textContent = '📋 Copy as BBCode'; }, 2000);
    });
  });
}

function _parseNames(text) {
  return text.split('\n').map(l => l.trim()).filter(Boolean);
}

function _esc(s) {
  return s ? String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : '';
}

// Seeded Fisher-Yates shuffle using xorshift32 PRNG
function _seededPick(arr, count, seed) {
  let s = _hashSeed(seed);
  const rand = () => { s ^= s << 13; s ^= s >> 17; s ^= s << 5; return (s >>> 0) / 4294967296; };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}

function _hashSeed(seed) {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = (h * 16777619) >>> 0; }
  return h || 1;
}
