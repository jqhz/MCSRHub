'use client';

import { useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useSearchParams } from 'next/navigation';
import type { CardItem, Playlist } from '@src/data/content';
import PlaylistCard from '@src/components/PlaylistCard';
import RegularCard from '@src/components/RegularCard';

interface CardGridProps {
  playlists?: Playlist[];
  cards: CardItem[];
  title?: string;
  emptyMessage?: string;
}

export default function CardGrid({
  playlists = [],
  cards,
  title,
  emptyMessage = 'No items to show yet.',
}: CardGridProps) {
  const searchParams = useSearchParams();
  const highlightId = useMemo(
    () => searchParams?.get('highlight') ?? '',
    [searchParams],
  );

  useEffect(() => {
    if (!highlightId) return;
    const target = document.getElementById(highlightId);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target.classList.add('mcsr-highlight');
    const timeout = window.setTimeout(() => {
      target.classList.remove('mcsr-highlight');
    }, 2000);
    return () => window.clearTimeout(timeout);
  }, [highlightId]);

  const hasItems = playlists.length > 0 || cards.length > 0;

  return (
    <Box>
      {title && (
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
          {title}
        </Typography>
      )}
      {!hasItems && (
        <Typography variant="body1" color="text.secondary">
          {emptyMessage}
        </Typography>
      )}
      {hasItems && (
        <Box className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {playlists.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
          {cards.map((card) => (
            <RegularCard key={card.id} card={card} />
          ))}
        </Box>
      )}
    </Box>
  );
}
