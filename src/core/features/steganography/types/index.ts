export interface EmbedSecretRequest {
  imageFile: File;
  secretText: string;
}

export interface EmbedSecretResult {
  originalFileName: string;
  secretLength: number;
  encryptedLength: number;
  fileSize: number;
}

// export interface EmbedSecretResponse {
//   success: boolean;
//   modifiedImageData?: string; // Base64 encoded image with embedded secret
//   originalFileName?: string;
//   error?: string;
// }

export interface ExtractSecretRequest {
  imageFile: File;
}

export interface ExtractSecretResponse {
  success: boolean;
  secretText?: string;
  error?: string;
}

export interface SteganographyResult {
  success: boolean;
  data?: Uint8Array;
  error?: string;
}

export interface ZipPayload {
  encryptedSecret: string;
  timestamp: number;
  version: string;
}

// Supported image formats
export type SupportedImageFormat = 'image/jpeg' | 'image/jpg' | 'image/png';

// Constants
export const SUPPORTED_FORMATS: SupportedImageFormat[] = [
  'image/jpeg',
  'image/jpg',
  'image/png',
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_SECRET_LENGTH = 5000; // characters
export const ZIP_SIGNATURE = 'STEG_V1'; // Version signature for our embedded data
