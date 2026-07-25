import Navbar from '../components/landing/Navbar';
import Faq from '../components/landing/Faq';
import {
  ICON_MAP,
  CheckIcon,
  MedalIcon,
  CalendarIcon,
  MapPinIcon,
  FlagIcon,
  ArrowRightIcon,
} from '../components/landing/Icons';
import {
  EVENT,
  STATS,
  ABOUT_POINTS,
  TIMELINE,
  RULES,
  PRIZES,
} from '../data/content';

/* ------------------------------------------------------------------ */
/* Section shell                                                       */
/* ------------------------------------------------------------------ */

const Section = ({ id, eyebrow, title, subtitle, children, className = '' }) => (
  <section id={id} className={`scroll-mt-20 py-20 sm:py-24 ${className}`}>
    <div className="mx-auto max-w-6xl px-4">
      {(eyebrow || title) && (
        <div className="mx-auto mb-14 max-w-2xl text-center">
          {eyebrow && (
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-navy-400">
              {eyebrow}
            </p>
          )}
          {title && (
            <h2 className="mt-2 text-3xl font-extrabold text-navy-800 sm:text-4xl">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-4 text-base leading-relaxed text-navy-500">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  </section>
);

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

const Hero = ({ onRegister }) => (
  <section
    id="top"
    className="relative overflow-hidden bg-pstu-gradient text-white"
  >
    <div className="absolute inset-0 bg-grid-navy bg-[size:44px_44px] opacity-70" />
    <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-navy-400/20 blur-3xl" />
    <div className="absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-gold-400/10 blur-3xl" />

    <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-20 sm:pb-28 sm:pt-28">
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex animate-fade-in items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-navy-100 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
          {EVENT.university}
        </span>

        <h1 className="mt-6 animate-fade-up text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
          {EVENT.title}
        </h1>
        <p className="mt-4 animate-fade-up text-xl font-semibold text-navy-100 sm:text-2xl">
          {EVENT.tagline}
        </p>
        <p className="mx-auto mt-5 max-w-2xl animate-fade-up text-base leading-relaxed text-navy-200 sm:text-lg">
          {EVENT.intro}
        </p>

        <div className="mt-9 flex animate-fade-up flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onRegister}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-navy-800 shadow-lg shadow-navy-900/30 transition hover:bg-navy-50 sm:w-auto"
          >
            Register Your Team
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
          <a
            href="#about"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/25 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
          >
            Learn More
          </a>
        </div>

        <div className="mt-10 flex animate-fade-up flex-col items-center justify-center gap-x-8 gap-y-3 text-sm text-navy-100 sm:flex-row">
          <span className="inline-flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-gold-300" />
            {EVENT.date}
          </span>
          <span className="hidden h-4 w-px bg-white/20 sm:block" />
          <span className="inline-flex items-center gap-2">
            <MapPinIcon className="h-4 w-4 text-gold-300" />
            {EVENT.venue}
          </span>
          <span className="hidden h-4 w-px bg-white/20 sm:block" />
          <span className="inline-flex items-center gap-2">
            <FlagIcon className="h-4 w-4 text-gold-300" />
            {EVENT.format}
          </span>
        </div>
      </div>
    </div>

    <div className="relative border-t border-white/10 bg-navy-900/40 backdrop-blur">
      <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-white/10 px-4 lg:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="px-4 py-6 text-center">
            <p className="text-3xl font-extrabold text-white sm:text-4xl">
              {stat.value}
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-navy-200">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ------------------------------------------------------------------ */
/* About                                                               */
/* ------------------------------------------------------------------ */

const About = () => (
  <Section
    id="about"
    eyebrow="About the Contest"
    title="Where the best teams sharpen their edge"
    subtitle="PSTU IT Carnival brings together the country's most competitive programmers for a day built around algorithmic problem-solving, teamwork, and pure code."
  >
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {ABOUT_POINTS.map((point) => {
        const Icon = ICON_MAP[point.icon] || ICON_MAP.code;
        return (
          <div
            key={point.title}
            className="group rounded-2xl border border-navy-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-navy-200 hover:shadow-lg"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-50 text-navy-600 transition group-hover:bg-navy-700 group-hover:text-white">
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-bold text-navy-800">
              {point.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-navy-500">
              {point.text}
            </p>
          </div>
        );
      })}
    </div>
  </Section>
);

/* ------------------------------------------------------------------ */
/* Timeline                                                            */
/* ------------------------------------------------------------------ */

const Timeline = () => (
  <Section
    id="timeline"
    eyebrow="Schedule"
    title="The road to contest day"
    subtitle="Key milestones from registration to the final buzzer. Mark your calendar and get your team ready."
    className="bg-navy-50"
  >
    <div className="relative mx-auto max-w-3xl">
      <div className="absolute left-4 top-2 h-full w-px bg-navy-200 sm:left-1/2" />
      <div className="space-y-8">
        {TIMELINE.map((item, i) => (
          <div
            key={item.phase}
            className={`relative flex flex-col gap-4 sm:flex-row sm:items-center ${
              i % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'
            }`}
          >
            <div className="flex-1 pl-12 sm:px-8 sm:pl-0">
              <div
                className={`rounded-2xl border border-navy-100 bg-white p-5 shadow-sm ${
                  i % 2 === 0 ? 'sm:text-right' : 'sm:text-left'
                }`}
              >
                <p className="text-xs font-bold uppercase tracking-wide text-gold-600">
                  {item.date}
                </p>
                <h3 className="mt-1 text-lg font-bold text-navy-800">
                  {item.phase}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-navy-500">
                  {item.text}
                </p>
              </div>
            </div>

            <span className="absolute left-4 top-6 z-10 flex h-3 w-3 -translate-x-1/2 items-center justify-center sm:left-1/2 sm:top-1/2 sm:-translate-y-1/2">
              <span className="h-3 w-3 rounded-full border-2 border-navy-600 bg-white" />
            </span>

            <div className="hidden flex-1 sm:block" />
          </div>
        ))}
      </div>
    </div>
  </Section>
);

/* ------------------------------------------------------------------ */
/* Format & Rules                                                      */
/* ------------------------------------------------------------------ */

const Format = ({ onRegister }) => (
  <Section
    id="format"
    eyebrow="Format & Rules"
    title="How the contest works"
    subtitle="A straightforward, ICPC-inspired ruleset. Know it before you register your team."
  >
    <div className="grid items-start gap-8 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <ul className="grid gap-3 sm:grid-cols-2">
          {RULES.map((rule) => (
            <li
              key={rule}
              className="flex items-start gap-3 rounded-xl border border-navy-100 bg-white p-4 shadow-sm"
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                <CheckIcon className="h-4 w-4" />
              </span>
              <span className="text-sm leading-relaxed text-navy-700">
                {rule}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="lg:col-span-2">
        <div className="rounded-2xl bg-pstu-gradient p-7 text-white shadow-lg">
          <h3 className="text-xl font-bold">Ready to compete?</h3>
          <p className="mt-2 text-sm leading-relaxed text-navy-100">
            Registration takes just a few minutes. Have your team name, coach
            details, and each member's Codeforces handle ready.
          </p>
          <button
            type="button"
            onClick={onRegister}
            className="group mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-navy-800 shadow-md transition hover:bg-navy-50"
          >
            Start Registration
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
          <p className="mt-4 text-xs text-navy-200">
            No payment required · Instant registration ID
          </p>
        </div>
      </div>
    </div>
  </Section>
);

/* ------------------------------------------------------------------ */
/* Prizes                                                              */
/* ------------------------------------------------------------------ */

const rankStyles = {
  1: {
    ring: 'border-gold-300 ring-2 ring-gold-200',
    badge: 'bg-gold-400 text-navy-900',
    medal: 'text-gold-500',
    scale: 'lg:-translate-y-4',
  },
  2: {
    ring: 'border-navy-100',
    badge: 'bg-navy-200 text-navy-800',
    medal: 'text-navy-300',
    scale: '',
  },
  3: {
    ring: 'border-navy-100',
    badge: 'bg-gold-700/20 text-gold-800',
    medal: 'text-gold-700',
    scale: '',
  },
};

const Prizes = () => (
  <Section
    id="prizes"
    eyebrow="Rewards"
    title="Play for the podium"
    subtitle="Trophies, medals, and certificates for the teams that rise to the top. Every participant walks away with an event t-shirt."
    className="bg-navy-50"
  >
    <div className="grid items-center gap-6 sm:grid-cols-3">
      {PRIZES.map((prize) => {
        const s = rankStyles[prize.rank] || rankStyles[3];
        return (
          <div
            key={prize.place}
            className={`rounded-2xl border bg-white p-7 text-center shadow-sm transition ${s.ring} ${s.scale}`}
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center">
              <MedalIcon className={`h-14 w-14 ${s.medal}`} />
            </div>
            <span
              className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${s.badge}`}
            >
              {prize.place}
            </span>
            <ul className="mt-5 space-y-2">
              {prize.perks.map((perk) => (
                <li key={perk} className="text-sm font-medium text-navy-600">
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

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */

const FaqSection = () => (
  <Section
    id="faq"
    eyebrow="FAQ"
    title="Questions, answered"
    subtitle="Everything you need to know before registering your team."
  >
    <div className="mx-auto max-w-3xl">
      <Faq />
    </div>
  </Section>
);

/* ------------------------------------------------------------------ */
/* Final CTA                                                           */
/* ------------------------------------------------------------------ */

const FinalCta = ({ onRegister }) => (
  <section className="py-20 sm:py-24">
    <div className="mx-auto max-w-6xl px-4">
      <div className="relative overflow-hidden rounded-3xl bg-pstu-gradient px-6 py-16 text-center text-white shadow-xl sm:px-12">
        <div className="absolute inset-0 bg-grid-navy bg-[size:36px_36px] opacity-60" />
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold-400/10 blur-3xl" />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Your team's spot is waiting
          </h2>
          <p className="mt-4 text-base leading-relaxed text-navy-100 sm:text-lg">
            Gather your three coders, pick a name worth remembering, and claim
            your place at PSTU IT Carnival 2026.
          </p>
          <button
            type="button"
            onClick={onRegister}
            className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-bold text-navy-800 shadow-lg transition hover:bg-navy-50"
          >
            Register Your Team
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  </section>
);

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

const Footer = () => (
  <footer className="border-t border-navy-100 bg-white">
    <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-700 text-sm font-extrabold text-white">
          PC
        </span>
        <div className="text-sm">
          <p className="font-bold text-navy-800">PSTU IT Carnival 2026</p>
          <p className="text-xs text-navy-400">{EVENT.university}</p>
        </div>
      </div>
      <div className="flex flex-col items-center gap-1 text-sm text-navy-500 sm:items-end">
        <a
          href={`mailto:${EVENT.contactEmail}`}
          className="font-medium text-navy-600 transition hover:text-navy-900"
        >
          {EVENT.contactEmail}
        </a>
        <p className="text-xs text-navy-400">
          © 2026 PSTU IT Carnival — Programming Contest
        </p>
      </div>
    </div>
  </footer>
);

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const LandingPage = ({ onRegister }) => (
  <div className="min-h-screen bg-white">
    <Navbar onRegister={onRegister} />
    <main>
      <Hero onRegister={onRegister} />
      <About />
      <Timeline />
      <Format onRegister={onRegister} />
      <Prizes />
      <FaqSection />
      <FinalCta onRegister={onRegister} />
    </main>
    <Footer />
  </div>
);

export default LandingPage;
