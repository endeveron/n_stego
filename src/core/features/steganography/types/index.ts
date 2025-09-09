export type SteganographyData = {
  unit8Array: Uint8Array<ArrayBufferLike>;
  imageType?: SupportedImageType;
};

export interface SteganographyResult {
  success: boolean;
  data?: SteganographyData;
  error?: string;
}

export type SupportedImageType = 'image/jpeg' | 'image/jpg' | 'image/png';
