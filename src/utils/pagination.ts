import type { CardItem, Playlist, CategorySlug } from '@src/data/content';
import type { SearchItem } from '@src/utils/search';

export const PAGE_SIZE = 12;

const getCategoryCombinedIds = (
  category: CategorySlug,
  cards: CardItem[],
  playlists: Playlist[],
) => {
  const scopedPlaylists = playlists.filter(
    (playlist) => playlist.category === category,
  );
  const scopedCards = cards
    .filter((card) => card.category === category && !card.playlistId)
    .sort(
      (a, b) => Number(Boolean(b.recommended)) - Number(Boolean(a.recommended)),
    );
  return [
    ...scopedPlaylists.map((playlist) => `playlist-${playlist.id}`),
    ...scopedCards.map((card) => card.id),
  ];
};

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
  category: CategorySlug,
  playlistId: string,
  cardId: string,
  cards: CardItem[],
) => {
  const scopedCards = cards.filter(
    (card) =>
      card.category === category && card.playlistId === playlistId,
  ).sort(
    (a, b) => Number(Boolean(b.recommended)) - Number(Boolean(a.recommended)),
  );
  const index = scopedCards.findIndex((card) => card.id === cardId);
  if (index < 0) return 1;
  return Math.floor(index / PAGE_SIZE) + 1;
};
