/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import { appendQuerySuffix, getPlaylistRoute } from '@src/utils/navigation';
import {
  getPlaylistPathSegments,
  playlistUsesCanonicalPath,
} from '@src/utils/playlists';
import { getPlaylistRouteContext } from '@src/lib/route-content';
import PlaylistView from '@src/components/PlaylistView';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; playlistPath: string[] }>;
}): Promise<Metadata> {
  const { category, playlistPath } = await params;
  const { categoryMeta, playlist, playlists } = await getPlaylistRouteContext(
    category,
    playlistPath,
  );

  if (!categoryMeta) {
    return { title: 'Category not found' };
  }

  if (!playlist) {
    return { title: 'Playlist not found' };
  }

  const description =
    playlist.description ??
    `Explore ${playlist.title} — curated links and resources in ${categoryMeta.label}.`;
  const title = playlist.title;
  const url = getPlaylistRoute(playlist, playlists);
  const ogImagePath = `/og/${category}/${playlistPath.join('/')}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: [
        {
          url: ogImagePath,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImagePath],
    },
  };
}

export default async function PlaylistPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string; playlistPath: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { category, playlistPath } = await params;
  const resolvedSearchParams = await searchParams;
  const { categoryMeta, playlist, playlists } = await getPlaylistRouteContext(
    category,
    playlistPath,
  );

  if (!categoryMeta) {
    return (
      <PlaylistView
        category={category as import('@src/data/content').CategorySlug}
        playlistPath={playlistPath}
      />
    );
  }

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
