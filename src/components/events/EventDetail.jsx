'use client';

import Link from 'next/link';
import Navbar from '../landing/Navbar';
import Footer from '../landing/Footer';
import Faq from '../landing/Faq';
import TournamentInfo from '../gaming/TournamentInfo';
import RulesSection from '../gaming/RulesSection';
import CoordinatorContact from '../gaming/CoordinatorContact';
import { accentOf } from '../gaming/accents';
import {
  ICON_MAP,
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  CheckIcon,
} from '../landing/Icons';
import { getEventDetail } from '../../data/events';
import { ROUTES, eventDetailNav } from '../../lib/routes';

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

const Hero = ({ event }) => {
  const Icon = ICON_MAP[event.icon] || ICON_MAP.code;
  const a = accentOf(event.accent);
  const t = event.tournament;

  const quickFacts = [
    { icon: CalendarIcon, value: t.date },
    { icon: ClockIcon, value: t.time },
    { icon: MapPinIcon, value: t.venue },
  ];

  return (
    <section className="relative overflow-hidden bg-ink-950">
      <div className="absolute inset-0 bg-hero" />
      <div className="absolute inset-0 bg-grid bg-[size:46px_46px] opacity-50" />
      <div className={`absolute -right-20 top-8 h-72 w-72 rounded-full blur-3xl ${a.blob}`} />

      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-12 sm:pb-20 sm:pt-16">
        <Link
          href={`${ROUTES.home}#events`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-mist-200 transition hover:text-white"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          All carnival events
        </Link>

        <div className="mt-8 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-carnival text-white shadow-glow-grape ring-1 ring-white/10">
            <Icon className="h-10 w-10" />
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-widest ${a.border} ${a.bgSoft} ${a.text}`}
              >
                <span className={`h-1.5 w-1.5 animate-pulse-glow rounded-full ${a.dot}`} />
                Pre-Registration Open
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-mist-300">
                {event.scope}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-mist-300">
                {event.mode}
              </span>
            </div>

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              {event.name}
            </h1>
            <p className="mt-1 text-sm font-medium text-mist-400">{event.fullName}</p>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-mist-300">
              {event.tagline}
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
          <Link
            href={ROUTES.register}
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gold-400 px-7 py-3.5 text-sm font-bold text-ink-950 shadow-glow-gold transition hover:bg-gold-300"
          >
            Pre-Register for {event.shortName}
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#rules"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-grape-400/40 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:border-grape-400/70 hover:bg-white/10"
          >
            Read the Rules
          </a>
        </div>

        <p className="mt-5 text-xs text-mist-400">{event.heroNote}</p>
      </div>
    </section>
  );
};

/* Registration is a separate route for IUPC (a three-step wizard), so this
   section is a prepare-then-go panel rather than an inline form. */
const RegisterCta = ({ event }) => {
  const a = accentOf(event.accent);
  const r = event.registration;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="grid items-start gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-ink-600 bg-ink-800/60 p-6 shadow-card sm:p-7">
            <h3 className="text-base font-bold text-white">
              Have this ready before you start
            </h3>
            <ul className="mt-4 space-y-3">
              {r.checklist.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${a.bgSoft} ${a.text}`}
                  >
                    <CheckIcon className="h-3 w-3" />
                  </span>
                  <span className="text-sm leading-relaxed text-mist-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="relative overflow-hidden rounded-2xl bg-carnival p-7 text-white shadow-glow-grape">
            <div className="absolute inset-0 bg-grid bg-[size:30px_30px] opacity-30" />
            <div className="relative">
              <h3 className="text-xl font-bold">Ready to register?</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/85">
                The form takes a few minutes — team and coach details first, then
                your three members, then a review before you submit.
              </p>
              <Link
                href={ROUTES.register}
                className="group mt-6 inline-flex items-center gap-2 rounded-xl bg-gold-400 px-6 py-3 text-sm font-bold text-ink-950 shadow-md transition hover:bg-gold-300"
              >
                {r.cta}
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <p className="mt-4 text-xs text-white/70">{r.note}</p>
              <p className="mt-1 text-xs text-white/70">
                Registration closes {event.tournament.deadline}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EventDetail = ({ slug }) => {
  const event = getEventDetail(slug);
  if (!event) return null;

  return (
    <div className="min-h-screen">
      <Navbar
        links={eventDetailNav}
        homeHref={ROUTES.home}
        ctaHref={ROUTES.register}
        ctaLabel="Pre-Register"
      />
      <main>
        <Hero event={event} />

        <Section
          id="info"
          eyebrow="Contest Info"
          title={`${event.name} at a glance`}
          subtitle={event.blurb}
        >
          <TournamentInfo game={event} />
        </Section>

        <Section
          id="rules"
          eyebrow="Rules & Regulations"
          title="Know before you compete"
          subtitle="Read these carefully — registering means your whole team accepts them."
          className="bg-ink-950/40"
        >
          <RulesSection game={event} />
        </Section>

        <Section
          id="register"
          eyebrow="Registration"
          title={`Pre-register for ${event.name}`}
          subtitle="Registration happens on a separate page so you can fill it in one sitting."
        >
          <RegisterCta event={event} />
        </Section>

        <Section
          id="faq"
          eyebrow="FAQ"
          title="Questions, answered"
          subtitle={`The things ${event.name} teams ask us most.`}
          className="bg-ink-950/40"
        >
          <div className="mx-auto max-w-3xl">
            <Faq items={event.faqs} />
          </div>
        </Section>

        <Section
          id="contact"
          eyebrow="Coordinator Contact"
          title="Still need help?"
          subtitle="Reach the people running this contest directly."
        >
          <div className="mx-auto max-w-3xl">
            <CoordinatorContact game={event} />
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
};

export default EventDetail;
