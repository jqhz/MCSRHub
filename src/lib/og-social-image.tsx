import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { OG_IMAGE_SIZE } from '@src/lib/og-social-image.constants';
import { toAbsoluteImageUrl, toAbsoluteUrl } from '@src/lib/site-url';

const BRAND = {
  background: '#0c0f14',
  panel: '#121826',
  accent: '#5eead4',
  text: '#f8fafc',
  muted: '#94a3b8',
} as const;

let fontDataPromise: Promise<ArrayBuffer> | undefined;

const loadFont = () => {
  fontDataPromise ??= readFile(
    join(process.cwd(), 'src/assets/fonts/Minecraft.otf'),
  ).then((buffer) => buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
  return fontDataPromise;
};

const truncate = (value: string, maxLength: number) =>
  value.length <= maxLength ? value : `${value.slice(0, maxLength - 1).trimEnd()}…`;

export interface OgSocialImageInput {
  title: string;
  eyebrow?: string;
  description?: string;
  imageUrl?: string;
}

export async function renderOgSocialImage({
  title,
  eyebrow = 'MCSR Hub',
  description,
  imageUrl,
}: OgSocialImageInput) {
  const fontData = await loadFont();
  const logoUrl = toAbsoluteUrl('/images/MCSRHubIgloo.png');
  const featuredImage = toAbsoluteImageUrl(imageUrl);
  const safeTitle = truncate(title, 72);
  const safeDescription = description ? truncate(description, 140) : undefined;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          backgroundColor: BRAND.background,
          fontFamily: 'Minecraftia',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: featuredImage ? 1.15 : 1,
            padding: '56px 64px',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <img
              src={logoUrl}
              alt=""
              width={56}
              height={56}
              style={{ borderRadius: 12 }}
            />
            <div
              style={{
                display: 'flex',
                fontSize: 28,
                color: BRAND.accent,
                letterSpacing: 1,
              }}
            >
              {eyebrow}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div
              style={{
                display: 'flex',
                fontSize: 64,
                lineHeight: 1.05,
                color: BRAND.text,
                letterSpacing: -1,
              }}
            >
              {safeTitle}
            </div>
            {safeDescription ? (
              <div
                style={{
                  display: 'flex',
                  fontSize: 28,
                  lineHeight: 1.35,
                  color: BRAND.muted,
                  maxWidth: featuredImage ? 560 : 900,
                }}
              >
                {safeDescription}
              </div>
            ) : null}
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: 24,
              color: BRAND.muted,
            }}
          >
            mcsrhub.vercel.app
          </div>
        </div>

        {featuredImage ? (
          <div
            style={{
              display: 'flex',
              flex: 0.85,
              padding: '40px 48px 40px 0',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                width: '100%',
                height: '100%',
                borderRadius: 24,
                overflow: 'hidden',
                border: `3px solid ${BRAND.accent}`,
                backgroundColor: BRAND.panel,
              }}
            >
              <img
                src={featuredImage}
                alt=""
                width={OG_IMAGE_SIZE.width}
                height={OG_IMAGE_SIZE.height}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
          </div>
        ) : null}
      </div>
    ),
    {
      ...OG_IMAGE_SIZE,
      fonts: [
        {
          name: 'Minecraftia',
          data: fontData,
          style: 'normal',
          weight: 400,
        },
      ],
    },
  );
}
