'use client';

import { useMemo, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import { CATEGORIES } from '@src/data/content';
import { useContent } from '@src/components/ContentProvider';
import {
  getCardRoute,
  getHighlightIdForPlaylist,
  getPlaylistRouteById,
} from '@src/utils/navigation';
import { getCategoryPageForItem, getPlaylistPageForCard } from '@src/utils/pagination';
import { createSearch, type SearchItem } from '@src/utils/search';

interface HeaderProps {
  onMenuClick: () => void;
}

const categoryLabelMap = new Map(
  CATEGORIES.map((category) => [category.slug, category.label]),
);

const getResultRoute = (
  item: SearchItem,
  cards: import('@src/data/content').CardItem[],
  playlists: import('@src/data/content').Playlist[],
) => {
  if (item.type === 'playlist') {
    return `${getPlaylistRouteById(
      item.category,
      item.id,
    )}?highlight=${getHighlightIdForPlaylist(item.id)}&page=1`;
  }
  if (item.playlistId) {
    const page = getPlaylistPageForCard(
      item.category,
      item.playlistId,
      item.id,
      cards,
    );
    return `${getPlaylistRouteById(
      item.category,
      item.playlistId,
    )}?highlight=${item.id}&page=${page}`;
  }
  const highlightParam = `highlight=${item.id}`;
  const page = getCategoryPageForItem(item, cards, playlists);
  const baseRoute = getCardRoute({
    category: item.category,
    playlistId: item.playlistId,
  });
  return `${baseRoute}?${highlightParam}&page=${page}`;
};

export default function Header({ onMenuClick }: HeaderProps) {
  const theme = useTheme();
  const router = useRouter();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { cards, playlists } = useContent();
  const [query, setQuery] = useState('');
  const fuse = useMemo(() => createSearch(cards, playlists), [cards, playlists]);
  const results = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return [];
    return fuse.search(trimmed, { limit: 8 }).map((result) => result.item);
  }, [fuse, query]);
  const hasQuery = query.trim().length > 0;
  const hasResults = hasQuery && results.length > 0;

  const handleSelect = (item: SearchItem) => {
    router.push(getResultRoute(item, cards, playlists));
    setQuery('');
  };

  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ gap: 2 }}>
        <IconButton
          color="inherit"
          aria-label={isDesktop ? 'Toggle sidebar' : 'Open navigation menu'}
          edge="start"
          onClick={onMenuClick}
        >
          <MenuIcon />
        </IconButton>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <img
            src="/images/MCSRHubIcon.png"
            alt="MCSR Hub"
            width={28}
            height={28}
          />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            MCSR Hub
          </Typography>
        </Box>
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ width: '100%', maxWidth: 520, position: 'relative' }}>
            <TextField
              fullWidth
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tutorials, tools, channels..."
              aria-label="Search MCSR resources"
              sx={{
                '& .MuiInputBase-root': {
                  backgroundColor: 'rgba(18, 24, 38, 0.9)',
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            {hasQuery && (
              <Paper
                role="listbox"
                aria-label="Search results"
                sx={{
                  position: 'absolute',
                  zIndex: 1200,
                  width: '100%',
                  mt: 1,
                  maxHeight: 280,
                  overflow: 'auto',
                }}
              >
                {hasResults ? (
                  <List dense disablePadding>
                    {results.map((item) => {
                      const categoryLabel =
                        categoryLabelMap.get(item.category) ?? item.category;
                      return (
                        <ListItemButton
                          key={`${item.type}-${item.id}`}
                          onClick={() => handleSelect(item)}
                        >
                          <Box>
                            <Typography variant="subtitle2">
                              {item.title}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {categoryLabel}
                              {item.type === 'playlist' ? ' • Playlist' : ''}
                            </Typography>
                          </Box>
                        </ListItemButton>
                      );
                    })}
                  </List>
                ) : (
                  <Box sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      No matches yet.
                    </Typography>
                  </Box>
                )}
              </Paper>
            )}
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
