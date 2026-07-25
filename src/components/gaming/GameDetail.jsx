'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import Navbar from '../landing/Navbar';
import Footer from '../landing/Footer';
import Faq from '../landing/Faq';
import TournamentInfo from './TournamentInfo';
import RulesSection from './RulesSection';
import CoordinatorContact from './CoordinatorContact';
/* Split out of the page bundle: while a tournament's entries are closed the
   form never renders, so none of its code is sent to the browser either. */
const GameRegistrationForm = dynamic(() => import('./GameRegistrationForm'));
import RegistrationClosed from './RegistrationClosed';
import {
  ICON_MAP,
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
} from '../landing/Icons';
import { getGame, isGameRegistrationOpen } from '../../data/gaming';
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

const Hero = ({ game, registrationOpen }) => {
  const Icon = ICON_MAP[game.icon] || ICON_MAP.gamepad;
  const a = accentOf(game.accent);
  const t = game.tournament;

  const quickFacts = [
    { icon: CalendarIcon, value: t.date },
    { icon: ClockIcon, value: t.time },
    { icon: MapPinIcon, value: t.venue },
  ];

  /* The four numbers people actually scan for, pulled out of the info grid.
     Short forms keep every tile on one line so the strip stays even. */
  const headline = [
    { label: 'Prize Pool', value: t.prizePool, accent: true },
    {
      label: t.entryScope ? `Entry Fee · ${t.entryScope}` : 'Entry Fee',
      value: t.entryShort || t.entryFee,
    },
    { label: 'Team Size', value: t.teamSizeShort || t.teamSize },
    { label: 'Slots', value: t.slots },
  ];

  return (
    /* Full viewport minus the 61px sticky navbar. min-h (not h) so the hero
       still grows on narrow screens instead of clipping its content. */
    <section className="relative flex min-h-[calc(100dvh-61px)] flex-col overflow-hidden bg-ink-950">
      <div className="absolute inset-0 bg-hero" />
      <div className="absolute inset-0 bg-grid bg-[size:46px_46px] opacity-50" />
      <div className={`absolute -right-24 -top-10 h-80 w-80 rounded-full blur-3xl ${a.blob}`} />
      <div className="absolute -left-24 top-32 h-72 w-72 rounded-full bg-grape-600/20 blur-3xl" />

      <div className="relative mx-auto w-full max-w-6xl px-4 pt-8">
        <Link
          href={ROUTES.gaming}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-mist-300 transition hover:text-white"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          All gaming events
        </Link>
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-8 sm:py-10">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <div
            className={`relative flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-3xl border bg-ink-900/70 backdrop-blur ${a.border} ${a.glow} ${a.text}`}
          >
            <Icon className="h-9 w-9" />
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {registrationOpen ? (
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-widest ${a.border} ${a.bgSoft} ${a.text}`}
                >
                  <span className={`h-1.5 w-1.5 animate-pulse-glow rounded-full ${a.dot}`} />
                  Registration Open
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-gold-300">
                  <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-gold-400" />
                  Registration Opens Soon
                </span>
              )}
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-mist-300">
                {game.scope}
              </span>
            </div>

            <h1 className="mt-3.5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              {game.name}
            </h1>
            <p className="mt-2.5 max-w-2xl text-base leading-relaxed text-mist-300">
              {game.tagline}
            </p>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-mist-200">
          {quickFacts.map((fact, i) => (
            <span key={i} className="inline-flex items-center gap-2">
              <fact.icon className="h-4 w-4 text-gold-400" />
              {fact.value}
            </span>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {registrationOpen ? (
            <a
              href="#register"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gold-400 px-7 py-3.5 text-sm font-bold text-ink-950 shadow-glow-gold transition hover:bg-gold-300"
            >
              Register for {game.shortName}
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          ) : (
            <a
              href="#rules"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gold-400 px-7 py-3.5 text-sm font-bold text-ink-950 shadow-glow-gold transition hover:bg-gold-300"
            >
              Read the Rules
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          )}
          <a
            href={registrationOpen ? '#rules' : '#register'}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-grape-400/40 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:border-grape-400/70 hover:bg-white/10"
          >
            {registrationOpen ? 'Read the Rules' : 'When does it open?'}
          </a>
        </div>

        <p className="mt-5 text-xs text-mist-400">{game.heroNote}</p>
      </div>

      {/* Headline numbers — the same treatment the landing-page hero uses. */}
      <div className="relative border-t border-white/10 bg-ink-950/70 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-y divide-white/10 px-4 sm:divide-y-0 lg:grid-cols-4">
          {headline.map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center justify-center px-4 py-5 text-center sm:py-6"
            >
              <p
                className={`text-2xl font-extrabold sm:text-3xl ${
                  item.accent ? a.text : 'text-white'
                }`}
              >
                {item.value}
              </p>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-mist-400">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
};

const GameDetail = ({ slug }) => {
  const game = getGame(slug);
  if (!game) return null;

  const registrationOpen = isGameRegistrationOpen(game);

  return (
    <div className="min-h-screen">
      <Navbar
        links={gameDetailNav}
        homeHref={ROUTES.home}
        ctaHref="#register"
        ctaLabel={registrationOpen ? 'Register Now' : 'Get Notified'}
      />
      <main>
        <Hero game={game} registrationOpen={registrationOpen} />

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
          subtitle="Read these carefully — entering means your whole squad accepts them. Breaking a rule can cost points or the tournament."
          className="bg-ink-950/40"
        >
          <RulesSection game={game} />
        </Section>

        <Section
          id="register"
          eyebrow="Registration"
          title={
            registrationOpen
              ? `Register for ${game.name}`
              : `${game.name} registration`
          }
          subtitle={
            registrationOpen
              ? game.registration.kind === 'solo'
                ? 'Fill in your player details below. Everything marked with * is required.'
                : 'Fill in your squad details below. Everything marked with * is required — the substitute row is optional.'
              : 'Entries are not open yet. Here is what to get ready and who to ask.'
          }
        >
          {registrationOpen ? (
            <div className="mx-auto max-w-4xl">
              <GameRegistrationForm game={game} />
            </div>
          ) : (
            <RegistrationClosed game={game} />
          )}
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
          <div className="mx-auto max-w-4xl">
            <CoordinatorContact game={game} />
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
};

export default GameDetail;
