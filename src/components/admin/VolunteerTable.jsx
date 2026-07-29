'use client';

import { useMemo, useState } from 'react';
import { EVENTS } from '@/data/content';
import printTable from './printTable';

const CANONICAL_EVENTS = EVENTS.map((e) => e.name);
const T_SHIRT_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

/* A PSTU student ID carries the session in its first two digits — 2102015 is a
   '21' student. Punctuation varies between entries ('21-02-015'), so the digits
   are pulled out before slicing. */
const sessionOf = (studentId) => {
  const digits = String(studentId || '').replace(/\D/g, '');
  return digits.length >= 2 ? digits.slice(0, 2) : '';
};

/* The volunteer form defaults to M and the schema defaults to '', so a blank
   size is displayed and filtered as M rather than as its own bucket. */
const sizeOf = (volunteer) => volunteer.tShirtSize || 'M';

const eventsOf = (volunteer) =>
  (Array.isArray(volunteer.events) ? volunteer.events : [])
    .map((e) => String(e).trim())
    .filter(Boolean);

/* Every list — filtered or whole — is ordered by student ID so the serials mean
   something and a volunteer keeps the same place between two prints.
   Ordered numerically, not lexically: as text '9' would land after '2102015'.
   Compared digit-count first rather than via Number() so a mistyped 20-digit
   entry cannot lose precision, with leading zeros dropped so that shortcut
   holds. IDs carrying no digits sink to the end, and the registration ID
   breaks ties to keep the order total and stable. */
const sortKeyOf = (studentId) =>
  String(studentId || '').replace(/\D/g, '').replace(/^0+/, '');

const compareById = (a, b) => {
  const keyA = sortKeyOf(a.studentId);
  const keyB = sortKeyOf(b.studentId);
  if (keyA !== keyB) {
    if (!keyA || !keyB) return keyA ? -1 : 1;
    if (keyA.length !== keyB.length) return keyA.length - keyB.length;
    return keyA < keyB ? -1 : 1;
  }
  return String(a.registrationId || '').localeCompare(String(b.registrationId || ''));
};

/* Mirrors the on-screen columns; printTable adds the serial and does the
   escaping. Email and events wrap because they are the only fields long enough
   to need it. */
const PRINT_COLUMNS = [
  { header: 'Reg ID', cls: 'mono', value: (v) => v.registrationId },
  { header: 'Name', cls: 'name', value: (v) => v.fullName },
  { header: 'Student ID', cls: 'mono', value: (v) => v.studentId },
  { header: 'Session', cls: 'num', value: (v) => sessionOf(v.studentId) },
  { header: 'Size', cls: 'num', value: (v) => sizeOf(v) },
  { header: 'Phone', value: (v) => v.phone },
  { header: 'Email', cls: 'wrap', value: (v) => v.email },
  { header: 'Selected Events', cls: 'wrap', value: (v) => eventsOf(v).join(', ') },
];

const selectClass =
  'rounded-lg border border-ink-500 bg-ink-950/60 px-3 py-2 text-xs font-medium text-white outline-none focus:border-grape-400 focus:ring-1 focus:ring-grape-400/30 transition';

