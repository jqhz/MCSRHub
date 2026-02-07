/* eslint-disable react-refresh/only-export-components */
'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { CardItem, Playlist } from '@src/data/content';

interface ContentState {
  cards: CardItem[];
  playlists: Playlist[];
  loading: boolean;
  refresh: () => Promise<void>;
}

const ContentContext = createContext<ContentState | null>(null);

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within ContentProvider');
  }
  return context;
};

export default function ContentProvider({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData?: { cards: CardItem[]; playlists: Playlist[] };
}) {
  const [cards, setCards] = useState<CardItem[]>(initialData?.cards ?? []);
  const [playlists, setPlaylists] = useState<Playlist[]>(
    initialData?.playlists ?? [],
  );
  const [loading, setLoading] = useState(!initialData);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/content', { cache: 'force-cache' });
      const data = (await response.json()) as { cards: CardItem[]; playlists: Playlist[] };
      setCards(data.cards ?? []);
      setPlaylists(data.playlists ?? []);
    } catch {
      setCards([]);
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialData) {
      fetchContent();
    }
  }, [fetchContent, initialData]);

  const value = useMemo(
    () => ({
      cards,
      playlists,
      loading,
      refresh: fetchContent,
    }),
    [cards, playlists, loading, fetchContent],
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}
