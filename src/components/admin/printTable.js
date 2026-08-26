/* Shared printer for every admin table.
 *
 * Renders a plain, high-contrast document into an off-screen iframe and hands
 * it to the browser's own print dialog, where "Save as PDF" is the standard
 * destination. That keeps the export dependency-free instead of shipping a PDF
 * library to every admin, and it prints exactly what the preview shows.
 *
 * Columns are declared per section in registrationPrint.js; a serial column is
 * added here so every printed list is numbered the same way. */

const esc = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/* Cell text is escaped first, so a newline in the source data is the only thing
   that can become a <br> — the data itself can never inject markup. */
const cell = (value) => esc(value).replace(/\n/g, '<br />');

/* One frame at a time: a second print replaces the first rather than leaving
   detached iframes behind. */
let activeFrame = null;

const buildDocument = ({ title, summary, columns, rows }) => {
  const generatedAt = new Date().toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const head = columns
    .map(
      (col) =>
        `<th${col.width ? ` style="width:${esc(col.width)}"` : ''}>${esc(col.header)}</th>`
    )
    .join('');

  const body = rows.length
    ? rows
        .map((row, i) => {
          const cells = columns
            .map((col) => {
              const raw = col.value(row, i);
              const text = raw === '' || raw == null ? '—' : raw;
              return `<td${col.cls ? ` class="${esc(col.cls)}"` : ''}>${cell(text)}</td>`;
            })
            .join('');
          return `<tr>${cells}</tr>`;
        })
        .join('')
    : `<tr><td colspan="${columns.length}" class="empty">Nothing to print — this list is empty.</td></tr>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${esc(title)} — PSTU IT Carnival 2026</title>
<style>
  @page { size: A4 landscape; margin: 11mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    color: #111;
    font-size: 10px;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  header { border-bottom: 2px solid #111; padding-bottom: 8px; margin-bottom: 10px; }
  h1 { margin: 0; font-size: 16px; letter-spacing: -0.01em; }
  .sub { margin: 3px 0 0; font-size: 10px; color: #444; }
  .meta {
    margin-top: 6px; display: flex; justify-content: space-between;
    gap: 16px; font-size: 9.5px; color: #333;
  }
  .meta strong { color: #111; }
  table { width: 100%; border-collapse: collapse; }
  /* Repeats the header on every sheet and keeps a row from being torn in half. */
  thead { display: table-header-group; }
  tr { page-break-inside: avoid; }
  th, td { border: 1px solid #8a8a8a; padding: 4px 5px; text-align: left; vertical-align: top; }
  th {
    background: #ececec; font-size: 8.5px; text-transform: uppercase;
    letter-spacing: 0.05em; white-space: nowrap;
  }
  td.num { text-align: center; white-space: nowrap; }
  td.mono { font-family: "SFMono-Regular", Consolas, monospace; font-size: 9px; white-space: nowrap; }
  td.name { font-weight: 600; }
  td.wrap { word-break: break-word; }
  td.empty { text-align: center; padding: 18px; color: #666; }
  tbody tr:nth-child(even) { background: #f7f7f7; }
  footer { margin-top: 10px; font-size: 8.5px; color: #666; text-align: right; }
</style>
</head>
<body>
  <header>
    <h1>PSTU IT Carnival 2026 — ${esc(title)}</h1>
    <p class="sub">${esc(summary)}</p>
    <div class="meta">
      <span>Total rows: <strong>${rows.length}</strong></span>
      <span>Generated: <strong>${esc(generatedAt)}</strong></span>
    </div>
  </header>
  <table>
    <thead><tr>${head}</tr></thead>
    <tbody>${body}</tbody>
  </table>
  <footer>PSTU IT Carnival 2026 · Admin Export</footer>
</body>
</html>`;
};

