'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import {
  AlertIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
} from '@/components/landing/Icons';
import { fetchGameRegistrations } from '@/services/events/gaming';
import { getGame } from '@/data/gaming';
import { ROUTES, gameDirectoryNav } from '@/lib/routes';
import { accentOf } from '@/lib/accents';

// ---------------------------------------------------------------------------
// Public directory of who has entered a tournament.
//
// Two shapes from one component, because the difference is one column:
//   squad games  a squad name, or "To be Allocated" for someone who entered
//                alone and is waiting to be placed in one;
//   1v1 games    the player, and nothing about squads at all.
//
// Contact details, game IDs and payment references are never sent to the
// browser — see the PRIVACY note in src/server/events/gaming/directory.js.
// ---------------------------------------------------------------------------

const PAGE_SIZE = 25;
const DEBOUNCE_MS = 300;

const UNALLOCATED = 'To be Allocated';

/* Column template shared by the header and every row, so they cannot drift. */
const COLS_SQUAD = 'sm:grid-cols-[3rem_minmax(0,1.2fr)_minmax(0,1fr)_8rem]';
const COLS_SOLO = 'sm:grid-cols-[3rem_minmax(0,1.4fr)_minmax(0,1fr)_8rem]';

/* One flag, one pill. A row lands as 'pending' — a submitted transaction ID is
   a claim, not proof — and an admin moves it to 'paid' after matching it
   against the wallet statement, or to 'rejected'. */
const STATUS_PILL = {
  pending: {
    label: 'pending',
    className: 'border-gold-400/40 bg-gold-400/10 text-gold-300',
  },
  paid: {
    label: 'confirmed',
    className: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300',
    icon: true,
  },
  rejected: {
    label: 'rejected',
    className: 'border-red-500/40 bg-red-500/10 text-red-300',
  },
};

