import { MetadataRoute } from 'next';
import { APP_NAME } from '@/core/constants';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${APP_NAME} – Text in Image`,
    short_name: APP_NAME,
    description:
      'A secure steganography app that lets you hide encrypted messages inside images.',
    start_url: '/',
    display: 'standalone',
    background_color: '#07AFA5',
    theme_color: '#07AFA5',
    icons: [
      {
        src: '/images/icons/favicon.ico',
        sizes: 'any',
        type: 'image/ico',
      },
      {
        src: '/images/icons/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/images/icons/icon-256x256.png',
        sizes: '256x256',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/images/icons/android-icon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/images/icons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/images/icons/icon-48x48.png',
        sizes: '48x48',
        type: 'image/png',
      },
      {
        src: '/images/icons/icon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/images/icons/icon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
    ],
  };
}
