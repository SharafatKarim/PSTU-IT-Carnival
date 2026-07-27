import { notFound } from 'next/navigation';
import GameRegisterPage from '@/components/gaming/GameRegisterPage';
import { getGame } from '@/data/gaming';
import { gameRegisterMetadata } from '@/lib/metadata';

const SLUG = 'ludo';

export const metadata = gameRegisterMetadata(SLUG);

/* Routes are explicit folders, so this file is what makes
   ROUTES.gameRegister('ludo') resolve. Without it the URL 404s even though
   every link on the site builds it happily.

   GameRegisterPage renders the closed panel while registrationOpen is false,
   so this exists before entries open and says why rather than 404ing. */
export default function LudoRegisterPage() {
  if (!getGame(SLUG)) notFound();

  return <GameRegisterPage slug={SLUG} />;
}
