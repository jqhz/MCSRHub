'use client';

import type React from 'react';

import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import CardGrid from '@src/components/CardGrid';
import { CATEGORIES, type CategorySlug, type Playlist } from '@src/data/content';
import {
  getCategoryRoute,
  getHighlightIdForPlaylist,
  getPlaylistRoute,
} from '@src/utils/navigation';
import {
  PAGE_SIZE,
  getChildPlaylists,
  getPlaylistCards,
} from '@src/utils/pagination';
import { useContent } from '@src/components/ContentProvider';

const getAncestors = (playlist: Playlist, playlists: Playlist[]) => {
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

export default function PlaylistView({
  category,
  playlistSlug,
}: {
  category: CategorySlug;
  playlistSlug: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cards, playlists, loading } = useContent();
  const pageParam = Number(searchParams?.get('page') ?? '1');
  const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const categoryMeta = CATEGORIES.find((item) => item.slug === category);

  if (!categoryMeta) {
    return (
      <Typography variant="h5" color="text.secondary">
        Playlist not found.
      </Typography>
    );
  }

  if (loading) {
    return (
      <Typography variant="body1" color="text.secondary">
        Loading content...
      </Typography>
    );
  }

  const playlist = playlists.find(
    (item) => item.category === categoryMeta.slug && item.slug === playlistSlug,
  );

  if (!playlist) {
    return (
      <Typography variant="h5" color="text.secondary">
        Playlist not found.
      </Typography>
    );
  }

  const ancestors = getAncestors(playlist, playlists);
  const childPlaylists = getChildPlaylists(playlist.id, playlists);
  const scopedCards = getPlaylistCards(playlist.id, cards);
  const combinedItems = [
    ...childPlaylists.map((item) => ({ type: 'playlist' as const, playlist: item })),
    ...scopedCards.map((card) => ({ type: 'card' as const, card })),
  ];
  const totalPages = Math.max(1, Math.ceil(combinedItems.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageSlice = combinedItems.slice(startIndex, startIndex + PAGE_SIZE);
  const pagedPlaylists = pageSlice
    .filter((item) => item.type === 'playlist')
    .map((item) => item.playlist);
  const pagedCards = pageSlice
    .filter((item) => item.type === 'card')
    .map((item) => item.card);
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    router.push(`${getPlaylistRoute(playlist)}?page=${value}`);
  };

  return (
    <Box>
      <Box id={getHighlightIdForPlaylist(playlist.id)}>
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link prefetch={false} component={NextLink} href={getCategoryRoute(categoryMeta.slug)}>
            {categoryMeta.label}
          </Link>
          {ancestors.map((ancestor) => (
            <Link
              key={ancestor.id}
              prefetch={false}
              component={NextLink}
              href={getPlaylistRoute(ancestor)}
            >
              {ancestor.title}
            </Link>
          ))}
          <Typography color="text.primary">{playlist.title}</Typography>
        </Breadcrumbs>
      </Box>
      <CardGrid playlists={pagedPlaylists} cards={pagedCards} title={playlist.title} />
      {totalPages > 1 && (
        <Stack alignItems="center" sx={{ mt: 4 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </Stack>
      )}
    </Box>
  );
}
