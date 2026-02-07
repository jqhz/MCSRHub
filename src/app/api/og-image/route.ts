import { NextResponse } from 'next/server';

const FALLBACK_PATH = '/images/defaultcard.jpg';

const getFallbackResponse = (request: Request) => {
  const response = NextResponse.redirect(new URL(FALLBACK_PATH, request.url), 302);
  response.headers.set(
    'Cache-Control',
    'public, s-maxage=86400, stale-while-revalidate=604800',
  );
  return response;
};

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
    const hostname = target.hostname.replace('www.', '');
    if (
      hostname === 'discord.gg' ||
      (hostname === 'discord.com' && target.pathname.startsWith('/invite/'))
    ) {
      const inviteCode =
        hostname === 'discord.gg'
          ? target.pathname.replace('/', '')
          : target.pathname.split('/invite/')[1]?.split('/')[0] ?? '';
      if (inviteCode) {
        const inviteResponse = await fetch(
          `https://discord.com/api/v9/invites/${inviteCode}?with_counts=true`,
        );
        if (inviteResponse.ok) {
          const inviteData = (await inviteResponse.json()) as {
            guild?: { id?: string; icon?: string };
          };
          const guildId = inviteData.guild?.id;
          const guildIcon = inviteData.guild?.icon;
          if (guildId && guildIcon) {
            const iconUrl = `https://cdn.discordapp.com/icons/${guildId}/${guildIcon}.png?size=512`;
            const response = NextResponse.redirect(iconUrl, 302);
            response.headers.set(
              'Cache-Control',
              'public, s-maxage=86400, stale-while-revalidate=604800',
            );
            return response;
          }
        }
        return new NextResponse(null, { status: 404 });
      }
    }

    const response = await fetch(target.toString(), {
      headers: { 'User-Agent': 'MCSRHub/1.0' },
    });
    const html = await response.text();
    const ogImage =
      getMetaContent(html, 'og:image') || getMetaContent(html, 'twitter:image');
    if (!ogImage) return getFallbackResponse(request);

    const resolved = new URL(ogImage, target).toString();
    const response2 = NextResponse.redirect(resolved, 302);
    response2.headers.set(
      'Cache-Control',
      'public, s-maxage=86400, stale-while-revalidate=604800',
    );
    return response2;
  } catch {
    return getFallbackResponse(request);
  }
};
