import { permanentRedirect } from 'next/navigation';
import { getContent } from '@src/db/queries';
import { CATEGORIES } from '@src/data/content';
import { appendQuerySuffix } from '@src/utils/navigation';
import {
  findPlaylistByPath,
  findPlaylistBySlugOrId,
  getPlaylistPathSegments,
  playlistUsesCanonicalPath,
} from '@src/utils/playlists';
import PlaylistView from '@src/components/PlaylistView';

export default async function PlaylistPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string; playlistPath: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { category, playlistPath } = await params;
  const resolvedSearchParams = await searchParams;
  const categoryMeta = CATEGORIES.find((item) => item.slug === category);

  if (!categoryMeta) {
    return (
      <PlaylistView
        category={category as import('@src/data/content').CategorySlug}
        playlistPath={playlistPath}
      />
    );
  }

  const { playlists } = await getContent();
  const playlist =
    findPlaylistByPath(playlists, categoryMeta.slug, playlistPath) ??
    (playlistPath.length === 1
      ? findPlaylistBySlugOrId(playlists, categoryMeta.slug, playlistPath[0])
      : undefined);

  if (playlist && !playlistUsesCanonicalPath(playlist, playlistPath, playlists)) {
    const canonicalPath = getPlaylistPathSegments(playlist, playlists);
    permanentRedirect(
      `/${categoryMeta.slug}/${canonicalPath.join('/')}${appendQuerySuffix(resolvedSearchParams)}`,
    );
  }

  return (
    <PlaylistView
      category={categoryMeta.slug}
      playlistPath={playlist ? getPlaylistPathSegments(playlist, playlists) : playlistPath}
    />
  );
}
