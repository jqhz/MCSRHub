/* eslint-disable react-refresh/only-export-components */
import type { Metadata, Viewport } from 'next';
import '@src/styles/globals.css';
import AppShell from '@src/components/AppShell';
import { Analytics } from "@vercel/analytics/next";
import { getContent } from '@src/db/queries';
export const metadata: Metadata = {
  title: {
    default: 'MCSR Hub',
    template: '%s | MCSR Hub',
  },
  description:
    'MCSR Hub is a community-driven index of Minecraft speedrunning tutorials, tech, tools, and resources with searchable playlists and curated links.',
  metadataBase: new URL('https://mcsrhub.vercel.app'),
  openGraph: {
    title: 'MCSR Hub',
    description:
      'Find Minecraft speedrunning tutorials, tech, tools, and community resources in one searchable hub.',
    url: '/',
    siteName: 'MCSR Hub',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MCSR Hub',
    description:
      'Find Minecraft speedrunning tutorials, tech, tools, and community resources in one searchable hub.',
  },
  icons: {
    icon: '/images/MCSRHubIgloo.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
};

// Content lives in NeonDB and is managed by the private ResourceQ app.
const getInitialContent = async () => {
  try {
    return await getContent();
  } catch {
    return { cards: [], playlists: [] };
  }
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialContent = await getInitialContent();

  return (
    <html lang="en">
      <body>
        <AppShell initialContent={initialContent}>{children}</AppShell>
        <Analytics />
      </body>
    </html>
  );
}