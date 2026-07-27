import connectDB from '@/server/db';
import { GAMING_DESK } from '@/data/gaming';
import Coordinator from './model';

// ---------------------------------------------------------------------------
// Reading coordinator contacts for a page.
//
// Called from server components, so it must never throw: the contact section
// is the least important part of a game page and a database hiccup must not
// take the whole route down with it. Every failure resolves to an empty list
// and the caller falls back to its own default.
// ---------------------------------------------------------------------------

/* Six routes read these, and `next build` prerenders all six back to back.
   Without a memo that is six round trips — or, on a build machine with no
   database reachable, six connection timeouts. Short enough that seeding the
   collection still shows up promptly, long enough to collapse a build. */
const TTL_MS = 30_000;
const memo = new Map();

/* Only what CoordinatorContact renders. Mongo documents are not serialisable
   across the server/client boundary — _id and the timestamps would throw. */
const plain = (doc) => ({
  name: doc.name,
  role: doc.role || '',
  phone: doc.phone || '',
  email: doc.email || '',
  facebook: doc.facebook || '',
});

/**
 * Coordinators for the given scopes, in the order they should be displayed.
 *
 * Scopes are tried in the order given: a game with its own row wins, and the
 * wing-wide desk is used only when the game has nobody of its own. That is
 * more useful than merging both, which would list the same person twice under
 * two different roles.
 *
 * @param {string[]} scopes  e.g. ['pubg-mobile', 'gaming']
 */
export async function listCoordinators(scopes) {
  const wanted = (Array.isArray(scopes) ? scopes : [scopes]).filter(Boolean);
  if (wanted.length === 0) return [];

  const key = wanted.join('|');
  const hit = memo.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value;

  const remember = (value) => {
    memo.set(key, { at: Date.now(), value });
    return value;
  };

  try {
    await connectDB();

    const docs = await Coordinator.find({
      scope: { $in: wanted },
      active: true,
    })
      .sort({ order: 1, name: 1 })
      .lean();

    for (const scope of wanted) {
      const matches = docs.filter((doc) => doc.scope === scope);
      if (matches.length > 0) return remember(matches.map(plain));
    }
    return remember([]);
  } catch (error) {
    console.error('[coordinators] lookup failed:', error);
    /* Remembered too — otherwise an unreachable database is re-dialled on
       every single page render, and each attempt costs the connection
       timeout. */
    return remember([]);
  }
}

/**
 * Contacts for a game page: its own desk, then the gaming wing's, then the
 * hard-coded fallback.
 *
 * The last step is not a second source of truth — the stored rows always win.
 * It exists because a database hiccup must not leave a live registration page
 * with no way to reach anybody at all.
 */
export async function gameCoordinators(slug) {
  const stored = await listCoordinators([slug, 'gaming']);
  return stored.length > 0 ? stored : GAMING_DESK;
}
