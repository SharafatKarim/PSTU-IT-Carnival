// ---------------------------------------------------------------------------
// Shared input patterns.
//
// These live in one place because they were previously copied into the IUPC
// form, the IUPC server validator and the gaming config — and drifted: the
// IUPC copies rejected local-format numbers like 01712345678 while gaming
// accepted them. Import from here rather than re-declaring.
//
// Safe on both sides of the network boundary: no imports, no side effects.
// ---------------------------------------------------------------------------

/* The three ways people actually write a Bangladeshi mobile number:
     01712345678      local, with the trunk 0
     1712345678       bare, no prefix
     +8801712345678   international (the +, and 880, are both optional)
   Operator prefixes run 013–019. */
export const BD_PHONE_RE = /^(?:\+?880|0)?1[3-9]\d{8}$/;

export const EMAIL_RE = /^\S+@\S+\.\S+$/;

/* Team names use underscores instead of spaces so they survive scoreboards
   and exports. No varsity prefix is required. */
export const TEAM_NAME_RE = /^[A-Za-z0-9_]+$/;

export const PHONE_HINT = 'Use 01XXXXXXXXX or +8801XXXXXXXXX';
