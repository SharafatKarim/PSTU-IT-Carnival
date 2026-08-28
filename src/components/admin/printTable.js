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
    color: #000000;
    background: #ffffff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 6mm 8mm;
  }
  .card {
    border: 2px dashed #000000;
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
    font-size: 8.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #222222;
    border-bottom: 1.5px solid #000000;
    padding-bottom: 3px;
    margin-bottom: 4px;
  }
  .card-id-tag {
    font-family: "SFMono-Regular", Consolas, monospace;
    font-size: 9.5px;
    font-weight: 800;
    color: #000000;
    border: 1px solid #000000;
    padding: 1px 6px;
    border-radius: 3px;
    background: #ffffff;
  }
  .card-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .team-name {
    font-size: 16px;
    font-weight: 900;
    color: #000000;
    line-height: 1.25;
    word-break: break-word;
  }
  .varsity-name {
    font-size: 11.5px;
    color: #111111;
    font-weight: 600;
    margin-top: 2px;
    line-height: 1.3;
  }
  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-top: auto;
    padding-top: 5px;
    border-top: 2px solid #000000;
  }
  .room-tag {
    font-size: 11px;
    font-weight: 800;
    background: #ffffff;
    color: #000000;
    padding: 2px 8px;
    border-radius: 4px;
    border: 1.5px solid #000000;
  }
  .seat-tag {
    font-size: 13px;
    font-weight: 900;
    background: #ffffff;
    color: #000000;
    padding: 2px 10px;
    border-radius: 4px;
    border: 2px solid #000000;
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

export function printEvaluationForm({ title = 'Project Showcasing Evaluation Form', teams = [] }) {
  if (typeof document === 'undefined') return;

  const generatedAt = new Date().toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const body = teams.length
    ? teams
        .map((t, i) => {
          const regId = t.registrationId || t.teamId || '—';
          const teamName = t.teamName || '—';
          const membersList = (t.members || [])
            .map((m) => `${m.name}${m.academicId ? ` (${m.academicId})` : ''}`)
            .join(', ');
          const projectTitle = t.projectTitle || t.projectName || '';
          const projectDetails = projectTitle
            ? `<strong>Project:</strong> ${esc(projectTitle)}<br/><strong>Members:</strong> ${esc(membersList)}`
            : esc(membersList);

          return `
            <tr>
              <td class="num">${i + 1}</td>
              <td class="mono">${esc(regId)}</td>
              <td class="name">${esc(teamName)}</td>
              <td class="wrap">${projectDetails}</td>
              <td class="comment-box"></td>
            </tr>
          `;
        })
        .join('')
    : `<tr><td colspan="5" class="empty">No teams found to evaluate.</td></tr>`;

  const doc = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${esc(title)} — PSTU IT Carnival 2026</title>
<style>
  @page { size: A4 portrait; margin: 10mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    color: #111;
    font-size: 11px;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  header { border-bottom: 2px solid #111; padding-bottom: 10px; margin-bottom: 14px; }
  h1 { margin: 0; font-size: 18px; letter-spacing: -0.01em; }
  .sub { margin: 3px 0 0; font-size: 11px; color: #444; }
  .judge-info {
    margin-top: 12px;
    padding: 10px 12px;
    border: 1.5px solid #222;
    border-radius: 6px;
    background: #fafafa;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    font-weight: 600;
  }
  .judge-line {
    border-bottom: 1.5px solid #222;
    min-width: 200px;
    display: inline-block;
    height: 16px;
  }
  .meta {
    margin-top: 8px; display: flex; justify-content: space-between;
    font-size: 10px; color: #555;
  }
  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  thead { display: table-header-group; }
  tr { page-break-inside: avoid; }
  th, td { border: 1px solid #666; padding: 8px 8px; text-align: left; vertical-align: top; }
  th {
    background: #eaeaea; font-size: 10px; text-transform: uppercase;
    letter-spacing: 0.05em; white-space: nowrap;
  }
  td.num { text-align: center; font-weight: bold; width: 30px; }
  td.mono { font-family: "SFMono-Regular", Consolas, monospace; font-size: 10.5px; font-weight: bold; width: 130px; white-space: nowrap; }
  td.name { font-weight: bold; width: 140px; }
  td.wrap { width: 220px; word-break: break-word; }
  td.comment-box { height: 50px; background: #ffffff; }
  td.empty { text-align: center; padding: 20px; color: #666; }
  tbody tr:nth-child(even) { background: #fdfdfd; }
  footer { margin-top: 14px; font-size: 9px; color: #666; text-align: right; }
</style>
</head>
<body>
  <header>
    <h1>PSTU IT Carnival 2026 — ${esc(title)}</h1>
    <p class="sub">Official Judge Evaluation & Scoring Sheet</p>
    <div class="judge-info">
      <div>Judge's Name: <span class="judge-line"></span></div>
      <div>Signature: <span class="judge-line" style="min-width: 140px;"></span></div>
      <div>Date: <span class="judge-line" style="min-width: 90px;"></span></div>
    </div>
    <div class="meta">
      <span>Total Teams: <strong>${teams.length}</strong></span>
      <span>Generated: <strong>${esc(generatedAt)}</strong></span>
    </div>
  </header>
  <table>
    <thead>
      <tr>
        <th style="width: 30px;">#</th>
        <th style="width: 130px;">Reg ID</th>
        <th style="width: 140px;">Team Name</th>
        <th style="width: 220px;">Project & Members</th>
        <th>Judge Score & Comments</th>
      </tr>
    </thead>
    <tbody>${body}</tbody>
  </table>
  <footer>PSTU IT Carnival 2026 · Project Showcasing Evaluation Sheet</footer>
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

export function printBalloonText({ title = 'IUPC Balloon Text Strips', teams = [] }) {
  if (typeof document === 'undefined') return;

  const stripsHtml = teams.length
    ? teams
        .map((t, idx) => {
          const teamIdStr = t.teamId || t.registrationId || '';
          const teamName = t.teamName || 'Team';
          const varsity = t.varsityName ? ` (${t.varsityName})` : '';
          const roomSeat = [t.room, t.seat ? (String(t.seat).toLowerCase().startsWith('seat') ? t.seat : `Seat ${t.seat}`) : ''].filter(Boolean).join(' · ');

          return `
            <div class="strip">
              <div class="strip-content">
                <span class="message">Good luck Balloon for team <strong class="team-name">${esc(teamName)}</strong>${esc(varsity)}.</span>
              </div>
              ${(teamIdStr || roomSeat) ? `
                <div class="strip-meta">
                  ${teamIdStr ? `<span class="meta-tag mono">${esc(teamIdStr)}</span>` : ''}
                  ${roomSeat ? `<span class="meta-tag">${esc(roomSeat)}</span>` : ''}
                </div>
              ` : ''}
            </div>
          `;
        })
        .join('')
    : '<div class="empty">No teams to print balloon text for.</div>';

  const doc = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${esc(title)} — PSTU IT Carnival 2026</title>
<style>
  @page { size: A4 landscape; margin: 8mm 10mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    color: #000000;
    background: #ffffff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .header {
    border-bottom: 2px solid #000;
    padding-bottom: 6px;
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .header h1 {
    margin: 0;
    font-size: 14px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .header .meta {
    font-size: 11px;
    font-weight: 600;
    color: #333;
  }
  .strips-container {
    display: flex;
    flex-direction: column;
  }
  .strip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 13px 12px;
    border-bottom: 2px dashed #333333;
    page-break-inside: avoid;
    height: 21mm;
    box-sizing: border-box;
  }
  .strip-content {
    flex: 1;
    font-size: 15px;
    line-height: 1.35;
    color: #111;
  }
  .team-name {
    font-size: 17px;
    font-weight: 900;
    color: #000;
  }
  .strip-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }
  .meta-tag {
    font-size: 11px;
    font-weight: 700;
    border: 1.5px solid #222;
    padding: 3px 8px;
    border-radius: 4px;
    background: #f8f8f8;
    white-space: nowrap;
  }
  .meta-tag.mono {
    font-family: "SFMono-Regular", Consolas, monospace;
  }
  .empty {
    text-align: center;
    padding: 40px;
    font-size: 15px;
    color: #666;
  }
</style>
</head>
<body>
  <div class="header">
    <h1>PSTU IT CARNIVAL 2026 · IUPC Balloon Encouragement Strips</h1>
    <div class="meta">Total teams: ${teams.length}</div>
  </div>
  <div class="strips-container">${stripsHtml}</div>
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

export function printBaggageTags({ title = 'IUPC Contestant Baggage Tokens', teams = [] }) {
  if (typeof document === 'undefined') return;

  const tokens = [];
  teams.forEach((t) => {
    const teamIdStr = t.teamId || t.registrationId || '';
    const teamName = t.teamName || 'Team';
    const varsity = t.varsityName || 'University';
    const room = t.room ? t.room : 'Room TBD';
    const seat = t.seat ? (String(t.seat).toLowerCase().startsWith('seat') ? t.seat : `Seat ${t.seat}`) : 'Seat TBD';

    const members = (t.members && Array.isArray(t.members) && t.members.length > 0)
      ? t.members
      : [{ name: 'Contestant 1' }, { name: 'Contestant 2' }, { name: 'Contestant 3' }];

    members.forEach((m, idx) => {
      const memberName = typeof m === 'string' ? m : (m.name || `Contestant ${idx + 1}`);
      const memberPhone = typeof m === 'object' && m.phone ? m.phone : '';
      const isLeader = typeof m === 'object' && m.isTeamLeader;
      const tokenCode = `${teamIdStr}-B${idx + 1}`;

      tokens.push({
        teamIdStr,
        teamName,
        varsity,
        room,
        seat,
        memberName,
        memberPhone,
        isLeader,
        tokenCode,
        bagNum: idx + 1,
        totalBags: members.length,
      });
    });
  });

  const cardsHtml = tokens.length
    ? tokens
        .map((tok) => `
          <div class="baggage-card">
            <!-- TOP HALF: BAG ATTACHMENT TAG -->
            <div class="bag-tag-section">
              <div class="baggage-header">
                <span>PSTU IT CARNIVAL 2026 · BAG STORAGE TAG</span>
                <span class="baggage-token-code">${esc(tok.tokenCode)}</span>
              </div>
              <div class="baggage-body">
                <div class="team-title">${esc(tok.teamName)}</div>
                <div class="varsity-title">${esc(tok.varsity)}</div>
                <div class="owner-info">
                  <div>Contestant: <span class="owner-name">${esc(tok.memberName)}</span>${tok.isLeader ? ' (Leader)' : ''}</div>
                  ${tok.memberPhone ? `<div class="owner-phone">Phone: ${esc(tok.memberPhone)}</div>` : ''}
                </div>
              </div>
              <div class="baggage-footer">
                <span class="loc-badge">${esc(tok.room)} · ${esc(tok.seat)}</span>
                <span class="bag-num-tag">Bag ${tok.bagNum} of ${tok.totalBags}</span>
              </div>
            </div>

            <!-- CUT DIVIDER -->
            <div class="cut-divider">
              <span>✂ CUT & HAND CLAIM TOKEN BELOW TO CONTESTANT</span>
            </div>

            <!-- BOTTOM HALF: CONTESTANT CLAIM TOKEN -->
            <div class="claim-token-section">
              <div class="claim-header">
                <span>CONTESTANT BAGGAGE CLAIM TOKEN</span>
                <span class="claim-token-code">${esc(tok.tokenCode)}</span>
              </div>
              <div class="claim-body">
                <div class="claim-team">${esc(tok.teamName)} <span class="claim-owner">(${esc(tok.memberName)})</span></div>
                <div class="claim-note">Present this token at the baggage counter after contest to retrieve your bag.</div>
              </div>
            </div>
          </div>
        `)
        .join('')
    : '<div class="empty">No baggage tokens to print.</div>';

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
    color: #000000;
    background: #ffffff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 6mm 8mm;
  }
  .baggage-card {
    border: 2px solid #000000;
    border-radius: 8px;
    padding: 8px 10px;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 62mm;
    page-break-inside: avoid;
  }
  .bag-tag-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .baggage-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 8px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #000000;
    border-bottom: 1.5px solid #000000;
    padding-bottom: 2px;
    margin-bottom: 3px;
  }
  .baggage-token-code {
    font-family: "SFMono-Regular", Consolas, monospace;
    font-size: 10px;
    font-weight: 900;
    color: #000000;
    border: 1.5px solid #000000;
    padding: 1px 5px;
    border-radius: 3px;
    background: #ffffff;
  }
  .baggage-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .team-title {
    font-size: 14px;
    font-weight: 900;
    color: #000000;
    line-height: 1.2;
    word-break: break-word;
  }
  .varsity-title {
    font-size: 10.5px;
    color: #111111;
    font-weight: 600;
    margin-top: 1px;
  }
  .owner-info {
    margin-top: 4px;
    padding: 3px 5px;
    border: 1px solid #000000;
    border-radius: 4px;
    font-size: 10px;
    background: #ffffff;
  }
  .owner-name {
    font-weight: 800;
  }
  .owner-phone {
    font-size: 9.5px;
    font-family: "SFMono-Regular", Consolas, monospace;
    font-weight: 700;
  }
  .baggage-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4px;
    margin-top: 4px;
    padding-top: 3px;
    border-top: 1px solid #000000;
  }
  .loc-badge {
    font-size: 10.5px;
    font-weight: 800;
    border: 1px solid #000000;
    padding: 1px 5px;
    border-radius: 3px;
  }
  .bag-num-tag {
    font-size: 10px;
    font-weight: 900;
    border: 1.5px solid #000000;
    padding: 1px 6px;
    border-radius: 3px;
  }
  .cut-divider {
    border-top: 1.5px dashed #000000;
    margin: 5px 0 3px 0;
    position: relative;
    text-align: center;
  }
  .cut-divider span {
    font-size: 7.5px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    background: #ffffff;
    padding: 0 4px;
    position: relative;
    top: -6px;
  }
  .claim-token-section {
    padding-top: 1px;
  }
  .claim-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 7.5px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #000000;
    margin-bottom: 2px;
  }
  .claim-token-code {
    font-family: "SFMono-Regular", Consolas, monospace;
    font-size: 9.5px;
    font-weight: 900;
    border: 1px solid #000000;
    padding: 0 5px;
    border-radius: 3px;
  }
  .claim-team {
    font-size: 10.5px;
    font-weight: 900;
    color: #000000;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .claim-owner {
    font-size: 9.5px;
    font-weight: 600;
  }
  .claim-note {
    font-size: 8px;
    color: #222222;
    margin-top: 1px;
    font-style: italic;
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
