import { NextResponse } from 'next/server';
import { normalizeUrl } from '@src/lib/card-screenshots';
import { resolveCardThumbnail } from '@src/lib/card-thumbnail';

const CACHE_TTL_MS = 1000 * 60 * 60 * 24;
const NEGATIVE_TTL_MS = 1000 * 60 * 10;

type CacheEntry = { url: string; expiresAt: number };

const getCache = () => {
  const globalForCache = globalThis as typeof globalThis & {
    ogImageCache?: Map<string, CacheEntry>;
  };
  if (!globalForCache.ogImageCache) {
    globalForCache.ogImageCache = new Map();
  }
  return globalForCache.ogImageCache;
};

const CACHE_CONTROL = 'public, s-maxage=86400, stale-while-revalidate=604800';

const getRedirectResponse = (destination: string) => {
  const response = NextResponse.redirect(destination, 302);
  response.headers.set('Cache-Control', CACHE_CONTROL);
  return response;
};

const toAbsoluteUrl = (url: string, request: Request): string => {
  if (/^(https?:)?\/\//.test(url) || url.startsWith('data:')) {
    return url.startsWith('//') ? `https:${url}` : url;
  }
  return new URL(url, request.url).toString();
};

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get('url');
  const wantsJson = searchParams.get('format') === 'json';

  if (!rawUrl) {
    const fallback = '/images/defaultcard.jpg';
    return wantsJson
      ? NextResponse.json({ url: fallback })
      : getRedirectResponse(new URL(fallback, request.url).toString());
  }

  let target: URL;
  try {
    target = new URL(rawUrl);
  } catch {
    const fallback = '/images/defaultcard.jpg';
    return wantsJson
      ? NextResponse.json({ url: fallback })
      : getRedirectResponse(new URL(fallback, request.url).toString());
  }

  if (!['http:', 'https:'].includes(target.protocol)) {
    const fallback = '/images/defaultcard.jpg';
    return wantsJson
      ? NextResponse.json({ url: fallback })
      : getRedirectResponse(new URL(fallback, request.url).toString());
  }

  try {
    const cacheKey = normalizeUrl(target.toString());
    const cache = getCache();
    const cached = cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      const cachedUrl = toAbsoluteUrl(cached.url, request);
      return wantsJson
        ? NextResponse.json({ url: cachedUrl }, { headers: { 'Cache-Control': CACHE_CONTROL } })
        : getRedirectResponse(cachedUrl);
    }

    const resolvedUrl = await resolveCardThumbnail(cacheKey);
    const absoluteUrl = toAbsoluteUrl(resolvedUrl, request);
    const ttl = resolvedUrl === '/images/defaultcard.jpg' ? NEGATIVE_TTL_MS : CACHE_TTL_MS;
    cache.set(cacheKey, { url: resolvedUrl, expiresAt: Date.now() + ttl });

    return wantsJson
      ? NextResponse.json({ url: absoluteUrl }, { headers: { 'Cache-Control': CACHE_CONTROL } })
      : getRedirectResponse(absoluteUrl);
  } catch {
    const fallback = '/images/defaultcard.jpg';
    return wantsJson
      ? NextResponse.json({ url: toAbsoluteUrl(fallback, request) })
      : getRedirectResponse(new URL(fallback, request.url).toString());
  }
};
