import { notFound } from 'next/navigation';
import RegisteredList from '@/components/gaming/RegisteredList';
import { getGame } from '@/data/gaming';
import { gameDirectoryMetadata } from '@/lib/metadata';

const SLUG = 'pubg-mobile';

export const metadata = gameDirectoryMetadata(SLUG);

/* The list itself is fetched in the browser so search and paging work without
   a round trip through the router — this page is only the shell. */
export default function PubgMobileTeamsPage() {
  if (!getGame(SLUG)) notFound();

  return <RegisteredList slug={SLUG} />;
}
