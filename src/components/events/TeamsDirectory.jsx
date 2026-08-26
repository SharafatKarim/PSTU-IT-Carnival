'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertIcon, ArrowLeftIcon, ArrowRightIcon, CheckIcon } from '@/components/landing/Icons';
import { fetchTeams } from '@/services/events/iupc';
import { getEventDetail, IUPC_PAYMENT, iupcPaymentClosed, HACKATHON_PAYMENT, hackathonPaymentClosed, HACKATHON_ACCEPTED_TEAMS } from '@/data/events';
import { eventTeamsNav } from '@/lib/routes';
import { accentOf } from '@/lib/accents';
import { useNow } from '@/lib/useNow';
import EventSubPage, { SubPageTabs } from './EventSubPage';
import PaymentModal from './PaymentModal';

const PAGE_SIZE = 25;
const DEBOUNCE_MS = 300;

/* Column template shared by the header and every row, so they cannot drift. */
const COLS = 'sm:grid-cols-[3rem_minmax(0,1fr)_minmax(0,1.15fr)_12.5rem]';

/* 'pre-registered' is where every team starts. It becomes 'paid' once the
   entry fee is settled after final registration opens. */
const STATUS_STYLES = {
  'pre-registered': 'border-gold-400/40 bg-gold-400/10 text-gold-300',
  selected: 'border-magenta-400/40 bg-magenta-400/10 text-magenta-300',
  delayed: 'border-red-400/40 bg-red-400/10 text-red-300',
  /* Reported, not yet reconciled — deliberately not the same green as paid. */
  'payment-submitted': 'border-aqua-400/40 bg-aqua-400/10 text-aqua-300',
  paid: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300',
  rejected: 'border-red-500/40 bg-red-500/10 text-red-300',
};

