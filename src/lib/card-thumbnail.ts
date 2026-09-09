import { getScreenshotPath } from '@src/lib/card-screenshots';
import { resolveCardImageUrl } from '@src/lib/og-image-resolve';

export const FALLBACK_CARD_IMAGE = '/images/defaultcard.jpg';

/** Final img src for a card URL (Discord icon, og:image, screenshot, or fallback). */
export const resolveCardThumbnail = async (rawUrl: string): Promise<string> => {
  const resolved = await resolveCardImageUrl(rawUrl);
  if (resolved.source !== 'fallback') {
    return resolved.url;
  }
  return getScreenshotPath(rawUrl) ?? FALLBACK_CARD_IMAGE;
};
