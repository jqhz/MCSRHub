/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from 'next';
import '@src/styles/globals.css';
import AppShell from '@src/components/AppShell';
import { Analytics } from "@vercel/analytics/next";
import path from 'path';
import { promises as fs } from 'fs';
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
    icon: 'images/MCSRHubIcon.png',
  },
};

const getInitialContent = async () => {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'content-store.json');
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw) as {
      cards: import('@src/data/content').CardItem[];
      playlists: import('@src/data/content').Playlist[];
    };
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