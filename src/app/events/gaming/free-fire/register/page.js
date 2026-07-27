import { notFound } from 'next/navigation';
import GameRegisterPage from '@/components/gaming/GameRegisterPage';
import { getGame } from '@/data/gaming';
import { gameRegisterMetadata } from '@/lib/metadata';

const SLUG = 'free-fire';

export const metadata = gameRegisterMetadata(SLUG);

/* Fully static — no database call anywhere on this route. The entry fee, the
   accepted wallets and the number to send to are all constants in
   src/data/gaming.js, so the whole page is server-rendered at build time. */
export default function FreeFireRegisterPage() {
  if (!getGame(SLUG)) notFound();

  return <GameRegisterPage slug={SLUG} />;
}
