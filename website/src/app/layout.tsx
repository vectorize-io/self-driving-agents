import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { asset } from '@/lib/link';

export const metadata: Metadata = {
  title: {
    default: 'Self-Driving Agents',
    template: '%s — Self-Driving Agents',
  },
  description:
    'Agents that learn from every conversation and get better over time. Portable memory powered by Hindsight.',
  icons: {
    icon: asset('/favicon.svg'),
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
        />
      </head>
      <body className="flex min-h-dvh flex-col bg-ink-50 text-ink-800">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
