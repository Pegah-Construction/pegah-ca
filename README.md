# Pegah Construction — Website

Marketing site and staff dashboard for Pegah Construction Ltd.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS · Prisma + PostgreSQL · Vercel Blob

> **Looking for how to *use* the site?** This file is for developers. The
> non-technical walkthrough of every dashboard screen lives in
> [`docs/ADMIN_GUIDE.md`](docs/ADMIN_GUIDE.md) — keep that one updated when you
> ship a feature staff will touch.

## Getting started

```bash
npm install
cp .env.example .env      # then fill in DATABASE_URL and DIRECT_URL
npm run db:push           # create the schema
npm run db:seed           # optional: demo content
npm run dev
```

Open http://localhost:3000. The dashboard is at `/admin`.

The database is **PostgreSQL** (Supabase in production — use the pooler URL on
port 6543 for `DATABASE_URL` and the direct connection on 5432 for `DIRECT_URL`,
which Prisma needs for `db push`). Uploads go to **Vercel Blob** when
`BLOB_READ_WRITE_TOKEN` is set. See [`.env.example`](.env.example) for every
variable, including the Anthropic key for AI generation and the SmartBid
credentials for tender sync.

## Scripts

| Command             | What it does                          |
| ------------------- | ------------------------------------- |
| `npm run dev`       | Start the dev server                  |
| `npm run build`     | `prisma generate` + production build  |
| `npm run start`     | Serve the production build            |
| `npm run lint`      | Lint                                  |
| `npm run db:push`   | Push `schema.prisma` to the database  |
| `npm run db:seed`   | Seed demo data (`prisma/seed.ts`)     |
| `npm run db:studio` | Prisma Studio                         |

## Project structure

```
app/
  layout.tsx          Root layout, fonts, SEO metadata + JSON-LD, theme bootstrap
  globals.css         Tailwind layers, theme tokens, .article-body styles
  sitemap.ts          Dynamic sitemap (static routes + projects + published posts)
  robots.ts           Allows the public site, disallows /admin and /api
  page.tsx            Homepage
  about/ safety/ contact/             Public pages, content served from the database
  projects/           List + [slug] detail
  blog/               List + [slug] detail (likes, share, reader comments)
  careers/ tenders/   Job postings; SmartBid-synced tenders
  subcontractors/register/            Embedded SmartBid registration form
  admin/              Staff dashboard (see below)
  api/                50 route handlers backing both halves
components/
  Navbar.tsx          Sticky nav; collapses to a scrollable menu below `lg`
  ThemeToggle.tsx     Light/dark switch, persisted per browser
  LikeButton.tsx      Anonymous per-browser likes on articles
  ShareButton.tsx     Native share sheet, falling back to copy-link
  Comments.tsx        Reader comment form + thread
  Hero.tsx HeroCarousel.tsx StatBand.tsx Intro.tsx ServicesList.tsx …
                      (services live only as the home page section — there is no /services page)
  Brand.tsx           SiteLogo / LogoMark / Wordmark / Eyebrow
  admin/              Dashboard shell, guard, UI primitives, one view per module
lib/
  db.ts               Prisma client
  auth.tsx password.ts  Login, password hashing, reset tokens
  settings.ts settings-server.ts  Editable site-wide copy (key/value Setting table)
  about-content.ts safety-content.ts  Editable page content
  ai.ts               Article + social-post generation
  smartbid.ts         Tender sync
  storage.ts          Vercel Blob uploads
  comments.ts         Shared comment validation (client + API)
  site.ts             Static company details, nav structure, canonical origin
```

Most site copy is **database-backed and editable in the dashboard**. What is
still hardcoded in `lib/site.ts` — the careers email, the nav structure, the
organization details used for structured data — is listed for staff in
[§18 of the admin guide](docs/ADMIN_GUIDE.md#18-what-lives-in-code).

## Admin console (`/admin`)

Internal dashboard for managing site content. Reachable from the **Staff login**
link in the site footer.

**Auth.** Real credentials: passwords are hashed (`lib/password.ts`), verified by
`/api/auth/login`, with forgot-password and reset-token flows. Note the session
itself is still held **client-side** in `localStorage` by `AuthProvider`
(`lib/auth.tsx`) rather than in a server session or signed cookie — move it to
one before this guards anything more sensitive than content editing.

**Roles.** There is **one role: `admin`**, with access to every module
(`lib/admin.ts` → `PERMS`). A user's job is recorded in their *title*, not their
role. `permsFor()` returns no permissions for any unrecognised role, so a
hand-edited row fails closed.

Every page is wrapped in `<Guard module="…">`, which shows the login screen when
signed out and otherwise renders the page inside `<AdminShell>`. When the role
lacks the module it renders the shell with **empty content** — note that `Guard`'s
own doc comment still claims it renders `<AccessDenied />` (`components/admin/ui.tsx`),
which it no longer does; the component is now unused.

### Enabled modules

Dashboard · Projects · Tenders · News & Blog · Careers · Inquiries · About/Team ·
Health & Safety · Services · Users & Roles · Settings

All of these read and write real data through `app/api/*`.

### Disabled modules

Task Board, Schedule, Clients, Documents and the AI Assistant chat are **commented
out of the sidebar** in `components/admin/AdminShell.tsx`. Their routes and views
still exist and still read the mock constants in `lib/admin.ts` (`BOARD`, `TASKS`,
`CLIENTS`, `DOCUMENTS`, `AI_*`). Re-enable a nav entry only after porting its view
onto the database.

## Deploy

Zero-config on [Vercel](https://vercel.com) — import the repo, set the variables
from `.env.example`, and deploy. `NEXT_PUBLIC_SITE_URL` must be the live origin:
it is the canonical URL used by the sitemap, robots.txt, social preview cards and
the share button.
