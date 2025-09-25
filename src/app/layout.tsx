import type { Metadata, Viewport } from 'next';
import { Mulish } from 'next/font/google';

import { Providers } from '@/core/context/providers';
import { Toaster } from '@/core/components/ui/Sonner';
import { APP_NAME, BASE_URL } from '@/core/constants';

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
  title: `${APP_NAME} – Safe Embed in Image`,
  applicationName: APP_NAME,
  description: `A secure steganography web app that lets you hide encrypted messages inside images without altering their visible appearance.`,
  creator: 'Endeveron',
  metadataBase: new URL(BASE_URL),
  openGraph: {
    title: `${APP_NAME} – Safe Embed in Image`,
    description: `A secure steganography web app that lets you hide encrypted messages inside images without altering their visible appearance.`,
    siteName: APP_NAME,
    type: 'website',
    url: '/',
    locale: 'en_US',
    images: [
      {
        url: `${BASE_URL}/images/open-graph/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: `OG Image`,
        type: 'image/jpg',
      },
      {
        url: `${BASE_URL}/images/open-graph/og-image-square.jpg`,
        width: 1200,
        height: 1200,
        alt: `OG Image`,
        type: 'image/jpg',
      },
    ],
  },
  icons: {
    icon: {
      url: `${BASE_URL}/images/icons/favicon.ico`,
      type: 'image/image/ico',
    },
  },
  // Additional meta tags for messaging apps and social platforms
  other: {
    // WhatsApp and general mobile
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Games',

    // Pinterest
    'pinterest-rich-pin': 'true',

    // Generic social media
    robots: 'index, follow',
    googlebot: 'index, follow',

    // For better link previews in messaging apps
    'format-detection': 'telephone=no',
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
