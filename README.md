# Pegah Construction — Website

Hi-fi marketing site for Pegah Construction Ltd., built from the **Direction A
(editorial / image-led)** wireframe.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Scripts

| Command         | What it does                       |
| --------------- | ---------------------------------- |
| `npm run dev`   | Start the dev server               |
| `npm run build` | Production build                   |
| `npm run start` | Serve the production build         |
| `npm run lint`  | Lint                               |

## Project structure

```
app/
  layout.tsx          Root layout + fonts (Archivo / Source Sans 3 / Space Mono)
  globals.css         Tailwind layers + .eyebrow + .image-slot helpers
  page.tsx            Homepage (Direction A)
  about/              Stub route
  services/           Stub route (renders the services data)
  projects/           Stub route (filter chips + project grid)
  safety/             Stub route
  contact/            Stub route (enquiry form + details)
  admin/              Role-based management console (see below)
components/
  Navbar.tsx          Sticky nav, transparent over hero → solid on scroll
  Hero.tsx            Full-bleed hero with gradient + headline
  StatBand.tsx        Stats card overlapping the hero
  Intro.tsx           "Who we are" statement
  FeaturedProjects.tsx Alternating large project spreads
  ServicesList.tsx    Numbered service rows
  SafetyBand.tsx      Deep-blue safety call-to-action
  Footer.tsx          Sitemap + contact
  PageShell.tsx       Shared chrome for stub routes
  ImageSlot.tsx       Striped placeholder for real photography
  Brand.tsx           Wordmark + Eyebrow
  Button.tsx          Link button (solid / outline / ghost-light)
lib/
  site.ts             All copy & data (nav, stats, projects, services, sectors)
```

## Adding real photography

Drop images into `/public` and replace `<ImageSlot />` with `next/image`:

```tsx
import Image from "next/image";

<Image src="/projects/hero.jpg" alt="..." fill className="object-cover" />;
```

Brand color (deep corporate blue) lives in `tailwind.config.ts` under
`colors.brand`. All site copy is in `lib/site.ts`.

## Deploy

Zero-config on [Vercel](https://vercel.com) — import the repo and deploy.

## Admin console (`/admin`)

A role-based internal dashboard to manage and monitor users, projects, clients,
tasks, safety and documents. Reachable from the **Staff login** link in the
site footer, or directly at `/admin`.

**Mock auth** — no backend. A login screen offers three demo accounts; the
chosen user id is stored in `localStorage` and read by an `AuthProvider`
(`lib/auth.tsx`). Replace this with real authentication (NextAuth, Clerk, etc.)
for production.

**Roles & permissions** (`lib/admin.ts` → `PERMS`):

| Role | Sees | Project scope | Budgets | Manage users | Edit settings |
| --- | --- | --- | --- | --- | --- |
| **Administrator** | all modules | all projects | ✓ | ✓ | ✓ |
| **Project Manager** | no Users/Settings | projects they manage | ✓ | — | — |
| **Site Foreman** | field modules only | projects they're on | — | — | — |

Every page is wrapped in `<Guard module="…">` which: shows the login screen when
signed out, renders `<AccessDenied />` when the role lacks the module, and
otherwise shows the page inside `<AdminShell>` (sidebar + topbar). Data is
scoped per-user via `visibleProjects()` / `visibleIds()`.

```
app/admin/
  layout.tsx          Wraps the console in <AuthProvider>
  page.tsx            Dashboard (KPIs, scoped project table, activity)
  projects/           Projects table → projects/[id] detail (timeline, budget, team, tasks, safety)
  board/              Kanban task board (drag-drop, subtasks, comments)
  tenders/            Tender aggregation → tenders/[id] detail (buyer contacts, track)
  news/               News / Blog CMS (publish/unpublish, tags, featured)
  ai/                 AI Assistant chat (provider switch, 12 tools, mock responses)
  schedule/ clients/ users/ safety/ documents/ settings/
components/admin/
  AdminShell.tsx      Sidebar (role-filtered) + topbar
  LoginScreen.tsx     Mock login + demo accounts
  Guard.tsx           Auth + permission gate
  ui.tsx              Shared primitives (cards, pills, table, avatar…)
  views/              One client component per page
```

All dashboard data is mock data in `lib/admin.ts` — swap in real API calls there.

### Modules

- **Dashboard** — role-scoped KPIs, project table, milestones, activity feed
- **Projects** — list + detail (timeline, budget, team, tasks, safety)
- **Task Board** — Kanban (New/Doing/Stuck/Review/Completed), drag-and-drop, subtask checkboxes, comment threads
- **Tenders** — aggregated procurement across 10 platforms, filters, track/notes, detail with buyer contacts *(mock data; real scrapers per spec)*
- **News & Blog** — article CMS with publish/unpublish, tags, featured
- **AI Assistant** — chat connected to the mock data via 12 tools, provider selector (Claude/OpenAI/Gemini/Grok), intent-aware responses with tool-call chips *(mock; wire to a real LLM client for production)*
- **Clients · Users & Roles · Safety · Documents · Settings** — as before

> The AI, tenders, board and news modules are **high-fidelity UI mockups with mock data** — they mirror the production platform's UX but do not include the live backend (database, scrapers, LLM calls).
