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
): SearchItem[] => [
  ...playlists.map((playlist) => ({
    type: 'playlist' as const,
    id: playlist.id,
    title: playlist.title,
    category: playlist.category,
    description: playlist.description,
  })),
  ...cards.map((card) => ({
    type: 'card' as const,
    id: card.id,
    title: card.title,
    category: card.category,
    playlistId: card.playlistId,
    description: card.description,
  })),
];

export const createSearch = (cards: CardItem[], playlists: Playlist[]) =>
  new Fuse(buildSearchIndex(cards, playlists), {
    keys: ['title', 'description', 'category'],
    threshold: 0.35,
    ignoreLocation: true,
    minMatchCharLength: 2,
  });
