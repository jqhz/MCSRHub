import type { CategorySlug, Playlist } from '@src/data/content';

export const getCategoryRoute = (category: CategorySlug) => `/${category}`;

export const getPlaylistRoute = (playlist: Playlist) =>
  `/${playlist.category}/${playlist.slug}`;

export const getPlaylistRouteBySlug = (category: CategorySlug, slug: string) =>
  `/${category}/${slug}`;

export const getPlaylistRouteByPlaylistId = (
  category: CategorySlug,
  playlistId: string,
  playlists: Playlist[],
) => {
  const playlist = playlists.find(
    (item) => item.id === playlistId && item.category === category,
  );
  return playlist
    ? getPlaylistRoute(playlist)
    : getPlaylistRouteBySlug(category, playlistId);
};

export const getHighlightIdForPlaylist = (playlistId: string) =>
  `playlist-${playlistId}`;

export const appendQuerySuffix = (
  searchParams: Record<string, string | string[] | undefined>,
) => {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === 'string') query.set(key, value);
  }
  return query.size > 0 ? `?${query.toString()}` : '';
};
