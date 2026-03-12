# Hot Beam Website

Marketing site and lightweight admin CMS for Hot Beam Productions, built with Next.js 16. The project includes the public website, a Firebase-backed admin area, deployment scripts for OpenNext/Cloudflare, and supporting Cloudflare Workers for contact handling and automation.

## Stack

- Next.js 16 + React 19
- Tailwind CSS 4
- Firebase / Firestore for CMS data
- Cloudflare R2 for media storage
- OpenNext for Cloudflare-compatible builds
- Cloudflare Workers for supporting services

## Repository Layout

- `src/app` - public pages, admin routes, API routes, sitemap, and metadata
- `src/components` - shared UI and admin interface components
- `src/lib` - data access, auth helpers, SEO helpers, and shared utilities
- `scripts` - content sync, seeding, and media maintenance scripts
- `worker` - contact/form worker
- `worker-ig-refresh` - Instagram refresh / deployment helper worker
- `docs` - internal reports and research artifacts

## Prerequisites

- Node.js 20+
- npm

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the environment template and fill in the required values:
   ```bash
   cp .env.local.example .env.local
   ```
3. If you use Wrangler/OpenNext locally, add the local dev vars file:
   ```bash
   cp .dev.vars.example .dev.vars
   ```
4. Start the app:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

The repo ships with `.env.local.example` as the source of truth for required configuration. The main groups are:

- public app configuration for contact endpoints, Turnstile, and R2 media URLs
- Firebase client keys for the CMS/admin experience
- server-side R2 credentials for uploads
- optional Instagram and snapshot configuration for published content

Use `.dev.vars.example` for local Wrangler/OpenNext development only. Keep `.env.local` and `.dev.vars` out of git.

## Scripts

- `npm run dev` - start the local Next.js dev server
- `npm run build` - create a production build
- `npm run start` - run the production server locally
- `npm run lint` - run ESLint
- `npm run preview` - build and preview the OpenNext/Cloudflare output locally
- `npm run deploy` - build and deploy the site with OpenNext/Cloudflare
- `npm run upload` - upload the built artifact without deploying
- `npm run cf-typegen` - regenerate Cloudflare environment types
- `npm run sync:fallback-json` - sync published fallback data from Firestore
- `npm run sync:fallback-json:check` - verify whether fallback data is up to date

## Deployment Notes

- The app can be built and previewed locally with OpenNext for Cloudflare.
- Production automation lives in `.github/workflows/sync-fallback-and-deploy.yml`.
- The workflow syncs fallback Firestore data on schedule/manual runs and deploys the production build after approved changes land on `main`.

## Workers

Each worker is isolated in its own folder:

- `worker` handles the contact workflow
- `worker-ig-refresh` supports Instagram refresh and deployment automation

Install worker dependencies from each worker directory before using their local `dev` or `deploy` scripts.
