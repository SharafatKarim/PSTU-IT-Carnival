'use client';

import Link from 'next/link';
import Navbar from './landing/Navbar';
import Faq from './landing/Faq';
import Footer from './landing/Footer';
import Lineup from './landing/Lineup';
import Countdown from './landing/Countdown';
import HeadlineStrip from './ui/HeadlineStrip';
import {
  CheckIcon,
  CalendarIcon,
  MapPinIcon,
  FlagIcon,
  ArrowRightIcon,
  TicketIcon,
  UsersIcon,
  AlertIcon,
} from './landing/Icons';
import { EVENT, EVENTS, STATS, TIMELINE, word } from '@/data/content';
import { getEventDetail } from '@/data/events';
import { ROUTES } from '@/lib/routes';
import { currentStop } from '@/lib/schedule';
import { useNow } from '@/lib/useNow';

const IUPC = getEventDetail('iupc');

/* ---------------------------------------------------------------------------
   Section shell.

   The header is a two-column band — title left, an optional link right — so the
   page reads down one edge instead of a centred ribbon. Exactly one block on
   this page is centred (the closing CTA), and that scarcity is what gives it
   force.
   --------------------------------------------------------------------------- */
const Section = ({
  id,
  eyebrow,
  title,
  titleNowrap = false,
  lede,
  action,
  children,
  className = '',
  pad = 'py-20 sm:py-24',
}) => (
  <section id={id} className={`scroll-mt-20 ${pad} ${className}`}>
    <div className="mx-auto max-w-6xl px-4">
      {title && (
        <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div className={titleNowrap ? 'lg:shrink-0' : 'max-w-[46ch]'}>
            {eyebrow && (
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-mist-400">
                {eyebrow}
              </p>
            )}
            <h2
              className={`mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl ${
                titleNowrap ? 'lg:whitespace-nowrap' : ''
              }`}
            >
              {title}
            </h2>
          </div>
          {action}
        </header>
      )}
      {lede && (
        <p className="mt-6 max-w-[62ch] text-base leading-relaxed text-mist-300">
          {lede}
        </p>
      )}
      <div className={title ? 'mt-8' : ''}>{children}</div>
    </div>
  </section>
);

/* ---------------------------------------------------------------------------
   Hero — 7/5 split. Everything a visitor needs to decide sits on the left; the
   one action they can take sits on the right, and on mobile the panel is
   ordered above the long intro rather than seven blocks down.
   --------------------------------------------------------------------------- */
