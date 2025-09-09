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

export type SteganographyData = {
  unit8Array: Uint8Array<ArrayBufferLike>;
  imageType?: SupportedImageType;
};

export interface SteganographyResult {
  success: boolean;
  data?: SteganographyData;
  error?: string;
}

export interface ZipPayload {
  encryptedSecret: string;
  timestamp: number;
  version: string;
}

// Supported image types
export type SupportedImageType = 'image/jpeg' | 'image/jpg' | 'image/png';
