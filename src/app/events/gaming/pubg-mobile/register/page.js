import { notFound } from 'next/navigation';
import GameRegisterPage from '@/components/gaming/GameRegisterPage';
import { getGame } from '@/data/gaming';
import { gameRegisterMetadata } from '@/lib/metadata';

const SLUG = 'pubg-mobile';

export const metadata = gameRegisterMetadata(SLUG);

export default function PubgMobileRegisterPage() {
  if (!getGame(SLUG)) notFound();

  return <GameRegisterPage slug={SLUG} />;
}
