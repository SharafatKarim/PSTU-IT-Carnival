import { notFound } from 'next/navigation';
import GameRegisterPage from '@/components/gaming/GameRegisterPage';
import { getGame } from '@/data/gaming';
import { gameCoordinators } from '@/server/coordinators';
import { gameRegisterMetadata } from '@/lib/metadata';

const SLUG = 'free-fire';

export const metadata = gameRegisterMetadata(SLUG);

export const revalidate = 60;

export default async function FreeFireRegisterPage() {
  if (!getGame(SLUG)) notFound();

  return <GameRegisterPage slug={SLUG} coordinators={await gameCoordinators(SLUG)} />;
}
