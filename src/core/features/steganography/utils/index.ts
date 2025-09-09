import { ZIP_SIGNATURE } from '@/core/features/steganography/constants';
import { decryptString, encryptString } from '@/core/lib/crypto';
import JSZip from 'jszip';
import { zipPayloadSchema } from '../schemas';
import { SteganographyResult, SupportedImageType, ZipPayload } from '../types';

/**
 * Convert File to Uint8Array
 */
export async function fileToUint8Array(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

/**
 * Convert Uint8Array to string
 */
export function uint8ArrayToString(data: Uint8Array<ArrayBufferLike>): string {
  const decoder = new TextDecoder('utf-8');
  return decoder.decode(data);
}

/**
 * Helper to find the end of JPEG data (EOI marker: 0xFF 0xD9)
 * For PNG, we'll append after the IEND chunk
 */
function findImageEndPosition(
  imageBytes: Uint8Array,
  format: SupportedImageType
): number {
  console.log('format', format);

  if (format === 'image/jpeg' || format === 'image/jpg') {
    // Look for JPEG EOI marker (0xFF 0xD9)
    for (let i = imageBytes.length - 2; i >= 0; i--) {
      if (imageBytes[i] === 0xff && imageBytes[i + 1] === 0xd9) {
        return i + 2; // Position after EOI marker
      }
    }
    // If no EOI found, append at the end
    return imageBytes.length;
  } else if (format === 'image/png') {
    // PNG: look for IEND chunk (0x49 0x45 0x4E 0x44)
    for (let i = imageBytes.length - 8; i >= 0; i--) {
      if (
        imageBytes[i] === 0x49 &&
        imageBytes[i + 1] === 0x45 &&
        imageBytes[i + 2] === 0x4e &&
        imageBytes[i + 3] === 0x44
      ) {
        return i + 8; // Position after IEND chunk (4 bytes chunk name + 4 bytes CRC)
      }
    }
    // If no IEND found, append at the end
    return imageBytes.length;
  }
  // } else if (format === 'image/png') {
  //   // PNG IEND chunk format: 4 bytes length (== 0), 4 bytes 'IEND', 4 bytes CRC
  //   for (let i = imageBytes.length - 12; i >= 0; i--) {
  //     // Check for the IEND chunk (starts with 0x00 0x00 0x00 0x00 0x49 0x45 0x4E 0x44)
  //     if (
  //       imageBytes[i] === 0x00 &&
  //       imageBytes[i + 1] === 0x00 &&
  //       imageBytes[i + 2] === 0x00 &&
  //       imageBytes[i + 3] === 0x00 &&
  //       imageBytes[i + 4] === 0x49 && // I
  //       imageBytes[i + 5] === 0x45 && // E
  //       imageBytes[i + 6] === 0x4e && // N
  //       imageBytes[i + 7] === 0x44 // D
  //     ) {
  //       return i + 12; // Entire IEND chunk = 12 bytes
  //     }
  //   }
  //   // If no IEND found, append at the end
  //   return imageBytes.length;
  // }

  return imageBytes.length;
}

/**
 * Helper to create a ZIP archive containing the encrypted secret
 */
async function createSecretZip(secretText: string): Promise<Uint8Array> {
  const zip = new JSZip();

  // Encrypt the secret
  const encryptedSecret = encryptString(secretText);

  // Create payload with metadata
  const payload: ZipPayload = {
    encryptedSecret,
    timestamp: Date.now(),
    version: ZIP_SIGNATURE,
  };

  // Add to ZIP
  zip.file('secret.json', JSON.stringify(payload));

  // Generate ZIP as Uint8Array
  const zipData = await zip.generateAsync({
    type: 'uint8array',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }, // Maximum compression
  });

  return zipData;
}

/**
 * Helper to extract and decrypt secret from ZIP data
 */
