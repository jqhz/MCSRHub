'use client';

import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CircularProgress from '@mui/material/CircularProgress';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface FanartItem {
  imageUrl: string;
  tweetUrl: string;
  author: string;
}

interface FanartGridProps {
  page: number;
  pageSize: number;
  onPageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
}

export default function FanartGrid({
  page,
  pageSize,
  onPageChange,
}: FanartGridProps) {
  const [items, setItems] = useState<FanartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return items.slice(startIndex, startIndex + pageSize);
  }, [items, currentPage, pageSize]);

  useEffect(() => {
    const loadFanart = async () => {
      try {
        const response = await fetch('/api/fanart');
        const data = await response.json();
        setItems(data.items ?? []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadFanart();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (items.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary">
        Fanart will appear here once available.
      </Typography>
    );
  }

  return (
    <Box>
      <Box className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {pagedItems.map((item) => (
          <Card
            key={item.tweetUrl}
            className="h-full"
            sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <CardActionArea
              component="a"
              href={item.tweetUrl}
              target="_blank"
              rel="noreferrer"
              className="h-full"
              sx={{ height: '100%', alignItems: 'stretch' }}
            >
              <CardMedia
                component="img"
                image={item.imageUrl}
                alt={`Fanart by ${item.author}`}
                sx={{ height: 220, objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {item.author}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
      {totalPages > 1 && (
        <Stack alignItems="center" sx={{ mt: 4 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={onPageChange}
            color="primary"
          />
        </Stack>
      )}
    </Box>
  );
}
