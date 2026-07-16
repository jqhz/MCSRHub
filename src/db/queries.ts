import { unstable_cache } from 'next/cache';
import { db } from './index';
import { cards, cardCategories, playlistCards, playlists } from './schema';
import type { CardItem, CategorySlug, Playlist } from '@src/data/content';
import { filterPublicCards } from '@src/utils/publicContent';

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
  const categoryPositionsByCard = new Map<
    string,
    Partial<Record<CategorySlug, number>>
  >();
  for (const row of categoryRows) {
    const list = categoriesByCard.get(row.cardId) ?? [];
    list.push(row.categorySlug);
    categoriesByCard.set(row.cardId, list);

    const positions = categoryPositionsByCard.get(row.cardId) ?? {};
    positions[row.categorySlug] = row.position;
    categoryPositionsByCard.set(row.cardId, positions);
  }

  const playlistsByCard = new Map<string, string[]>();
  const playlistPositionsByCard = new Map<string, Partial<Record<string, number>>>();
  for (const row of playlistLinkRows) {
    const list = playlistsByCard.get(row.cardId) ?? [];
    list.push(row.playlistId);
    playlistsByCard.set(row.cardId, list);

    const positions = playlistPositionsByCard.get(row.cardId) ?? {};
    positions[row.playlistId] = row.position;
    playlistPositionsByCard.set(row.cardId, positions);
  }

  const allCards: CardItem[] = cardRows.map((row) => ({
    id: row.id,
    categories: orderCategoriesWithPrimary(
      row.id,
      categoriesByCard.get(row.id) ?? [],
    ),
    playlistIds: playlistsByCard.get(row.id) ?? [],
    categoryPositions: categoryPositionsByCard.get(row.id) ?? {},
    playlistPositions: playlistPositionsByCard.get(row.id) ?? {},
    title: row.title,
    description: row.description ?? undefined,
    image: row.image ?? undefined,
    date: row.date ?? undefined,
    recommended: row.recommended,
    archived: row.archived,
    url: row.url,
  }));

  return {
    cards: filterPublicCards(allCards),
    playlists: playlistRows.map((row) => ({
      id: row.id,
      slug: row.slug,
      category: row.categorySlug,
      parentPlaylistId: row.parentPlaylistId ?? undefined,
      title: row.title,
      image: row.image,
      description: row.description ?? undefined,
      position: row.position,
    })),
  };
};

export const getContent = unstable_cache(fetchContent, ['content-store-v3'], {
  revalidate: 300,
});
