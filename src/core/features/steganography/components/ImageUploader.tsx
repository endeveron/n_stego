'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

import { FormControl, FormInput, FormMessage } from '@/core/components/ui/Form';
import { cn } from '@/core/utils';

type ImageUploaderProps = {
  onChange: (file: File) => void;
};

export default function ImageUploader({ onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [dragCounter, setDragCounter] = useState<number>(0);

  // Derived state for easier use in rendering
  const isDragOver = dragCounter > 0;

  // Drag event handlers
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => prev + 1);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => Math.max(0, prev - 1));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      setDragCounter(0);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const imgFile = files[0];
        onChange(imgFile);
        setPreviewFile(imgFile);
      }
    },
    [onChange]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const imgFile = files[0];
      onChange(imgFile);
      setPreviewFile(imgFile);
    }
  };

  useEffect(() => {
    if (!previewFile) return;

    const objectUrl = URL.createObjectURL(previewFile);
    return () => URL.revokeObjectURL(objectUrl);
  }, [previewFile]);

  return (
    <>
      <FormControl>
        <div
          data-drag-over={isDragOver}
          className={cn(
            'relative min-h-24 border-2 border-dashed p-4 rounded-md text-center cursor-pointer trans-c',
            isDragOver ? 'border-accent bg-accent/10' : 'border-border bg-input'
          )}
          onClick={() => inputRef.current?.click()}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {!previewFile && (
            <div className="h-full flex-center">
              <p className="text-sm text-muted">
                Pick or drag an image
                <br />
                JPG or PNG
              </p>
            </div>
          )}

          {previewFile && (
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-full max-w-40 h-40 mx-auto">
                <Image
                  key={previewFile.name}
                  src={URL.createObjectURL(previewFile)}
                  alt="Selected image"
                  fill
                  className="rounded-md object-contain"
                />
              </div>
            </div>
          )}

          <FormInput
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleChange}
            className="hidden"
          />
        </div>
      </FormControl>

      <FormMessage />
    </>
  );
}
