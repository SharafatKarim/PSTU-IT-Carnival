/* What an entrant needs in hand before starting a game's form.
   Shared by the detail page's hand-off panel and the closed-registration
   notice, so the two never tell people to prepare different things. */
export const prepList = (game) =>
  game.registration.kind === 'solo'
    ? [
        'Your in-game name and account ID, exactly as they appear in game',
        'A valid student ID for eligibility checks',
        `The entry fee (${game.tournament.entryFee}) — collected on-site`,
      ]
    : [
        'A squad name, plus four players and an optional substitute',
        'Every player’s in-game name and UID',
        'A captain who can receive room IDs and passwords',
        `The entry fee (${game.tournament.entryFee}) — collected on-site`,
      ];
