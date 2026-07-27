import { notFound } from 'next/navigation';
import RegisteredList from '@/components/gaming/RegisteredList';
import { getGame } from '@/data/gaming';
import { gameDirectoryMetadata } from '@/lib/metadata';

const SLUG = 'ludo';

export const metadata = gameDirectoryMetadata(SLUG);

/* /players, not /teams: gameDirectory() in routes.js resolves a 'solo'
   registration to the players route, and the nav starts emitting that link the
   moment registrationOpen becomes true. A missing folder would 404 it. */
export default function LudoPlayersPage() {
  if (!getGame(SLUG)) notFound();

  return <RegisteredList slug={SLUG} />;
}
