import type { CategorySlug, Playlist } from '@src/data/content';

export const findPlaylistInCategory = (
  playlists: Playlist[],
  category: CategorySlug | string,
  param: string,
) =>
  playlists.find(
    (playlist) =>
      playlist.category === category &&
      (playlist.slug === param || playlist.id === param),
  );

export const playlistUsesCanonicalSlug = (playlist: Playlist, param: string) =>
  param === playlist.slug;
