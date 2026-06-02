// exportUtils.js — CSV, JSON, TXT, BBCode export helpers

import { downloadFile } from './sharedUI.js';

// ── CSV ───────────────────────────────────────────────────────────────────────

export function toCsv(rows, headers) {
  const escape = v => {
    const s = String(v ?? '').replace(/"/g, '""');
    return /[",\n\r]/.test(s) ? `"${s}"` : s;
  };
  const lines = [];
  if (headers) lines.push(headers.map(escape).join(','));
  rows.forEach(row => {
    const values = Array.isArray(row) ? row : headers.map(h => row[h] ?? '');
    lines.push(values.map(escape).join(','));
  });
  return lines.join('\n');
}

export function exportCsv(rows, headers, filename = 'export.csv') {
  downloadFile(filename, toCsv(rows, headers), 'text/csv;charset=utf-8');
}

// ── JSON ──────────────────────────────────────────────────────────────────────

export function exportJson(data, filename = 'export.json') {
  downloadFile(filename, JSON.stringify(data, null, 2), 'application/json');
}

// ── TXT ───────────────────────────────────────────────────────────────────────

export function exportTxt(text, filename = 'export.txt') {
  downloadFile(filename, text, 'text/plain;charset=utf-8');
}

// ── BBCode table from array ────────────────────────────────────────────────────

export function toBBCodeTable(rows, headers) {
  const row = cells => `[tr]${cells.map(c => `[td]${c}[/td]`).join('')}[/tr]`;
  const lines = ['[table]'];
  if (headers) lines.push(`[tr]${headers.map(h => `[td][b]${h}[/b][/td]`).join('')}[/tr]`);
  rows.forEach(r => {
    const values = Array.isArray(r) ? r : headers.map(h => r[h] ?? '');
    lines.push(row(values));
  });
  lines.push('[/table]');
  return lines.join('\n');
}

// ── TSV (tab-separated) for clipboard ────────────────────────────────────────

export function toTsv(rows, headers) {
  const clean = v => String(v ?? '').replace(/\t/g, ' ').replace(/\n/g, ' ');
  const lines = [];
  if (headers) lines.push(headers.map(clean).join('\t'));
  rows.forEach(row => {
    const values = Array.isArray(row) ? row : headers.map(h => row[h] ?? '');
    lines.push(values.map(clean).join('\t'));
  });
  return lines.join('\n');
}
