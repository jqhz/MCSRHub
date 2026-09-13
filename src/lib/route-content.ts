import { getContent } from '@src/db/queries';
import { CATEGORIES, type CategorySlug } from '@src/data/content';
import {
  findPlaylistByPath,
  findPlaylistBySlugOrId,
} from '@src/utils/playlists';

export async function getCategoryRouteContext(category: string) {
  const categoryMeta = CATEGORIES.find((item) => item.slug === category);
  if (!categoryMeta) {
    return { categoryMeta: null, playlists: [] as Awaited<ReturnType<typeof getContent>>['playlists'] };
  }

  const { playlists } = await getContent();
  return { categoryMeta, playlists };
}

export async function getPlaylistRouteContext(category: string, playlistPath: string[]) {
  const { categoryMeta, playlists } = await getCategoryRouteContext(category);
  if (!categoryMeta) {
    return { categoryMeta: null, playlist: undefined, playlists };
  }

  const playlist =
    findPlaylistByPath(playlists, categoryMeta.slug, playlistPath) ??
    (playlistPath.length === 1
      ? findPlaylistBySlugOrId(playlists, categoryMeta.slug, playlistPath[0])
      : undefined);

  return { categoryMeta, playlist, playlists };
}

export const isCategorySlug = (value: string): value is CategorySlug =>
  CATEGORIES.some((item) => item.slug === value);
