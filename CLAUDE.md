# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

MCSRHub is a community hub aggregating Minecraft Speedrunning (MCSR) guides, resources, and tutorials. Next.js (App Router) + React 19 + MUI v7 + Tailwind v4, with Drizzle ORM against a Neon Postgres database.

## Commands

- `npm run dev` / `npm run build` / `npm run start` — Next.js dev/build/start
- `npm run lint` — ESLint (flat config, `eslint.config.js`)
- `npm test` — runs `src/**/*.test.ts` via Node's built-in test runner (`tsx --test`); very few test files exist currently
- `npm run backup` — dumps all content DB tables to `backups/*.json` via `scripts/backup-db.ts`

## Database / schema

- `src/db/schema.ts` mirrors the schema owned and migrated by a separate private app, **ResourceQ** (https://github.com/jqhz/ResourceQ). MCSRHub only reads from these tables at runtime.
- If ResourceQ's schema changes upstream, `schema.ts` (and a corresponding drizzle migration here) may need to be updated to match — don't originate unrelated schema changes from this repo. See the `sync-resourceq-schema` skill for this workflow.
- Content (cards, playlists, categories) is served from the DB via `src/db/queries.ts`, not from flat files. Contributors request content additions via Discord/issue, not by editing files directly.
- `.env` (gitignored) holds a live `DATABASE_URL`; there is no `.env.example`.

## Workflow

- One branch per feature, named `feature/<feature-name>`, then a pull request for review before merging into `main`.

## Notes

- `vite`, `@vitejs/plugin-react-swc`, and the `eslint-plugin-react-refresh` vite preset in `eslint.config.js` are dead weight left over from a pre-Next.js migration — Next.js/App Router is the only real build path; don't try to wire up Vite.
- `src/pages/api/fanart.ts` is a lone Pages-Router-style API route coexisting with the App Router's `src/app/api/*/route.ts` handlers.
- Fan art is manually curated via Discord submissions, not scraped from Twitter/X (would require a bearer token).
