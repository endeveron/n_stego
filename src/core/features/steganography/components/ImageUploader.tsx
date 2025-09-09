'use client';

import {
  FormControl,
  FormInput,
  FormMessage,
  // useFormField,
} from '@/core/components/ui/Form';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

type ImageUploaderProps = {
  onChange: (file: File) => void;
};

export default function ImageUploader({ onChange }: ImageUploaderProps) {
  // const { error } = useFormField();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
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
          className="relative min-h-24 border-2 border-dashed border-border p-4 rounded-md text-center cursor-pointer hover:bg-popover-focus trans-c"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
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
