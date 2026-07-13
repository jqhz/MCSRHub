import {
  pgTable,
  text,
  timestamp,
  boolean,
  pgEnum,
  primaryKey,
  foreignKey,
} from 'drizzle-orm/pg-core';

// Mirrors the schema owned/migrated by the private ResourceQ app.
// MCSRHub only reads from these tables.
export const categorySlugEnum = pgEnum('category_slug', [
  'tutorials',
  'tech',
  'documents',
  'downloads',
  'apps-tools',
  'discords',
  'youtube',
  'fanart',
]);

export const categories = pgTable('categories', {
  slug: categorySlugEnum('slug').primaryKey(),
  label: text('label').notNull(),
});

export const playlists = pgTable(
  'playlists',
  {
    id: text('id').primaryKey(),
    categorySlug: categorySlugEnum('category_slug')
      .notNull()
      .references(() => categories.slug, { onDelete: 'restrict' }),
    parentPlaylistId: text('parent_playlist_id'),
    title: text('title').notNull(),
    image: text('image').notNull(),
    description: text('description'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.parentPlaylistId],
      foreignColumns: [table.id],
      name: 'playlists_parent_playlist_id_fkey',
    }).onDelete('cascade'),
  ],
);

export const cards = pgTable('cards', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  image: text('image'),
  date: text('date'),
  recommended: boolean('recommended').notNull().default(false),
  url: text('url').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const playlistCards = pgTable(
  'playlist_cards',
  {
    playlistId: text('playlist_id')
      .notNull()
      .references(() => playlists.id, { onDelete: 'cascade' }),
    cardId: text('card_id')
      .notNull()
      .references(() => cards.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.playlistId, t.cardId] })],
);

export const cardCategories = pgTable(
  'card_categories',
  {
    cardId: text('card_id')
      .notNull()
      .references(() => cards.id, { onDelete: 'cascade' }),
    categorySlug: categorySlugEnum('category_slug')
      .notNull()
      .references(() => categories.slug, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.cardId, t.categorySlug] })],
);
