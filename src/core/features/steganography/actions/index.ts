'use server';

import { embedSecretServerSchema } from '@/core/features/steganography/schemas';
import { ServerActionResult } from '@/core/types/common';
import { handleActionError } from '@/core/utils/error';

interface EmbedSecretResult {
  originalFileName: string;
  secretLength: number;
  fileSize: number;
}

export async function embedSecretAction(
  formData: FormData
): Promise<ServerActionResult<EmbedSecretResult>> {
  try {
    // Extract data from FormData
    const secretText = formData.get('secretText') as string;
    const imageFile = formData.get('imageFile') as File;

    console.log('Server received data:', {
      secretText,
      fileName: imageFile?.name,
      fileSize: imageFile?.size,
      fileType: imageFile?.type,
      isFile: imageFile instanceof File,
    });

    // Validate using your server schema
    const validatedData = embedSecretServerSchema.parse({
      secretText,
      imageFile,
    });

    console.log('Data validation passed:', {
      secretText: validatedData.secretText,
      imageFileName: validatedData.imageFile.name,
      imageFileSize: validatedData.imageFile.size,
      imageFileType: validatedData.imageFile.type,
    });

    // TODO: Next steps will be implemented here
    // 1. Encrypt the secret text
    // 2. Create ZIP archive with encrypted data
    // 3. Concatenate ZIP to image
    // 4. Return the modified image

    return {
      success: true,
      data: {
        originalFileName: validatedData.imageFile.name,
        secretLength: validatedData.secretText.length,
        fileSize: validatedData.imageFile.size,
      },
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