async function extractSecretFromZip(zipData: Uint8Array): Promise<string> {
  try {
    const zip = new JSZip();
    await zip.loadAsync(zipData);

    const secretFile = zip.file('secret.json');
    if (!secretFile) {
      throw new Error('Secret file not found in embedded data');
    }

    const jsonContent = await secretFile.async('string');
    const payload = JSON.parse(jsonContent);

    // Validate payload structure
    const validatedPayload = zipPayloadSchema.parse(payload);

    // Verify version signature
    if (validatedPayload.version !== ZIP_SIGNATURE) {
      throw new Error('Invalid or unsupported embedded data format');
    }

    // Decrypt the secret
    const decryptedSecret = decryptString(validatedPayload.encryptedSecret);

    if (!decryptedSecret) {
      throw new Error(
        'Failed to decrypt secret - invalid data or wrong passphrase'
      );
    }

    return decryptedSecret;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to extract secret: ${error.message}`);
    }
    throw new Error('Failed to extract secret: Unknown error');
  }
}

/**
 * Embed secret into image by appending ZIP data
 */
export async function embedSecretInImage({
  imageFile,
  secretText,
}: {
  imageFile: File;
  secretText: string;
}): Promise<SteganographyResult> {
  try {
    // Convert image to bytes
    const imageBytes = await fileToUint8Array(imageFile);

    // Create ZIP with encrypted text
    const zip = await createSecretZip(secretText);

    // Find where to append data (after image end markers)
    const imageEndPos = findImageEndPosition(
      imageBytes,
      imageFile.type as SupportedImageType
    );

    // Create new array with image + ZIP data
    const unit8Array = new Uint8Array(imageEndPos + zip.length);

    // Copy original image data up to end position
    unit8Array.set(imageBytes.subarray(0, imageEndPos), 0);

    // Append ZIP data
    unit8Array.set(zip, imageEndPos);

    return {
      success: true,
      data: {
        unit8Array,
        imageType: imageFile.type as SupportedImageType,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Extract and decrypt secret from image with embedded data
 */
export async function extractSecretFromImage(
  imageFile: File
): Promise<SteganographyResult> {
  try {
    // Convert image to bytes
    const imageBytes = await fileToUint8Array(imageFile);

    // Find where original image ends
    const imageEndPos = findImageEndPosition(
      imageBytes,
      imageFile.type as SupportedImageType
    );

    // Check if there's additional data after the image
    if (imageBytes.length <= imageEndPos) {
      throw new Error('No embeded data found in this image');
    }

    // Extract the appended data (should be ZIP)
    const zipData = imageBytes.subarray(imageEndPos);

    // Verify it's a valid ZIP by checking ZIP signature (PK)
    if (zipData.length < 4 || zipData[0] !== 0x50 || zipData[1] !== 0x4b) {
      throw new Error('No valid embeded data found in this image');
    }

    // Extract and decrypt secret
    const secretText = await extractSecretFromZip(zipData);

    return {
      success: true,
      data: {
        unit8Array: new TextEncoder().encode(secretText),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Validate image format and size
 */
export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  const supportedFormats: SupportedImageType[] = [
    'image/jpeg',
    'image/jpg',
    'image/png',
  ];

  if (!supportedFormats.includes(file.type as SupportedImageType)) {
    return {
      valid: false,
      error: 'Only JPEG and PNG files are supported',
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'File is empty',
    };
  }

  if (file.size > 10 * 1024 * 1024) {
    // 10MB
    return {
      valid: false,
      error: 'File size must be less than 10MB',
    };
  }

  return { valid: true };
}

/**
 * Generate filename for the modified image
 */
export function generateModifiedFilename(originalFilename: string): string {
  const lastDotIndex = originalFilename.lastIndexOf('.');
  const nameWithoutExt =
    lastDotIndex !== -1
      ? originalFilename.substring(0, lastDotIndex)
      : originalFilename;
  const extension =
    lastDotIndex !== -1 ? originalFilename.substring(lastDotIndex) : '';

  return `${nameWithoutExt}_with_secret${extension}`;
}
