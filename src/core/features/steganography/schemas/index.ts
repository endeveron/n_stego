import { z } from 'zod';

import {
  INPUT_IMAGE_MAX_SIZE,
  INPUT_TEXT_MAX_LENGTH,
  SUPPORTED_IMAGE_TYPES,
} from '@/core/features/steganography/constants';
import { SupportedImageType } from '@/core/features/steganography/types';

const imageFile = z
  .any()
  .refine((file) => file instanceof File, 'Provide a valid image')
  .refine(
    (file) => file?.size <= INPUT_IMAGE_MAX_SIZE,
    `File size must be less than ${INPUT_IMAGE_MAX_SIZE / 1024 / 1024}MB`
  )
  .refine(
    (file) => SUPPORTED_IMAGE_TYPES.includes(file?.type as SupportedImageType),
    'Only JPEG and PNG files are supported'
  );

// Embed text schema
export const embedTextSchema = z.object({
  embedText: z
    .string()
    .min(1, 'Required')
    .max(
      INPUT_TEXT_MAX_LENGTH,
      `Text must be less than ${INPUT_TEXT_MAX_LENGTH} characters`
    )
    .trim()
    .regex(
      /^[a-zA-Z0-9\s.,!?'"():;\-_]+$/,
      'Only letters, numbers, and basic punctuation are allowed'
    ),
  imageFile,
});

// Extract text schema
export const extractTextSchema = z.object({
  imageFile,
});

// ZIP payload schema for validation
export const zipPayloadSchema = z.object({
  encryptedText: z.string().min(1),
  timestamp: z.number().positive(),
  version: z.string().min(1),
});

// Type exports for convenience
export type EmbedTextData = z.infer<typeof embedTextSchema>;
export type ExtractTextData = z.infer<typeof extractTextSchema>;
export type ZipPayloadData = z.infer<typeof zipPayloadSchema>;
