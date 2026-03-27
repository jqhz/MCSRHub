'use client';

import { useEffect, useRef, useState } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import type { CardItem } from '../data/content';

interface RegularCardProps {
  card: CardItem;
  /** When true, the card grows to fill the parent (e.g. homepage Paper); default keeps a capped width in grids. */
  fillContainer?: boolean;
}

export default function RegularCard({ card, fillContainer = false }: RegularCardProps) {
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

  const getFallbackImage = (url: string) => {
    const youtubeId = getYouTubeId(url);
    if (youtubeId) {
      return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
    }
    return `/api/og-image?url=${encodeURIComponent(url)}`;
  };

  const imageSrc = card.image ?? (card.url ? getFallbackImage(card.url) : undefined);

  const [displaySrc, setDisplaySrc] = useState<string | undefined>(imageSrc);
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  const resetTimerRef = useRef<number | null>(null);
  const isTouchDevice = useMediaQuery('(hover: none), (pointer: coarse)');

  const clearResetTimer = () => {
    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  };

  const scheduleReset = () => {
    clearResetTimer();
    resetTimerRef.current = window.setTimeout(() => {
      setCopied(false);
      resetTimerRef.current = null;
    }, 1000);
  };

  useEffect(() => {
    setDisplaySrc(imageSrc);
    setCopied(false);
    clearResetTimer();
  }, [imageSrc]);

  useEffect(() => {
    return () => clearResetTimer();
  }, []);

  const doCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(card.url);
      setCopied(true);

      // On touch devices there is no hover-off state, so reset after 1 second.
      if (isTouchDevice) {
        scheduleReset();
      }
    } catch (err) {
      console.error('Failed to Copy: ', err);
    }
  };

  const handleMouseEnter = () => {
    clearResetTimer();
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);

    if (copied) {
      scheduleReset();
    }
  };

  const showCopyButton = isTouchDevice || isHovered;
  const copyIcon = copied ? <CheckIcon /> : <ContentCopyIcon />;

  return (
    <Card
      id={card.id}
      className="h-full"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        width: '100%',
        ...(fillContainer
          ? {
              maxWidth: '100%',
              mx: 0,
              flex: 1,
              minHeight: 0,
            }
          : {
              maxWidth: 'min(100%, 28rem)',
              mx: 'auto',
            }),
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
            <img
              src="https://0h847npmzk.ufs.sh/f/BE9LtSdhVFPyXPoG60RAm0QDWCe2BHLVxnuT1bGgd4sUEpoq"
              alt="Recommended"
              width={32}
              height={32}
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
        sx={{
          height: '100%',
          alignItems: 'stretch',
          ...(fillContainer
            ? {
                flex: 1,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
              }
            : {}),
        }}
      >
        {displaySrc && (
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
              image={displaySrc}
              alt={card.title}
              sx={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              loading="lazy"
              decoding="async"
              onError={() => setDisplaySrc('/images/defaultcard.jpg')}
            />
            {showCopyButton && (
              <Tooltip title={copied ? "Copied!" : "Copy"} placement="top">
                <IconButton
                  aria-label="Copy"
                  onClick={doCopy}
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    zIndex: 2,
                    backgroundColor: 'rgba(15, 23, 42, 0.1)',
                    '&:hover': { backgroundColor: 'rgba(15, 23, 42, 0.5)' },
                  }}
                >
                  {copyIcon}
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}
        {showCopyButton && !displaySrc && (
          <Tooltip title={copied ? "Copied!" : "Copy to clipboard"} placement="top">
            <IconButton
              aria-label="Copy"
              onClick={doCopy}
              sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                zIndex: 2,
                backgroundColor: 'rgba(15, 23, 42, 0.1)',
                '&:hover': { backgroundColor: 'rgba(15, 23, 42, 0.5)' },
              }}
            >
              {copyIcon}
            </IconButton>
          </Tooltip>
        )}
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1, flexGrow: 1 }}>
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
                {new Date(card.date).toLocaleDateString('en-US', { timeZone: 'UTC' })}
              </Typography>
            </Stack>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}