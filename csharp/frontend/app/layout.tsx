import type { Metadata } from 'next';
import { IBM_Plex_Mono, Space_Grotesk } from 'next/font/google';
import './globals.css';

const display = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' });
const body = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-body' });

export const metadata: Metadata = {
  title: 'Service Platform',
  description: 'Multi-stack service portal with request, auth, and admin flows.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable}`}>{children}</body>
    </html>
  );
}
