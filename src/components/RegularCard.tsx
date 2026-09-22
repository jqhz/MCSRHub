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
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import type { CardItem } from '../data/content';
import { getScreenshotPath } from '@src/lib/card-screenshots';
import { FALLBACK_CARD_IMAGE } from '@src/lib/card-thumbnail';
import { getYouTubeId } from '@src/lib/youtube';
import CardAdditionalInfoMarkdown from './CardAdditionalInfoMarkdown';

interface RegularCardProps {
  card: CardItem;
  fillContainer?: boolean;
}

const getSyncImageSrc = (card: CardItem): string | undefined => {
  if (card.image?.trim()) {
    return card.image;
  }
  if (!card.url?.trim()) {
    return undefined;
  }
  const youtubeId = getYouTubeId(card.url);
  if (youtubeId) {
    return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
  }
  return getScreenshotPath(card.url) ?? undefined;
};

export default function RegularCard({ card, fillContainer = false }: RegularCardProps) {
  const [displaySrc, setDisplaySrc] = useState<string | undefined>(() => getSyncImageSrc(card));
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const additionalInfoMarkdown = card.additionalInfo?.trim() ?? '';
  const hasAdditionalInfo = additionalInfoMarkdown.length > 0;

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
    setCopied(false);
    clearResetTimer();

    const syncSrc = getSyncImageSrc(card);
    if (syncSrc) {
      setDisplaySrc(syncSrc);
      return;
    }

    if (!card.url?.trim()) {
      setDisplaySrc(undefined);
      return;
    }

    let cancelled = false;

    const resolveThumbnail = async () => {
      try {
        const response = await fetch(
          `/api/og-image?url=${encodeURIComponent(card.url)}&format=json`,
        );
        if (!response.ok) {
          throw new Error('Failed to resolve thumbnail');
        }
        const data = (await response.json()) as { url?: string };
        if (!cancelled) {
          setDisplaySrc(data.url ?? FALLBACK_CARD_IMAGE);
        }
      } catch {
        if (!cancelled) {
          setDisplaySrc(FALLBACK_CARD_IMAGE);
        }
      }
    };

    setDisplaySrc(undefined);
    void resolveThumbnail();

    return () => {
      cancelled = true;
    };
  }, [card.image, card.url]);

  useEffect(() => {
    return () => clearResetTimer();
  }, []);

  const doCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(card.url);
      setCopied(true);

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

  const openAdditionalInfo = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setInfoOpen(true);
  };

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
        {(displaySrc || !getSyncImageSrc(card)) && (
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
            {displaySrc && (
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
                onError={() => setDisplaySrc(FALLBACK_CARD_IMAGE)}
              />
            )}
            {showCopyButton && displaySrc && (
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
          {(card.description || card.date || hasAdditionalInfo) && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                minWidth: 0,
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                {card.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    {...(hasAdditionalInfo
                      ? {
                          noWrap: true,
                          sx: { overflow: 'hidden', textOverflow: 'ellipsis' },
                        }
                      : {})}
                  >
                    {card.description}
                  </Typography>
                )}
                {card.date && (
                  <Typography variant="caption" color="text.secondary">
                    {new Date(card.date).toLocaleDateString('en-US', { timeZone: 'UTC' })}
                  </Typography>
                )}
              </Box>
              {hasAdditionalInfo && (
                <Tooltip title="Additional Info" placement="top">
                  <Box
                    component="button"
                    type="button"
                    aria-label="Additional Info"
                    onClick={openAdditionalInfo}
                    sx={{
                      flexShrink: 0,
                      width: 22,
                      height: 22,
                      p: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 1,
                      borderColor: 'text.secondary',
                      borderRadius: 0.5,
                      bgcolor: 'transparent',
                      color: 'text.secondary',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: '0.75rem',
                      fontWeight: 400,
                      fontStyle: 'normal',
                      lineHeight: 1,
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    i
                  </Box>
                </Tooltip>
              )}
            </Box>
          )}
        </CardContent>
      </CardActionArea>
      {hasAdditionalInfo && (
        <Dialog
          open={infoOpen}
          onClose={() => setInfoOpen(false)}
          maxWidth="sm"
          fullWidth
          aria-labelledby={`${card.id}-additional-info-title`}
        >
          <DialogTitle
            id={`${card.id}-additional-info-title`}
            sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, pr: 1 }}
          >
            <Typography component="span" variant="h6" sx={{ fontWeight: 600, pt: 0.25 }}>
              {card.title}
            </Typography>
            <IconButton
              aria-label="Close"
              onClick={() => setInfoOpen(false)}
              sx={{ mt: -0.5, mr: -0.5 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers={false}>
            <CardAdditionalInfoMarkdown markdown={additionalInfoMarkdown} />
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
