import { notFound } from 'next/navigation';
import AnnouncedEvent from '@/components/events/AnnouncedEvent';
import GameDetail from '@/components/gaming/GameDetail';
import { getGame } from '@/data/gaming';
import { gameMetadata } from '@/lib/metadata';

const SLUG = 'chess';

export const metadata = gameMetadata(SLUG);

export default function ChessPage() {
  const game = getGame(SLUG);
  if (!game) notFound();

  /* Swaps to the full detail page on its own once the data grows a
     tournament block and stage becomes 'published'. */
  return game.stage === 'announced' ? (
    <AnnouncedEvent slug={SLUG} kind="game" />
  ) : (
    <GameDetail slug={SLUG} />
  );
}
