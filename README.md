# Hotbeam

Hotbeam is a Next.js 16 web application configured for deployment on Cloudflare using OpenNext.

## Prerequisites

- Node.js 20+
- npm

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000).

## Useful scripts

- `npm run dev` — start local development server
- `npm run build` — create production build
- `npm run start` — run production server
- `npm run lint` — run ESLint
- `npm run preview` — build and preview Cloudflare/OpenNext output
- `npm run deploy` — build and deploy to Cloudflare

## Cloudflare type generation

To regenerate Cloudflare environment types:

```bash
npm run cf-typegen
```
