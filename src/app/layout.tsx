import type { Metadata, Viewport } from 'next';
import { Mulish } from 'next/font/google';

import { Providers } from '@/core/context/providers';
import { Toaster } from '@/core/components/ui/Sonner';
import { APP_NAME } from '@/core/constants';

import '@/core/globals.css';

export const viewport: Viewport = {
  interactiveWidget: 'resizes-content',
  viewportFit: 'cover',
};

const mulishSans = Mulish({
  variable: '--font-mulish-sans',
  subsets: ['cyrillic', 'latin'],
});

export const metadata: Metadata = {
  title: `${APP_NAME} — Embed Text in Image`,
  applicationName: APP_NAME,
  description: `A secure steganography web app that lets you hide encrypted messages inside images without altering their visible appearance.`,
  creator: 'Endeveron',
  icons: {
    icon: {
      url: `https://n-stego.vercel.app/favicon.ico`,
      type: 'image/image/ico',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${mulishSans.variable} antialiased`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