const OpenNowPanel = () => {
  const t = IUPC?.tournament;
  if (!t) return null;

  const facts = [
    { icon: UsersIcon, label: 'Team slots', value: t.slots },
    { icon: TicketIcon, label: 'To pre-register', value: 'Free' },
    { icon: AlertIcon, label: 'Entries close', value: t.deadline },
  ];

  return (
    <div className="rounded-2xl border border-gold-400/40 bg-ink-900/70 p-6 shadow-glow-gold backdrop-blur sm:p-7">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-gold-300">
          <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-gold-400" />
          Open now
        </span>
        {t.deadline && <Countdown date={t.deadline} />}
      </div>

      <h2 className="mt-4 text-xl font-bold text-white">
        {IUPC.name} pre-registration
      </h2>
      <p className="mt-1.5 text-sm leading-relaxed text-mist-300">
        {IUPC.fullName} — {t.teamSize.replace(/\s*\(.*\)/, '')}.
      </p>

      <dl className="mt-5 divide-y divide-white/10 border-y border-white/10">
        {facts.map((fact) => (
          <div key={fact.label} className="flex items-center gap-3 py-2.5">
            <fact.icon className="h-4 w-4 shrink-0 text-mist-400" />
            <dt className="flex-1 text-sm text-mist-400">{fact.label}</dt>
            <dd className="text-sm font-semibold text-white tabular-nums">
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>

      <Link
        href={ROUTES.register}
        className="group mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold-400 px-6 py-3.5 text-sm font-bold text-ink-950 shadow-glow-gold transition hover:bg-gold-300"
      >
        Pre-register your team
        <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
      <p className="mt-3 text-center text-xs text-mist-400">
        Free · instant registration ID
      </p>
    </div>
  );
};

const Hero = () => (
  <section
    id="top"
    className="relative flex min-h-[calc(100svh-65px)] flex-col overflow-hidden bg-ink-950 md:min-h-[calc(100svh-61px)]"
  >
    <div
      aria-hidden="true"
      className="absolute inset-0 bg-cover bg-center opacity-25"
      style={{ backgroundImage: 'url(/cover.jpg)' }}
    />
    <div
      aria-hidden="true"
      className="absolute inset-0 bg-gradient-to-b from-ink-950/80 via-ink-950/60 to-ink-950"
    />
    <div className="absolute inset-0 bg-hero opacity-80" />
    <div className="absolute inset-0 bg-grid bg-[size:46px_46px] opacity-50" />
    <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-grape-600/25 blur-3xl" />
    <div className="absolute -right-16 top-24 h-72 w-72 rounded-full bg-aqua-500/15 blur-3xl" />

    <div className="relative mx-auto flex w-full max-w-6xl flex-1 animate-fade-up items-center px-4 pb-12 pt-10 sm:pb-16 sm:pt-16">
      <div className="grid w-full items-start gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="flex flex-col lg:col-span-7">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-aqua-300">
            {EVENT.university}
          </p>

          <h1 className="mt-4 text-5xl font-extrabold leading-[1.04] tracking-tight sm:text-6xl">
            <span className="text-white">PSTU </span>
            <span className="text-gradient-title">IT Carnival</span>
            <span className="text-white"> 2026</span>
          </h1>

          <p className="mt-4 max-w-[46ch] text-xl font-medium leading-snug text-mist-200 sm:text-2xl">
            {EVENT.tagline}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-mist-300">
            <span className="inline-flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-mist-400" />
              {EVENT.date}
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPinIcon className="h-4 w-4 text-mist-400" />
              {EVENT.venue}
            </span>
            <span className="inline-flex items-center gap-2">
              <FlagIcon className="h-4 w-4 text-mist-400" />
              {EVENT.format}
            </span>
          </div>

          <p className="mt-6 max-w-[62ch] text-base leading-relaxed text-mist-400">
            {EVENT.intro}
          </p>

          <a
            href="#events"
            className="mt-7 inline-flex items-center gap-2 self-start text-sm font-semibold text-mist-200 transition hover:text-white"
          >
            See all {word(EVENTS.length).toLowerCase()} events
            <ArrowRightIcon className="h-4 w-4" />
          </a>
        </div>

        {/* -order-1 on mobile: the action comes before the long intro. */}
        <div className="-order-1 lg:order-none lg:col-span-5">
          <OpenNowPanel />
        </div>
      </div>
    </div>

    <HeadlineStrip items={STATS} />
  </section>
);

const LineupSection = () => (
  <Section
    id="events"
    eyebrow="The line-up"
    title={`${word(EVENTS.length)} events. One carnival.`}
    titleNowrap
  >
    <Lineup />

    <Link
      href={ROUTES.events}
      className="group mt-10 inline-flex items-center gap-2 text-sm font-semibold text-mist-300 transition hover:text-white"
    >
      Browse all twelve by category
      <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  </Section>
);

/* Replaces the old Format section, which reproduced six rules that live on
   /events/iupc. This explains the process instead of restating the rules. */
const HowToEnter = () => {
  const r = IUPC?.registration;
  const t = IUPC?.tournament;
  if (!r || !t) return null;

  return (
    <Section
      id="register"
      eyebrow="IUPC · how to enter"
      title="Three steps, and the first one is free"
      titleNowrap
      className="border-y border-white/10 bg-ink-950/40"
      pad="py-24 sm:py-28"
      action={
        <Link
          href={ROUTES.iupc}
          className="group inline-flex items-center gap-2 text-sm font-semibold text-mist-300 transition hover:text-white"
        >
          Full rules and format
          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      }
    >
      {/* The three steps run across the full width, not down a 7-column
          gutter. They are a sequence, and a sequence reads left to right — as
          a stacked list each step was one short line in a py-5 band, so the
          section spent a third of its height on three sentences. */}
      <ol className="grid gap-x-8 gap-y-6 sm:grid-cols-3">
        {r.process.map((step, i) => (
          <li key={step} className="border-t border-white/10 pt-5">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-aqua-300 tabular-nums">
              Step {i + 1}
            </span>
            <p className="mt-2 text-sm leading-relaxed text-mist-300">{step}</p>
          </li>
        ))}
      </ol>

      <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.22em] text-mist-400">
            Have this ready
          </h3>
          <ul className="mt-5 grid gap-x-8 gap-y-3.5 sm:grid-cols-2">
            {r.checklist.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-aqua-400" />
                <span className="text-sm leading-relaxed text-mist-300">
                  {item}
                </span>
              </li>
            ))}
          </ul>

          {/* Awards sat inside the CTA panel, which made one box hold four
              unrelated things: what you win, what is not decided, the button,
              and the deadline. What you win belongs with what you need. */}
          <h3 className="mt-10 text-[11px] font-bold uppercase tracking-[0.22em] text-mist-400">
            What the winners get
          </h3>
          <ul className="mt-5 grid gap-x-8 gap-y-3.5 sm:grid-cols-2">
            {/* Read from the same array /events/iupc renders. Hand-typing this
                list is how the landing page came to advertise awards the IUPC
                page did not show at all. */}
            {IUPC.prizes.map((prize) => (
              <li key={prize.place} className="flex items-start gap-2.5">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-mist-400" />
                <span className="text-sm leading-relaxed text-mist-300">
                  <span className="font-semibold text-mist-200">
                    {prize.place}
                  </span>{' '}
                  — {prize.perks.join(', ')}
                </span>
              </li>
            ))}
            <li className="flex items-start gap-2.5">
              <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-mist-400" />
              <span className="text-sm leading-relaxed text-mist-300">
                An event t-shirt for every participant
              </span>
            </li>
          </ul>
          <p className="mt-5 text-xs leading-relaxed text-mist-400">
            IUPC prize money is not published yet. The datathon and the three
            esports tournaments publish theirs on their own pages.
          </p>
        </div>

        {/* The panel does one job now: take the action. */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-gold-400/30 bg-ink-900/40 p-6 shadow-glow-gold sm:p-7 lg:sticky lg:top-24">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-gold-300">
                <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-gold-400" />
                Open now
              </span>
              {t.deadline && <Countdown date={t.deadline} />}
            </div>

            <h3 className="mt-4 text-lg font-bold text-white">
              Step one takes a minute
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-mist-300">
              Nothing is paid until your slot is confirmed.
            </p>

            <dl className="mt-5 divide-y divide-white/10 border-y border-white/10">
              {[
                { label: 'Team slots', value: t.slots },
                { label: 'To pre-register', value: 'Free' },
                { label: 'Entries close', value: t.deadline },
              ].map((fact) => (
                <div key={fact.label} className="flex items-center gap-3 py-2.5">
                  <dt className="flex-1 text-sm text-mist-400">{fact.label}</dt>
                  <dd className="text-sm font-semibold text-white tabular-nums">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>

            <Link
              href={ROUTES.register}
              className="group mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold-400 px-6 py-3.5 text-sm font-bold text-ink-950 shadow-glow-gold transition hover:bg-gold-300"
            >
              Start pre-registration
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
};

/* Four stops on one line. The marker is derived from the dates in the data, so
   the page does not go stale on 1 August. */
const Schedule = () => {
  const now = useNow();
  /* -1 until the client knows what day it is, which marks every stop neutral.
     Guessing here would bake the build-time marker into the prerendered HTML,
     and React does not patch mismatched attributes — it would stay there. */
  const stop = now === null ? -1 : currentStop(TIMELINE, now);

  return (
    <Section id="timeline" eyebrow="Schedule" title="The road to carnival day">
      <ol className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {TIMELINE.map((item, i) => {
          const done = i < stop;
          const current = i === stop;

          return (
            <li key={item.phase} className="relative pt-6">
              <span
                aria-hidden="true"
                className={`absolute left-0 top-0 h-px w-full ${
                  done ? 'bg-aqua-400/40' : 'bg-white/10'
                }`}
              />
              <span
                aria-hidden="true"
                className={`absolute -top-[5px] left-0 h-2.5 w-2.5 rounded-full ${
                  current
                    ? 'bg-gold-400 ring-4 ring-gold-400/20'
                    : done
                      ? 'bg-aqua-400'
                      : 'border border-white/25 bg-ink-950'
                }`}
              />

              <p
                className={`text-[11px] font-bold uppercase tracking-wide tabular-nums ${
                  current ? 'text-gold-300' : 'text-mist-400'
                }`}
              >
                {item.date}
              </p>
              <h3
                className={`mt-1.5 text-base font-bold ${
                  done ? 'text-mist-300' : 'text-white'
                }`}
              >
                {item.phase}
              </h3>
              <p className="mt-1.5 max-w-[46ch] text-sm leading-relaxed text-mist-400">
                {item.text}
              </p>
            </li>
          );
        })}
      </ol>
    </Section>
  );
};

/* The header is the same two-column band every other section uses. It used to
   be a 4/8 split with a sticky left column holding a title, one sentence and a
   link — and then 300px of nothing, because there was nothing else to put
   there. */
const FaqSection = () => (
  <Section
    id="faq"
    eyebrow="FAQ"
    title="Questions, answered"
    titleNowrap
    className="border-y border-white/10 bg-ink-950/40"
    pad="py-16 sm:py-20"
    action={
      <Link
        href={`${ROUTES.iupc}#contact`}
        className="group inline-flex items-center gap-2 text-sm font-semibold text-mist-300 transition hover:text-white"
      >
        Contact the coordinator
        <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    }
  >
    <Faq />
  </Section>
);

/* The only centred block, and the only bg-carnival surface, on the page.
   That scarcity is what gives it force, so it stays centred — but it had a
   headline, a sentence, a button and a 12px footnote in a 350px-tall gradient,
   which is a lot of surface for very little. It carries the deadline properly
   now: a live countdown above the fold of the panel, and the two numbers that
   decide the thing on either side of the button. */
const FinalCta = () => {
  const t = IUPC?.tournament;

  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="relative overflow-hidden rounded-3xl bg-carnival px-6 py-14 text-center text-white shadow-glow-grape sm:px-12">
          <div className="absolute inset-0 bg-grid bg-[size:36px_36px] opacity-40" />
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-aqua-400/20 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-gold-400/15 blur-3xl" />

          <div className="relative mx-auto max-w-2xl">
            {t?.deadline && (
              <Countdown
                date={t.deadline}
                className="!border-white/25 !bg-white/10 !text-white"
              />
            )}

            <h2 className="mt-5 text-3xl font-extrabold sm:text-4xl">
              Your IUPC team&rsquo;s spot is waiting
            </h2>
            <p className="mx-auto mt-4 max-w-[52ch] text-base leading-relaxed text-white/90">
              Gather your three coders, pick a name worth remembering, and claim
              your place at the flagship contest.
            </p>

            <Link
              href={ROUTES.register}
              className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-gold-400 px-8 py-4 text-sm font-bold text-ink-950 shadow-lg transition hover:bg-gold-300"
            >
              Pre-register for IUPC
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>

            {t && (
              <dl className="mx-auto mt-8 grid max-w-md grid-cols-3 gap-px overflow-hidden rounded-xl bg-white/15 text-left">
                {[
                  { label: 'Team slots', value: t.slots },
                  { label: 'To pre-register', value: 'Free' },
                  { label: 'Entries close', value: t.deadline },
                ].map((fact) => (
                  <div key={fact.label} className="bg-grape-700/40 px-3 py-3 text-center">
                    <dt className="text-[10px] uppercase tracking-wide text-white/70">
                      {fact.label}
                    </dt>
                    <dd className="mt-1 text-sm font-bold tabular-nums">
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const LandingPage = () => (
  <div className="min-h-screen">
    <Navbar />
    <main>
      <Hero />
      <LineupSection />
      <HowToEnter />
      <Schedule />
      <FaqSection />
      <FinalCta />
    </main>
    <Footer />
  </div>
);

export default LandingPage;
