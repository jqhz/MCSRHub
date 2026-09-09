import { createHash } from 'crypto';
import manifest from '@src/data/card-screenshots.json';

export type ScreenshotManifestEntry = {
  path: string;
  capturedAt: string;
};

export type ScreenshotManifest = {
  entries: Record<string, ScreenshotManifestEntry>;
};

const SCREENSHOT_DIR = '/images/card-screenshots';

export const normalizeUrl = (rawUrl: string): string => {
  const url = new URL(rawUrl);
  url.hostname = url.hostname.replace(/^www\./, '').toLowerCase();
  if (url.protocol === 'http:') {
    url.protocol = 'https:';
  }
  if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.slice(0, -1);
  }
  return url.toString();
};

const buildNormalizedManifest = (): Map<string, string> => {
  const map = new Map<string, string>();
  for (const [key, entry] of Object.entries((manifest as ScreenshotManifest).entries)) {
    map.set(normalizeUrl(key), entry.path);
  }
  return map;
};

const normalizedManifest = buildNormalizedManifest();

export const hashUrl = (rawUrl: string): string => {
  const normalized = normalizeUrl(rawUrl);
  return createHash('sha256').update(normalized).digest('hex').slice(0, 16);
};

export const getScreenshotFilePath = (rawUrl: string): string =>
  `${SCREENSHOT_DIR}/${hashUrl(rawUrl)}.webp`;

export const getScreenshotPath = (rawUrl: string): string | null => {
  const key = normalizeUrl(rawUrl);
  return normalizedManifest.get(key) ?? null;
};
