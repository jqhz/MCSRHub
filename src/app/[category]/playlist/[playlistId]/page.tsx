import { permanentRedirect } from 'next/navigation';
import { getContent } from '@src/db/queries';
import { appendQuerySuffix, getPlaylistRoute } from '@src/utils/navigation';

// Legacy URL: /[category]/playlist/[id] -> /[category]/[...nested-slugs]
export default async function LegacyPlaylistRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ category: string; playlistId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { category, playlistId } = await params;
  const resolvedSearchParams = await searchParams;
  const suffix = appendQuerySuffix(resolvedSearchParams);

  const { playlists } = await getContent();
  const playlist = playlists.find(
    (item) => item.category === category && item.id === playlistId,
  );

  permanentRedirect(
    playlist
      ? `${getPlaylistRoute(playlist, playlists)}${suffix}`
      : `/${category}/${playlistId}${suffix}`,
  );
}
