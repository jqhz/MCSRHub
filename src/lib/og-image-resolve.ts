const FETCH_TIMEOUT_MS = 3_500;
const DISCORD_TIMEOUT_MS = 2_500;

export type CardImageResolveResult =
  | { source: 'discord-icon'; url: string }
  | { source: 'og'; url: string }
  | { source: 'fallback' };

export const getMetaContent = (html: string, property: string): string => {
  const regex = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
    'i',
  );
  const match = html.match(regex);
  return match?.[1] ?? '';
};

const getDiscordInviteCode = (target: URL): string | null => {
  const hostname = target.hostname.replace(/^www\./, '');
  if (hostname === 'discord.gg') {
    const code = target.pathname.replace(/^\//, '').split('/')[0];
    return code || null;
  }
  if (hostname === 'discord.com' && target.pathname.startsWith('/invite/')) {
    return target.pathname.split('/invite/')[1]?.split('/')[0] ?? null;
  }
  return null;
};

const resolveDiscordIcon = async (target: URL): Promise<string | null> => {
  const inviteCode = getDiscordInviteCode(target);
  if (!inviteCode) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DISCORD_TIMEOUT_MS);
  try {
    const inviteResponse = await fetch(
      `https://discord.com/api/v9/invites/${inviteCode}?with_counts=true`,
      { signal: controller.signal },
    );
    if (!inviteResponse.ok) return null;

    const inviteData = (await inviteResponse.json()) as {
      guild?: { id?: string; icon?: string };
    };
    const guildId = inviteData.guild?.id;
    const guildIcon = inviteData.guild?.icon;
    if (!guildId || !guildIcon) return null;

    return `https://cdn.discordapp.com/icons/${guildId}/${guildIcon}.png?size=512`;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

/** Mirrors /api/og-image resolution before the screenshot-manifest layer. */
export const resolveCardImageUrl = async (rawUrl: string): Promise<CardImageResolveResult> => {
  const target = new URL(rawUrl);

  if (getDiscordInviteCode(target)) {
    const discordIcon = await resolveDiscordIcon(target);
    if (discordIcon) {
      return { source: 'discord-icon', url: discordIcon };
    }
    return { source: 'fallback' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(target.toString(), {
      headers: { 'User-Agent': 'MCSRHub/1.0' },
      signal: controller.signal,
    });
    const html = await response.text();
    const ogImage =
      getMetaContent(html, 'og:image') || getMetaContent(html, 'twitter:image');
    if (!ogImage) {
      return { source: 'fallback' };
    }

    return { source: 'og', url: new URL(ogImage, target).toString() };
  } catch {
    return { source: 'fallback' };
  } finally {
    clearTimeout(timeout);
  }
};

export const needsScreenshot = (result: CardImageResolveResult): boolean =>
  result.source === 'fallback';
