import type { CardItem, Playlist, CategorySlug } from '@src/data/content';
import type { SearchItem } from '@src/utils/search';
import { showsOnCategoryRoot } from '@src/utils/placement';
import { isPublicCard } from '@src/utils/publicContent';
import {
  sortCardsByCategoryPosition,
  sortCardsByPlaylistPosition,
  sortPlaylistsByPosition,
} from '@src/utils/sorting';

export const PAGE_SIZE = 12;

export const getCategoryPlaylists = (
  category: CategorySlug,
  playlists: Playlist[],
) =>
  sortPlaylistsByPosition(
    playlists.filter(
      (playlist) => playlist.category === category && !playlist.parentPlaylistId,
    ),
  );

export const getCategoryCards = (
  category: CategorySlug,
  cards: CardItem[],
  playlists: Playlist[],
) =>
  sortCardsByCategoryPosition(
    cards.filter(
      (card) =>
        isPublicCard(card) && showsOnCategoryRoot(card, category, playlists),
    ),
    category,
  );

export const getChildPlaylists = (playlistId: string, playlists: Playlist[]) =>
  sortPlaylistsByPosition(
    playlists.filter((playlist) => playlist.parentPlaylistId === playlistId),
  );

export const getPlaylistCards = (playlistId: string, cards: CardItem[]) =>
  sortCardsByPlaylistPosition(
    cards.filter(
      (card) => isPublicCard(card) && card.playlistIds.includes(playlistId),
    ),
    playlistId,
  );

const getCategoryCombinedIds = (
  category: CategorySlug,
  cards: CardItem[],
  playlists: Playlist[],
) => [
  ...getCategoryPlaylists(category, playlists).map(
    (playlist) => `playlist-${playlist.id}`,
  ),
  ...getCategoryCards(category, cards, playlists).map((card) => card.id),
];

export const getCategoryPageForItem = (
  item: SearchItem,
  cards: CardItem[],
  playlists: Playlist[],
) => {
  if (item.type === 'card' && item.playlistId) {
    return 1;
  }
  const combinedIds = getCategoryCombinedIds(item.category, cards, playlists);
  const targetId =
    item.type === 'playlist' ? `playlist-${item.id}` : item.id;
  const index = combinedIds.findIndex((id) => id === targetId);
  if (index < 0) return 1;
  return Math.floor(index / PAGE_SIZE) + 1;
};

export const getPlaylistPageForCard = (
  playlistId: string,
  cardId: string,
  cards: CardItem[],
  playlists: Playlist[],
) => {
  const combinedIds = [
    ...getChildPlaylists(playlistId, playlists).map(
      (playlist) => `playlist-${playlist.id}`,
    ),
    ...getPlaylistCards(playlistId, cards).map((card) => card.id),
  ];
  const index = combinedIds.findIndex((id) => id === cardId);
  if (index < 0) return 1;
  return Math.floor(index / PAGE_SIZE) + 1;
};
