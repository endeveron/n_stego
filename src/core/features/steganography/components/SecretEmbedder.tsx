'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { embedSecretClientSchema } from '../schemas';
import type { EmbedSecretFormData } from '../schemas';
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
import ImageUploader from '@/core/features/steganography/components/ImageUploader';
import { embedSecretAction } from '@/core/features/steganography/actions';

export default function SecretEmbedder() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EmbedSecretFormData>({
    resolver: zodResolver(embedSecretClientSchema),
    defaultValues: {
      imageFile: undefined,
      secretText: 'Hello!',
    },
  });

  // const selectedFile = form.watch('imageFile');

  const onSubmit = async (data: EmbedSecretFormData) => {
    console.log('Form data:', {
      secretText: data.secretText,
      fileName: data.imageFile.name,
      fileSize: data.imageFile.size,
      fileType: data.imageFile.type,
    });

    setIsSubmitting(true);

    try {
      // Create FormData to send to server action
      const formData = new FormData();
      formData.append('secretText', data.secretText);
      formData.append('imageFile', data.imageFile);

      // Call server action
      const result = await embedSecretAction(formData);

      if (result.success) {
        console.log('Success! Server response:', result.data);
        // TODO: Handle success (e.g., show toast, download file, etc.)
      } else {
        console.error('Server error:', result.error);
        // TODO: Handle error (e.g., show error toast)
      }
    } catch (error) {
      console.error('Client error:', error);
      // TODO: Handle client-side error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Embed Secret in Image</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Secret Text Input using custom Textarea */}
          <FormField
            control={form.control}
            name="secretText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Secret Text</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter your secret text here..."
                    rows={4}
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
                <FormLabel>Image File</FormLabel>
                <ImageUploader onChange={field.onChange} />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <div className="flex-center">
            <Button variant="accent" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : 'Embed Secret'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
