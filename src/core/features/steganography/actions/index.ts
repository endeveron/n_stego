'use server';

import {
  embedTextSchema,
  extractTextSchema,
} from '@/core/features/steganography/schemas';
import { SteganographyData } from '@/core/features/steganography/types';
import {
  embedTextInImage,
  extractTextFromImage,
} from '@/core/features/steganography/utils';
import { ServerActionResult } from '@/core/types/common';
import { handleActionError } from '@/core/utils/error';

export async function embedTextAction(
  formData: FormData
): Promise<ServerActionResult<SteganographyData | undefined>> {
  const errMsg = 'Unable to embed provided data.';
  try {
    // Extract data from FormData
    const embedText = formData.get('embedText') as string;
    const imageFile = formData.get('imageFile') as File;

    if (!embedText || !imageFile) {
      return handleActionError(`${errMsg} Missing input data.`);
    }

    // Validate using your server schema
    const validatedData = embedTextSchema.parse({
      imageFile,
      embedText,
    });

    if (!validatedData) {
      return handleActionError(`${errMsg} Invalid input data.`);
    }

    // Embed encrypted text into image
    const { success, data, error } = await embedTextInImage({
      imageFile,
      embedText,
    });
    if (!success || error) {
      const message = `${errMsg} Could not create archive.${
        error ? ' ' + error : ''
      }`;
      return handleActionError(message);
    }

    return {
      success: true,
      data, // The modified image
    };
  } catch (error) {
    console.error('Error in embedTextAction:', error);

    if (error && typeof error === 'object' && 'issues' in error) {
      // Zod error
      const zodError = error as { issues: Array<{ message: string }> };
      return handleActionError(
        `Validation error: ${
          zodError.issues[0]?.message || 'Validation failed'
        }`
      );
    }

    return handleActionError(
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
  }
}

export async function extractTextAction(
  formData: FormData
): Promise<ServerActionResult<SteganographyData | undefined>> {
  const errMsg = 'Unable to extract.';
  try {
    // Extract data from FormData
    const imageFile = formData.get('imageFile') as File;

    if (!imageFile) {
      return handleActionError(`${errMsg} Missing input data.`);
    }

    // Validate using your server schema
    const validatedData = extractTextSchema.parse({
      imageFile,
    });

    if (!validatedData) {
      return handleActionError(`${errMsg} Invalid input data.`);
    }

    const { success, data, error } = await extractTextFromImage(
      validatedData.imageFile
    );
    if (error) {
      return handleActionError(`${errMsg} ${error}`);
    }
    if (!success) {
      return handleActionError(errMsg);
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Error in embedTextAction:', error);

    if (error && typeof error === 'object' && 'issues' in error) {
      // Zod error
      const zodError = error as { issues: Array<{ message: string }> };
      return handleActionError(
        `Validation error: ${
          zodError.issues[0]?.message || 'Validation failed'
        }`
      );
    }

    return handleActionError(
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
  }
}
