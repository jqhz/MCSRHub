/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from 'next';
import '@src/styles/globals.css';
import AppShell from '@src/components/AppShell';
import { Analytics } from "@vercel/analytics/next"
export const metadata: Metadata = {
  title: 'MCSR Hub',
  description: 'MCSR community hub',
  icons: {
    icon: 'images/MCSRHubIcon.png',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
        <Analytics />
      </body>
    </html>
  );
}