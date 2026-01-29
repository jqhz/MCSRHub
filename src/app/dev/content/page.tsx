/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import ListSubheader from '@mui/material/ListSubheader';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import {
  CATEGORIES,
  type CardItem,
  type Playlist,
  type CategorySlug,
} from '../../../data/content';

const emptyCard: CardItem = {
  id: '',
  category: 'tutorials',
  title: '',
  description: '',
  image: '',
  date: '',
  url: '',
  playlistId: undefined,
  recommended: false,
};

const emptyPlaylist: Playlist = {
  id: '',
  category: 'tutorials',
  title: '',
  image: '',
  description: '',
};

const getCategoryPrefix = (category: CardItem['category']) => {
  switch (category) {
    case 'tutorials':
      return 'tutorial';
    case 'tech':
      return 'tech';
    case 'documents':
      return 'document';
    case 'downloads':
      return 'download';
    case 'apps-tools':
      return 'app';
    case 'discords':
      return 'discord';
    case 'youtube':
      return 'youtube';
    case 'fanart':
      return 'fanart';
    default:
      return 'card';
  }
};

export default function DevContentPage() {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [draft, setDraft] = useState<CardItem>(emptyCard);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });
  const [playlistDraft, setPlaylistDraft] = useState<Playlist>(emptyPlaylist);
  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null);
  const playlistOptions = useMemo(
    () =>
      playlists.filter((playlist) => playlist.category === draft.category),
    [playlists, draft.category],
  );
  const playlistMap = useMemo(
    () =>
      new Map(
        playlists.map((playlist) => [
          playlist.id,
          `${playlist.category} > ${playlist.title}`,
        ]),
      ),
    [playlists],
  );

  const fetchContent = async () => {
    const response = await fetch('/api/content');
    const data = (await response.json()) as {
      cards: CardItem[];
      playlists: Playlist[];
    };
    setCards(data.cards ?? []);
    setPlaylists(data.playlists ?? []);
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const getNextIdForCategory = useCallback(
    (category: CardItem['category']) => {
      const prefix = getCategoryPrefix(category);
      const regex = new RegExp(`^${prefix}-(\\d{3})$`);
      const max = cards.reduce((acc, card) => {
        if (card.category !== category) return acc;
        const match = card.id.match(regex);
        if (!match) return acc;
        const value = Number(match[1]);
        return Number.isNaN(value) ? acc : Math.max(acc, value);
      }, 0);
      const next = String(Math.min(max + 1, 999)).padStart(3, '0');
      return `${prefix}-${next}`;
    },
    [cards],
  );

  useEffect(() => {
    if (editingId) return;
    const prefix = getCategoryPrefix(draft.category);
    const pattern = new RegExp(`^${prefix}-\\d{3}$`);
    if (!draft.id || pattern.test(draft.id)) {
      setDraft((prev) => ({
        ...prev,
        id: getNextIdForCategory(prev.category),
      }));
    }
  }, [draft.category, draft.id, editingId, getNextIdForCategory]);

  const handleChange = <K extends keyof CardItem>(
    key: K,
    value: CardItem[K],
  ) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const normalizeCard = (card: CardItem) => ({
    ...card,
    id: card.id.trim(),
    title: card.title.trim(),
    description: card.description?.trim() || undefined,
    image: card.image?.trim() || undefined,
    date: card.date?.trim() || undefined,
    url: card.url.trim(),
    playlistId: card.playlistId || undefined,
    recommended: Boolean(card.recommended),
  });

  const handleSave = async () => {
    const payload = normalizeCard(draft);
    if (!payload.id || !payload.url) return;
    const response = await fetch('/api/content', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ card: payload }),
    });
    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setToast({
        open: true,
        message: data.error ?? 'Unable to save card.',
      });
      return;
    }
    const nextCategory = draft.category;
    setDraft({ ...emptyCard, category: nextCategory });
    setEditingId(null);
    await fetchContent();
  };

  const handleEdit = (card: CardItem) => {
    setEditingId(card.id);
    setDraft({
      ...card,
      description: card.description ?? '',
      image: card.image ?? '',
      date: card.date ?? '',
    });
  };

  const handleDelete = async (cardId: string) => {
    await fetch('/api/content', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: cardId }),
    });
    if (editingId === cardId) {
      setEditingId(null);
      setDraft(emptyCard);
    }
    await fetchContent();
  };

  const normalizePlaylist = (playlist: Playlist) => ({
    ...playlist,
    id: playlist.id.trim(),
    title: playlist.title.trim(),
    image: playlist.image.trim(),
    description: playlist.description?.trim() || undefined,
  });

  const handleSavePlaylist = async () => {
    const payload = normalizePlaylist(playlistDraft);
    if (!payload.id || !payload.title) return;
    const response = await fetch('/api/content', {
      method: editingPlaylistId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playlist: payload }),
    });
    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setToast({
        open: true,
        message: data.error ?? 'Unable to save playlist.',
      });
      return;
    }
    const nextCategory = playlistDraft.category;
    setPlaylistDraft({ ...emptyPlaylist, category: nextCategory });
    setEditingPlaylistId(null);
    await fetchContent();
  };

  const handleEditPlaylist = (playlist: Playlist) => {
    setEditingPlaylistId(playlist.id);
    setPlaylistDraft({
      ...playlist,
      description: playlist.description ?? '',
    });
  };

  const handleDeletePlaylist = async (playlistId: string) => {
    await fetch('/api/content', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: playlistId, type: 'playlist' }),
    });
    if (editingPlaylistId === playlistId) {
      setEditingPlaylistId(null);
      setPlaylistDraft(emptyPlaylist);
    }
    await fetchContent();
  };

  const filteredCards = useMemo(() => {
    if (filter === 'all') return cards;
    if (filter.startsWith('category:')) {
      const category = filter.replace('category:', '');
      return cards.filter((card) => card.category === category);
    }
    if (filter.startsWith('playlist:')) {
      const playlistId = filter.replace('playlist:', '');
      return cards.filter((card) => card.playlistId === playlistId);
    }
    return cards;
  }, [cards, filter]);

  const filterOptions = useMemo(() => {
    const options: React.ReactNode[] = [
      <MenuItem key="all" value="all">
        All cards
      </MenuItem>,
    ];

    CATEGORIES.forEach((category: { slug: CategorySlug; label: string }) => {
      options.push(
        <ListSubheader key={`${category.slug}-header`} disableSticky>
          {category.label}
        </ListSubheader>,
      );
      options.push(
        <MenuItem key={`${category.slug}-all`} value={`category:${category.slug}`}>
          {category.label} (All)
        </MenuItem>,
      );
      playlists
        .filter((playlist) => playlist.category === category.slug)
        .forEach((playlist) => {
          options.push(
            <MenuItem key={`playlist-${playlist.id}`} value={`playlist:${playlist.id}`}>
              {category.label} &gt; {playlist.title} (Playlist)
            </MenuItem>,
          );
        });
    });

    return options;
  }, [playlists]);

  return (
    <Stack spacing={4}>
      <Typography variant="h4" sx={{ fontWeight: 800 }}>
        Content Builder (Dev Only)
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Use this page to review, add, edit, and delete cards. Changes are saved
        to `src/data/content-store.json`.
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6">
            {editingId ? 'Edit Card' : 'Add Card'}
          </Typography>
          <Divider />
          <Box className="grid gap-3 md:grid-cols-2">
            <TextField
              label="Card ID"
              value={draft.id}
              onChange={(event) => handleChange('id', event.target.value)}
              helperText="Unique id like tutorial-001"
            />
            <TextField
              label="Title"
              value={draft.title}
              onChange={(event) => handleChange('title', event.target.value)}
            />
            <TextField
              label="Category"
              select
              value={draft.category}
              onChange={(event) =>
                handleChange('category', event.target.value as CardItem['category'])
              }
            >
              {CATEGORIES.map((category: { slug: CategorySlug; label: string }) => (
                <MenuItem key={category.slug} value={category.slug}>
                  {category.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Playlist (optional)"
              select
              value={draft.playlistId ?? ''}
              onChange={(event) =>
                handleChange('playlistId', event.target.value || undefined)
              }
            >
              <MenuItem value="">None</MenuItem>
              {playlistOptions.map((playlist) => (
                <MenuItem key={playlist.id} value={playlist.id}>
                  {playlist.title}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Description"
              value={draft.description}
              onChange={(event) => handleChange('description', event.target.value)}
              multiline
              minRows={2}
            />
            <TextField
              label="URL"
              value={draft.url}
              onChange={(event) => handleChange('url', event.target.value)}
            />
            <TextField
              label="Image URL (optional)"
              value={draft.image}
              onChange={(event) => handleChange('image', event.target.value)}
            />
            <TextField
              label="Date (optional, ISO)"
              value={draft.date}
              onChange={(event) => handleChange('date', event.target.value)}
            />
          </Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={Boolean(draft.recommended)}
                onChange={(event) =>
                  handleChange('recommended', event.target.checked)
                }
              />
            }
            label="Recommended card"
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button variant="contained" onClick={handleSave}>
              {editingId ? 'Update Card' : 'Add Card'}
            </Button>
            {editingId && (
              <Button
                variant="outlined"
                onClick={() => {
                  setEditingId(null);
                  setDraft({ ...emptyCard, category: draft.category });
                }}
              >
                Cancel Edit
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6">Playlists</Typography>
          <Divider />
          <Box className="grid gap-3 md:grid-cols-2">
            <TextField
              label="Playlist ID"
              value={playlistDraft.id}
              onChange={(event) =>
                setPlaylistDraft((prev: Playlist) => ({
                  ...prev,
                  id: event.target.value,
                }))
              }
            />
            <TextField
              label="Title"
              value={playlistDraft.title}
              onChange={(event) =>
                setPlaylistDraft((prev: Playlist) => ({
                  ...prev,
                  title: event.target.value,
                }))
              }
            />
            <TextField
              label="Category"
              select
              value={playlistDraft.category}
              onChange={(event) =>
                setPlaylistDraft((prev: Playlist) => ({
                  ...prev,
                  category: event.target.value as Playlist['category'],
                }))
              }
            >
              {CATEGORIES.map((category: { slug: CategorySlug; label: string }) => (
                <MenuItem key={category.slug} value={category.slug}>
                  {category.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Image URL"
              value={playlistDraft.image}
              onChange={(event) =>
                setPlaylistDraft((prev: Playlist) => ({
                  ...prev,
                  image: event.target.value,
                }))
              }
            />
            <TextField
              label="Description"
              value={playlistDraft.description}
              onChange={(event) =>
                setPlaylistDraft((prev: Playlist) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              multiline
              minRows={2}
            />
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button variant="contained" onClick={handleSavePlaylist}>
              {editingPlaylistId ? 'Update Playlist' : 'Add Playlist'}
            </Button>
            {editingPlaylistId && (
              <Button
                variant="outlined"
                onClick={() => {
                  setEditingPlaylistId(null);
                  setPlaylistDraft({ ...emptyPlaylist, category: playlistDraft.category });
                }}
              >
                Cancel Edit
              </Button>
            )}
          </Stack>
          <Box className="grid gap-3 md:grid-cols-2">
            {playlists.map((playlist) => (
              <Paper key={playlist.id} sx={{ p: 2, bgcolor: 'rgba(18, 24, 38, 0.7)' }}>
                <Stack spacing={1}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {playlist.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {playlist.category} • {playlist.id}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {playlist.image}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleEditPlaylist(playlist)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() => handleDeletePlaylist(playlist.id)}
                    >
                      Delete
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Box>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <Typography variant="h6">Cards</Typography>
            <TextField
              label="Filter cards"
              select
              size="small"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              sx={{ minWidth: 240 }}
            >
              {filterOptions}
            </TextField>
          </Stack>
          <Divider />
          <Box className="grid gap-3 md:grid-cols-2">
            {filteredCards.map((card) => (
              <Paper key={card.id} sx={{ p: 2, bgcolor: 'rgba(18, 24, 38, 0.7)' }}>
                <Stack spacing={1}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {card.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.category} • {card.id}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {card.playlistId
                      ? `Breadcrumbs: ${playlistMap.get(card.playlistId) ?? card.playlistId}`
                      : `Breadcrumbs: ${card.category}`}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {card.url}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="outlined" onClick={() => handleEdit(card)}>
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() => handleDelete(card.id)}
                    >
                      Delete
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Box>
        </Stack>
      </Paper>
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ open: false, message: '' })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToast({ open: false, message: '' })}
          severity="error"
          variant="filled"
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
