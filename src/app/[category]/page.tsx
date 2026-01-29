'use client';

import type React from 'react';

import Box from '@mui/material/Box';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import CardGrid from '@src/components/CardGrid';
import FanartGrid from '@src/components/FanartGrid';
import { CATEGORIES, type CategorySlug } from '@src/data/content';
import { useContent } from '@src/components/ContentProvider';
import { PAGE_SIZE } from '@src/utils/pagination';

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cards, playlists, loading } = useContent();
  const slug = params?.category;
  const category = Array.isArray(slug) ? slug[0] : slug;
  const pageParam = Number(searchParams?.get('page') ?? '1');
  const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const categoryMeta = CATEGORIES.find((item) => item.slug === category);

  if (!categoryMeta) {
    return (
      <Typography variant="h5" color="text.secondary">
        Category not found.
      </Typography>
    );
  }

  if (categoryMeta.slug === 'fanart') {
    const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
      router.push(`/${categoryMeta.slug}?page=${value}`);
    };
    return (
      <Box>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
          Fanart
        </Typography>
        <FanartGrid page={page} pageSize={PAGE_SIZE} onPageChange={handlePageChange} />
      </Box>
    );
  }

  if (loading) {
    return (
      <Typography variant="body1" color="text.secondary">
        Loading content...
      </Typography>
    );
  }

  const scopedPlaylists = playlists.filter(
    (playlist) => playlist.category === (categoryMeta.slug as CategorySlug),
  );
  const scopedCards = cards
    .filter(
      (card) =>
        card.category === (categoryMeta.slug as CategorySlug) &&
        !card.playlistId,
    )
    .sort((a, b) => Number(Boolean(b.recommended)) - Number(Boolean(a.recommended)));
  const combinedItems = [
    ...scopedPlaylists.map((playlist) => ({ type: 'playlist' as const, playlist })),
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
    router.push(`/${categoryMeta.slug}?page=${value}`);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        {categoryMeta.label}
      </Typography>
      <CardGrid playlists={pagedPlaylists} cards={pagedCards} />
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
