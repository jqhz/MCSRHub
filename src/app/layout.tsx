import type { Metadata } from 'next';
import '@src/styles/globals.css';
export const metadata: Metadata = {
  title: 'MCSRHub',
  description: 'MCSR community hub',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}