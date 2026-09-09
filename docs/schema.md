# Database schema

Full column-by-column reference for `src/db/schema.ts`. See [`data-layer.md`](./data-layer.md) for how this schema is queried and cached, and [`routing-and-api.md`](./routing-and-api.md#nested-playlist-path-resolution) for how the `playlists` self-reference powers nested playlist routing.

**This schema is read-only from MCSRHub's perspective.** It mirrors the schema owned and migrated by the private [ResourceQ](https://github.com/jqhz/ResourceQ) app — all writes happen there, not in this repo. There's no local `drizzle.config.*` or migration tooling here (see [`gotchas.md` #3](./gotchas.md#3-no-drizzleconfig-anywhere)); when ResourceQ's schema changes upstream, use the `sync-resourceq-schema` skill to bring `schema.ts` back in sync.

## `category_slug` (enum)

```
tutorials | tech | documents | downloads | apps-tools | discords | youtube | fanart
```

Defined via `pgEnum`, used as the column type anywhere a category slug is stored.

## `categories`

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `slug` | `category_slug` | no | — | **primary key** |
| `label` | `text` | no | — | |

## `playlists`

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | `text` | no | — | **primary key** |
| `category_slug` | `category_slug` | no | — | FK → `categories.slug`, `ON DELETE RESTRICT` |
| `parent_playlist_id` | `text` | **yes** | — | self-FK → `playlists.id`, `ON DELETE CASCADE` |
| `title` | `text` | no | — | |
| `slug` | `text` | no | — | |
| `image` | `text` | no | — | |
| `description` | `text` | yes | — | |
| `position` | `integer` | no | `0` | |
| `created_at` | `timestamp` (tz) | no | `now()` | |

`parent_playlist_id` is what enables arbitrarily nested playlists — a playlist with a null parent is a root playlist within its category. Deleting a parent cascades to its children.

## `cards`

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | `text` | no | — | **primary key** |
| `title` | `text` | no | — | |
| `description` | `text` | yes | — | |
| `image` | `text` | yes | — | |
| `date` | `text` | yes | — | |
| `recommended` | `boolean` | no | `false` | |
| `archived` | `boolean` | no | `false` | |
| `url` | `text` | no | — | **unique** |
| `created_at` | `timestamp` (tz) | no | `now()` | |

Note: `id` carries an implicit prefix convention (`tutorial-`, `tech-`, `discord-`, etc.) used by `getContent()` to infer a "primary" category — see [`data-layer.md` § category ordering convention](./data-layer.md#category-ordering-convention) and [`gotchas.md` #5](./gotchas.md#5-category-ordering-convention). Nothing at the schema level enforces this.

## `playlist_cards` (join: playlists ↔ cards)

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `playlist_id` | `text` | no | — | FK → `playlists.id`, `ON DELETE CASCADE`, part of composite PK |
| `card_id` | `text` | no | — | FK → `cards.id`, `ON DELETE CASCADE`, part of composite PK |
| `position` | `integer` | no | `0` | |

Primary key: (`playlist_id`, `card_id`).

## `card_categories` (join: cards ↔ categories)

| Column | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `card_id` | `text` | no | — | FK → `cards.id`, `ON DELETE CASCADE`, part of composite PK |
| `category_slug` | `category_slug` | no | — | FK → `categories.slug`, `ON DELETE CASCADE`, part of composite PK |
| `position` | `integer` | no | `0` | |

Primary key: (`card_id`, `category_slug`). A card can belong to more than one category — this table is why `CardItem.categories` in the app layer is an array, not a single value.

## App-level types vs. raw rows

The app doesn't pass raw Drizzle row shapes around — `src/db/queries.ts` joins the tables above in memory into the shapes defined in `src/data/content.ts`:

```ts
interface Playlist {
  id: string; slug: string; category: CategorySlug;
  parentPlaylistId?: string; title: string; image: string;
  description?: string; position: number;
}

interface CardItem {
  id: string; categories: CategorySlug[]; playlistIds: string[];
  categoryPositions: Partial<Record<CategorySlug, number>>;
  playlistPositions: Partial<Record<string, number>>;
  title: string; description?: string; image?: string; date?: string;
  recommended?: boolean; archived: boolean; url: string;
}
```

These fold in the join-table data (`categories`, `playlistIds`, and their per-relationship `position` values) directly onto the card, so components never need to touch `playlistCards`/`cardCategories` themselves.
