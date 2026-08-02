import { getGame } from '@/data/gaming';

/* Dropdown filters for the admin tables — one entry per tab that has one.
 *
 * keyOf() reduces a row to the bucket it belongs in, normalized: entrants type
 * these values themselves, so 'PSTU' and 'pstu ' have to land together. An empty
 * key means the field is missing and gets its own bucket, sorted last.
 *
 * labelFor() receives the first row seen for a key, so a label can show the
 * spelling as submitted rather than the normalized form used for grouping. */
export const SECTION_FILTERS = {
  iupc: {
    allLabel: 'All universities',
    unknownLabel: 'University not given',
    summaryLabel: 'University',
    keyOf: (team) => String(team.varsityName || '').trim().toLowerCase(),
    labelFor: (_key, sample) => String(sample.varsityName || '').trim(),
  },

  gaming: {
    allLabel: 'All games',
    unknownLabel: 'Game not set',
    summaryLabel: 'Game',
    keyOf: (entry) => String(entry.game || '').trim().toLowerCase(),
    /* Rows carry the slug; GAMES holds the display name. An unrecognised slug
       still reads sensibly rather than vanishing from the list. */
    labelFor: (key) => getGame(key)?.name || key.toUpperCase(),
  },

  'project-showcase': {
    allLabel: 'All universities',
    unknownLabel: 'University not given',
    summaryLabel: 'University',
    keyOf: (team) => {
      const leader = (team.members || []).find((m) => m.isTeamLeader) || team.members?.[0];
      return String(leader?.universityName || '').trim().toLowerCase();
    },
    labelFor: (_key, sample) => {
      const leader = (sample.members || []).find((m) => m.isTeamLeader) || sample.members?.[0];
      return String(leader?.universityName || '').trim();
    },
  },

  hackathon: {
    allLabel: 'All universities',
    unknownLabel: 'University not given',
    summaryLabel: 'University',
    keyOf: (team) => {
      const leader = (team.members || []).find((m) => m.isTeamLeader) || team.members?.[0];
      return String(leader?.universityName || '').trim().toLowerCase();
    },
    labelFor: (_key, sample) => {
      const leader = (sample.members || []).find((m) => m.isTeamLeader) || sample.members?.[0];
      return String(leader?.universityName || '').trim();
    },
  },
};
