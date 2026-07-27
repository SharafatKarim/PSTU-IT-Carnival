import { notFound } from 'next/navigation';
import GameRegisterPage from '@/components/gaming/GameRegisterPage';
import { getGame } from '@/data/gaming';
import { gameCoordinators } from '@/server/coordinators';
import { gamePaymentAccount } from '@/server/payments';
import { gameRegisterMetadata } from '@/lib/metadata';

const SLUG = 'efootball';

export const metadata = gameRegisterMetadata(SLUG);

export const revalidate = 60;

/* Closed tournaments still render — the page shows what to prepare and who to
   ask, rather than 404ing on a link somebody already shared. */
export default async function EfootballRegisterPage() {
  if (!getGame(SLUG)) notFound();

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
