'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
// import Image from 'next/image';
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
import SearchIcon from '@mui/icons-material/Search';
import { useRouter } from 'next/navigation';
import { CATEGORIES } from '@src/data/content';
import { useContent } from '@src/components/ContentProvider';
import {
  getCategoryRoute,
  getHighlightIdForPlaylist,
  getPlaylistRoute,
  getPlaylistRouteByPlaylistId,
} from '@src/utils/navigation';
import { getCategoryPageForItem, getPlaylistPageForCard } from '@src/utils/pagination';
import { createSearch, type SearchItem } from '@src/utils/search';

interface HeaderProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
}

const SEARCH_LISTBOX_ID = 'search-results-listbox';

const categoryLabelMap = new Map(
  CATEGORIES.map((category) => [category.slug, category.label]),
);

const isTypingTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
};

const getResultRoute = (
  item: SearchItem,
  cards: import('@src/data/content').CardItem[],
  playlists: import('@src/data/content').Playlist[],
) => {
  if (item.type === 'playlist') {
    const playlist = playlists.find(
      (entry) => entry.id === item.id && entry.category === item.category,
    );
    const route = playlist
      ? getPlaylistRoute(playlist, playlists)
      : getPlaylistRouteByPlaylistId(item.category, item.slug, playlists);
    return `${route}?highlight=${getHighlightIdForPlaylist(item.id)}&page=1`;
  }
  if (item.playlistId) {
    const page = getPlaylistPageForCard(
      item.playlistId,
      item.id,
      cards,
      playlists,
    );
    return `${getPlaylistRouteByPlaylistId(
      item.category,
      item.playlistId,
      playlists,
    )}?highlight=${item.id}&page=${page}`;
  }
  const page = getCategoryPageForItem(item, cards, playlists);
  return `${getCategoryRoute(item.category)}?highlight=${item.id}&page=${page}`;
};

export default function Header({ onMenuClick, sidebarOpen }: HeaderProps) {
  const router = useRouter();
  const { cards, playlists } = useContent();
  const inputRef = useRef<HTMLInputElement>(null);
  const activeOptionRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const fuse = useMemo(() => createSearch(cards, playlists), [cards, playlists]);
  const results = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return [];
    return fuse.search(trimmed, { limit: 8 }).map((result) => result.item);
  }, [fuse, query]);
  const hasQuery = query.trim().length > 0;
  const hasResults = hasQuery && results.length > 0;
  const effectiveActiveIndex =
    activeIndex >= 0 && results.length > 0
      ? Math.min(activeIndex, results.length - 1)
      : -1;

  useEffect(() => {
    if (effectiveActiveIndex < 0) return;
    activeOptionRef.current?.scrollIntoView({ block: 'nearest' });
  }, [effectiveActiveIndex]);

  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '/') return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;
      event.preventDefault();
      inputRef.current?.focus();
    };
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleSelect = (item: SearchItem) => {
    router.push(getResultRoute(item, cards, playlists));
    setQuery('');
    setActiveIndex(-1);
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      setQuery('');
      setActiveIndex(-1);
      inputRef.current?.blur();
      return;
    }

    if (results.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((prev) => {
        if (prev < 0) return 0;
        return Math.min(prev + 1, results.length - 1);
      });
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) => {
        if (prev < 0) return 0;
        return Math.max(prev - 1, 0);
      });
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const index = effectiveActiveIndex >= 0 ? effectiveActiveIndex : 0;
      handleSelect(results[index]!);
    }
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
          aria-label="Toggle sidebar"
          edge="start"
          onClick={onMenuClick}
        >
          {/* <MenuIcon /> */}
          <img
            src={sidebarOpen ? '/images/MCSRHubIcon.png' : '/images/MCSRHubIconAlt.png'}
            alt="MCSR Hub"
            width={28}
            height={28}
          />
        </IconButton>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* <img
            src="/images/MCSRHubIcon.png"
            alt="MCSR Hub"
            width={28}
            height={28}
          /> */}
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            MCSR Hub
          </Typography>
        </Box>
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ width: '100%', maxWidth: 520, position: 'relative' }}>
            <TextField
              fullWidth
              inputRef={inputRef}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(-1);
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search tutorials, tools, channels..."
              aria-label="Search MCSR resources"
              aria-expanded={hasQuery}
              aria-controls={hasQuery ? SEARCH_LISTBOX_ID : undefined}
              aria-autocomplete="list"
              aria-activedescendant={
                effectiveActiveIndex >= 0 && hasResults
                  ? `search-result-${effectiveActiveIndex}`
                  : undefined
              }
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
                endAdornment: !hasQuery ? (
                  <InputAdornment
                    position="end"
                    sx={{ display: { xs: 'none', md: 'flex' }, mr: 0.25 }}
                  >
                    <Box
                      component="span"
                      aria-hidden
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 22,
                        height: 22,
                        borderRadius: 0.75,
                        border: '1px solid',
                        borderColor: 'divider',
                        color: 'text.secondary',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        lineHeight: 1,
                        pointerEvents: 'none',
                        userSelect: 'none',
                      }}
                    >
                      /
                    </Box>
                  </InputAdornment>
                ) : undefined,
              }}
            />
            {hasQuery && (
              <Paper
                id={SEARCH_LISTBOX_ID}
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
                    {results.map((item, index) => {
                      const categoryLabel =
                        categoryLabelMap.get(item.category) ?? item.category;
                      const selected = index === effectiveActiveIndex;
                      return (
                        <ListItemButton
                          key={`${item.type}-${item.id}-${item.category}${item.type === 'card' && item.playlistId ? `-${item.playlistId}` : ''}`}
                          id={`search-result-${index}`}
                          role="option"
                          aria-selected={selected}
                          selected={selected}
                          ref={selected ? activeOptionRef : undefined}
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
