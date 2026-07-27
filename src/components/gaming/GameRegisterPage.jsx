'use client';

import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import GameRegistrationForm from './GameRegistrationForm';
import RegistrationClosed from './RegistrationClosed';
import { ArrowLeftIcon } from '@/components/landing/Icons';
import { getGame, isGameRegistrationOpen } from '@/data/gaming';
import { ROUTES, gameRegisterNav } from '@/lib/routes';
import { accentOf } from '@/lib/accents';

/* A game's registration page, matching how IUPC works: the detail page hands
   off to this route rather than embedding the form. Entries that are not open
   yet still render — as the "what to prepare" panel — so a shared link never
   dead-ends. */
const GameRegisterPage = ({ slug, coordinators, paymentAccount }) => {
  const game = getGame(slug);
  if (!game) return null;

  const open = isGameRegistrationOpen(game);
  const a = accentOf(game.accent);

  return (
    <div className="min-h-screen">
      <Navbar
        links={gameRegisterNav(game.slug)}
        homeHref={ROUTES.home}
        ctaHref={ROUTES.gaming}
        ctaLabel="All Games"
      />

      <header className="relative overflow-hidden bg-ink-950 text-white">
        <div className="absolute inset-0 bg-hero" />
        <div className="absolute inset-0 bg-grid bg-[size:44px_44px] opacity-40" />
        <div
          className={`absolute -right-24 -top-16 h-72 w-72 rounded-full blur-3xl ${a.blob}`}
        />

        <div className="relative mx-auto max-w-4xl px-4 py-10 sm:py-14">
          <Link
            href={ROUTES.game(game.slug)}
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-mist-200 transition hover:text-white"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to {game.name} details
          </Link>

          <p className={`text-xs font-semibold uppercase tracking-widest ${a.text}`}>
            {game.scope}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            {game.name} Registration
          </h1>
          <p className="mt-2 text-base leading-relaxed text-mist-300">
            {open
              ? game.registration.kind === 'solo'
                ? 'Fill in your player details below. Everything marked with * is required.'
                : 'Tell us whether you have a full squad or are entering alone, then fill in the details below. Everything marked with * is required.'
              : 'Entries are not open yet. Here is what to get ready and who to ask.'}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
        {open ? (
          <GameRegistrationForm game={game} paymentAccount={paymentAccount} />
        ) : (
          <RegistrationClosed game={game} coordinators={coordinators} />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default GameRegisterPage;
