import type { CategorySlug, Playlist } from '@src/data/content';

export const getPlaylistAncestors = (
  playlist: Playlist,
  playlists: Playlist[],
) => {
  const byId = new Map(playlists.map((item) => [item.id, item]));
  const ancestors: Playlist[] = [];
  let current = playlist.parentPlaylistId
    ? byId.get(playlist.parentPlaylistId)
    : undefined;
  while (current && !ancestors.includes(current)) {
    ancestors.unshift(current);
    current = current.parentPlaylistId
      ? byId.get(current.parentPlaylistId)
      : undefined;
  }
  return ancestors;
};

export const getPlaylistPathSegments = (
  playlist: Playlist,
  playlists: Playlist[],
) => [...getPlaylistAncestors(playlist, playlists).map((item) => item.slug), playlist.slug];

export const findPlaylistByPath = (
  playlists: Playlist[],
  category: CategorySlug | string,
  pathSegments: string[],
) => {
  if (pathSegments.length === 0) return undefined;

  let parentId: string | undefined;
  let current: Playlist | undefined;

  for (const segment of pathSegments) {
    current = playlists.find(
      (playlist) =>
        playlist.category === category &&
        playlist.parentPlaylistId === parentId &&
        (playlist.slug === segment || playlist.id === segment),
    );
    if (!current) return undefined;
    parentId = current.id;
  }

  return current;
};

export const findPlaylistBySlugOrId = (
  playlists: Playlist[],
  category: CategorySlug | string,
  param: string,
) => {
  const matches = playlists.filter(
    (playlist) =>
      playlist.category === category &&
      (playlist.slug === param || playlist.id === param),
  );
  if (matches.length === 1) return matches[0];
  if (matches.length > 1) {
    return matches.find((playlist) => !playlist.parentPlaylistId) ?? matches[0];
  }
  return undefined;
};

/** @deprecated Use findPlaylistByPath or findPlaylistBySlugOrId */
export const findPlaylistInCategory = findPlaylistBySlugOrId;

export const playlistUsesCanonicalPath = (
  playlist: Playlist,
  pathSegments: string[],
  playlists: Playlist[],
) => {
  const canonicalPath = getPlaylistPathSegments(playlist, playlists);
  return (
    canonicalPath.length === pathSegments.length &&
    canonicalPath.every((segment, index) => segment === pathSegments[index])
  );
};

/** @deprecated Use playlistUsesCanonicalPath */
export const playlistUsesCanonicalSlug = (
  playlist: Playlist,
  param: string,
  playlists: Playlist[],
) => playlistUsesCanonicalPath(playlist, [param], playlists);
