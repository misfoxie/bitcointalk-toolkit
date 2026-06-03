// tableMaker.js — Visual BBCode table generator with live preview.

export default {
  id: 'tableMaker',
  name: 'Table Maker',
  description: 'Visual Bitcointalk BBCode table generator.',
  category: 'Posting & BBCode',
  defaultEnabled: false,

  init(api) { /* dashboard-only */ },
  destroy() {},

  renderDashboardPanel(container) {
    _renderTableMaker(container);
  },
};

const STYLES = {
  plain: { header: '', cell: '' },
  bold_header: { header: '[b]', cell: '' },
  colored: { headerBg: '#1d4ed8', header: '[b][color=white]', headerClose: '[/color][/b]', cell: '' },
  striped: { note: 'Use alternating row colors manually.' },
};

function _renderTableMaker(container) {
  let rows = 3, cols = 3;

  container.innerHTML = `
<div style="display:flex;flex-direction:column;gap:14px;max-width:900px">

  <!-- Controls row -->
  <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
    <div style="display:flex;align-items:center;gap:6px;font-size:12px">
      <label style="color:var(--text-secondary,#9ca3af)">Rows:</label>
      <input id="tm-rows" type="number" value="3" min="1" max="20" style="width:52px;padding:5px;border-radius:4px;border:1px solid var(--border,#374151);background:var(--bg-secondary,#111827);color:var(--text,#e5e7eb);font-size:12px">
    </div>
    <div style="display:flex;align-items:center;gap:6px;font-size:12px">
      <label style="color:var(--text-secondary,#9ca3af)">Cols:</label>
      <input id="tm-cols" type="number" value="3" min="1" max="10" style="width:52px;padding:5px;border-radius:4px;border:1px solid var(--border,#374151);background:var(--bg-secondary,#111827);color:var(--text,#e5e7eb);font-size:12px">
    </div>
    <button id="tm-rebuild" style="padding:5px 12px;border-radius:4px;border:none;background:var(--accent,#3b82f6);color:#fff;cursor:pointer;font-size:12px">Apply</button>
    <div style="display:flex;align-items:center;gap:6px;font-size:12px">
      <label style="color:var(--text-secondary,#9ca3af)">Style:</label>
      <select id="tm-style" style="padding:5px 8px;border-radius:4px;border:1px solid var(--border,#374151);background:var(--bg-secondary,#111827);color:var(--text,#e5e7eb);font-size:12px">
        <option value="plain">Plain</option>
        <option value="bold_header" selected>Bold header row</option>
        <option value="firstcol">Bold first column</option>
        <option value="full_bold">Bold header + first col</option>
      </select>
    </div>
    <label style="display:flex;align-items:center;gap:5px;font-size:12px;cursor:pointer;color:var(--text-secondary,#9ca3af)">
      <input id="tm-header-row" type="checkbox" checked> First row is header
    </label>
  </div>

  <!-- Grid editor -->
  <div>
    <div style="font-size:11px;color:var(--text-secondary,#9ca3af);margin-bottom:6px">Click cells to edit. Tab to move right.</div>
    <div id="tm-grid" style="overflow-x:auto"></div>
  </div>

  <!-- Output -->
  <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-start">
    <button id="tm-generate" style="padding:7px 16px;border-radius:5px;border:none;background:var(--accent,#3b82f6);color:#fff;cursor:pointer;font-size:13px;font-weight:600">Generate BBCode</button>
    <button id="tm-copy" disabled style="padding:7px 14px;border-radius:5px;border:1px solid var(--border,#374151);background:none;color:var(--text-secondary,#9ca3af);cursor:pointer;font-size:12px">📋 Copy</button>
    <button id="tm-copy-studio" disabled style="padding:7px 14px;border-radius:5px;border:1px solid var(--border,#374151);background:none;color:var(--text-secondary,#9ca3af);cursor:pointer;font-size:12px">✏️ Send to Studio</button>
  </div>
  <textarea id="tm-output" rows="8" readonly style="width:100%;padding:10px;border-radius:6px;border:1px solid var(--border,#374151);background:var(--bg-secondary,#111827);color:var(--text,#e5e7eb);font-size:12px;font-family:monospace;resize:vertical;box-sizing:border-box" placeholder="BBCode will appear here after clicking Generate…"></textarea>

</div>`;

  // Build initial grid
  _buildGrid(container, rows, cols);

  container.querySelector('#tm-rebuild').addEventListener('click', () => {
    rows = Math.min(Math.max(parseInt(container.querySelector('#tm-rows').value, 10) || 3, 1), 20);
    cols = Math.min(Math.max(parseInt(container.querySelector('#tm-cols').value, 10) || 3, 1), 10);
    container.querySelector('#tm-rows').value = rows;
    container.querySelector('#tm-cols').value = cols;
    _buildGrid(container, rows, cols);
  });

  container.querySelector('#tm-generate').addEventListener('click', () => {
    const bbcode = _generateBBCode(container, rows, cols);
    container.querySelector('#tm-output').value = bbcode;
    const copyBtn  = container.querySelector('#tm-copy');
    const studioBtn = container.querySelector('#tm-copy-studio');
    copyBtn.disabled  = false; copyBtn.style.color  = 'var(--text,#e5e7eb)';
    studioBtn.disabled = false; studioBtn.style.color = 'var(--text,#e5e7eb)';
  });

  container.querySelector('#tm-copy').addEventListener('click', () => {
    const val = container.querySelector('#tm-output').value;
    navigator.clipboard.writeText(val).then(() => {
      const btn = container.querySelector('#tm-copy');
      btn.textContent = '✓ Copied'; setTimeout(() => { btn.textContent = '📋 Copy'; }, 2000);
    });
  });

  container.querySelector('#tm-copy-studio').addEventListener('click', () => {
    const val = container.querySelector('#tm-output').value;
    const studioEditor = document.getElementById('studio-editor');
    if (studioEditor) {
      studioEditor.value += (studioEditor.value ? '\n\n' : '') + val;
      studioEditor.dispatchEvent(new Event('input'));
      // Navigate to studio section
      document.querySelector('[data-section="studio"]')?.click();
    } else {
      navigator.clipboard.writeText(val);
    }
  });
}

