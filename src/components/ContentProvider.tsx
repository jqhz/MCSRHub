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

export default function ContentProvider({ children }: { children: React.ReactNode }) {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContent = useCallback(async () => {
    try {
      const response = await fetch('/api/content');
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
    fetchContent();
  }, [fetchContent]);

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
