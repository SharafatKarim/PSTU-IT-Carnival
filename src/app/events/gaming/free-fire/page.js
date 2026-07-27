import { notFound } from 'next/navigation';
import GameDetail from '@/components/gaming/GameDetail';
import { getGame } from '@/data/gaming';
import { gameCoordinators } from '@/server/coordinators';
import { gameMetadata } from '@/lib/metadata';

const SLUG = 'free-fire';

export const metadata = gameMetadata(SLUG);

/* See the note in ../pubg-mobile/page.js — contacts come from the database. */
export const revalidate = 60;

export default async function FreeFirePage() {
  if (!getGame(SLUG)) notFound();

  return <GameDetail slug={SLUG} coordinators={await gameCoordinators(SLUG)} />;
}
