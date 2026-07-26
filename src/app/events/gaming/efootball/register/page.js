import { notFound } from 'next/navigation';
import GameRegisterPage from '@/components/gaming/GameRegisterPage';
import { getGame } from '@/data/gaming';
import { gameRegisterMetadata } from '@/lib/metadata';

const SLUG = 'efootball';

export const metadata = gameRegisterMetadata(SLUG);

/* Closed tournaments still render — the page shows what to prepare and who to
   ask, rather than 404ing on a link somebody already shared. */
export default function EfootballRegisterPage() {
  if (!getGame(SLUG)) notFound();

  return <GameRegisterPage slug={SLUG} />;
}
