/**
 * Batch-captures 16:9 website screenshots for cards that would otherwise
 * show /images/defaultcard.jpg (no DB image, no Discord icon, no og:image).
 * Run: npm run capture-screenshots [-- --local] [-- --limit N]
 */
import 'dotenv/config';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import type { CardItem } from '../src/data/content';
import {
  getScreenshotFilePath,
  normalizeUrl,
  type ScreenshotManifest,
} from '../src/lib/card-screenshots';
import { needsScreenshot, resolveCardImageUrl } from '../src/lib/og-image-resolve';

const PROD_CONTENT_URL = 'https://mcsrhub.vercel.app/api/content';
const VIEWPORT = { width: 800, height: 450 };
const NAV_TIMEOUT_MS = 15_000;
const DELAY_BETWEEN_MS = 1_500;
const PROBE_DELAY_MS = 500;

const MANIFEST_PATH = path.join(process.cwd(), 'src/data/card-screenshots.json');
const SCREENSHOT_DIR = path.join(process.cwd(), 'public/images/card-screenshots');

const isYouTubeUrl = (url: string): boolean => {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '').toLowerCase();
    return hostname === 'youtu.be' || hostname.endsWith('youtube.com');
  } catch {
    return false;
  }
};

const isDiscordUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./, '').toLowerCase();
    return (
      hostname === 'discord.gg' ||
      (hostname === 'discord.com' && parsed.pathname.startsWith('/invite/'))
    );
  } catch {
    return false;
  }
};

const parseArgs = () => {
  const args = process.argv.slice(2);
  const local = args.includes('--local');
  const limitIndex = args.indexOf('--limit');
  const limit =
    limitIndex >= 0 && args[limitIndex + 1]
      ? Number.parseInt(args[limitIndex + 1]!, 10)
      : undefined;
  return { local, limit: Number.isFinite(limit) ? limit : undefined };
};

const loadManifest = (): ScreenshotManifest => {
  const raw = readFileSync(MANIFEST_PATH, 'utf-8');
  return JSON.parse(raw) as ScreenshotManifest;
};

const saveManifest = (manifest: ScreenshotManifest) => {
  writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf-8');
};

const fetchCards = async (local: boolean): Promise<CardItem[]> => {
  if (local) {
    const { getContent } = await import('../src/db/queries');
    const store = await getContent();
    return store.cards;
  }

  const response = await fetch(PROD_CONTENT_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch content: ${response.status} ${response.statusText}`);
  }
  const data = (await response.json()) as { cards: CardItem[] };
  return data.cards;
};

const getCandidateUrls = (cards: CardItem[], manifest: ScreenshotManifest): string[] => {
  const seen = new Set<string>();
  const urls: string[] = [];

  for (const card of cards) {
    if (card.archived) continue;
    if (card.image?.trim()) continue;
    if (!card.url?.trim()) continue;
    if (isYouTubeUrl(card.url)) continue;
    if (isDiscordUrl(card.url)) continue;

    const normalized = normalizeUrl(card.url);
    if (manifest.entries[normalized]) continue;
    if (seen.has(normalized)) continue;

    seen.add(normalized);
    urls.push(normalized);
  }

  return urls;
};

const filterUrlsNeedingScreenshot = async (urls: string[]): Promise<string[]> => {
  const eligible: string[] = [];

  for (const url of urls) {
    const resolved = await resolveCardImageUrl(url);
    if (needsScreenshot(resolved)) {
      eligible.push(url);
      continue;
    }

    const via = resolved.source === 'og' ? 'og:image' : 'discord icon';
    console.log(`  skip (${via}): ${url}`);
    await sleep(PROBE_DELAY_MS);
  }

  return eligible;
};

const captureScreenshot = async (
  browser: Awaited<ReturnType<typeof chromium.launch>>,
  url: string,
  outputPath: string,
): Promise<void> => {
  const page = await browser.newPage({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
  });

  try {
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: NAV_TIMEOUT_MS });
    } catch {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT_MS });
    }

    const pngBuffer = await page.screenshot({
      type: 'png',
      clip: { x: 0, y: 0, width: VIEWPORT.width, height: VIEWPORT.height },
    });

    await sharp(pngBuffer).webp({ quality: 80 }).toFile(outputPath);
  } finally {
    await page.close();
  }
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const main = async () => {
  const { local, limit } = parseArgs();
  const manifest = loadManifest();
  const cards = await fetchCards(local);
  const candidates = getCandidateUrls(cards, manifest);

  if (candidates.length === 0) {
    console.log('No new candidate URLs.');
    return;
  }

  console.log(`Probing ${candidates.length} candidate URL(s) for missing og:image...`);
  let urls = await filterUrlsNeedingScreenshot(candidates);

  if (limit !== undefined) {
    urls = urls.slice(0, limit);
  }

  if (urls.length === 0) {
    console.log('No URLs need screenshots (all have og:image or discord icons).');
    return;
  }

  mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const failures: string[] = [];
  let captured = 0;

  console.log(`Capturing ${urls.length} screenshot(s)...`);

  const browser = await chromium.launch({ headless: true });
  try {
    for (const url of urls) {
      const relativePath = getScreenshotFilePath(url);
      const outputPath = path.join(process.cwd(), 'public', relativePath.replace(/^\//, ''));

      try {
        console.log(`  ${url}`);
        await captureScreenshot(browser, url, outputPath);
        manifest.entries[url] = {
          path: relativePath,
          capturedAt: new Date().toISOString(),
        };
        saveManifest(manifest);
        captured += 1;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`  FAILED ${url}: ${message}`);
        failures.push(url);
      }

      await sleep(DELAY_BETWEEN_MS);
    }
  } finally {
    await browser.close();
  }

  console.log(`Done. Captured ${captured}/${urls.length}.`);
  if (failures.length > 0) {
    console.log('Failures:');
    for (const url of failures) {
      console.log(`  - ${url}`);
    }
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
