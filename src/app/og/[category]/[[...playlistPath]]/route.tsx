import { getCategoryPlaylists } from '@src/utils/pagination';
import {
  getCategoryRouteContext,
  getPlaylistRouteContext,
  isCategorySlug,
} from '@src/lib/route-content';
import { renderOgSocialImage } from '@src/lib/og-social-image';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  context: { params: Promise<{ category: string; playlistPath?: string[] }> },
) {
  const { category, playlistPath = [] } = await context.params;

  if (!isCategorySlug(category)) {
    return renderOgSocialImage({
      title: 'Category not found',
      description: 'This category does not exist on MCSR Hub.',
    });
  }

  if (playlistPath.length === 0) {
    const { categoryMeta, playlists } = await getCategoryRouteContext(category);
    if (!categoryMeta) {
      return renderOgSocialImage({
        title: 'Category not found',
        description: 'This category does not exist on MCSR Hub.',
      });
    }

    const rootPlaylists = getCategoryPlaylists(categoryMeta.slug, playlists);
    const featuredImage = rootPlaylists.find((item) => item.image)?.image;
    const description =
      categoryMeta.slug === 'fanart'
        ? 'Community fan art from the Minecraft speedrunning scene.'
        : `Playlists and resources for Minecraft speedrunning ${categoryMeta.label.toLowerCase()}.`;

    return renderOgSocialImage({
      title: categoryMeta.label,
      eyebrow: 'MCSR Hub',
      description,
      imageUrl: featuredImage,
    });
  }

  const { categoryMeta, playlist } = await getPlaylistRouteContext(category, playlistPath);

  if (!categoryMeta) {
    return renderOgSocialImage({
      title: 'Category not found',
      description: 'This category does not exist on MCSR Hub.',
    });
  }

  if (!playlist) {
    return renderOgSocialImage({
      title: 'Playlist not found',
      eyebrow: categoryMeta.label,
      description: 'This playlist could not be found on MCSR Hub.',
    });
  }

  return renderOgSocialImage({
    title: playlist.title,
    eyebrow: categoryMeta.label,
    description:
      playlist.description ??
      `Explore ${playlist.title} — curated links and resources on MCSR Hub.`,
    imageUrl: playlist.image,
  });
}
