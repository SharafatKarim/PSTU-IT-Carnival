'use client';

import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import GameCard from './GameCard';
import { ArrowLeftIcon, AlertIcon, GamepadIcon } from '@/components/landing/Icons';
import { GAMES, GAMING } from '@/data/gaming';
import { EVENT } from '@/data/content';
import { ROUTES, gamingNav } from '@/lib/routes';

const GamingHub = () => (
  <div className="min-h-screen">
    <Navbar
      links={gamingNav}
      homeHref={ROUTES.home}
      ctaHref={ROUTES.register}
      ctaLabel="IUPC Register"
    />

    <main>
      <section className="relative overflow-hidden bg-ink-950">
        <div className="absolute inset-0 bg-hero" />
        <div className="absolute inset-0 bg-grid bg-[size:46px_46px] opacity-50" />
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-magenta-500/20 blur-3xl" />
        <div className="absolute -right-16 top-20 h-72 w-72 rounded-full bg-aqua-500/15 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-12 sm:pb-20 sm:pt-16">
          <Link
            href={ROUTES.home}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-mist-200 transition hover:text-white"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to carnival home
          </Link>

          <div className="mt-8 max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-carnival text-white shadow-glow-grape ring-1 ring-white/10">
                <GamepadIcon className="h-6 w-6" />
              </span>
              <p className="text-gradient-brand text-xs font-bold uppercase tracking-[0.22em]">
                {GAMING.eyebrow}
              </p>
            </div>

            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
              {GAMING.title}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-mist-300 sm:text-lg">
              {GAMING.intro}
            </p>

            <div className="mt-7 flex flex-wrap gap-x-8 gap-y-2 text-sm text-mist-200">
              <span>
                <strong className="font-semibold text-white">{GAMES.length}</strong>{' '}
                tournaments
              </span>
              <span>
                <strong className="font-semibold text-white">{EVENT.date}</strong>
              </span>
              <span>
                <strong className="font-semibold text-white">{EVENT.venue}</strong>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section id="games" className="scroll-mt-20 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-6 lg:grid-cols-3">
            {GAMES.map((game) => (
              <GameCard key={game.slug} game={game} />
            ))}
          </div>

          <p className="mx-auto mt-10 flex max-w-2xl items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-mist-300">
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-mist-400" />
            <span>{GAMING.note}</span>
          </p>
        </div>
      </section>
    </main>

    <Footer />
  </div>
);

export default GamingHub;
