import { notFound } from 'next/navigation';
import GameDetail from '@/components/gaming/GameDetail';
import { getGame } from '@/data/gaming';
import { gameMetadata } from '@/lib/metadata';

const SLUG = 'free-fire';

export const metadata = gameMetadata(SLUG);

export default function FreeFirePage() {
  if (!getGame(SLUG)) notFound();

  return <GameDetail slug={SLUG} />;
}
