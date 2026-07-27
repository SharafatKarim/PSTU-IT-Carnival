import { notFound } from 'next/navigation';
import GameRegisterPage from '@/components/gaming/GameRegisterPage';
import { getGame } from '@/data/gaming';
import { gameCoordinators } from '@/server/coordinators';
import { gamePaymentAccount } from '@/server/payments';
import { gameRegisterMetadata } from '@/lib/metadata';

const SLUG = 'pubg-mobile';

export const metadata = gameRegisterMetadata(SLUG);

export const revalidate = 60;

export default async function PubgMobileRegisterPage() {
  if (!getGame(SLUG)) notFound();

  /* Only rendered if entries are shut — the closed notice names a coordinator
     to chase. Fetched either way so the two routes cannot show different
     contacts. */
  const [coordinators, paymentAccount] = await Promise.all([
    gameCoordinators(SLUG),
    gamePaymentAccount(SLUG),
  ]);

  return (
    <GameRegisterPage
      slug={SLUG}
      coordinators={coordinators}
      paymentAccount={paymentAccount}
    />
  );
}
