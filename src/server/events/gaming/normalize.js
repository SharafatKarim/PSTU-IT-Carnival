// ---------------------------------------------------------------------------
// Form payload -> database document.
//
// The browser sends the form's own shape (players.<n>.*, teamName, entryType,
// the agreement checkboxes). This turns it into the document described in
// ./model.js, and is the only place that knows how the two relate.
//
// Runs AFTER validation, so every required field is present and every value is
// a string. Its job is trimming, ordering and flattening — not checking.
// ---------------------------------------------------------------------------

import { feeFor } from '@/data/gaming';

const text = (value) => (typeof value === 'string' ? value.trim() : '');

/* The form submits a sparse array when a squad row was never rendered — an
   individual entry serialises as [contact, null, null, null].

   A row counted as real if it carries ANY identifying field. This used to test
   `gameId` alone, which was right while every tournament was an esport. Ludo is
   played on a board: there is no game ID, so every row was filtered out, the
   entry normalised to zero players and an empty contact, and create() threw a
   generic 500 at someone who had filled the form in correctly. */
const realRows = (players) =>
  (Array.isArray(players) ? players : []).filter(
    (row) => text(row?.gameId) || text(row?.name) || text(row?.academicId)
  );

export function normalizeGameRegistration(game, body, { receiverNumber } = {}) {
  const rows = realRows(body.players);

  /* eFootball fixes its entry type in the data and never asks; the battle
     royales ask. Trust the config over the payload where both exist, so a
     hand-crafted request cannot claim to be something else. */
  const entryType = game.registration.entryType || body.entryType;

  /* Hand-mapped, not spread, so a stray key in the payload cannot reach the
     document. That means every field a tournament collects must be listed
     here — academicId and faculty were being dropped silently, the form
     returning 201 while the data went nowhere. */
  const players = rows.map((row, index) => ({
    isLeader: index === 0,
    name: text(row.name) || undefined,
    gameId: text(row.gameId) || undefined,
    device: text(row.device) || undefined,
    academicId: text(row.academicId) || undefined,
    faculty: text(row.faculty) || undefined,
  }));

  const lead = rows[0] || {};

  return {
    game: game.slug,
    entryType,
    /* Only a squad has a name. An individual entrant is placed in a team the
       committee forms later, so leaving this unset is the honest record. */
    teamName: entryType === 'team' ? text(body.teamName) : undefined,
    contact: {
      name: text(lead.name),
      email: text(lead.email).toLowerCase(),
      phone: text(lead.phone),
    },
    players,
    /* Only tournaments that HAVE game IDs get the duplicate-entry index. A
       board game contributes an empty array rather than a list of undefined. */
    gameIds: players
      .map((player) => player.gameId?.toLowerCase())
      .filter(Boolean),
    payment: {
      method: text(body.payment?.method),
      /* Uppercased here as well as in the schema, so the route's duplicate
         check compares the same string the database will store.

         UNDEFINED when blank, never ''. The unique index is partial and covers
         documents where the field is a string — an empty string is a string,
         so two screenshot-only entries would collide and the second entrant
         would be told their transaction ID was a duplicate when they never
         gave one. */
      transactionId: text(body.payment?.transactionId).toUpperCase() || undefined,
      /* Both computed server-side. An entrant can claim any amount and any
         destination; neither is taken from the request. */
      receiverNumber: receiverNumber || '',
      amount: feeFor(game, entryType),
      /* Set by the route once the image is stored; null when the tournament
         does not ask for one. */
      screenshot: null,
    },

    /* Stored, not just validated. These were checked and then thrown away, so
       there was no record that anyone had accepted the rules. */
    agreements: {
      rules: body.agreeRules === true,
      contact: body.agreeContact === true,
      infoCorrect: body.agreeInfo === true,
    },
  };
}
