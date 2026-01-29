import type { CardItem, CategorySlug, Playlist } from '@src/data/content';

export const getCategoryRoute = (category: CategorySlug) => `/${category}`;

export const getPlaylistRoute = (playlist: Playlist) =>
  `/${playlist.category}/playlist/${playlist.id}`;

export const getPlaylistRouteById = (category: CategorySlug, playlistId: string) =>
  `/${category}/playlist/${playlistId}`;

export const getCardRoute = (card: Pick<CardItem, 'category' | 'playlistId'>) =>
  card.playlistId
    ? getPlaylistRouteById(card.category, card.playlistId)
    : getCategoryRoute(card.category);

export const getHighlightIdForPlaylist = (playlistId: string) =>
  `playlist-${playlistId}`;
