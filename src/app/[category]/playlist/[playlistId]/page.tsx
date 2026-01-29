'use client';

import type React from 'react';

import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import CardGrid from '@src/components/CardGrid';
import { CATEGORIES } from '../../../../data/content';
import type { CategorySlug } from '../../../../data/content';
import { getCategoryRoute, getHighlightIdForPlaylist } from '@src/utils/navigation';
import { PAGE_SIZE } from '@src/utils/pagination';
import { useContent } from '@src/components/ContentProvider';

export default function PlaylistPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cards, playlists, loading } = useContent();
  const categoryParam = params?.category;
  const playlistParam = params?.playlistId;
  const category = Array.isArray(categoryParam) ? categoryParam[0] : categoryParam;
  const playlistId = Array.isArray(playlistParam)
    ? playlistParam[0]
    : playlistParam;
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
    (item) =>
      item.category === (categoryMeta?.slug as CategorySlug) &&
      item.id === playlistId,
  );

  if (!playlist) {
    return (
      <Typography variant="h5" color="text.secondary">
        Playlist not found.
      </Typography>
    );
  }

  const scopedCards = cards
    .filter(
      (card) =>
        card.category === (categoryMeta.slug as CategorySlug) &&
        card.playlistId === playlist.id,
    )
    .sort((a, b) => Number(Boolean(b.recommended)) - Number(Boolean(a.recommended)));
  const totalPages = Math.max(1, Math.ceil(scopedCards.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pagedCards = scopedCards.slice(startIndex, startIndex + PAGE_SIZE);
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    router.push(
      `/${categoryMeta.slug}/playlist/${playlist.id}?page=${value}`,
    );
  };

  return (
    <Box>
      <Box id={getHighlightIdForPlaylist(playlist.id)}>
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link component={NextLink} href={getCategoryRoute(categoryMeta.slug)}>
            {categoryMeta.label}
          </Link>
          <Typography color="text.primary">{playlist.title}</Typography>
        </Breadcrumbs>
      </Box>
      <CardGrid cards={pagedCards} title={playlist.title} />
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
