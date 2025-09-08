'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/core/components/ui/Button';
import { Form, FormField, FormItem } from '@/core/components/ui/Form';
import Loading from '@/core/components/ui/Loading';
import { extractSecretAction } from '@/core/features/steganography/actions';
import ImageUploader from '@/core/features/steganography/components/ImageUploader';
import {
  extractSecretSchema,
  type ExtractSecretData,
} from '@/core/features/steganography/schemas';
import { uint8ArrayToString } from '@/core/features/steganography/utils';
import { useClipboard } from '@/core/hooks/useClipboard';
import { cn } from '@/core/utils';

export default function SecretExtractor() {
  const { copy } = useClipboard();
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const form = useForm<ExtractSecretData>({
    resolver: zodResolver(extractSecretSchema),
  });

  // const selectedFile = form.watch('imageFile');

  const handleCopyToClipboard = () => {
    if (!result?.trim()) return;

    copy(result);
    toast('Copied to clipboard');
  };

  const handleReset = () => {
    setResult(null);
  };

  const onSubmit = async (data: ExtractSecretData) => {
    setIsProcessing(true);

    try {
      // Create FormData to send to server action
      const formData = new FormData();
      formData.append('imageFile', data.imageFile);

      // Call server action
      const res = await extractSecretAction(formData);

      if (res.success) {
        if (res.data) {
          setResult(uint8ArrayToString(res.data));
          form.reset();
        }
      } else {
        console.error('Server error:', res.error);
        toast('Server error');
      }
    } catch (error) {
      console.error('Client error:', error);
      toast('Oops! Something went wrong');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-md pt-0 px-6 pb-8 border-border/50 border-2 rounded-2xl trans-a">
      <div className="flex-center -translate-y-6">
        <h1 className="w-fit text-2xl text-center text-title font-bold  bg-background px-4 trans-c">
          Extract Secret from Image
        </h1>
      </div>

      {result ? (
        <>
          <div className="min-h-24 flex-center flex-col gap-4 p-6 rounded-lg bg-input/40 cursor-default trans-c">
            <div className="text-lg font-semibold">{result}</div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex-center gap-8">
            <Button
              onClick={handleCopyToClipboard}
              className="px-8"
              variant="secondary"
              disabled={isProcessing}
            >
              Copy
            </Button>
            <Button
              onClick={handleReset}
              className="px-8"
              variant="secondary"
              disabled={isProcessing}
            >
              Clear
            </Button>
          </div>
        </>
      ) : (
        <div className="relative">
          <div
            className={cn(
              'absolute z-10 opacity-0 inset-0 pointer-events-none flex-center',
              isProcessing && 'opacity-100'
            )}
          >
            <Loading />
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className={cn(
                'min-h-24 space-y-6 trans-o',
                isProcessing && 'opacity-5 pointer-events-none'
              )}
            >
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
                  {isProcessing ? 'Processing...' : 'Extract'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
}
