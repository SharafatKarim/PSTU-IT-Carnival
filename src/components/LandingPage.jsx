'use client';

import Link from 'next/link';
import Navbar from './landing/Navbar';
import Events from './landing/Events';
import Faq from './landing/Faq';
import Footer from './landing/Footer';
import HeadlineStrip from './ui/HeadlineStrip';
import {
  ICON_MAP,
  CheckIcon,
  CertificateIcon,
  CalendarIcon,
  MapPinIcon,
  FlagIcon,
  ArrowRightIcon,
} from './landing/Icons';
import {
  EVENT,
  STATS,
  ABOUT_POINTS,
  TIMELINE,
  RULES,
  PRIZES,
} from '../data/content';
import { ROUTES } from '../lib/routes';

/* Accents mirror the detail pages, so the front door and the event pages read
   as one system instead of a wall of identical purple tiles. */
const HERO_TILES = [
  { icon: 'code', label: 'Programming', tile: 'border-aqua-400/40 text-aqua-300 shadow-glow-aqua' },
  { icon: 'rocket', label: 'Hackathon', tile: 'border-grape-400/40 text-grape-300 shadow-glow-grape' },
  { icon: 'gamepad', label: 'Gaming', tile: 'border-magenta-500/40 text-magenta-300 shadow-glow-magenta' },
  { icon: 'lightbulb', label: 'Quiz & Apps', tile: 'border-gold-400/40 text-gold-300 shadow-glow-gold' },
];

