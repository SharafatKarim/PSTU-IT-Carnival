import { notFound } from 'next/navigation';
import GameDetail from '@/components/gaming/GameDetail';
import { getGame } from '@/data/gaming';
import { gameMetadata } from '@/lib/metadata';

const SLUG = 'efootball';

export const metadata = gameMetadata(SLUG);

export default function EfootballPage() {
  // The detail component looks the game up itself — the config carries regexes
  // and validators, which cannot cross the server/client boundary as props.
  if (!getGame(SLUG)) notFound();

  return <GameDetail slug={SLUG} />;
}
