# MCSRHub developer docs

This folder is a map of the codebase for humans — where things live, how data flows, and what's non-obvious. It's separate from [`CLAUDE.md`](../CLAUDE.md), which is a short set of instructions for AI coding agents (commands, DB/schema ownership, workflow conventions). Read `CLAUDE.md` for those basics; come here for everything else. These docs link back to `CLAUDE.md` rather than repeating it.

**Confused about something weird in the code?** Check [`gotchas.md`](./gotchas.md) first — it's a list of the non-obvious conventions and rough edges most likely to trip you up.

## Index

| File | Covers |
|---|---|
| [`architecture.md`](./architecture.md) | How data flows from the DB to the screen, server vs. client rendering, caching layers, state management |
| [`routing-and-api.md`](./routing-and-api.md) | Every page route and API route: what renders it, what it returns |
| [`data-layer.md`](./data-layer.md) | The single query entry point, the `votes.json` exception, backups |
| [`schema.md`](./schema.md) | Full column-by-column DB schema reference (types, nullability, defaults, FKs) |
| [`components-and-utils.md`](./components-and-utils.md) | What each component and util does, and who uses it |
| [`gotchas.md`](./gotchas.md) | Non-obvious conventions and known rough edges — read this first |

## Repository map

```
src/app/                       Next.js App Router — pages + API routes (primary router)
  layout.tsx                     root layout: fetches initial content server-side, wraps app in AppShell
  page.tsx                       "/" homepage (client component)
  [category]/page.tsx            "/[category]" listing page (client component)
  [category]/[...playlistPath]/  "/[category]/<nested-slugs>" playlist pages (server component)
  [category]/playlist/[playlistId]/  legacy URL, redirects to the nested-slug path
  api/content/route.ts           GET — {cards, playlists} from the DB
  api/og-image/route.ts          GET — resolves an og:image for a given URL
  api/votes/route.ts             GET/POST — daily poll, backed by a local JSON file (not the DB)

src/pages/api/fanart.ts        legacy Pages Router route (see gotchas.md #1)

src/components/                flat, 10 components, no subfolders — see components-and-utils.md
src/data/                      static/config TS data (categories, fanart sample, vote questions)
                                + votes.json, a runtime-generated file written by api/votes
src/db/                        Drizzle connection, schema.ts (see docs/schema.md), queries.ts
src/utils/                     pure helper functions, no React — + a couple of colocated *.test.ts files
src/styles/globals.css         Tailwind v4 entry point
src/assets/                    Minecraftia font + a leftover react.svg (see gotchas.md #2)

scripts/backup-db.ts           `npm run backup` — dumps DB tables to backups/*.json
backups/                       output of the above
```

## Where do I start?

| I want to... | Read |
|---|---|
| Add or change a route or API endpoint | [`routing-and-api.md`](./routing-and-api.md) |
| Understand how content gets from the DB to a component | [`architecture.md`](./architecture.md), [`data-layer.md`](./data-layer.md) |
| Change the DB schema | [`schema.md`](./schema.md), then the `sync-resourceq-schema` skill (`.claude/skills/sync-resourceq-schema/`) |
| Find or reuse a utility function | [`components-and-utils.md`](./components-and-utils.md) |
| Avoid a known footgun | [`gotchas.md`](./gotchas.md) |
