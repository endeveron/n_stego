import { SupportedImageType } from '@/core/features/steganography/types';

export const SUPPORTED_IMAGE_TYPES: SupportedImageType[] = [
  'image/jpeg',
  'image/jpg',
  'image/png',
];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_SECRET_LENGTH = 5000; // characters
export const ZIP_SIGNATURE = 'STEG_V1'; // Version signature for our embedded data

export const OUTPUT_IMAGE_FILENAME = 'image';
export const RESET_TIMEOUT = 10000;

export const imageTypeMap = new Map<SupportedImageType, string>([
  ['image/jpeg', '.jpg'],
  ['image/jpg', '.jpg'],
  ['image/png', '.png'],
]);
