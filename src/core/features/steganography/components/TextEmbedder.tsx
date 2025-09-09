'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/core/components/ui/Button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormTextarea,
} from '@/core/components/ui/Form';
import Loading from '@/core/components/ui/Loading';
import { embedTextAction } from '@/core/features/steganography/actions';
import CardTitle from '@/core/features/steganography/components/CardTitle';
import Countdown from '@/core/features/steganography/components/Countdown';
import ImageUploader from '@/core/features/steganography/components/ImageUploader';
import {
  imageTypeMap,
  OUTPUT_IMAGE_FILENAME,
  RESET_TIMEOUT,
} from '@/core/features/steganography/constants';
import {
  embedTextSchema,
  type EmbedTextData,
} from '@/core/features/steganography/schemas';
import {
  SteganographyData,
  SupportedImageType,
} from '@/core/features/steganography/types';
import { cn } from '@/core/utils';

export default function TextEmbedder() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEmbed, setIsEmbed] = useState(false);

  const form = useForm<EmbedTextData>({
    resolver: zodResolver(embedTextSchema),
  });

  const downloadImage = (data: SteganographyData) => {
    const copied = new Uint8Array(data.unit8Array.length);
    // Copy data into new buffer backed by ArrayBuffer
    copied.set(data.unit8Array);

    const blob = new Blob([copied], { type: data.imageType });

    // Create an object URL
    const url = URL.createObjectURL(blob);

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = url;
    link.download =
      OUTPUT_IMAGE_FILENAME +
      imageTypeMap.get(data.imageType as SupportedImageType);
    document.body.appendChild(link);
    link.click();

    // Clean up
    link.remove();
    URL.revokeObjectURL(url);

    form.reset();
    setIsEmbed(true);
  };

  const onSubmit = async (data: EmbedTextData) => {
    setIsProcessing(true);

    try {
      // Create FormData to send to server action
      const formData = new FormData();
      formData.append('embedText', data.embedText);
      formData.append('imageFile', data.imageFile);

      // Call server action
      const res = await embedTextAction(formData);

      if (res.success) {
        if (res.data) {
          downloadImage(res.data);
        }
      } else {
        console.error('TextEmbedder:', res.error);
        toast(res.error.message ?? 'Unable to embed data');
      }
    } catch (error) {
      console.error('TextEmbedder:', error);
      toast('Oops! Something went wrong. Please try again later');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isEmbed) {
      timeout = setTimeout(() => {
        setIsEmbed(false);
      }, RESET_TIMEOUT);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isEmbed]);

  return (
    <div className="relative w-full max-w-md p-6 rounded-2xl bg-card shadow-xs dark:shadow-none trans-c">
      <CardTitle>Embed</CardTitle>

      {isEmbed ? (
        <>
          <div className="absolute -top-3 -right-3 rounded-full bg-background p-1 trans-c">
            <Countdown />
          </div>
          <div className="w-full flex-center flex-col p-6 rounded-lg bg-input/40 cursor-default trans-c">
            <div className="text-2xl -translate-y-2 font-black text-title">
              Success!
            </div>
            <div className="text-muted text-sm text-center">
              Check your downloads folder. <br />
              The image now contains an encrypted embed.
            </div>
          </div>
        </>
      ) : (
        <div className="relative">
          <div
            className={cn(
              'absolute opacity-0 inset-0 pointer-events-none flex-center',
              isProcessing && 'opacity-100'
            )}
          >
            <Loading />
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className={cn(
                'min-h-24 space-y-4 trans-o',
                isProcessing && 'opacity-5 pointer-events-none'
              )}
            >
              {/* Text Input */}
              <FormField
                control={form.control}
                name="embedText"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FormTextarea
                        className="min-h-24 text-lg font-bold"
                        placeholder="Enter your text for embedding here..."
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
                  {isProcessing ? 'Processing...' : 'Embed'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
}
