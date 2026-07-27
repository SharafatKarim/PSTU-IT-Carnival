import { notFound } from 'next/navigation';
import RegisteredList from '@/components/gaming/RegisteredList';
import { getGame } from '@/data/gaming';
import { gameDirectoryMetadata } from '@/lib/metadata';

const SLUG = 'chess';

export const metadata = gameDirectoryMetadata(SLUG);

export default function ChessPlayersPage() {
  if (!getGame(SLUG)) notFound();

  return <RegisteredList slug={SLUG} />;
}
