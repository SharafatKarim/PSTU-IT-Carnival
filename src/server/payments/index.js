import connectDB from '@/server/db';
import { GAMING_PAYMENT } from '@/data/gaming';
import PaymentAccount from './model';

// ---------------------------------------------------------------------------
// Reading the receiving wallet for a tournament.
//
// Same contract as src/server/coordinators/: never throws, memoised briefly so
// a build or a burst of page renders is one query, and falls back to the
// constant in src/data/gaming.js if the collection is empty or unreachable.
//
// The fallback matters more here than it does for contacts — a registration
// form that cannot tell someone where to send the fee cannot be completed at
// all. The stored row still wins whenever there is one.
// ---------------------------------------------------------------------------

const TTL_MS = 30_000;
const memo = new Map();

const plain = (doc) => ({
  number: doc.number,
  accountType: doc.accountType || '',
  instructions: doc.instructions || '',
});

/**
 * The wallet a given game's entrants should pay into.
 *
 * Scopes are tried in order — a tournament with its own row wins, otherwise
 * the gaming-wide wallet is used.
 *
 * @param {string} slug  game slug, e.g. 'pubg-mobile'
 */
export async function gamePaymentAccount(slug) {
  const scopes = [slug, 'gaming'].filter(Boolean);
  const key = scopes.join('|');

  const hit = memo.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value;

  const remember = (value) => {
    memo.set(key, { at: Date.now(), value });
    return value;
  };

  try {
    await connectDB();

    const docs = await PaymentAccount.find({
      scope: { $in: scopes },
      active: true,
    }).lean();

    for (const scope of scopes) {
      const match = docs.find((doc) => doc.scope === scope);
      if (match) return remember(plain(match));
    }
    return remember(GAMING_PAYMENT);
  } catch (error) {
    console.error('[payments] lookup failed:', error);
    /* Remembered so an unreachable database is not re-dialled on every render,
       each attempt costing the connection timeout. */
    return remember(GAMING_PAYMENT);
  }
}
