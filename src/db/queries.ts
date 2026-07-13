import { unstable_cache } from 'next/cache';
import { db } from './index';
import { cards, cardCategories, playlistCards, playlists } from './schema';
import type { CardItem, CategorySlug, Playlist } from '@src/data/content';

const CATEGORY_PREFIX: Record<CategorySlug, string> = {
  tutorials: 'tutorial',
  tech: 'tech',
  documents: 'document',
  downloads: 'download',
  'apps-tools': 'app',
  discords: 'discord',
  youtube: 'youtube',
  fanart: 'fanart',
};

// The card's id prefix marks its primary category (e.g. "tutorial-001" -> tutorials).
const orderCategoriesWithPrimary = (
  cardId: string,
  categories: CategorySlug[],
): CategorySlug[] => {
  if (categories.length <= 1) return categories;
  const primary = categories.find((slug) =>
    cardId.startsWith(`${CATEGORY_PREFIX[slug]}-`),
  );
  if (!primary) return categories;
  return [primary, ...categories.filter((slug) => slug !== primary)];
};

export interface ContentStore {
  cards: CardItem[];
  playlists: Playlist[];
}

const fetchContent = async (): Promise<ContentStore> => {
  const [cardRows, categoryRows, playlistLinkRows, playlistRows] =
    await Promise.all([
      db.select().from(cards),
      db.select().from(cardCategories),
      db.select().from(playlistCards),
      db.select().from(playlists),
    ]);

  const categoriesByCard = new Map<string, CategorySlug[]>();
  for (const row of categoryRows) {
    const list = categoriesByCard.get(row.cardId) ?? [];
    list.push(row.categorySlug);
    categoriesByCard.set(row.cardId, list);
  }

  const playlistsByCard = new Map<string, string[]>();
  for (const row of playlistLinkRows) {
    const list = playlistsByCard.get(row.cardId) ?? [];
    list.push(row.playlistId);
    playlistsByCard.set(row.cardId, list);
  }

  return {
    cards: cardRows.map((row) => ({
      id: row.id,
      categories: orderCategoriesWithPrimary(
        row.id,
        categoriesByCard.get(row.id) ?? [],
      ),
      playlistIds: playlistsByCard.get(row.id) ?? [],
      title: row.title,
      description: row.description ?? undefined,
      image: row.image ?? undefined,
      date: row.date ?? undefined,
      recommended: row.recommended,
      url: row.url,
    })),
    playlists: playlistRows.map((row) => ({
      id: row.id,
      category: row.categorySlug,
      parentPlaylistId: row.parentPlaylistId ?? undefined,
      title: row.title,
      image: row.image,
      description: row.description ?? undefined,
    })),
  };
};

export const getContent = unstable_cache(fetchContent, ['content-store'], {
  revalidate: 300,
});
