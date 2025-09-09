import {
  MAX_FILE_SIZE,
  MAX_SECRET_LENGTH,
  SUPPORTED_IMAGE_TYPES,
} from '@/core/features/steganography/constants';
import { SupportedImageType } from '@/core/features/steganography/types';
import { z } from 'zod';

const imageFile = z
  .any()
  .refine((file) => file instanceof File, 'Provide a valid image')
  .refine(
    (file) => file?.size <= MAX_FILE_SIZE,
    `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`
  )
  .refine(
    (file) => SUPPORTED_IMAGE_TYPES.includes(file?.type as SupportedImageType),
    'Only JPEG and PNG files are supported'
  );

// Embed secret schema (uses a single File)
export const embedSecretSchema = z.object({
  secretText: z
    .string()
    .min(1, 'Required')
    .max(
      MAX_SECRET_LENGTH,
      `Text must be less than ${MAX_SECRET_LENGTH} characters`
    )
    .trim(),
  imageFile,
});

// Extract secret schema (uses a single File)
export const extractSecretSchema = z.object({
  imageFile,
});

// ZIP payload schema for validation
export const zipPayloadSchema = z.object({
  encryptedSecret: z.string().min(1),
  timestamp: z.number().positive(),
  version: z.string().min(1),
});

// Type exports for convenience
export type EmbedSecretData = z.infer<typeof embedSecretSchema>;
export type ExtractSecretData = z.infer<typeof extractSecretSchema>;
export type ZipPayloadData = z.infer<typeof zipPayloadSchema>;
