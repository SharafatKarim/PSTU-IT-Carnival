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

const text = (value) => (typeof value === 'string' ? value.trim() : '');

/* The form submits a sparse array when a squad row was never rendered — an
   individual entry serialises as [contact, null, null, null]. A row without a
   game ID is not a player. */
const realRows = (players) =>
  (Array.isArray(players) ? players : []).filter((row) => text(row?.gameId));

export function normalizeGameRegistration(game, body) {
  const rows = realRows(body.players);

  /* eFootball fixes its entry type in the data and never asks; the battle
     royales ask. Trust the config over the payload where both exist, so a
     hand-crafted request cannot claim to be something else. */
  const entryType = game.registration.entryType || body.entryType;

  const players = rows.map((row, index) => ({
    isLeader: index === 0,
    name: text(row.name) || undefined,
    gameId: text(row.gameId),
    device: text(row.device) || undefined,
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
    gameIds: players.map((player) => player.gameId.toLowerCase()),
  };
}
