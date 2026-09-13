/** Canonical site origin for absolute URLs in metadata and OG images. */
export const SITE_ORIGIN = 'https://mcsrhub.vercel.app';

export const toAbsoluteUrl = (path: string) =>
  new URL(path.startsWith('/') ? path : `/${path}`, SITE_ORIGIN).toString();

export const toAbsoluteImageUrl = (src: string | undefined): string | undefined => {
  if (!src?.trim()) return undefined;
  const value = src.trim();
  if (/^https?:\/\//.test(value)) return value;
  if (value.startsWith('//')) return `https:${value}`;
  if (value.startsWith('data:')) return value;
  return toAbsoluteUrl(value.startsWith('/') ? value : `/${value}`);
};
