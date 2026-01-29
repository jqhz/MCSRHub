import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import type { CardItem, Playlist } from '@src/data/content';

interface ContentStore {
  cards: CardItem[];
  playlists: Playlist[];
}

const STORAGE_PATH = path.join(process.cwd(), 'src', 'data', 'content-store.json');

const readStore = async (): Promise<ContentStore> => {
  try {
    const raw = await fs.readFile(STORAGE_PATH, 'utf-8');
    return JSON.parse(raw) as ContentStore;
  } catch {
    return { cards: [], playlists: [] };
  }
};

const writeStore = async (store: ContentStore) => {
  await fs.writeFile(STORAGE_PATH, JSON.stringify(store, null, 2), 'utf-8');
};

export const GET = async () => {
  const store = await readStore();
  return NextResponse.json(store);
};

export const POST = async (request: Request) => {
  const payload = (await request.json()) as {
    card?: CardItem;
    playlist?: Playlist;
  };
  const store = await readStore();

  if (payload.card) {
    if (!payload.card.id || !payload.card.url) {
      return NextResponse.json({ error: 'Invalid card.' }, { status: 400 });
    }
    if (store.cards.some((card) => card.id === payload.card?.id)) {
      return NextResponse.json({ error: 'Card id exists.' }, { status: 400 });
    }
    store.cards.push(payload.card);
    await writeStore(store);
    return NextResponse.json(store);
  }

  if (payload.playlist) {
    if (!payload.playlist.id || !payload.playlist.title) {
      return NextResponse.json({ error: 'Invalid playlist.' }, { status: 400 });
    }
    if (store.playlists.some((playlist) => playlist.id === payload.playlist?.id)) {
      return NextResponse.json({ error: 'Playlist id exists.' }, { status: 400 });
    }
    store.playlists.push(payload.playlist);
    await writeStore(store);
    return NextResponse.json(store);
  }

  return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
};

export const PUT = async (request: Request) => {
  const payload = (await request.json()) as {
    card?: CardItem;
    playlist?: Playlist;
  };
  const store = await readStore();

  if (payload.card?.id) {
    store.cards = store.cards.map((card) =>
      card.id === payload.card?.id ? payload.card : card,
    );
    await writeStore(store);
    return NextResponse.json(store);
  }

  if (payload.playlist?.id) {
    store.playlists = store.playlists.map((playlist) =>
      playlist.id === payload.playlist?.id ? payload.playlist : playlist,
    );
    await writeStore(store);
    return NextResponse.json(store);
  }

  return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
};

export const DELETE = async (request: Request) => {
  const payload = (await request.json()) as { id: string; type?: 'card' | 'playlist' };
  if (!payload?.id) {
    return NextResponse.json({ error: 'Invalid id.' }, { status: 400 });
  }
  const store = await readStore();
  if (payload.type === 'playlist') {
    store.playlists = store.playlists.filter((playlist) => playlist.id !== payload.id);
    store.cards = store.cards.map((card) =>
      card.playlistId === payload.id ? { ...card, playlistId: undefined } : card,
    );
  } else {
    store.cards = store.cards.filter((card) => card.id !== payload.id);
  }
  await writeStore(store);
  return NextResponse.json(store);
};
