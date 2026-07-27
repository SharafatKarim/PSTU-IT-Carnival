import { notFound } from 'next/navigation';
import RegisteredList from '@/components/gaming/RegisteredList';
import { getGame } from '@/data/gaming';
import { gameDirectoryMetadata } from '@/lib/metadata';

const SLUG = 'rubiks-cube';

export const metadata = gameDirectoryMetadata(SLUG);

export default function RubiksPlayersPage() {
  if (!getGame(SLUG)) notFound();

  return <RegisteredList slug={SLUG} />;
}
