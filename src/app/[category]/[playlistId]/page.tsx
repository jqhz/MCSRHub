import { permanentRedirect } from 'next/navigation';
import { getContent } from '@src/db/queries';
import { CATEGORIES } from '@src/data/content';
import { appendQuerySuffix } from '@src/utils/navigation';
import {
  findPlaylistInCategory,
  playlistUsesCanonicalSlug,
} from '@src/utils/playlists';
import PlaylistView from './PlaylistView';

export default async function PlaylistPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string; playlistId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { category, playlistId: param } = await params;
  const resolvedSearchParams = await searchParams;
  const categoryMeta = CATEGORIES.find((item) => item.slug === category);

  if (!categoryMeta) {
    return (
      <PlaylistView
        category={category as import('@src/data/content').CategorySlug}
        playlistSlug={param}
      />
    );
  }

  const { playlists } = await getContent();
  const playlist = findPlaylistInCategory(playlists, categoryMeta.slug, param);

  if (playlist && !playlistUsesCanonicalSlug(playlist, param)) {
    permanentRedirect(
      `/${categoryMeta.slug}/${playlist.slug}${appendQuerySuffix(resolvedSearchParams)}`,
    );
  }

  return (
    <PlaylistView category={categoryMeta.slug} playlistSlug={playlist?.slug ?? param} />
  );
}
