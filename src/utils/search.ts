import Fuse from 'fuse.js';
import type { CardItem, Playlist, CategorySlug } from '@src/data/content';

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
    // Prefer a direct category placement; otherwise locate the card via its
    // first playlist. Cards with no placement at all are unreachable, skip.
    if (card.categories.length > 0) {
      cardItems.push({
        type: 'card',
        id: card.id,
        title: card.title,
        category: card.categories[0],
        description: card.description,
      });
      continue;
    }
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
  }

  return [
    ...playlists.map((playlist) => ({
      type: 'playlist' as const,
      id: playlist.id,
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