const StatusPill = ({ status }) => {
  const pill = STATUS_PILL[status] || STATUS_PILL.pending;

  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${pill.className}`}
    >
      {pill.icon && <CheckIcon className="h-3 w-3" />}
      {pill.label}
    </span>
  );
};

const EntryRow = ({ entry, accent, solo, cols }) => {
  /* The whole point of the squad column: someone who entered alone has no
     squad yet, and saying so beats an empty cell. */
  const squadLabel = entry.teamName || UNALLOCATED;
  const unallocated = !entry.teamName;

  return (
    <li
      className={`grid grid-cols-1 items-start gap-x-4 gap-y-2 border-t border-ink-700/70 px-3 py-3 transition hover:bg-white/[0.02] sm:items-center sm:py-2.5 ${cols}`}
    >
      <div className="flex items-center justify-between gap-3 sm:block">
        <span
          className={`inline-grid h-7 w-7 shrink-0 place-items-center rounded-md text-xs font-extrabold ${accent.bgSoft} ${accent.text}`}
        >
          {entry.serial ?? '—'}
        </span>
        {/* Status rides along the top line on mobile, own column on desktop. */}
        <span className="sm:hidden">
          <StatusPill status={entry.status} />
        </span>
      </div>

      <div className="min-w-0">
        <p
          className={`truncate text-sm font-bold ${
            solo || !unallocated ? 'text-white' : 'italic text-mist-400'
          }`}
        >
          {solo ? entry.playerName : squadLabel}
        </p>
        <p className="truncate font-mono text-[10px] text-mist-500">
          {entry.registrationId}
        </p>
      </div>

      <div className="min-w-0">
        {solo ? (
          <p className="truncate text-xs text-mist-500">Individual entry</p>
        ) : (
          <>
            <p className="truncate text-sm text-mist-200">{entry.playerName}</p>
            <p className="truncate text-xs text-mist-500">
              {unallocated
                ? 'Entered alone — squad formed by the committee'
                : `${entry.playerCount} player${entry.playerCount === 1 ? '' : 's'}`}
            </p>
          </>
        )}
      </div>

      <div className="hidden sm:block sm:justify-self-end">
        <StatusPill status={entry.status} />
      </div>
    </li>
  );
};

const RegisteredList = ({ slug }) => {
  const game = getGame(slug);
  const accent = accentOf(game?.accent);
  const solo = game?.registration?.kind === 'solo';
  const cols = solo ? COLS_SOLO : COLS_SQUAD;

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const abortRef = useRef(null);

  const load = useCallback(
    async (term, pageNum) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);
      try {
        const data = await fetchGameRegistrations(
          slug,
          { search: term, page: pageNum, limit: PAGE_SIZE },
          controller.signal
        );
        setResult(data);
      } catch (err) {
        // A superseded request is not a failure — a newer one is already running.
        if (err?.name === 'AbortError') return;
        setError(err.message || 'Could not load registrations');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    },
    [slug]
  );

  /* Debounced so typing a squad name is one request, not one per keystroke. */
  useEffect(() => {
    const id = setTimeout(() => load(search, page), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [search, page, load]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const onSearchChange = (value) => {
    setSearch(value);
    setPage(1); // a new term always starts from the first page
  };

  if (!game) return null;

  const entries = result?.entries ?? [];
  const total = result?.total ?? 0;
  const pages = result?.pages ?? 1;
  const counts = result?.counts;

  const noun = solo ? 'player' : 'entry';
  const nounPlural = solo ? 'players' : 'entries';

  return (
    <div className="flex min-h-screen flex-col bg-ink-950">
      <Navbar
        links={gameDirectoryNav(slug)}
        homeHref={ROUTES.home}
        ctaHref={ROUTES.gameRegister(slug)}
        ctaLabel="Register"
      />

      {/* shrink-0 is load-bearing. This is a flex child with overflow-hidden
          (for the blur blob), and flex-shrink defaults to 1 — so as soon as the
          page's natural content passes 100vh the header gives up height rather
          than the page growing, and the clipped rows are the last line of the
          intro and the squad counts. */}
      <header className="relative shrink-0 overflow-hidden">
        <div className="absolute inset-0 bg-hero opacity-70" />
        <div className="absolute inset-0 bg-grid bg-[size:44px_44px] opacity-40" />
        <div
          className={`absolute -right-24 -top-20 h-64 w-64 rounded-full blur-3xl ${accent.blob}`}
        />

        <div className="relative mx-auto w-full max-w-6xl px-4 pb-7 pt-8 sm:pb-8 sm:pt-10">
          <Link
            href={ROUTES.game(slug)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-mist-300 transition hover:text-white"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to {game.name} details
          </Link>

          <p
            className={`mt-5 text-xs font-bold uppercase tracking-[0.22em] ${accent.text}`}
          >
            {game.scope}
          </p>
          <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            {solo ? 'Registered Players' : 'Registered Squads'}
          </h1>
          <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-mist-300">
            {solo
              ? `Everyone entered for ${game.name}. Search by name, serial or registration ID.`
              : `Every squad entered for ${game.name}. Players who entered alone appear as “${UNALLOCATED}” until the committee groups them.`}
          </p>

          {counts && !solo && (
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-mist-300">
              <span>
                <strong className="font-bold text-white">{counts.squads}</strong>{' '}
                full squad{counts.squads === 1 ? '' : 's'}
              </span>
              <span>
                <strong className="font-bold text-white">{counts.solos}</strong>{' '}
                waiting to be allocated
              </span>
            </div>
          )}
        </div>
      </header>

      {/* flex-1 is what pins the footer down on short pages. */}
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <label className="relative flex-1">
              <span className="sr-only">Search registrations</span>
              <input
                type="search"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={
                  solo
                    ? 'Search by player name, serial or registration ID'
                    : 'Search by squad, player name, serial or registration ID'
                }
                className="w-full rounded-lg border border-ink-600 bg-ink-900/70 px-4 py-2.5 text-sm text-white placeholder-mist-500 outline-none transition focus:border-grape-500 focus:ring-2 focus:ring-grape-500/30"
              />
            </label>
            <p className="shrink-0 text-sm text-mist-400">
              {loading && !result
                ? 'Loading…'
                : `${total} ${total === 1 ? noun : nounPlural}${search ? ' found' : ''}`}
            </p>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-ink-600 bg-ink-800/50">
            <div
              className={`hidden gap-4 bg-ink-900/50 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-mist-400 sm:grid ${cols}`}
            >
              <span>#</span>
              <span>{solo ? 'Player' : 'Squad'}</span>
              <span>{solo ? 'Entry' : 'Registered by'}</span>
              <span className="justify-self-end">Payment</span>
            </div>

            {error ? (
              <div className="flex items-start gap-2.5 border-t border-ink-700/70 p-6 text-sm text-red-300">
                <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : loading ? (
              <p className="border-t border-ink-700/70 p-10 text-center text-sm text-mist-400">
                Loading {nounPlural}…
              </p>
            ) : entries.length === 0 ? (
              <div className="border-t border-ink-700/70 p-10 text-center">
                <p className="text-sm font-semibold text-mist-200">
                  {search
                    ? `No ${nounPlural} match that search`
                    : `No ${nounPlural} registered yet`}
                </p>
                <p className="mt-1 text-sm text-mist-500">
                  {search
                    ? 'Try a serial number, or part of the name.'
                    : 'Registrations appear here as they come in.'}
                </p>
              </div>
            ) : (
              <ul>
                {entries.map((entry) => (
                  <EntryRow
                    key={entry.registrationId}
                    entry={entry}
                    accent={accent}
                    solo={solo}
                    cols={cols}
                  />
                ))}
              </ul>
            )}
          </div>

          {pages > 1 && (
            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className="inline-flex items-center gap-2 rounded-lg border border-ink-600 px-4 py-2 text-sm font-semibold text-mist-200 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>
              <span className="text-sm text-mist-400">
                Page {page} of {pages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page >= pages || loading}
                className="inline-flex items-center gap-2 rounded-lg border border-ink-600 px-4 py-2 text-sm font-semibold text-mist-200 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="hidden sm:inline">Next</span>
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>
          )}

          <p className="mt-5 text-xs leading-relaxed text-mist-500">
            Names and payment state only — phone numbers, emails, game IDs and
            transaction references are never shown here. “Pending” means a
            transaction ID was submitted and is waiting on the committee;
            “confirmed” means it has been matched against the wallet statement.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RegisteredList;
