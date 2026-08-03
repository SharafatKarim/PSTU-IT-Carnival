# PSTU IT Carnival 2026

The website for **PSTU IT Carnival 2026** — a three-day tech and gaming festival
at Patuakhali Science and Technology University, 13–15 August 2026.

Eleven events. IUPC (the flagship ICPC-style contest) takes pre-registrations
online; the three gaming tournaments publish their formats, rules and prizes
while entries stay closed; the rest are announced but not yet open.

Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · MongoDB · pnpm

## Run it

**With Docker** — the whole stack, no local Node or MongoDB needed:

```bash
docker compose up -d --build
```

Then open **http://localhost:5173**.

**Locally**, against your own MongoDB:

```bash
pnpm install
 # then set MONGO_URI
cp .env.example .env    
pnpm dev
```

Then open **http://localhost:3000**.

| Command | |
| --- | --- |
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint |
| `docker compose logs -f` | Follow container logs |
| `docker compose down` | Stop (keeps the database) |
| `docker compose down -v` | Stop and **delete** the database |

### Environment

Copy `.env.example` to `.env`. Everything has a default, so `docker compose up`
works with no `.env` at all.

| Variable | Default | |
| --- | --- | --- |
| `MONGO_URI` | `mongodb://localhost:27017/IT_Carnival` | Connection string. Required for the API; the site's pages render without it. |
| `MONGO_DB` | `pstu_it_carnival` | Database name compose builds its URI from. Note `.env.example` suggests `IT_Carnival`, so the two disagree unless you set it. |
| `CLIENT_PORT` | `5173` | Host port compose publishes on |
| `NEXT_PUBLIC_SITE_URL` | `https://` + `EVENT.website` | Base URL used by `sitemap.xml` |

---

## How the URLs are laid out

Everything is one tree. Every event lives under `/events`, and each event owns
its own pages:

```
/                                       Landing page
/events                                 Index of the whole line-up
/events/iupc                            Event home — info, rules, FAQ, contact
/events/iupc/register                   Registration form
/events/gaming                          Gaming hub
/events/gaming/efootball                Game home
/events/gaming/efootball/register       Game registration
/events/gaming/pubg-mobile              …and the same pair for each game
/events/gaming/free-fire
/sitemap.xml                            Generated from the route registry
```

The API mirrors it exactly:

```
POST /api/v1/events/iupc/registrations            Stores an IUPC team
POST /api/v1/events/gaming/<game>/registrations   Validates, does not store yet
GET  /api/v1/health                               Database reachability
```

URLs that were public before this layout — `/gaming`, `/gaming/<slug>`,
`/register` — permanently redirect to their new homes (`next.config.mjs`).
`/api/v1/registrations` re-exports the IUPC handler rather than redirecting,
because a 308 would rely on the caller replaying its POST body.

---

## Project structure

```
src/
├── app/                  Routes only — each page.js resolves data and delegates
│   ├── page.js             /            → <LandingPage>
│   ├── events/             /events and every event beneath it
│   ├── api/v1/events/      One namespace per event, mirroring the pages
│   ├── layout.js           Root layout, fonts, site-wide metadata
│   ├── globals.css         Tailwind v4 @theme — the entire design system
│   ├── not-found.js        Themed 404
│   └── sitemap.js          Built from lib/routes.js
│
├── data/                 All content. Coordinators edit here and nowhere else.
│   ├── content.js          Carnival-wide copy: hero, stats, events, timeline, FAQs
│   ├── events.js           IUPC detail page: schedule, rules, FAQ, coordinator
│   ├── gaming.js           The three tournaments, including their form fields
│   └── universities.js     Suggestions for the varsity field, south of the Padma
│
├── lib/
│   ├── routes.js           Every URL on the site. Nothing else hard-codes a path.
│   └── metadata.js         Page titles and descriptions, built from data/
│
├── components/
│   ├── LandingPage.jsx     The home page
│   ├── landing/            Navbar, Events grid, FAQ, Footer, Icons
│   ├── events/             Events index, IUPC detail page
│   ├── gaming/             Hub, game cards, detail page, registration
│   ├── ui/                 Shared pieces (HeadlineStrip)
│   └── *.jsx               Form primitives: FormField, SelectField, Autocomplete…
│
├── server/               Server-only. Never imported by a client component.
│   ├── db.js               Cached Mongoose connection
│   └── events/
│       ├── iupc/           model.js · validation.js · ids.js
│       └── gaming/         validation.js
│
└── services/             Browser-side clients for the API
    └── events/             iupc.js · gaming.js
```

### Two rules the code relies on

**Content lives in `src/data/`.** Components read it; they do not restate it.
Change a date once and it updates the event page, the landing card, the page
title and the form notice together.

**Paths live in `src/lib/routes.js`.** Navs, cards, CTAs, the sitemap and the
redirects all build their `href` from it, so renaming an event moves every link
that points at it.

