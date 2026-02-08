'use client';

import { useEffect, useMemo, useState } from 'react';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import type { CardItem } from '../data/content';
// import NextImage from 'next/image';
// import NetherStar from 'public/images/Recommended_Star.gif'
interface RegularCardProps {
  card: CardItem;
}

export default function RegularCard({ card }: RegularCardProps) {
  const getYouTubeId = (url: string) => {
    try {
      if (url.includes('youtu.be/')) {
        return url.split('youtu.be/')[1]?.split(/[?&]/)[0] ?? '';
      }
      if (url.includes('youtube.com')) {
        const params = new URL(url).searchParams;
        return params.get('v') ?? '';
      }
    } catch {
      return '';
    }
    return '';
  };

  const isDiscordInvite = (url: string) => {
    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname.replace('www.', '');
      return (
        hostname === 'discord.gg' ||
        (hostname === 'discord.com' && parsed.pathname.startsWith('/invite/'))
      );
    } catch {
      return false;
    }
  };

  const getFallbackImage = (url: string) => {
    const youtubeId = getYouTubeId(url);
    if (youtubeId) {
      return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
    }
    return `/api/og-image?url=${encodeURIComponent(url)}`;

  };

  const imageSrc = card.image ?? (card.url ? getFallbackImage(card.url) : undefined);
  const [displaySrc, setDisplaySrc] = useState<string | undefined>(imageSrc);

  useEffect(() => {
    setDisplaySrc(imageSrc);
  }, [imageSrc]);

  return (
    <Card
      id={card.id}
      className="h-full"
      sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}
    >
      {card.recommended && (
        <Tooltip title="Recommended" placement="top">
          <IconButton
            aria-label="Recommended"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 2,
              backgroundColor: 'rgba(15, 23, 42, 0.7)',
              '&:hover': { backgroundColor: 'rgba(15, 23, 42, 0.9)' },
            }}
          >
            {/* <StarIcon sx={{ color: '#facc15' }} /> */}
            <img
              src="https://0h847npmzk.ufs.sh/f/BE9LtSdhVFPyXPoG60RAm0QDWCe2BHLVxnuT1bGgd4sUEpoq"
              alt="Recommended"
              width={32}
              height={32}
              // className="animate-spin [animation-duration:10s]"
            />
          </IconButton>
        </Tooltip>
      )}
      <CardActionArea
        component="a"
        href={card.url}
        target="_blank"
        rel="noreferrer"
        className="h-full"
        sx={{ height: '100%', alignItems: 'stretch' }}
      >
        {displaySrc && (
          <CardMedia
            component="img"
            height="160"
            image={displaySrc}
            alt={card.title}
            sx={{ height: 160, width: '100%', objectFit: 'cover' }}
            loading="lazy"
            decoding="async"
            onError={() => setDisplaySrc('/images/defaultcard.jpg')}
          />
        )}
        <CardContent
          sx={{ display: 'flex', flexDirection: 'column', gap: 1, flexGrow: 1 }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {card.title}
          </Typography>
          {card.description && (
            <Typography variant="body2" color="text.secondary">
              {card.description}
            </Typography>
          )}
          {card.date && (
            <Stack direction="row" spacing={1}>
              <Typography variant="caption" color="text.secondary">
                {new Date(card.date).toLocaleDateString('en-US', {
                  timeZone: 'UTC',
                })}
              </Typography>
            </Stack>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
