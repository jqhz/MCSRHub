# Architecture

See [`README.md`](./README.md) for the full directory map. This file covers how the pieces connect at runtime.

## Data flow: DB → screen

```
Neon Postgres
  → src/db/queries.ts  getContent()          (unstable_cache, key "content-store-v3", revalidate 300s)
    → src/app/layout.tsx                     server-side initial fetch, on every request
      → AppShell (client) → ContentProvider (client context, hydrated from initialData)
        → useContent() hook
          → components (Header, Sidebar, CardGrid, RegularCard, ...)
```

There's a second entry point into the same cached function: once mounted, `ContentProvider` can re-fetch via `GET /api/content` (see [`routing-and-api.md`](./routing-and-api.md)), which also calls `getContent()`. The client fetch uses `cache: 'force-cache'`, and the route itself sets `Cache-Control: public, s-maxage=300, stale-while-revalidate=600` — so both the server-side call and the client refetch are reading through the same 300s cache window in practice.

`RootLayout` (`src/app/layout.tsx`) wraps `getContent()` in a try/catch that falls back to `{ cards: [], playlists: [] }` on failure, so a DB outage degrades to an empty app rather than a crashed page.

## Server vs. client rendering

| Route / component | Type | Notes |
|---|---|---|
| `src/app/layout.tsx` | server | root layout; the only place that does the *initial* `getContent()` fetch |
| `/` (`src/app/page.tsx`) | client | homepage — daily tip + featured channel |
| `/[category]` | client | paginated category listing; special-cases the `fanart` category |
| `/[category]/[...playlistPath]` | server | resolves nested playlist paths, issues `permanentRedirect` if the URL isn't canonical |
| `/[category]/playlist/[playlistId]` | server | legacy-URL redirect shim → nested-slug path |
| `AppShell` | client | MUI theme, layout chrome, mounts `ContentProvider` |
| `ContentProvider` | client | React Context, data source for the rest of the client tree |

## State management

`ContentProvider` (`src/components/ContentProvider.tsx`) is the single source of app data on the client:

- Context value: `{ cards, playlists, loading, refresh }`
- Initialized from the `initialData` prop passed down from `RootLayout` → `AppShell` → `ContentProvider` (server-fetched, no client request needed on first paint)
- If no `initialData` is present (shouldn't normally happen given the layout always fetches), it fetches `/api/content` on mount instead
- `refresh()` is the same fetch function, exposed for components that want to manually re-pull data
- `useContent()` is the only sanctioned way for a component to read cards/playlists — it throws if called outside the provider

## Caching layers

| Layer | Mechanism | TTL |
|---|---|---|
| `getContent()` (`src/db/queries.ts`) | `unstable_cache`, key `content-store-v3` | 300s |
| `GET /api/content` | `Cache-Control: public, s-maxage=300, stale-while-revalidate=600` header, on top of the cached `getContent()` | 300s (600s stale) |
| `GET /api/og-image` | in-memory `Map` on `globalThis` (per server instance, not shared/persistent) | 24h success / 10min negative-result |

## Two routers, briefly

The App Router (`src/app/`) is the only router used for real routes and pages. One legacy API route, `src/pages/api/fanart.ts`, still lives under the old Pages Router — see [`gotchas.md` #1](./gotchas.md#1-two-coexisting-routers) for why it's there and what not to do with it.

## Styling stack

MUI v7 provides a dark theme (`createTheme` in `AppShell.tsx`) with a custom `Minecraftia` display font (`src/assets/fonts/Minecraft.otf`), layered under `CssBaseline`. Tailwind v4 is also wired in via `src/styles/globals.css` + `postcss.config.mjs` (no `tailwind.config.*` needed — v4 is CSS-configured). Both are active at once; MUI's `sx` prop is the more common styling path in existing components.
