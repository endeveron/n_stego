'use client';

import { Button } from '@/core/components/ui/Button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/core/components/ui/Form';
import { Textarea } from '@/core/components/ui/Textarea';
import { embedSecretAction } from '@/core/features/steganography/actions';
import ImageUploader from '@/core/features/steganography/components/ImageUploader';
import {
  FORM_TOGGLE_TIMEOUT,
  OUTPUT_IMAGE_FILENAME,
} from '@/core/features/steganography/constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { EmbedSecretFormData } from '../schemas';
import { embedSecretClientSchema } from '../schemas';
import { cn } from '@/core/utils';

export default function SecretEmbedder() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEmbed, setIsEmbed] = useState(false);

  const form = useForm<EmbedSecretFormData>({
    resolver: zodResolver(embedSecretClientSchema),
    defaultValues: {
      imageFile: undefined,
      secretText: 'Hello!',
    },
  });

  // const selectedFile = form.watch('imageFile');

  const downloadImage = (data: Uint8Array<ArrayBufferLike>) => {
    // const typedArray = data;
    const copied = new Uint8Array(data.length);
    // Copy data into new buffer backed by ArrayBuffer
    copied.set(data);

    const blob = new Blob([copied], { type: 'image/jpeg' });

    // Create an object URL
    const url = URL.createObjectURL(blob);

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = url;
    link.download = OUTPUT_IMAGE_FILENAME;
    document.body.appendChild(link);
    link.click();

    // Clean up
    link.remove();
    URL.revokeObjectURL(url);

    form.reset();
    setIsEmbed(true);
  };

  const onSubmit = async (data: EmbedSecretFormData) => {
    // console.log('Form data:', {
    //   secretText: data.secretText,
    //   fileName: data.imageFile.name,
    //   fileSize: data.imageFile.size,
    //   fileType: data.imageFile.type,
    // });

    setIsProcessing(true);

    try {
      // Create FormData to send to server action
      const formData = new FormData();
      formData.append('secretText', data.secretText);
      formData.append('imageFile', data.imageFile);

      // Call server action
      const res = await embedSecretAction(formData);

      if (res.success) {
        if (res.data) {
          downloadImage(res.data);
        }
      } else {
        console.error('Server error:', res.error);
        // TODO: Handle error (e.g., show error toast)
      }
    } catch (error) {
      console.error('Client error:', error);
      // TODO: Handle client-side error
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isEmbed) {
      timeout = setTimeout(() => {
        setIsEmbed(false);
      }, FORM_TOGGLE_TIMEOUT);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isEmbed]);

  return (
    <div className="w-full max-w-md mx-auto pt-0 px-6 pb-8 border-border/50 border-2 rounded-2xl trans-a">
      <div className="flex-center -translate-y-6">
        <h1 className="w-fit text-2xl text-center text-title font-bold  bg-background px-4 trans-c">
          Embed Secret in Image
        </h1>
      </div>

      {isEmbed ? (
        <div className="w-full flex-center flex-col gap-4 p-6 rounded-lg bg-input/40 cursor-default trans-c">
          <div className="text-2xl font-bold dark:text-teal-400">
            Completed!
          </div>
          <div className="text-muted text-sm text-center">
            Check your downloads folder. <br />
            The image now contains an encrypted embed.
          </div>
        </div>
      ) : (
        <div
          className={cn(
            'trans-o',
            isProcessing && 'opacity-20 pointer-events-none'
          )}
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Text Input */}
              <FormField
                control={form.control}
                name="secretText"
                render={({ field }) => (
                  <FormItem>
                    {/* <FormLabel>Text</FormLabel> */}
                    <FormControl>
                      <Textarea
                        placeholder="Enter your secret text here..."
                        rows={8}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image File Input */}
              <FormField
                control={form.control}
                name="imageFile"
                render={({ field }) => (
                  <FormItem>
                    {/* <FormLabel>Image File</FormLabel> */}
                    <ImageUploader onChange={field.onChange} />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="flex-center">
                <Button
                  className="px-8"
                  variant="accent"
                  type="submit"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'GO'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
}
