import type { CardItem, Playlist, CategorySlug } from '@src/data/content';
import type { SearchItem } from '@src/utils/search';

export const PAGE_SIZE = 12;

export const sortByRecommended = (cards: CardItem[]) =>
  [...cards].sort(
    (a, b) => Number(Boolean(b.recommended)) - Number(Boolean(a.recommended)),
  );

export const getCategoryPlaylists = (
  category: CategorySlug,
  playlists: Playlist[],
) =>
  playlists.filter(
    (playlist) => playlist.category === category && !playlist.parentPlaylistId,
  );

export const getCategoryCards = (category: CategorySlug, cards: CardItem[]) =>
  sortByRecommended(cards.filter((card) => card.categories.includes(category)));

export const getChildPlaylists = (playlistId: string, playlists: Playlist[]) =>
  playlists.filter((playlist) => playlist.parentPlaylistId === playlistId);

export const getPlaylistCards = (playlistId: string, cards: CardItem[]) =>
  sortByRecommended(cards.filter((card) => card.playlistIds.includes(playlistId)));

const getCategoryCombinedIds = (
  category: CategorySlug,
  cards: CardItem[],
  playlists: Playlist[],
) => [
  ...getCategoryPlaylists(category, playlists).map(
    (playlist) => `playlist-${playlist.id}`,
  ),
  ...getCategoryCards(category, cards).map((card) => card.id),
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
