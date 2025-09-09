import JSZip from 'jszip';

import { ZIP_SIGNATURE } from '@/core/features/steganography/constants';
import { decryptString, encryptString } from '@/core/lib/crypto';
import { ZipPayloadData, zipPayloadSchema } from '../schemas';
import { SteganographyResult, SupportedImageType } from '../types';

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

  return imageBytes.length;
}

/**
 * Helper to create a ZIP archive containing the encrypted text
 */
async function createZip(embedText: string): Promise<Uint8Array> {
  const zip = new JSZip();

  // Encrypt the text
  const encryptedText = encryptString(embedText);

  // Create payload with metadata
  const payload: ZipPayloadData = {
    encryptedText,
    timestamp: Date.now(),
    version: ZIP_SIGNATURE,
  };

  // Add to ZIP
  zip.file('data.json', JSON.stringify(payload));

  // Generate ZIP as Uint8Array
  const zipData = await zip.generateAsync({
    type: 'uint8array',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }, // Maximum compression
  });

  return zipData;
}

/**
 * Helper to extract and decrypt text from ZIP data
 */
async function extractTextFromZip(zipData: Uint8Array): Promise<string> {
  try {
    const zip = new JSZip();
    await zip.loadAsync(zipData);

    const dataFile = zip.file('data.json');
    if (!dataFile) {
      throw new Error('Embedded data file not found');
    }

    const jsonContent = await dataFile.async('string');
    const payload = JSON.parse(jsonContent);

    // Validate payload structure
    const validatedPayload = zipPayloadSchema.parse(payload);

    // Verify version signature
    if (validatedPayload.version !== ZIP_SIGNATURE) {
      throw new Error('Invalid or unsupported embedded data format');
    }

    // Decrypt the text
    const decryptedText = decryptString(validatedPayload.encryptedText);

    if (!decryptedText) {
      throw new Error(
        'Failed to decrypt text - invalid data or wrong passphrase'
      );
    }

    return decryptedText;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to extract text: ${error.message}`);
    }
    throw new Error('Failed to extract text: Unknown error');
  }
}

/**
 * Embed text into image by appending ZIP data
 */
export async function embedTextInImage({
  imageFile,
  embedText,
}: {
  imageFile: File;
  embedText: string;
}): Promise<SteganographyResult> {
  try {
    // Convert image to bytes
    const imageBytes = await fileToUint8Array(imageFile);

    // Create ZIP with encrypted text
    const zip = await createZip(embedText);

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
 * Extract and decrypt text from image with embedded data
 */
export async function extractTextFromImage(
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

    // Extract and decrypt text
    const embedText = await extractTextFromZip(zipData);

    return {
      success: true,
      data: {
        unit8Array: new TextEncoder().encode(embedText),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