---

## Editing content

| To change | Edit |
| --- | --- |
| Hero copy, stats, timeline, carnival FAQs | `src/data/content.js` |
| The event line-up and its cards | `EVENTS` in `src/data/content.js` |
| IUPC schedule, rules, FAQ, coordinator | `src/data/events.js` |
| A tournament's date, fee, prizes, rules, form | `src/data/gaming.js` |
| Varsity suggestions | `src/data/universities.js` |
| Colours, shadows, animations | the `@theme` block in `src/app/globals.css` |

> **Placeholders.** Dates, times, entry fees, prize amounts, slot counts and
> coordinator contacts in `events.js` and `gaming.js` are stand-ins, marked as
> such at the top of each file. Replace them before the site goes public.

### Opening or closing a registration

One flag per event decides whether a form renders:

```js
// src/data/gaming.js  ·  src/data/events.js
registrationOpen: false,   // true puts that event's form live
```

When it is `false`, the registration page still exists — it shows what to
prepare and who to ask, so a shared link never dead-ends — and the cards show a
disabled "Opens Soon" instead of a link to a form nobody can submit.

Today: **IUPC is open**, all three gaming tournaments are closed.

### Adding an event or a game

Routes are explicit folders, not `[slug]` catch-alls, so adding one takes two
steps:

1. Add the entry to `src/data/events.js` or `src/data/gaming.js`.
2. Create the matching folder — `src/app/events/<slug>/page.js`, or
   `src/app/events/gaming/<slug>/page.js` — and list the slug in
   `EVENT_PAGE_SLUGS` / `GAME_PAGE_SLUGS` in `src/lib/routes.js`.

Copy an existing page; each is about ten lines. If you forget step 2, the dev
server warns you rather than shipping a card that links to a 404:

```
[routes] Games in the data with no page: chess. Add
src/app/events/gaming/<slug>/page.js and list the slug in src/lib/routes.js,
or those links will 404.
```

---

## Registration

### IUPC — live

Three steps: team and coach, then three members, then a review. On submit the
API stores the team and returns an ID like `PSTU-IUPC-2026-0001`.

Rules the form enforces, on both sides:

- Exactly three members, each with a distinct email and Codeforces handle
- Team names unique across all registrations
- Team names carry the varsity's short form and use underscores, never spaces —
  `PSTU_Array_Of_Hope`
- Bangladeshi phone numbers

Pre-registration is free. The ৳3,000 per-team entry fee applies at *final*
registration, after confirmed slots are published university-wise.

### Gaming — scaffolded, not storing

The endpoint exists and does everything except persist: it resolves the game,
checks entries are open, validates the payload against that game's own field
config, then answers **501**. The browser never reaches it — `DEMO_MODE` in
`src/services/events/gaming.js` short-circuits first.

To go live:

1. Add a model and ID generator under `src/server/events/gaming/`
2. Replace the 501 block in
   `src/app/api/v1/events/gaming/[game]/registrations/route.js` with the create
   call — mirror the IUPC handler for duplicate checks
3. Set `DEMO_MODE = false`
4. Set `registrationOpen: true` on the games that are opening

The form itself is generated from `registration.sections` in `gaming.js`, and
the server validates against that same config — add a field to the data and
both sides pick it up.

---

## Deploying

The image is multi-stage: pnpm installs and builds, and the runtime stage runs
Node 24 without pnpm. `next.config.mjs` sets `output: 'standalone'`.

**Node 22.13 is the floor, and `engines.node` in `package.json` is what enforces
it off-Docker.** pnpm 11 loads `node:sqlite`, which Node 20 does not have, so on
an older Node it dies before installing a single package. The Dockerfile pins
`node:24-alpine`, but a platform that provisions its own runtime — Vercel — has
only `engines` to read. Do not drop that field; a build host defaulting to Node
20 fails every deploy at the install step.

**One lockfile only: `pnpm-lock.yaml`.** `package-lock.json` is gitignored. When
both were committed the package manager became ambiguous, Vercel chose npm, and
a dependency bump that regenerated only the pnpm lockfile made `npm ci` fail its
sync check. Running npm locally is fine — just never commit what it writes.

**`next start` does not work with a standalone build.** Run the bundled server,
and copy the static assets next to it:

```bash
pnpm build
cp -a .next/static  .next/standalone/.next/static
cp -a public        .next/standalone/public
node .next/standalone/server.js
```

The Dockerfile already does this — the note is for running a production build
by hand. Skipping the copy serves every page with no CSS.

## Notes

- No admin dashboard and no payment integration. No money is collected through
  the site; fees are handled on-site.
- Registrations are stored in the `IUPC_pre_reg` collection.
- `pnpm-lock.yaml` is the only lockfile — the Dockerfile installs with pnpm at
  the version pinned in `package.json`.