const StatusPill = ({ status = 'pre-registered', team, isHackathon }) => {
  const isSelected = isHackathon && team && (status === 'selected' || HACKATHON_ACCEPTED_TEAMS.includes(team.registrationId));
  const displayStatus = (status === 'pre-registered' && isSelected) ? 'selected' : status;

  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
        STATUS_STYLES[displayStatus] || STATUS_STYLES['pre-registered']
      }`}
    >
      {status === 'paid' && <CheckIcon className="h-3 w-3" />}
      {displayStatus === 'selected'
        ? 'Selected'
        : displayStatus === 'payment-submitted'
          ? 'Awaiting check'
          : displayStatus}
    </span>
  );
};

/* Table row on sm and up; a self-contained card below it. */
const TeamRow = ({ team, accent, onPay, closed, isHackathon, paymentConfig }) => (
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
        <StatusPill status={team.status} team={team} isHackathon={isHackathon} />
      </span>
    </div>

    <div className="min-w-0">
      <p className="truncate text-sm font-bold text-white">{team.teamName}</p>
      <p className="truncate font-mono text-[10px] text-mist-500">
        {team.registrationId}
      </p>
    </div>

    <div className="min-w-0">
      <p className="truncate text-sm text-mist-200">{team.varsityName || 'Hackathon Team'}</p>
      {team.members?.length > 0 && (
        <p className="truncate text-xs text-mist-500">{team.members.join(' · ')}</p>
      )}
    </div>

    <div className="hidden sm:flex sm:items-center sm:justify-end sm:gap-2">
      <StatusPill status={team.status} team={team} isHackathon={isHackathon} />
      <PayButton team={team} onPay={onPay} closed={closed} isHackathon={isHackathon} paymentConfig={paymentConfig} />
    </div>

    {/* On mobile the pill rides the top line, so the button gets its own row. */}
    <div className="sm:hidden">
      <PayButton team={team} onPay={onPay} closed={closed} isHackathon={isHackathon} paymentConfig={paymentConfig} full />
    </div>
  </li>
);

/* Shown until the fee is settled. A team whose reference is already in can see
   that it landed, but cannot submit a second one — the API refuses anyway.
 *
 * `closed` is the deadline having passed, decided on the CLIENT's clock. It
 * cannot be decided here at render time: this page is statically prerendered,
 * so a build on the 4th would bake in "open" for ever. It arrives as null until
 * the browser has told us what time it is, and null renders as open — the same
 * fallback the countdown pill uses, and the honest one, since the alternative
 * is flashing "closed" at everyone for a frame. The API is what actually
 * refuses a late submission. */
const PayButton = ({ team, onPay, closed, isHackathon, paymentConfig, full = false }) => {
  if (!isHackathon) return null;
  if (team.status === 'paid' || team.status === 'rejected' || team.status === 'delayed') return null;
  const isSelected = isHackathon && team && (team.status === 'selected' || HACKATHON_ACCEPTED_TEAMS.includes(team.registrationId));
  if (isHackathon && !isSelected) return null;

  const submitted = team.status === 'payment-submitted';
  const disabled = submitted || closed;

  return (
    <button
      type="button"
      onClick={() => onPay(team)}
      disabled={disabled}
      title={closed ? `The entry-fee deadline (${paymentConfig.deadline}) has passed` : undefined}
      className={`${full ? 'w-full' : ''} whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold transition ${
        disabled
          ? 'cursor-not-allowed border border-white/10 bg-white/5 text-mist-500'
          : 'bg-gold-400 text-ink-950 hover:bg-gold-300'
      }`}
    >
      {submitted ? 'Awaiting check' : closed ? 'Closed' : 'Pay'}
    </button>
  );
};

const TeamsDirectory = ({ slug = 'iupc' }) => {
  const event = getEventDetail(slug);
  const accent = accentOf(event?.accent);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isHackathon = slug === 'hackathon';
  const paymentConfig = isHackathon ? HACKATHON_PAYMENT : IUPC_PAYMENT;

  /* The row whose payment form is open, or null. */
  const [paying, setPaying] = useState(null);

  /* null until the browser reports the time — see PayButton for why this is not
     decided at render time. */
  const now = useNow();
  const closed = now ? (isHackathon ? hackathonPaymentClosed(now) : iupcPaymentClosed(now)) : false;

  const abortRef = useRef(null);

  const load = useCallback(async (term, pageNum) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const data = await fetchTeams(
        slug,
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
  }, [slug]);

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

  /* Flip the row locally so the button reads "Awaiting check" straight away.
     Cheaper and steadier than refetching the page the user is looking at. */
  const markSubmitted = (registrationId) =>
    setResult((prev) =>
      prev && {
        ...prev,
        teams: prev.teams.map((t) =>
          t.registrationId === registrationId
            ? { ...t, status: 'payment-submitted' }
            : t
        ),
      }
    );

  const teams = result?.teams ?? [];
  const total = result?.total ?? 0;
  const pages = result?.pages ?? 1;

  return (
    <EventSubPage
      event={event}
      slug={slug}
      nav={eventTeamsNav(slug)}
      eyebrow={event?.scope}
      title={isHackathon ? "Selected Teams" : "Registered Teams"}
      intro={isHackathon ? "Selected teams for the Hackathon grand finale. Search your team name or ID and press Pay to submit your payment details." : `Every team pre-registered for ${event?.name}. Search by team name, university, member, or serial number.`}
      tabs={<SubPageTabs slug={slug} active="teams" />}
    >
      {/* While the fee window is open this page has to carry the reminder on
          its own. The landing page leads with whatever phase is current — with
          IUPC pre-registration reopened that is "pre-register", which is right
          for a team that has not entered and says nothing to the ones already
          on this list with a fee outstanding. They arrive here; this is where
          the date belongs. Hidden once every row is settled, so a fully paid
          directory is not nagging anybody. */}
      {!closed && !loading && teams.some((t) => t.status !== 'paid') && (
        <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-gold-400/25 bg-gold-400/[0.07] px-4 py-3 text-sm text-mist-200">
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" />
          <span>
            <strong className="font-semibold text-white">
              The entry fee is still due
            </strong>{' '}
            — find your team below and press Pay. Payments close{' '}
            <strong className="font-semibold text-white">
              {paymentConfig.deadline}
            </strong>
            ; a team that has not paid by then may lose its slot.
          </span>
        </div>
      )}

      {/* A row full of greyed-out buttons is a bug until something says why. */}
      {closed && (
        <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-red-500/25 bg-red-950/20 px-4 py-3 text-sm text-mist-200">
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <span>
            <strong className="font-semibold text-white">
              The entry-fee deadline has passed
            </strong>{' '}
            — payments closed on {paymentConfig.deadline} and can no longer be
            submitted here. If you have already sent the money and your team
            still shows as pre-registered, contact the coordinators rather than
            sending it again.
          </span>
        </div>
      )}

      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search teams</span>
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by team name, university, member, or serial"
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
              <TeamRow
                key={team.registrationId}
                team={team}
                accent={accent}
                onPay={setPaying}
                closed={closed}
                isHackathon={isHackathon}
                paymentConfig={paymentConfig}
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
        Team, university, member names and status only — contact details are
        never shown here. Every pre-registered team has a slot; pay the entry
        fee from your row to confirm it.
      </p>

      {paying && (
        <PaymentModal
          team={paying}
          onClose={() => setPaying(null)}
          onPaid={markSubmitted}
        />
      )}
    </EventSubPage>
  );
};

export default TeamsDirectory;
