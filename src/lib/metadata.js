// ---------------------------------------------------------------------------
// Page metadata, built from the event data.
//
// Routes are explicit folders now, so without this every page.js would carry a
// hand-written title and description — four per event, drifting the moment a
// date or venue changes. Instead each page calls one of these and the copy
// keeps coming from src/data/.
// ---------------------------------------------------------------------------

import { EVENT } from '@/data/content';
import { getEventDetail } from '@/data/events';
import { getGame } from '@/data/gaming';

const SUFFIX = EVENT.title;

const build = (title, description) => ({
  title,
  description,
  openGraph: {
    title,
    description,
    type: 'website',
    images: [
      {
        url: '/cover.jpg',
        width: 1200,
        height: 630,
        alt: 'PSTU IT Carnival 2026 Scrim Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/cover.jpg'],
  },
});

/* A page whose data has been removed still needs a title — the route itself
   calls notFound(), this is only what the tab says on the way there. */
const missing = (what) => ({ title: `${what} not found — ${SUFFIX}` });

/* An announced event has no tournament block — describing it as though it did
   would print "undefined at undefined" into a search result. */
const announced = (event) =>
  build(
    `${event.name} — ${SUFFIX}`,
    `${event.blurb} Announced for ${SUFFIX}; date, format and registration to be confirmed.`
  );

export function eventMetadata(slug) {
  const event = getEventDetail(slug);
  if (!event) return missing('Event');
  if (!event.tournament) return announced(event);

  const t = event.tournament;
  const pool = t.prizePool ? ` Prize pool ${t.prizePool}.` : '';

  return build(
    `${event.name} — ${SUFFIX}`,
    `${event.fullName}. ${t.date} at ${t.venue}.${pool} Format, rules and pre-registration.`
  );
}

export function eventRegisterMetadata(slug) {
  const event = getEventDetail(slug);
  if (!event) return missing('Registration');

  /* An event can have a form before it has a date — the IT Quiz form is built
     and waiting on a venue and a receiving number. Without this guard the
     build crashes reading `teamSize` off undefined. */
  const t = event.tournament;
  if (!t) {
    return build(
      `${event.name} Registration — ${SUFFIX}`,
      `Register for ${event.fullName} at ${SUFFIX}. Date and venue to be announced.`
    );
  }

  return build(
    `${event.name} Pre-Registration — ${SUFFIX}`,
    `Pre-register your team for ${event.fullName} at ${SUFFIX}. ${t.teamSize}, held ${t.date} at ${t.venue}.`
  );
}

export function eventTeamsMetadata(slug) {
  const event = getEventDetail(slug);
  if (!event) return missing('Teams');

  return build(
    `${event.name} Registered Teams — ${SUFFIX}`,
    `Every team pre-registered for ${event.fullName} at ${SUFFIX}. Search by team name, university, member or serial number.`
  );
}

export function eventSlotsMetadata(slug) {
  const event = getEventDetail(slug);
  if (!event) return missing('Slot allocations');

  return build(
    `${event.name} Slot Allocations — ${SUFFIX}`,
    `University-wise slot allocation for ${event.fullName} at ${SUFFIX}.`
  );
}

export function gameMetadata(slug) {
  const game = getGame(slug);
  if (!game) return missing('Game');
  if (!game.tournament) return announced(game);

  const t = game.tournament;

  return build(
    `${game.name} — ${SUFFIX}`,
    `${game.tagline} ${t.date} at ${t.venue}. Prize pool ${t.prizePool}. Rules, format and registration.`
  );
}

export function gameDirectoryMetadata(slug) {
  const game = getGame(slug);
  if (!game) return missing('Registrations');

  const solo = game.registration?.kind === 'solo';

  return build(
    `${game.name} ${solo ? 'Registered Players' : 'Registered Squads'} — ${SUFFIX}`,
    solo
      ? `Everyone registered for the ${game.name} tournament at ${SUFFIX}. Search by player name, serial or registration ID.`
      : `Every squad registered for the ${game.name} tournament at ${SUFFIX}. Search by squad, player, serial or registration ID.`
  );
}

export function gameRegisterMetadata(slug) {
  const game = getGame(slug);
  if (!game) return missing('Registration');

  /* Same guard as eventRegisterMetadata: Ludo has a form and a fee but no
     published date, so there is no tournament block to read. */
  const t = game.tournament;
  if (!t) {
    return build(
      `${game.name} Registration — ${SUFFIX}`,
      `Register for the ${game.name} tournament at ${SUFFIX}. Date and format to be announced.`
    );
  }

  return build(
    `${game.name} Registration — ${SUFFIX}`,
    `Register for the ${game.name} tournament at ${SUFFIX}. ${t.teamSize}, ${t.date} at ${t.venue}. Entry ${t.entryFee}, closes ${t.deadline}.`
  );
}
