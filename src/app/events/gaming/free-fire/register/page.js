import { notFound } from 'next/navigation';
import GameRegisterPage from '@/components/gaming/GameRegisterPage';
import { getGame } from '@/data/gaming';
import { gameRegisterMetadata } from '@/lib/metadata';

const SLUG = 'free-fire';

export const metadata = gameRegisterMetadata(SLUG);

export default function FreeFireRegisterPage() {
  if (!getGame(SLUG)) notFound();

  return <GameRegisterPage slug={SLUG} />;
}
