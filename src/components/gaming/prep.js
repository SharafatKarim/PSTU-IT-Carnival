/* What an entrant needs in hand before starting a game's form.
   Shared by the detail page's hand-off panel and the closed-registration
   notice, so the two never tell people to prepare different things.

   A game states its own list in `registration.prep` (src/data/gaming.js) —
   what to bring differs per tournament, and the entry fee and ID format are
   part of the answer. The generic lists below are the fallback for a game
   that has not written one yet. */
export const prepList = (game) => {
  if (game.registration?.prep?.length > 0) return game.registration.prep;

  const fee = `The entry fee (${game.tournament.entryFee}) — collected on-site`;

  return game.registration?.kind === 'solo'
    ? [
        'Your in-game name and account ID, exactly as they appear in game',
        'A valid student ID for eligibility checks',
        fee,
      ]
    : [
        'A squad name, and every player’s in-game ID',
        'A team leader who can receive room IDs and passwords on WhatsApp',
        'A valid student ID for each player',
        fee,
      ];
};
