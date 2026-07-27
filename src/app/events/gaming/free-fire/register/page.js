import { notFound } from 'next/navigation';
import GameRegisterPage from '@/components/gaming/GameRegisterPage';
import { getGame } from '@/data/gaming';
import { gameCoordinators } from '@/server/coordinators';
import { gamePaymentAccount } from '@/server/payments';
import { gameRegisterMetadata } from '@/lib/metadata';

const SLUG = 'free-fire';

export const metadata = gameRegisterMetadata(SLUG);

export const revalidate = 60;

export default async function FreeFireRegisterPage() {
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
