import { z } from 'zod';
import {
  SUPPORTED_FORMATS,
  MAX_SECRET_LENGTH,
  MAX_FILE_SIZE,
  SupportedImageFormat,
} from '../types';

// File validation schema
export const fileSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  size: z
    .number()
    .max(
      MAX_FILE_SIZE,
      `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`
    )
    .min(1, 'File cannot be empty'),
  type: z.enum(SUPPORTED_FORMATS as [string, ...string[]], {
    message: 'Only JPEG and PNG files are supported',
  }),
});

const secretText = z
  .string()
  .min(1, 'This field is required')
  .max(
    MAX_SECRET_LENGTH,
    `Text must be less than ${MAX_SECRET_LENGTH} characters`
  )
  .trim();

// Embed secret form schema for the Client side (uses FileList)
export const embedSecretClientSchema = z.object({
  secretText,
  imageFile: z
    .any()
    .refine(
      (fileList) => fileList instanceof FileList && fileList.length > 0,
      'Please select an image file'
    )
    .transform((fileList: FileList) => fileList[0])
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`
    )
    .refine(
      (file) => SUPPORTED_FORMATS.includes(file.type as SupportedImageFormat),
      'Only JPEG and PNG files are supported'
    ),
});

// Embed secret form schema for the Server side (File)
export const embedSecretServerSchema = z.object({
  secretText,
  imageFile: z
    .any()
    .refine((file) => file instanceof File, 'Invalid file format')
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`
    )
    .refine(
      (file) => SUPPORTED_FORMATS.includes(file.type as SupportedImageFormat),
      'Only JPEG and PNG files are supported'
    ),
});

// Extract secret form schema
export const extractSecretSchema = z.object({
  imageFile: z
    .instanceof(File)
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`
    )
    .refine(
      (file) => SUPPORTED_FORMATS.includes(file.type as SupportedImageFormat),
      'Only JPEG and PNG files are supported'
    ),
});

// ZIP payload schema for validation
export const zipPayloadSchema = z.object({
  encryptedSecret: z.string().min(1),
  timestamp: z.number().positive(),
  version: z.string().min(1),
});

// Form data schemas (for server actions)
export const embedFormDataSchema = z.object({
  secretText: z.string().min(1).max(MAX_SECRET_LENGTH).trim(),
  // FormData file will be validated separately in server action
});

export const extractFormDataSchema = z.object({
  // FormData file will be validated separately in server action
});

// Response validation schemas
export const embedResponseSchema = z.object({
  success: z.boolean(),
  modifiedImageData: z.string().optional(),
  originalFileName: z.string().optional(),
  error: z.string().optional(),
});

export const extractResponseSchema = z.object({
  success: z.boolean(),
  secretText: z.string().optional(),
  error: z.string().optional(),
});

// Type exports for convenience
export type EmbedSecretFormData = z.infer<typeof embedSecretClientSchema>;
export type ExtractSecretFormData = z.infer<typeof extractSecretSchema>;
export type ZipPayloadData = z.infer<typeof zipPayloadSchema>;
