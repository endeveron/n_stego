import { SupportedImageType } from '@/core/features/steganography/types';

export const INPUT_IMAGE_MAX_SIZE = 10 * 1024 * 1024; // 10MB

export const INPUT_TEXT_MAX_LENGTH = 2000; // 2000 characters ~2–8 KB

export const OUTPUT_IMAGE_FILENAME = 'image';

export const ZIP_SIGNATURE = 'STEG_V1'; // Version signature for embedded data

export const RESET_TIMEOUT = 10000;

export const SUPPORTED_IMAGE_TYPES: SupportedImageType[] = [
  'image/jpeg',
  'image/jpg',
  'image/png',
];

export const imageTypeMap = new Map<SupportedImageType, string>([
  ['image/jpeg', '.jpg'],
  ['image/jpg', '.jpg'],
  ['image/png', '.png'],
]);
