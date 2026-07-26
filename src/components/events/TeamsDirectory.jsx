'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertIcon, ArrowLeftIcon, ArrowRightIcon, CheckIcon } from '@/components/landing/Icons';
import { fetchTeams } from '@/services/events/iupc';
import { getEventDetail } from '@/data/events';
import { eventTeamsNav } from '@/lib/routes';
import { accentOf } from '@/components/gaming/accents';
import EventSubPage, { SubPageTabs } from './EventSubPage';

const PAGE_SIZE = 25;
const DEBOUNCE_MS = 300;

/* Column template shared by the header and every row, so they cannot drift. */
const COLS = 'sm:grid-cols-[3rem_minmax(0,1fr)_minmax(0,1.15fr)_7.5rem]';

/* 'pre-registered' is where every team starts. It becomes 'paid' once the
   entry fee is settled after final registration opens. */
const STATUS_STYLES = {
  'pre-registered': 'border-gold-400/40 bg-gold-400/10 text-gold-300',
  paid: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300',
  rejected: 'border-red-500/40 bg-red-500/10 text-red-300',
};

const StatusPill = ({ status = 'pre-registered' }) => (
  <span
    className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
      STATUS_STYLES[status] || STATUS_STYLES['pre-registered']
    }`}
  >
    {status === 'paid' && <CheckIcon className="h-3 w-3" />}
    {status}
  </span>
);

/* Table row on sm and up; a self-contained card below it. */
const TeamRow = ({ team, accent }) => (
  <li
    className={`grid grid-cols-1 items-start gap-x-4 gap-y-2 border-t border-ink-700/70 px-3 py-3 transition hover:bg-white/[0.02] sm:items-center sm:py-2.5 ${COLS}`}
  >
    <div className="flex items-center justify-between gap-3 sm:block">
      <span
        className={`inline-grid h-7 w-7 shrink-0 place-items-center rounded-md text-xs font-extrabold ${accent.bgSoft} ${accent.text}`}
      >
        {team.serial ?? '—'}
      </span>
      {/* Status rides along the top line on mobile, own column on desktop. */}
      <span className="sm:hidden">
        <StatusPill status={team.status} />
      </span>
    </div>

    <div className="min-w-0">
      <p className="truncate text-sm font-bold text-white">{team.teamName}</p>
      <p className="truncate font-mono text-[10px] text-mist-500">
        {team.registrationId}
      </p>
    </div>

    <div className="min-w-0">
      <p className="truncate text-sm text-mist-200">{team.varsityName}</p>
      {team.members?.length > 0 && (
        <p className="truncate text-xs text-mist-500">{team.members.join(' · ')}</p>
      )}
    </div>

    <div className="hidden sm:block sm:justify-self-end">
      <StatusPill status={team.status} />
    </div>
  </li>
);

const TeamsDirectory = ({ slug = 'iupc' }) => {
  const event = getEventDetail(slug);
  const accent = accentOf(event?.accent);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const abortRef = useRef(null);

  const load = useCallback(async (term, pageNum) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const data = await fetchTeams(
        { search: term, page: pageNum, limit: PAGE_SIZE },
        controller.signal
      );
      setResult(data);
    } catch (err) {
      // A superseded request is not a failure — a newer one is already running.
      if (err?.name === 'AbortError') return;
      setError(err.message || 'Could not load teams');
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  /* Debounced so typing a team name is one request, not one per keystroke. */
  useEffect(() => {
    const id = setTimeout(() => load(search, page), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [search, page, load]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const onSearchChange = (value) => {
    setSearch(value);
    setPage(1); // a new term always starts from the first page
  };

  const teams = result?.teams ?? [];
  const total = result?.total ?? 0;
  const pages = result?.pages ?? 1;

  return (
    <EventSubPage
      event={event}
      slug={slug}
      nav={eventTeamsNav(slug)}
      eyebrow={event?.scope}
      title="Registered Teams"
      intro={`Every team pre-registered for ${event?.name}. Search by team, university, member, serial or registration ID.`}
      tabs={<SubPageTabs slug={slug} active="teams" />}
    >
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search teams</span>
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by team, university, member, or serial"
            className="w-full rounded-lg border border-ink-600 bg-ink-900/70 px-4 py-2.5 text-sm text-white placeholder-mist-500 outline-none transition focus:border-grape-500 focus:ring-2 focus:ring-grape-500/30"
          />
        </label>
        <p className="shrink-0 text-sm text-mist-400">
          {loading && !result
            ? 'Loading…'
            : `${total} team${total === 1 ? '' : 's'}${search ? ' found' : ''}`}
        </p>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-ink-600 bg-ink-800/50">
        <div
          className={`hidden gap-4 bg-ink-900/50 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-mist-400 sm:grid ${COLS}`}
        >
          <span>#</span>
          <span>Team</span>
          <span>University &amp; Members</span>
          <span className="justify-self-end">Status</span>
        </div>

        {error ? (
          <div className="flex items-start gap-2.5 border-t border-ink-700/70 p-6 text-sm text-red-300">
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : loading ? (
          <p className="border-t border-ink-700/70 p-10 text-center text-sm text-mist-400">
            Loading teams…
          </p>
        ) : teams.length === 0 ? (
          <div className="border-t border-ink-700/70 p-10 text-center">
            <p className="text-sm font-semibold text-mist-200">
              {search ? 'No teams match that search' : 'No teams registered yet'}
            </p>
            <p className="mt-1 text-sm text-mist-500">
              {search
                ? 'Try a serial number, part of the team name, or the university.'
                : 'Registered teams will appear here as they sign up.'}
            </p>
          </div>
        ) : (
          <ul>
            {teams.map((team) => (
              <TeamRow key={team.registrationId} team={team} accent={accent} />
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
        Team, university, member names and status only — contact details are
        never shown here. Pre-registration is not a confirmed slot; slots are
        published university-wise once entries close.
      </p>
    </EventSubPage>
  );
};

export default TeamsDirectory;
