import type { CardItem, CategorySlug, Playlist } from '@src/data/content';

/** Items without an explicit position sort after all positioned items. */
const END_POSITION = Number.MAX_SAFE_INTEGER;

const compareByPosition = (
  aPosition: number | undefined,
  bPosition: number | undefined,
  aId: string,
  bId: string,
) => {
  const a = aPosition ?? END_POSITION;
  const b = bPosition ?? END_POSITION;
  if (a !== b) return a - b;
  return aId.localeCompare(bId);
};

export const sortPlaylistsByPosition = (playlists: Playlist[]) =>
  [...playlists].sort((a, b) =>
    compareByPosition(a.position, b.position, a.id, b.id),
  );

export const sortCardsByCategoryPosition = (
  cards: CardItem[],
  category: CategorySlug,
) =>
  [...cards].sort((a, b) =>
    compareByPosition(
      a.categoryPositions[category],
      b.categoryPositions[category],
      a.id,
      b.id,
    ),
  );

export const sortCardsByPlaylistPosition = (
  cards: CardItem[],
  playlistId: string,
) =>
  [...cards].sort((a, b) =>
    compareByPosition(
      a.playlistPositions[playlistId],
      b.playlistPositions[playlistId],
      a.id,
      b.id,
    ),
  );

export { compareByPosition, END_POSITION };
