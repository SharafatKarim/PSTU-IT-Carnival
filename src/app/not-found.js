import Link from 'next/link';
import Footer from '@/components/landing/Footer';
import { ArrowLeftIcon, ArrowRightIcon, GamepadIcon, CodeIcon } from '@/components/landing/Icons';
import { ROUTES } from '@/lib/routes';
import { GAMES } from '@/data/gaming';

export const metadata = {
  title: 'Page not found — PSTU IT Carnival 2026',
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="relative flex flex-1 items-center overflow-hidden bg-ink-950">
        <div className="absolute inset-0 bg-hero" />
        <div className="absolute inset-0 bg-grid bg-[size:46px_46px] opacity-50" />

        <div className="relative mx-auto w-full max-w-3xl px-4 py-24 text-center">
          <p className="text-gradient-brand text-xs font-bold uppercase tracking-[0.22em]">
            Error 404
          </p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            This page isn&apos;t on the bracket
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-mist-300">
            The link may be out of date, or the event you are looking for has
            not been announced yet. Here is where everyone else is heading.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={ROUTES.home}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold-400 px-7 py-3.5 text-sm font-bold text-ink-950 shadow-glow-gold transition hover:bg-gold-300 sm:w-auto"
            >
              <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              Back to home
            </Link>
            <Link
              href={ROUTES.gaming}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-grape-400/40 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:border-grape-400/70 hover:bg-white/10 sm:w-auto"
            >
              Gaming Fest
            </Link>
          </div>

          <div className="mx-auto mt-12 grid max-w-2xl gap-3 sm:grid-cols-2">
            <Link
              href={ROUTES.register}
              className="group flex items-center gap-3 rounded-xl border border-ink-600 bg-ink-800/60 p-4 text-left transition hover:border-grape-500/60"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-carnival text-white shadow-glow-grape">
                <CodeIcon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-white">
                  IUPC Pre-Registration
                </span>
                <span className="block text-xs text-mist-400">
                  Teams of three · South Zone
                </span>
              </span>
              <ArrowRightIcon className="h-4 w-4 shrink-0 text-mist-400 transition-transform group-hover:translate-x-0.5" />
            </Link>

            {GAMES.map((game) => (
              <Link
                key={game.slug}
                href={ROUTES.game(game.slug)}
                className="group flex items-center gap-3 rounded-xl border border-ink-600 bg-ink-800/60 p-4 text-left transition hover:border-grape-500/60"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-carnival text-white shadow-glow-grape">
                  <GamepadIcon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-white">
                    {game.name}
                  </span>
                  <span className="block text-xs text-mist-400">{game.mode}</span>
                </span>
                <ArrowRightIcon className="h-4 w-4 shrink-0 text-mist-400 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
