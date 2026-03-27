'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import type { Playlist } from '@src/data/content';
import {
  getHighlightIdForPlaylist,
  getPlaylistRoute,
} from '@src/utils/navigation';

interface PlaylistCardProps {
  playlist: Playlist;
}

const resolveImageSrc = (src: string) => {
  const value = src.trim();
  if (!value) return '';
  if (/^(https?:)?\/\//.test(value) || value.startsWith('/') || value.startsWith('data:')) {
    return value;
  }
  return `/${value}`;
};

export default function PlaylistCard({ playlist }: PlaylistCardProps) {
  return (
    <Card
      id={getHighlightIdForPlaylist(playlist.id)}
      className="h-full"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 'min(100%, 28rem)',
        width: '100%',
        mx: 'auto',
      }}
    >
      <CardActionArea
        component={Link}
        prefetch={false}
        href={getPlaylistRoute(playlist)}
        className="h-full"
        sx={{ height: '100%', alignItems: 'stretch' }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16 / 9',
            overflow: 'hidden',
            flexShrink: 0,
            bgcolor: 'action.hover',
          }}
        >
          <CardMedia
            component="img"
            image={resolveImageSrc(playlist.image)}
            alt={playlist.title}
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            loading="lazy"
            decoding="async"
          />
        </Box>
        <CardContent
          sx={{ display: 'flex', flexDirection: 'column', gap: 1, flexGrow: 1 }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {playlist.title}
            </Typography>
            <Chip size="small" label="Playlist" color="primary" />
          </Stack>
          {playlist.description && (
            <Typography variant="body2" color="text.secondary">
              {playlist.description}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