export default function VolunteerTable({ volunteers }) {
  const rows = useMemo(() => (Array.isArray(volunteers) ? volunteers : []), [volunteers]);

  const [query, setQuery] = useState('');
  const [session, setSession] = useState('all');
  const [event, setEvent] = useState('all');
  const [size, setSize] = useState('all');

  const sessionOptions = useMemo(() => {
    const counts = new Map();
    for (const v of rows) {
      const key = sessionOf(v.studentId) || 'unknown';
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => {
        if (a[0] === 'unknown') return 1;
        if (b[0] === 'unknown') return -1;
        return Number(b[0]) - Number(a[0]);
      })
      .map(([value, count]) => ({ value, count }));
  }, [rows]);

  const eventOptions = useMemo(() => {
    const counts = new Map();
    for (const v of rows) {
      for (const name of eventsOf(v)) counts.set(name, (counts.get(name) || 0) + 1);
    }
    const known = CANONICAL_EVENTS.filter((name) => counts.has(name));
    const extras = [...counts.keys()]
      .filter((name) => !CANONICAL_EVENTS.includes(name))
      .sort((a, b) => a.localeCompare(b));
    return [...known, ...extras].map((value) => ({ value, count: counts.get(value) }));
  }, [rows]);

  const sizeOptions = useMemo(() => {
    const counts = new Map();
    for (const v of rows) {
      const key = sizeOf(v);
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    const known = T_SHIRT_SIZES.filter((s) => counts.has(s));
    const extras = [...counts.keys()].filter((s) => !T_SHIRT_SIZES.includes(s)).sort();
    return [...known, ...extras].map((value) => ({ value, count: counts.get(value) }));
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows
      .filter((v) => {
        if (session !== 'all' && (sessionOf(v.studentId) || 'unknown') !== session) return false;
        if (event !== 'all' && !eventsOf(v).includes(event)) return false;
        if (size !== 'all' && sizeOf(v) !== size) return false;
        if (!q) return true;
        return [v.fullName, v.studentId, v.registrationId, v.email, v.phone].some((field) =>
          String(field || '').toLowerCase().includes(q)
        );
      })
      .sort(compareById);
  }, [rows, query, session, event, size]);

  /* Sorted here too — "Print All" bypasses the filters, and an unsorted sheet
     next to a sorted one would be hard to read against each other. */
  const allSorted = useMemo(() => [...rows].sort(compareById), [rows]);

  const filtersActive =
    query.trim() !== '' || session !== 'all' || event !== 'all' || size !== 'all';

  const clearFilters = () => {
    setQuery('');
    setSession('all');
    setEvent('all');
    setSize('all');
  };

  const activeFilterSummary = () => {
    const parts = [];
    if (session !== 'all') parts.push(`Session: ${session === 'unknown' ? 'Unknown' : session}`);
    if (event !== 'all') parts.push(`Event: ${event}`);
    if (size !== 'all') parts.push(`T-Shirt: ${size}`);
    if (query.trim()) parts.push(`Search: "${query.trim()}"`);
    return parts.length ? parts.join('  ·  ') : 'No filters — complete list';
  };

  const printList = (list, summary) =>
    printTable({
      title: 'Volunteer List',
      summary,
      columns: PRINT_COLUMNS,
      rows: list,
    });

  return (
    <div>
      <div className="border-b border-white/10 bg-ink-950/30 p-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, student ID, reg ID, email or phone…"
            className="min-w-60 flex-1 rounded-lg border border-ink-500 bg-ink-950/60 px-3 py-2 text-xs text-white placeholder-mist-500 outline-none focus:border-grape-400 focus:ring-1 focus:ring-grape-400/30 transition"
          />

          <select value={session} onChange={(e) => setSession(e.target.value)} className={selectClass}>
            <option value="all" className="bg-ink-900">All sessions ({rows.length})</option>
            {sessionOptions.map(({ value, count }) => (
              <option key={value} value={value} className="bg-ink-900">
                {value === 'unknown' ? 'Unknown session' : `Session ${value}`} ({count})
              </option>
            ))}
          </select>

          <select value={event} onChange={(e) => setEvent(e.target.value)} className={selectClass}>
            <option value="all" className="bg-ink-900">All events</option>
            {eventOptions.map(({ value, count }) => (
              <option key={value} value={value} className="bg-ink-900">
                {value} ({count})
              </option>
            ))}
          </select>

          <select value={size} onChange={(e) => setSize(e.target.value)} className={selectClass}>
            <option value="all" className="bg-ink-900">All t-shirt sizes</option>
            {sizeOptions.map(({ value, count }) => (
              <option key={value} value={value} className="bg-ink-900">
                Size {value} ({count})
              </option>
            ))}
          </select>

          {filtersActive && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-xs font-bold rounded-lg border border-white/10 bg-white/5 text-mist-300 hover:text-white hover:bg-white/10 transition"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-mist-400">
            Showing <span className="font-bold text-white">{filtered.length}</span> of{' '}
            <span className="font-bold text-white">{rows.length}</span> volunteers
            {filtersActive && <span className="text-mist-500"> · {activeFilterSummary()}</span>}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => printList(filtered, activeFilterSummary())}
              disabled={filtered.length === 0}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-grape-600 hover:bg-grape-500 text-white transition disabled:opacity-40 disabled:hover:bg-grape-600"
            >
              Print / Save PDF ({filtered.length})
            </button>
            {filtersActive && (
              <button
                onClick={() => printList(allSorted, 'No filters — complete list')}
                disabled={rows.length === 0}
                className="px-4 py-2 text-xs font-bold rounded-lg border border-grape-400/40 bg-white/5 text-white hover:bg-white/10 transition disabled:opacity-40"
              >
                Print All ({rows.length})
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-ink-950/40 text-xs font-bold uppercase tracking-wider text-mist-400">
              <th className="px-4 py-4 w-12">#</th>
              <th className="px-6 py-4">Reg ID</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Student ID</th>
              <th className="px-6 py-4">Session</th>
              <th className="px-6 py-4">Email / Phone</th>
              <th className="px-6 py-4">T-Shirt Size</th>
              <th className="px-6 py-4">Selected Events</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-10 text-center text-mist-400">
                  {rows.length === 0
                    ? 'No volunteer registrations found.'
                    : 'No volunteers match the current filters.'}
                </td>
              </tr>
            ) : (
              filtered.map((v, i) => (
                <tr key={v._id} className="hover:bg-white/2 transition">
                  <td className="px-4 py-4 text-xs font-bold text-mist-400 tabular-nums">{i + 1}</td>
                  <td className="px-6 py-4 font-mono text-xs text-gold-400 font-bold">{v.registrationId}</td>
                  <td className="px-6 py-4 font-bold text-white">{v.fullName}</td>
                  <td className="px-6 py-4 text-mist-300 font-mono text-xs">{v.studentId}</td>
                  <td className="px-6 py-4">
                    <span className="rounded bg-grape-500/15 border border-grape-400/30 px-2 py-0.5 text-[11px] font-bold text-grape-300">
                      {sessionOf(v.studentId) || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-mist-300">
                    <div className="text-white font-medium">{v.email || 'N/A'}</div>
                    <div className="text-mist-400">{v.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-mist-300">{sizeOf(v)}</td>
                  <td className="px-6 py-4 text-xs">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {eventsOf(v).map((evt) => (
                        <span
                          key={evt}
                          className={`rounded px-2 py-0.5 text-[11px] ${
                            event === evt
                              ? 'bg-aqua-400/20 border border-aqua-400/40 text-aqua-200 font-semibold'
                              : 'bg-white/10 text-aqua-300'
                          }`}
                        >
                          {evt}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
