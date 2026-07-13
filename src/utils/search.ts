import Fuse from 'fuse.js';
import type { CardItem, Playlist, CategorySlug } from '@src/data/content';
import { showsOnCategoryRoot } from '@src/utils/placement';

export type SearchItem =
  | {
      type: 'card';
      id: string;
      title: string;
      category: CategorySlug;
      playlistId?: string;
      description?: string;
    }
  | {
      type: 'playlist';
      id: string;
      slug: string;
      title: string;
      category: CategorySlug;
      description?: string;
    };

export const buildSearchIndex = (
  cards: CardItem[],
  playlists: Playlist[],
): SearchItem[] => {
  const playlistById = new Map(playlists.map((playlist) => [playlist.id, playlist]));

  const cardItems: SearchItem[] = [];
  for (const card of cards) {
    if (card.categories.length === 0) {
      const playlist = card.playlistIds
        .map((id) => playlistById.get(id))
        .find(Boolean);
      if (playlist) {
        cardItems.push({
          type: 'card',
          id: card.id,
          title: card.title,
          category: playlist.category,
          playlistId: playlist.id,
          description: card.description,
        });
      }
      continue;
    }

    const primaryCategory = card.categories[0];
    const playlistInCategory = card.playlistIds
      .map((id) => playlistById.get(id))
      .find((playlist) => playlist?.category === primaryCategory);

    cardItems.push({
      type: 'card',
      id: card.id,
      title: card.title,
      category: primaryCategory,
      playlistId: playlistInCategory?.id,
      description: card.description,
    });

    // Also index under secondary categories when the card appears on those roots.
    for (const category of card.categories.slice(1)) {
      if (!showsOnCategoryRoot(card, category, playlists)) continue;
      cardItems.push({
        type: 'card',
        id: card.id,
        title: card.title,
        category,
        description: card.description,
      });
    }
  }

  return [
    ...playlists.map((playlist) => ({
      type: 'playlist' as const,
      id: playlist.id,
      slug: playlist.slug,
      title: playlist.title,
      category: playlist.category,
      description: playlist.description,
    })),
    ...cardItems,
  ];
};

export const createSearch = (cards: CardItem[], playlists: Playlist[]) =>
  new Fuse(buildSearchIndex(cards, playlists), {
    keys: ['title', 'description', 'category'],
    threshold: 0.35,
    ignoreLocation: true,
    minMatchCharLength: 2,
  });
