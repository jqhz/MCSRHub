/* eslint-disable react-refresh/only-export-components */
import { getCategoryPlaylists } from '@src/utils/pagination';
import { getCategoryRouteContext, isCategorySlug } from '@src/lib/route-content';
import { OG_IMAGE_SIZE } from '@src/lib/og-social-image.constants';
import { renderOgSocialImage } from '@src/lib/og-social-image';

export const alt = 'MCSR Hub category preview';
export const size = OG_IMAGE_SIZE;
export const contentType = 'image/png';

export default async function CategoryOgImage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  if (!isCategorySlug(category)) {
    return renderOgSocialImage({
      title: 'Category not found',
      description: 'This category does not exist on MCSR Hub.',
    });
  }

  const { categoryMeta, playlists } = await getCategoryRouteContext(category);
  if (!categoryMeta) {
    return renderOgSocialImage({
      title: 'Category not found',
      description: 'This category does not exist on MCSR Hub.',
    });
  }

  const rootPlaylists = getCategoryPlaylists(categoryMeta.slug, playlists);
  const featuredImage = rootPlaylists.find((playlist) => playlist.image)?.image;

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
