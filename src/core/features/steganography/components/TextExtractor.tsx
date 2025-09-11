'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/core/components/ui/Button';
import { Form, FormField, FormItem } from '@/core/components/ui/Form';
import Loading from '@/core/components/ui/Loading';
import { extractTextAction } from '@/core/features/steganography/actions';
import CardTitle from '@/core/features/steganography/components/CardTitle';
import Countdown from '@/core/features/steganography/components/Countdown';
import ImageUploader from '@/core/features/steganography/components/ImageUploader';
import { RESET_TIMEOUT } from '@/core/features/steganography/constants';
import {
  extractTextSchema,
  type ExtractTextData,
} from '@/core/features/steganography/schemas';
import { uint8ArrayToString } from '@/core/features/steganography/utils';
import { useClipboard } from '@/core/hooks/useClipboard';
import { cn } from '@/core/utils';

export default function TextExtractor() {
  const { copy } = useClipboard();
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const form = useForm<ExtractTextData>({
    resolver: zodResolver(extractTextSchema),
  });

  const handleCopyToClipboard = () => {
    if (!result?.trim()) return;

    copy(result);
    toast('Copied to clipboard');
  };

  const handleReset = () => {
    setResult(null);
  };

  const onSubmit = async (data: ExtractTextData) => {
    setIsProcessing(true);

    try {
      // Create FormData to send to server action
      const formData = new FormData();
      formData.append('imageFile', data.imageFile);

      // Call server action
      const res = await extractTextAction(formData);

      if (res.success) {
        if (res.data) {
          setResult(uint8ArrayToString(res.data.unit8Array));
          form.reset();
        }
      } else {
        console.error('TextExtractor:', res.error);
        toast(res.error.message ?? 'Unable to extract');
      }
    } catch (error) {
      console.error('TextExtractor:', error);
      toast('Oops! Something went wrong. Please try again later');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (result) {
      timeout = setTimeout(() => {
        setResult(null);
      }, RESET_TIMEOUT);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [result]);

  return (
    <div className="relative mt-10 lg:mt-0 w-full max-w-md p-6 rounded-2xl bg-card trans-c">
      <CardTitle>Extract</CardTitle>

      {result ? (
        <>
          <div className="absolute -top-3 -right-3 rounded-full bg-background p-1 trans-c">
            <Countdown />
          </div>

          <div className="min-h-24 flex-center flex-col gap-4 p-6 rounded-lg bg-popover-focus cursor-default trans-c">
            <div className="text-lg font-bold">{result}</div>
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
              Reset
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
