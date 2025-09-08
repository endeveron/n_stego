'use server';

import { embedSecretServerSchema } from '@/core/features/steganography/schemas';
import { EmbedSecretResult } from '@/core/features/steganography/types';
import { embedSecretInImage } from '@/core/features/steganography/utils';
import { encryptString } from '@/core/lib/crypto';
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
    const validatedData = embedSecretServerSchema.parse({
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

    // Encrypt the secret text
    const encryptedText = encryptString(validatedData.secretText);
    // console.log('[Debug] Secret encrypted successfully:', {
    //   originalLength: validatedData.secretText.length,
    //   encryptedLength: encryptedSecret.length,
    //   encryptedPreview: encryptedSecret.substring(0, 20) + '...',
    // });

    // Embed encrypted secret into image
    const { success, data, error } = await embedSecretInImage({
      imageFile,
      encryptedText,
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