function _buildGrid(container, rows, cols) {
  const grid = container.querySelector('#tm-grid');
  grid.innerHTML = '';

  const table = document.createElement('table');
  table.style.cssText = 'border-collapse:collapse;';

  for (let r = 0; r < rows; r++) {
    const tr = document.createElement('tr');
    for (let c = 0; c < cols; c++) {
      const td = document.createElement('td');
      td.style.cssText = 'border:1px solid var(--border,#374151);padding:2px;min-width:80px;';

      const input = document.createElement('input');
      input.type = 'text';
      input.dataset.row = r;
      input.dataset.col = c;
      input.style.cssText = 'width:100%;padding:5px 7px;border:none;background:transparent;color:var(--text,#e5e7eb);font-size:12px;outline:none;box-sizing:border-box;min-width:80px;';

      if (r === 0) {
        input.placeholder = `Header ${c + 1}`;
        input.style.fontWeight = '600';
      } else {
        input.placeholder = `R${r+1}C${c+1}`;
      }

      // Tab navigation
      input.addEventListener('keydown', e => {
        if (e.key === 'Tab') {
          e.preventDefault();
          const nextC = c + 1 < cols ? c + 1 : 0;
          const nextR = c + 1 < cols ? r : r + 1;
          if (nextR < rows) {
            container.querySelector(`input[data-row="${nextR}"][data-col="${nextC}"]`)?.focus();
          }
        }
      });

      td.appendChild(input);
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }

  grid.appendChild(table);
}

function _generateBBCode(container, rows, cols) {
  const style      = container.querySelector('#tm-style').value;
  const headerRow  = container.querySelector('#tm-header-row').checked;
  const getCellVal = (r, c) => container.querySelector(`input[data-row="${r}"][data-col="${c}"]`)?.value || '';

  const lines = ['[table]'];

  for (let r = 0; r < rows; r++) {
    const isHeader = headerRow && r === 0;
    lines.push('[tr]');
    for (let c = 0; c < cols; c++) {
      const val  = getCellVal(r, c);
      let cell   = val;

      if (isHeader && (style === 'bold_header' || style === 'full_bold')) {
        cell = `[b]${cell}[/b]`;
      }
      if (!isHeader && c === 0 && (style === 'firstcol' || style === 'full_bold')) {
        cell = `[b]${cell}[/b]`;
      }

      lines.push(`[td]${cell}[/td]`);
    }
    lines.push('[/tr]');
  }

  lines.push('[/table]');
  return lines.join('\n');
}