export default function printTable({ title, summary = '', columns, rows = [] }) {
  if (typeof document === 'undefined') return;

  const withSerial = [
    { header: '#', width: '26px', cls: 'num', value: (_row, i) => String(i + 1) },
    ...columns,
  ];

  if (activeFrame) {
    activeFrame.remove();
    activeFrame = null;
  }

  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  frame.srcdoc = buildDocument({ title, summary, columns: withSerial, rows });
  frame.onload = () => {
    const win = frame.contentWindow;
    if (!win) return;
    /* Dropped only once the dialog closes — tearing the iframe down while it is
       still open cancels the print job in Chrome. */
    win.onafterprint = () => {
      if (activeFrame === frame) activeFrame = null;
      frame.remove();
    };
    win.focus();
    win.print();
  };

  activeFrame = frame;
  document.body.appendChild(frame);
}

export function printSeatPlan({ title = 'IUPC Seat Plan Bench Cards', teams = [] }) {
  if (typeof document === 'undefined') return;

  const cardsHtml = teams.length
    ? teams
        .map((t) => {
          const teamIdStr = t.teamId || t.registrationId || '';
          const room = t.room ? t.room : 'Room TBD';
          const seat = t.seat ? (String(t.seat).toLowerCase().startsWith('seat') ? t.seat : `Seat ${t.seat}`) : 'Seat TBD';
          return `
            <div class="card">
              <div class="card-header">
                <span>PSTU IT CARNIVAL 2026 · IUPC</span>
                ${teamIdStr ? `<span class="card-id-tag">${esc(teamIdStr)}</span>` : ''}
              </div>
              <div class="card-body">
                <div class="team-name">${esc(t.teamName)}</div>
                <div class="varsity-name">${esc(t.varsityName)}</div>
              </div>
              <div class="card-footer">
                <span class="room-tag">${esc(room)}</span>
                <span class="seat-tag">${esc(seat)}</span>
              </div>
            </div>
          `;
        })
        .join('')
    : '<div class="empty">No teams to print seat plan for.</div>';

  const doc = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${esc(title)} — PSTU IT Carnival 2026</title>
<style>
  @page { size: A4 portrait; margin: 8mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    color: #111;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 6mm 8mm;
  }
  .card {
    border: 2px dashed #444;
    border-radius: 8px;
    padding: 10px 12px;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 48mm;
    page-break-inside: avoid;
  }
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 8px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #555;
    border-bottom: 1px solid #ddd;
    padding-bottom: 3px;
    margin-bottom: 4px;
  }
  .card-id-tag {
    font-family: "SFMono-Regular", Consolas, monospace;
    font-size: 9px;
    font-weight: 800;
    color: #111;
  }
  .card-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .team-name {
    font-size: 15px;
    font-weight: 800;
    color: #000;
    line-height: 1.25;
    word-break: break-word;
  }
  .varsity-name {
    font-size: 11px;
    color: #444;
    font-weight: 500;
    margin-top: 2px;
    line-height: 1.3;
  }
  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-top: auto;
    padding-top: 4px;
    border-top: 1.5px solid #111;
  }
  .room-tag {
    font-size: 11px;
    font-weight: 700;
    background: #eeeeee;
    color: #222;
    padding: 2px 8px;
    border-radius: 4px;
    border: 1px solid #ccc;
  }
  .seat-tag {
    font-size: 12px;
    font-weight: 800;
    background: #111111;
    color: #ffffff;
    padding: 2px 10px;
    border-radius: 4px;
  }
  .empty {
    text-align: center;
    padding: 40px;
    font-size: 14px;
    color: #666;
  }
</style>
</head>
<body>
  <div class="grid">${cardsHtml}</div>
</body>
</html>`;

  if (activeFrame) {
    activeFrame.remove();
    activeFrame = null;
  }

  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  frame.srcdoc = doc;
  frame.onload = () => {
    const win = frame.contentWindow;
    if (!win) return;
    win.onafterprint = () => {
      if (activeFrame === frame) activeFrame = null;
      frame.remove();
    };
    win.focus();
    win.print();
  };

  activeFrame = frame;
  document.body.appendChild(frame);
}
