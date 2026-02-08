'use client';

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

export default function PlaylistCard({ playlist }: PlaylistCardProps) {
  return (
    <Card
      id={getHighlightIdForPlaylist(playlist.id)}
      className="h-full"
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <CardActionArea
        component={Link}
        prefetch={false}
        href={getPlaylistRoute(playlist)}
        className="h-full"
        sx={{ height: '100%', alignItems: 'stretch' }}
      >
        <CardMedia
          component="img"
          height="160"
          image={playlist.image}
          alt={playlist.title}
          sx={{ height: 160, width: '100%', objectFit: 'cover' }}
          loading="lazy"
          decoding="async"
        />
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
