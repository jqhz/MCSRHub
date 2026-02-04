import { NextResponse } from 'next/server';

const FALLBACK_PATH = '/images/defaultcard.jpg';

const getFallbackResponse = (request: Request) =>
  NextResponse.redirect(new URL(FALLBACK_PATH, request.url), 302);

const getMetaContent = (html: string, property: string) => {
  const regex = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
    'i',
  );
  const match = html.match(regex);
  return match?.[1] ?? '';
};

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get('url');
  if (!rawUrl) return getFallbackResponse(request);

  let target: URL;
  try {
    target = new URL(rawUrl);
  } catch {
    return getFallbackResponse(request);
  }

  if (!['http:', 'https:'].includes(target.protocol)) {
    return getFallbackResponse(request);
  }

  try {
    const response = await fetch(target.toString(), {
      headers: { 'User-Agent': 'MCSRHub/1.0' },
    });
    const html = await response.text();
    const ogImage =
      getMetaContent(html, 'og:image') || getMetaContent(html, 'twitter:image');
    if (!ogImage) return getFallbackResponse(request);

    const resolved = new URL(ogImage, target).toString();
    return NextResponse.redirect(resolved, 302);
  } catch {
    return getFallbackResponse(request);
  }
};
