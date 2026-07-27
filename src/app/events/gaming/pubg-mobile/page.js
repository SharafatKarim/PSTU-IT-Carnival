import { notFound } from 'next/navigation';
import GameDetail from '@/components/gaming/GameDetail';
import { getGame } from '@/data/gaming';
import { gameCoordinators } from '@/server/coordinators';
import { gameMetadata } from '@/lib/metadata';

const SLUG = 'pubg-mobile';

export const metadata = gameMetadata(SLUG);

/* Coordinator contacts are read from the database so a phone number can be
   corrected without a redeploy. Revalidating means that edit appears within a
   minute rather than at the next build. */
export const revalidate = 60;

export default async function PubgMobilePage() {
  if (!getGame(SLUG)) notFound();

  return <GameDetail slug={SLUG} coordinators={await gameCoordinators(SLUG)} />;
}
