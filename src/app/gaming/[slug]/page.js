import { notFound } from 'next/navigation';
import GameDetail from '../../../components/gaming/GameDetail';
import { GAMES, getGame } from '../../../data/gaming';

export function generateStaticParams() {
  return GAMES.map((game) => ({ slug: game.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) return { title: 'Game not found — PSTU IT Carnival 2026' };

  const title = `${game.name} — PSTU IT Carnival 2026`;
  const description = `${game.tagline} ${game.tournament.date} at ${game.tournament.venue}. Prize pool ${game.tournament.prizePool}. Rules, format and registration.`;

  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
  };
}

export default async function GamePage({ params }) {
  const { slug } = await params;
  // The detail component looks the game up itself — the config carries regexes
  // and validators, which cannot cross the server/client boundary as props.
  if (!getGame(slug)) notFound();

  return <GameDetail slug={slug} />;
}
