import JSZip from 'jszip';
import { encryptString, decryptString } from '@/core/lib/crypto';
import {
  SteganographyResult,
  ZipPayload,
  ZIP_SIGNATURE,
  SupportedImageFormat,
} from '../types';
import { zipPayloadSchema } from '../schemas';
import { ENCRYPTED_TEXT_FILENAME } from '@/core/features/steganography/constants';

/**
 * Convert File to Uint8Array
 */
export async function fileToUint8Array(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

/**
 * Convert Uint8Array to base64 string for download
 */
export function uint8ArrayToBase64(uint8Array: Uint8Array): string {
  let binaryString = '';
  const chunkSize = 0x8000; // 32KB chunks to avoid call stack overflow

  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(i, i + chunkSize);
    binaryString += String.fromCharCode.apply(null, Array.from(chunk));
  }

  return btoa(binaryString);
}

/**
 * Helper to find the end of JPEG data (EOI marker: 0xFF 0xD9)
 * For PNG, we'll append after the IEND chunk
 */
function findImageEndPosition(
  imageBytes: Uint8Array,
  format: SupportedImageFormat
): number {
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

  return imageBytes.length;
}

/**
 * Helper to create a ZIP archive containing the encrypted secret
 */
async function createSecretZip(encryptedText: string): Promise<Uint8Array> {
  const zip = new JSZip();

  // Add to ZIP
  zip.file(ENCRYPTED_TEXT_FILENAME, encryptedText);

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
 * Embed encrypted secret into image by appending ZIP data
 */
export async function embedSecretInImage({
  imageFile,
  encryptedText,
}: {
  imageFile: File;
  encryptedText: string;
}): Promise<SteganographyResult> {
  try {
    // Convert image to bytes
    const imageBytes = await fileToUint8Array(imageFile);

    // Create ZIP with encrypted text
    const zip = await createSecretZip(encryptedText);

    // Find where to append data (after image end markers)
    const imageEndPos = findImageEndPosition(
      imageBytes,
      imageFile.type as SupportedImageFormat
    );

    // Create new array with image + ZIP data
    const modifiedImage = new Uint8Array(imageEndPos + zip.length);

    // Copy original image data up to end position
    modifiedImage.set(imageBytes.subarray(0, imageEndPos), 0);

    // Append ZIP data
    modifiedImage.set(zip, imageEndPos);

    return {
      success: true,
      data: modifiedImage,
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
      imageFile.type as SupportedImageFormat
    );

    // Check if there's additional data after the image
    if (imageBytes.length <= imageEndPos) {
      throw new Error('No embedded data found in this image');
    }

    // Extract the appended data (should be ZIP)
    const zipData = imageBytes.subarray(imageEndPos);

    // Verify it's a valid ZIP by checking ZIP signature (PK)
    if (zipData.length < 4 || zipData[0] !== 0x50 || zipData[1] !== 0x4b) {
      throw new Error('No valid embedded data found in this image');
    }

    // Extract and decrypt secret
    const secretText = await extractSecretFromZip(zipData);

    return {
      success: true,
      data: new TextEncoder().encode(secretText), // Convert to Uint8Array for consistency
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
  const supportedFormats: SupportedImageFormat[] = [
    'image/jpeg',
    'image/jpg',
    'image/png',
  ];

  if (!supportedFormats.includes(file.type as SupportedImageFormat)) {
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
