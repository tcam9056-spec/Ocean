# Sóng nước của Đại Dương

A fairytale ocean showcase app where links are displayed as art on glowing glass shelves beneath a magical deep-sea world.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/song-nuoc run dev` — run the frontend (port 24678)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Framer Motion + Tailwind CSS
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for API contracts
- `lib/db/src/schema/showcaseLinks.ts` — showcase_links table schema
- `artifacts/api-server/src/routes/links.ts` — links API routes
- `artifacts/song-nuoc/src/` — React frontend
  - `components/OceanBackground.tsx` — animated ocean background with sun rays, stardust, seaweed
  - `components/MermaidSilhouette.tsx` — 2 animated mermaid SVGs swimming across the screen
  - `components/SplashScreen.tsx` — full-screen splash with fade-out on click
  - `components/ShowcaseShelf.tsx` — glassmorphism shelf rows displaying link cards
  - `components/LinkCard.tsx` — individual link card with like/delete functionality
  - `components/AdminPanel.tsx` — hidden admin trigger + upload form + login modal
  - `components/StatsBar.tsx` — total links & likes counter

## Architecture decisions

- Single-page app with no routing — all experience is one scrollable canvas
- Admin auth is frontend-only email check (tcam9056@gmail.com) — no OAuth, no server-side session
- Admin state persisted in localStorage key `ocean_admin_email`
- Framer Motion handles all animations; mermaids use long-duration (22-28s) keyframe paths
- Custom ocean scrollbar (3px teal glow line) replaces browser default
- Splash screen blocks audio autoplay restriction — user clicks to enter, triggering audio.play()

## Product

- Magical fairytale ocean link showcase — display curated URLs as artwork on glowing glass shelves
- Animated background: animated mermaids, sun rays, floating stardust particles, seaweed
- Splash screen gate: "Chạm để hòa mình vào đại dương cổ tích..."
- Each link card: title, italic description, hostname, heart/like counter with sparkle animation
- Admin-only: hidden anchor icon trigger → email login → upload form → delete buttons on cards
- Toast notifications styled as water bubbles (glassmorphism pill shape)

## User preferences

- Vietnamese language UI
- Admin email: tcam9056@gmail.com

## Gotchas

- Always run `pnpm run typecheck:libs` after changing `lib/db/src/schema/` before restarting api-server
- Re-run codegen after any change to `lib/api-spec/openapi.yaml`
- The `latestLink` field in LinksStats can be null if DB is empty — handle in frontend
- Route order matters: `/links/stats` must not conflict with `/links/:id` (currently safe because stats is GET and /:id is DELETE/POST only)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
