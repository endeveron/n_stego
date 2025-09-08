'use server';

import {
  embedSecretSchema,
  extractSecretSchema,
} from '@/core/features/steganography/schemas';
import {
  embedSecretInImage,
  extractSecretFromImage,
} from '@/core/features/steganography/utils';
import { ServerActionResult } from '@/core/types/common';
import { handleActionError } from '@/core/utils/error';

export async function embedSecretAction(
  formData: FormData
): Promise<ServerActionResult<Uint8Array<ArrayBufferLike> | undefined>> {
  const errMsg = 'Unable to embed provided data.';
  try {
    // Extract data from FormData
    const secretText = formData.get('secretText') as string;
    const imageFile = formData.get('imageFile') as File;

    if (!secretText || !imageFile) {
      return handleActionError(`${errMsg} Missing input data.`);
    }

    // console.log('Server received data:', {
    //   secretText,
    //   fileName: imageFile?.name,
    //   fileSize: imageFile?.size,
    //   fileType: imageFile?.type,
    //   isFile: imageFile instanceof File,
    // });

    // Validate using your server schema
    const validatedData = embedSecretSchema.parse({
      imageFile,
      secretText,
    });

    if (!validatedData) {
      return handleActionError(`${errMsg} Invalid input data.`);
    }

    // console.log('Data validation passed:', {
    //   secretText: validatedData.secretText,
    //   imageFileName: validatedData.imageFile.name,
    //   imageFileSize: validatedData.imageFile.size,
    //   imageFileType: validatedData.imageFile.type,
    // });

    // Embed encrypted secret into image
    const { success, data, error } = await embedSecretInImage({
      imageFile,
      secretText,
    });
    if (error) {
      return handleActionError(`${errMsg} Could not create archive. ${error}`);
    }
    if (!success) {
      return handleActionError(`${errMsg} Could not create archive.`);
    }

    return {
      success: true,
      data, // The modified image
    };
  } catch (error) {
    console.error('Error in embedSecretAction:', error);

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

export async function extractSecretAction(
  formData: FormData
): Promise<ServerActionResult<Uint8Array<ArrayBufferLike> | undefined>> {
  const errMsg = 'Unable to extract data.';
  try {
    // Extract data from FormData
    const imageFile = formData.get('imageFile') as File;

    if (!imageFile) {
      return handleActionError(`${errMsg} Missing input data.`);
    }

    // Validate using your server schema
    const validatedData = extractSecretSchema.parse({
      imageFile,
    });

    if (!validatedData) {
      return handleActionError(`${errMsg} Invalid input data.`);
    }

    const { success, data, error } = await extractSecretFromImage(
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
    console.error('Error in embedSecretAction:', error);

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