const Section = ({ id, eyebrow, title, subtitle, children, className = '' }) => (
  <section id={id} className={`scroll-mt-20 py-20 sm:py-24 ${className}`}>
    <div className="mx-auto max-w-6xl px-4">
      {(eyebrow || title) && (
        <div className="mx-auto mb-14 max-w-2xl text-center">
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

const Hero = () => (
  <section id="top" className="relative overflow-hidden bg-ink-950">
    <div className="absolute inset-0 bg-hero" />
    <div className="absolute inset-0 bg-grid bg-[size:46px_46px] opacity-50" />
    <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-grape-600/25 blur-3xl" />
    <div className="absolute -right-16 top-24 h-72 w-72 rounded-full bg-aqua-500/15 blur-3xl" />

    <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:pb-24 sm:pt-24">
      <div className="mx-auto max-w-3xl animate-fade-up text-center">
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-mist-200 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-aqua-400" />
            {EVENT.university}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gold-300">
            <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-gold-400" />
            IUPC pre-register by {EVENT.registrationDeadline}
          </span>
        </div>

        <h1 className="mt-6 text-4xl font-extrabold leading-[1.04] tracking-tight sm:text-6xl">
          <span className="text-white">PSTU </span>
          <span className="text-gradient-title">IT Carnival</span>
          <span className="text-white"> 2026</span>
        </h1>

        <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-mist-200 sm:text-base">
          <span aria-hidden="true" className="text-aqua-400">&#9668;</span> {EVENT.tagline}{' '}
          <span aria-hidden="true" className="text-aqua-400">&#9658;</span>
        </p>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-mist-300 sm:text-lg">
          {EVENT.intro}
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={ROUTES.iupc}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold-400 px-7 py-3.5 text-sm font-bold text-ink-950 shadow-glow-gold transition hover:bg-gold-300 sm:w-auto"
          >
            Explore IUPC
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#events"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-grape-400/40 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:border-grape-400/70 hover:bg-white/10 sm:w-auto"
          >
            Explore Events
          </a>
        </div>

        <div className="mt-9 flex flex-col items-center justify-center gap-x-8 gap-y-3 text-sm text-mist-200 sm:flex-row">
          <span className="inline-flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-gold-400" />
            {EVENT.date}
          </span>
          <span className="hidden h-4 w-px bg-white/15 sm:block" />
          <span className="inline-flex items-center gap-2">
            <MapPinIcon className="h-4 w-4 text-gold-400" />
            {EVENT.venue}
          </span>
          <span className="hidden h-4 w-px bg-white/15 sm:block" />
          <span className="inline-flex items-center gap-2">
            <FlagIcon className="h-4 w-4 text-gold-400" />
            {EVENT.format}
          </span>
        </div>

        {/* Poster-style glowing category tiles */}
        <div className="mt-12 grid grid-cols-2 justify-items-center gap-4 sm:grid-cols-4 sm:gap-6">
          {HERO_TILES.map((tile) => {
            const Icon = ICON_MAP[tile.icon] || ICON_MAP.code;
            return (
              <div key={tile.label} className="flex flex-col items-center gap-2">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl border bg-ink-900/70 backdrop-blur sm:h-16 sm:w-16 ${tile.tile}`}
                >
                  <Icon className="h-7 w-7" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-mist-300">
                  {tile.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>

    <HeadlineStrip
      items={STATS.map((stat, i) => ({
        ...stat,
        accentClass: i === 0 ? 'text-gold-300' : undefined,
      }))}
    />
  </section>
);

const About = () => (
  <Section
    id="about"
    eyebrow="About the Carnival"
    title="Where the south zone’s best show up"
    subtitle="PSTU IT Carnival brings together the region’s sharpest students for three days of algorithmic problem-solving, building, and gaming."
  >
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {ABOUT_POINTS.map((point) => {
        const Icon = ICON_MAP[point.icon] || ICON_MAP.code;
        return (
          <div
            key={point.title}
            className="group rounded-2xl border border-ink-600 bg-ink-800/60 p-6 shadow-card transition duration-300 hover:-translate-y-1 hover:border-grape-500/60 hover:shadow-glow-grape"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-carnival text-white shadow-glow-grape">
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-bold text-white">{point.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-mist-400">
              {point.text}
            </p>
          </div>
        );
      })}
    </div>
  </Section>
);

const Timeline = () => (
  <Section
    id="timeline"
    eyebrow="Schedule"
    title="The road to carnival day"
    subtitle="Four milestones from registration to the final buzzer. Mark your calendar and get your team ready."
  >
    <div className="relative">
      {/* Desktop connector line running through the step nodes */}
      <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-7 hidden h-0.5 bg-gradient-to-r from-grape-500 via-magenta-500 to-aqua-500 opacity-70 lg:block" />

      <ol className="grid gap-8 lg:grid-cols-4 lg:gap-6">
        {TIMELINE.map((item, i) => {
          const Icon = ICON_MAP[item.icon] || CalendarIcon;
          return (
            <li
              key={item.phase}
              className="group relative flex flex-col items-center text-center"
            >
              <div className="relative z-10 mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-carnival text-white shadow-glow-grape ring-4 ring-ink-950 transition-transform duration-300 group-hover:scale-105">
                <Icon className="h-6 w-6" />
                <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-gold-400 text-[11px] font-extrabold text-ink-950 ring-2 ring-ink-950">
                  {i + 1}
                </span>
              </div>

              <div className="w-full rounded-2xl border border-ink-600 bg-ink-800/60 p-5 shadow-card transition duration-300 group-hover:-translate-y-1 group-hover:border-grape-500/60 group-hover:shadow-glow-grape">
                <span className="inline-block rounded-full border border-gold-400/30 bg-gold-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-gold-300">
                  {item.date}
                </span>
                <h3 className="mt-3 text-lg font-bold text-white">
                  {item.phase}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-mist-400">
                  {item.text}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  </Section>
);

const Format = () => (
  <Section
    id="format"
    eyebrow="IUPC · Format & Rules"
    title="How the IUPC works"
    subtitle="A straightforward, ICPC-inspired ruleset for the flagship programming contest. Full details live on the IUPC event page."
    className="bg-ink-950/40"
  >
    <div className="grid items-start gap-8 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <ul className="grid gap-3 sm:grid-cols-2">
          {RULES.map((rule) => (
            <li
              key={rule}
              className="flex items-start gap-3 rounded-xl border border-ink-600 bg-ink-800/60 p-4 shadow-card"
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aqua-400/15 text-aqua-300">
                <CheckIcon className="h-4 w-4" />
              </span>
              <span className="text-sm leading-relaxed text-mist-200">
                {rule}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="lg:col-span-2">
        <div className="relative overflow-hidden rounded-2xl bg-carnival p-7 text-white shadow-glow-grape">
          <div className="absolute inset-0 bg-grid bg-[size:30px_30px] opacity-30" />
          <div className="relative">
            <h3 className="text-xl font-bold">Ready to compete in IUPC?</h3>
            <p className="mt-2 text-sm leading-relaxed text-white">
              The IUPC page has the full format, rules, slot count and
              coordinator contacts — plus the link to the registration form.
            </p>
            <Link
              href={ROUTES.iupc}
              className="group mt-6 inline-flex items-center gap-2 rounded-xl bg-gold-400 px-6 py-3 text-sm font-bold text-ink-950 shadow-md transition hover:bg-gold-300"
            >
              See full IUPC details
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <p className="mt-4 text-xs text-white">
              Pre-registration is free · Instant registration ID
            </p>
          </div>
        </div>
      </div>
    </div>
  </Section>
);

const rankStyles = {
  1: {
    ring: 'border-gold-400/60 shadow-glow-gold',
    badge: 'bg-gold-400 text-ink-950',
    medal: 'text-gold-400',
    scale: 'sm:-translate-y-4',
  },
  2: {
    ring: 'border-grape-400/50 shadow-glow-grape',
    badge: 'bg-grape-500 text-white',
    medal: 'text-grape-300',
    scale: '',
  },
  3: {
    ring: 'border-magenta-500/50 shadow-glow-magenta',
    badge: 'bg-magenta-500 text-white',
    medal: 'text-magenta-400',
    scale: '',
  },
};

const Prizes = () => (
  <Section
    id="prizes"
    eyebrow="Rewards"
    title="Play for the podium"
    subtitle="A trophy and certificate of excellence for the champion, certificates of merit for both runners-up, and an event t-shirt for every participant. Prize money is announced per event — the three gaming tournaments have theirs published already."
  >
    <div className="grid items-center gap-6 sm:grid-cols-3">
      {PRIZES.map((prize) => {
        const s = rankStyles[prize.rank] || rankStyles[3];
        return (
          <div
            key={prize.place}
            className={`rounded-2xl border bg-ink-800/70 p-7 text-center transition ${s.ring} ${s.scale}`}
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center">
              <CertificateIcon className={`h-12 w-12 ${s.medal}`} />
            </div>
            <span
              className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${s.badge}`}
            >
              {prize.place}
            </span>
            <ul className="mt-5 space-y-2">
              {prize.perks.map((perk) => (
                <li key={perk} className="text-sm font-medium text-mist-300">
                  {perk}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  </Section>
);

const FaqSection = () => (
  <Section
    id="faq"
    eyebrow="FAQ"
    title="Questions, answered"
    subtitle="Everything you need to know before registering your team."
    className="bg-ink-950/40"
  >
    <div className="mx-auto max-w-3xl">
      <Faq />
    </div>
  </Section>
);

const FinalCta = () => (
  <section className="py-20 sm:py-24">
    <div className="mx-auto max-w-6xl px-4">
      <div className="relative overflow-hidden rounded-3xl bg-carnival px-6 py-16 text-center text-white shadow-glow-grape sm:px-12">
        <div className="absolute inset-0 bg-grid bg-[size:36px_36px] opacity-40" />
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-aqua-400/20 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-gold-400/15 blur-3xl" />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Your IUPC team’s spot is waiting
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white sm:text-lg">
            Gather your three coders, pick a name worth remembering, and claim
            your place at the flagship contest of PSTU IT Carnival 2026.
          </p>
          <Link
            href={ROUTES.register}
            className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-gold-400 px-8 py-4 text-sm font-bold text-ink-950 shadow-lg transition hover:bg-gold-300"
          >
            Pre-Register for IUPC
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  </section>
);


const LandingPage = () => (
  <div className="min-h-screen">
    <Navbar />
    <main>
      <Hero />
      <About />
      <Events />
      <Timeline />
      <Format />
      <Prizes />
      <FaqSection />
      <FinalCta />
    </main>
    <Footer />
  </div>
);

export default LandingPage;
