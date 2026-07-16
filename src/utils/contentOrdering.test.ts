import assert from 'node:assert/strict';
import test from 'node:test';
import type { CardItem, Playlist } from '@src/data/content';
import { showsOnCategoryRoot } from '@src/utils/placement';
import { filterPublicCards, isPublicCard } from '@src/utils/publicContent';
import {
  sortCardsByCategoryPosition,
  sortCardsByPlaylistPosition,
  sortPlaylistsByPosition,
} from '@src/utils/sorting';
import {
  getCategoryCards,
  getCategoryPlaylists,
  getPlaylistCards,
} from '@src/utils/pagination';

const card = (
  overrides: Partial<CardItem> & Pick<CardItem, 'id'>,
): CardItem => ({
  categories: [],
  playlistIds: [],
  categoryPositions: {},
  playlistPositions: {},
  title: overrides.id,
  archived: false,
  url: `https://example.com/${overrides.id}`,
  ...overrides,
});

const playlist = (
  overrides: Partial<Playlist> & Pick<Playlist, 'id'>,
): Playlist => ({
  slug: overrides.id,
  category: 'tutorials',
  title: overrides.id,
  image: 'images/test.png',
  position: 0,
  ...overrides,
});

test('archived cards are excluded from public filters', () => {
  const cards = [
    card({ id: 'tutorial-001', archived: false }),
    card({ id: 'tutorial-002', archived: true }),
  ];
  assert.equal(filterPublicCards(cards).length, 1);
  assert.equal(isPublicCard(cards[1]), false);
});

test('playlists sort by position then id', () => {
  const sorted = sortPlaylistsByPosition([
    playlist({ id: 'tutorial-p-002', position: 2 }),
    playlist({ id: 'tutorial-p-001', position: 1 }),
    playlist({ id: 'tutorial-p-003', position: 1 }),
  ]);
  assert.deepEqual(
    sorted.map((item) => item.id),
    ['tutorial-p-001', 'tutorial-p-003', 'tutorial-p-002'],
  );
});

test('category cards sort by categoryPositions for that category', () => {
  const sorted = sortCardsByCategoryPosition(
    [
      card({ id: 'tutorial-002', categoryPositions: { tutorials: 2 } }),
      card({ id: 'tutorial-001', categoryPositions: { tutorials: 1 } }),
      card({ id: 'tutorial-003' }),
    ],
    'tutorials',
  );
  assert.deepEqual(
    sorted.map((item) => item.id),
    ['tutorial-001', 'tutorial-002', 'tutorial-003'],
  );
});

test('playlist cards sort by playlistPositions for that playlist', () => {
  const sorted = sortCardsByPlaylistPosition(
    [
      card({
        id: 'tutorial-002',
        playlistIds: ['tutorial-p-001'],
        playlistPositions: { 'tutorial-p-001': 5 },
      }),
      card({
        id: 'tutorial-001',
        playlistIds: ['tutorial-p-001'],
        playlistPositions: { 'tutorial-p-001': 1 },
      }),
    ],
    'tutorial-p-001',
  );
  assert.deepEqual(
    sorted.map((item) => item.id),
    ['tutorial-001', 'tutorial-002'],
  );
});

test('category root hides cards with a playlist in the same category', () => {
  const playlists = [
    playlist({ id: 'tutorial-p-001', category: 'tutorials', position: 0 }),
  ];
  const cards = [
    card({
      id: 'tutorial-001',
      categories: ['tutorials'],
      playlistIds: ['tutorial-p-001'],
    }),
    card({
      id: 'tutorial-002',
      categories: ['tutorials'],
    }),
  ];
  const visible = getCategoryCards('tutorials', cards, playlists);
  assert.deepEqual(visible.map((item) => item.id), ['tutorial-002']);
  assert.equal(
    showsOnCategoryRoot(cards[0], 'tutorials', playlists),
    false,
  );
});

test('cross-category playlist keeps category root visibility', () => {
  const playlists = [
    playlist({ id: 'download-p-001', category: 'downloads', position: 0 }),
  ];
  const cards = [
    card({
      id: 'tutorial-001',
      categories: ['tutorials'],
      playlistIds: ['download-p-001'],
    }),
  ];
  assert.equal(showsOnCategoryRoot(cards[0], 'tutorials', playlists), true);
  assert.deepEqual(
    getCategoryCards('tutorials', cards, playlists).map((item) => item.id),
    ['tutorial-001'],
  );
  assert.deepEqual(getPlaylistCards('download-p-001', cards).map((item) => item.id), [
    'tutorial-001',
  ]);
});

test('archived cards never appear in category or playlist listings', () => {
  const playlists = [playlist({ id: 'tutorial-p-001' })];
  const cards = [
    card({
      id: 'tutorial-001',
      archived: true,
      categories: ['tutorials'],
    }),
    card({
      id: 'tutorial-002',
      categories: ['tutorials'],
      playlistIds: ['tutorial-p-001'],
      playlistPositions: { 'tutorial-p-001': 0 },
    }),
  ];
  assert.deepEqual(getCategoryCards('tutorials', cards, playlists), []);
  assert.deepEqual(
    getPlaylistCards('tutorial-p-001', cards).map((item) => item.id),
    ['tutorial-002'],
  );
});

test('getCategoryPlaylists respects sibling position ordering', () => {
  const playlists = [
    playlist({ id: 'tutorial-p-002', position: 2 }),
    playlist({ id: 'tutorial-p-001', position: 1 }),
    playlist({ id: 'download-p-001', category: 'downloads', position: 0 }),
  ];
  assert.deepEqual(
    getCategoryPlaylists('tutorials', playlists).map((item) => item.id),
    ['tutorial-p-001', 'tutorial-p-002'],
  );
});
