import assert from 'node:assert/strict';
import test from 'node:test';
import type { Playlist } from '@src/data/content';
import {
  findPlaylistByPath,
  findPlaylistBySlugOrId,
  getPlaylistPathSegments,
  playlistUsesCanonicalPath,
} from '@src/utils/playlists';
import { getPlaylistRoute } from '@src/utils/navigation';

const playlists: Playlist[] = [
  {
    id: 'tutorial-p-bastions',
    slug: 'bastions',
    category: 'tutorials',
    title: 'Bastions',
    image: 'images/bastions.png',
    position: 0,
  },
  {
    id: 'tutorial-p-housing',
    slug: 'housing',
    category: 'tutorials',
    parentPlaylistId: 'tutorial-p-bastions',
    title: 'Housing',
    image: 'images/housing.png',
    position: 0,
  },
  {
    id: 'tutorial-p-root',
    slug: 'getting-started',
    category: 'tutorials',
    title: 'Getting Started',
    image: 'images/start.png',
    position: 1,
  },
];

test('getPlaylistPathSegments includes ancestor slugs for nested playlists', () => {
  const housing = playlists[1];
  assert.deepEqual(getPlaylistPathSegments(housing, playlists), [
    'bastions',
    'housing',
  ]);
});

test('getPlaylistPathSegments returns a single segment for root playlists', () => {
  const bastions = playlists[0];
  assert.deepEqual(getPlaylistPathSegments(bastions, playlists), ['bastions']);
});

test('findPlaylistByPath resolves nested playlists', () => {
  const housing = findPlaylistByPath(playlists, 'tutorials', [
    'bastions',
    'housing',
  ]);
  assert.equal(housing?.id, 'tutorial-p-housing');
});

test('findPlaylistByPath does not match nested playlists by leaf slug alone', () => {
  assert.equal(
    findPlaylistByPath(playlists, 'tutorials', ['housing']),
    undefined,
  );
});

test('findPlaylistBySlugOrId resolves nested playlists for legacy URLs', () => {
  const housing = findPlaylistBySlugOrId(playlists, 'tutorials', 'housing');
  assert.equal(housing?.id, 'tutorial-p-housing');
});

test('playlistUsesCanonicalPath rejects flat URLs for nested playlists', () => {
  const housing = playlists[1];
  assert.equal(playlistUsesCanonicalPath(housing, ['housing'], playlists), false);
  assert.equal(
    playlistUsesCanonicalPath(housing, ['bastions', 'housing'], playlists),
    true,
  );
});

test('getPlaylistRoute builds nested paths', () => {
  const housing = playlists[1];
  assert.equal(
    getPlaylistRoute(housing, playlists),
    '/tutorials/bastions/housing',
  );
});
