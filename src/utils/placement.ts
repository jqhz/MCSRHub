import type { CardItem, CategorySlug, Playlist } from '@src/data/content';

export const cardHasPlaylistInCategory = (
  card: CardItem,
  category: CategorySlug,
  playlists: Playlist[],
) => {
  const categoryByPlaylistId = new Map(
    playlists.map((playlist) => [playlist.id, playlist.category]),
  );
  return card.playlistIds.some(
    (playlistId) => categoryByPlaylistId.get(playlistId) === category,
  );
};

/** Category root listing: category checked and no playlist in that same category. */
export const showsOnCategoryRoot = (
  card: CardItem,
  category: CategorySlug,
  playlists: Playlist[],
) =>
  card.categories.includes(category) &&
  !cardHasPlaylistInCategory(card, category, playlists);
