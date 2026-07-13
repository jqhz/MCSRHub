import type { CategorySlug, Playlist } from '@src/data/content';

export const getCategoryRoute = (category: CategorySlug) => `/${category}`;

export const getPlaylistRoute = (playlist: Playlist) =>
  `/${playlist.category}/${playlist.id}`;

export const getPlaylistRouteById = (category: CategorySlug, playlistId: string) =>
  `/${category}/${playlistId}`;

export const getHighlightIdForPlaylist = (playlistId: string) =>
  `playlist-${playlistId}`;
