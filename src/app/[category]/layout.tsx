/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from 'next';
import { getCategoryRouteContext, isCategorySlug } from '@src/lib/route-content';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;

  if (!isCategorySlug(category)) {
    return { title: 'Category not found' };
  }

  const { categoryMeta } = await getCategoryRouteContext(category);
  if (!categoryMeta) {
    return { title: 'Category not found' };
  }

  const description =
    categoryMeta.slug === 'fanart'
      ? 'Community fan art from the Minecraft speedrunning scene, curated on MCSR Hub.'
      : `Browse ${categoryMeta.label.toLowerCase()} playlists and resources on MCSR Hub — tutorials, tools, and community links for Minecraft speedrunning.`;

  const title = categoryMeta.label;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/${categoryMeta.slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default function CategoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
