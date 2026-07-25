'use client';

import Link from 'next/link';
import Navbar from '../landing/Navbar';
import Footer from '../landing/Footer';
import Faq from '../landing/Faq';
import TournamentInfo from './TournamentInfo';
import RulesSection from './RulesSection';
import CoordinatorContact from './CoordinatorContact';
import GameRegistrationForm from './GameRegistrationForm';
import {
  ICON_MAP,
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
} from '../landing/Icons';
import { getGame } from '../../data/gaming';
import { ROUTES, gameDetailNav } from '../../lib/routes';
import { accentOf } from './accents';

const Section = ({ id, eyebrow, title, subtitle, children, className = '' }) => (
  <section id={id} className={`scroll-mt-20 py-16 sm:py-20 ${className}`}>
    <div className="mx-auto max-w-6xl px-4">
      {(eyebrow || title) && (
        <div className="mx-auto mb-12 max-w-2xl text-center">
          {eyebrow && (
            <p className="text-gradient-brand text-xs font-bold uppercase tracking-[0.22em]">
              {eyebrow}
            </p>
          )}
          {title && (
            <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-4 text-base leading-relaxed text-mist-300">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  </section>
);

const Hero = ({ game }) => {
  const Icon = ICON_MAP[game.icon] || ICON_MAP.gamepad;
  const a = accentOf(game.accent);
  const t = game.tournament;

  const quickFacts = [
    { icon: CalendarIcon, value: t.date },
    { icon: ClockIcon, value: t.time },
    { icon: MapPinIcon, value: t.venue },
  ];

  return (
    <section className="relative overflow-hidden bg-ink-950">
      <div className="absolute inset-0 bg-hero" />
      <div className="absolute inset-0 bg-grid bg-[size:46px_46px] opacity-50" />
      <div
        className={`absolute -right-20 top-8 h-72 w-72 rounded-full blur-3xl ${a.blob}`}
      />

      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-12 sm:pb-20 sm:pt-16">
        <Link
          href={ROUTES.gaming}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-mist-200 transition hover:text-white"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          All gaming events
        </Link>

        <div className="mt-8 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <div
            className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-carnival text-white shadow-glow-grape ring-1 ring-white/10`}
          >
            <Icon className="h-10 w-10" />
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-widest ${a.border} ${a.bgSoft} ${a.text}`}
              >
                <span className={`h-1.5 w-1.5 animate-pulse-glow rounded-full ${a.dot}`} />
                Registration Open
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-mist-300">
                {game.scope}
              </span>
            </div>

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              {game.name}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-mist-300">
              {game.tagline}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-x-8 gap-y-3 text-sm text-mist-200 sm:flex-row sm:items-center">
          {quickFacts.map((fact, i) => (
            <span key={i} className="inline-flex items-center gap-2">
              <fact.icon className="h-4 w-4 text-gold-400" />
              {fact.value}
            </span>
          ))}
        </div>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <a
            href="#register"
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gold-400 px-7 py-3.5 text-sm font-bold text-ink-950 shadow-glow-gold transition hover:bg-gold-300"
          >
            Register for {game.shortName}
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          <a
            href="#rules"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-grape-400/40 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:border-grape-400/70 hover:bg-white/10"
          >
            Read the Rules
          </a>
        </div>

        <p className="mt-5 text-xs text-mist-400">{game.heroNote}</p>
      </div>
    </section>
  );
};

const GameDetail = ({ slug }) => {
  const game = getGame(slug);
  if (!game) return null;

  return (
    <div className="min-h-screen">
      <Navbar
        links={gameDetailNav}
        homeHref={ROUTES.home}
        ctaHref="#register"
        ctaLabel="Register Now"
      />
      <main>
        <Hero game={game} />

        <Section
          id="info"
          eyebrow="Tournament Info"
          title={`${game.name} at a glance`}
          subtitle={game.blurb}
        >
          <TournamentInfo game={game} />
        </Section>

        <Section
          id="rules"
          eyebrow="Rules & Regulations"
          title="Know before you play"
          subtitle="Read these carefully — registering means your whole entry accepts them. Breaking a rule can cost points or the tournament."
          className="bg-ink-950/40"
        >
          <RulesSection game={game} />
        </Section>

        <Section
          id="register"
          eyebrow="Registration"
          title={`Register for ${game.name}`}
          subtitle={
            game.registration.kind === 'solo'
              ? 'Fill in your player details below. Everything marked with * is required.'
              : 'Fill in your squad details below. Everything marked with * is required — the substitute row is optional.'
          }
        >
          <div className="mx-auto max-w-4xl">
            <GameRegistrationForm game={game} />
          </div>
        </Section>

        <Section
          id="faq"
          eyebrow="FAQ"
          title="Questions, answered"
          subtitle={`The things ${game.name} entrants ask us most.`}
          className="bg-ink-950/40"
        >
          <div className="mx-auto max-w-3xl">
            <Faq items={game.faqs} />
          </div>
        </Section>

        <Section
          id="contact"
          eyebrow="Coordinator Contact"
          title="Still need help?"
          subtitle="Reach the people running this tournament directly — they answer fastest on WhatsApp."
        >
          <div className="mx-auto max-w-3xl">
            <CoordinatorContact game={game} />
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
};

export default GameDetail;
