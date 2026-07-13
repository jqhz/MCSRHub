import { permanentRedirect } from 'next/navigation';

// Legacy URL: /[category]/playlist/[playlistId] -> /[category]/[playlistId]
export default async function LegacyPlaylistRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ category: string; playlistId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { category, playlistId } = await params;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    if (typeof value === 'string') query.set(key, value);
  }
  const suffix = query.size > 0 ? `?${query.toString()}` : '';
  permanentRedirect(`/${category}/${playlistId}${suffix}`);
}
