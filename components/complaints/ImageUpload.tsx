"use client";

import { useRef, useState } from "react";
import { ImagePlus, X, ImageOff } from "lucide-react";

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE_MB = 8;

export function ImageUpload({
  onImage,
}: {
  onImage: (file: { name: string; dataUrl: string } | null) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    setError(null);
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Unsupported file type. Please upload a JPG, PNG or WEBP image.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Image is too large. Please upload a file under ${MAX_SIZE_MB}MB.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      setFileName(file.name);
      onImage({ name: file.name, dataUrl });
    };
    reader.onerror = () => setError("Could not read this image. Please try another file.");
    reader.readAsDataURL(file);
  };

  const clear = () => {
    setPreview(null);
    setFileName(null);
    onImage(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {!preview ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border-strong bg-navy-50/40 px-6 py-10 text-center hover:bg-navy-50"
        >
          <ImagePlus className="h-6 w-6 text-navy-600" />
          <span className="text-[13.5px] font-semibold text-ink-900">Upload Image</span>
          <span className="text-[12px] text-ink-500">JPG, JPEG, PNG or WEBP — up to {MAX_SIZE_MB}MB</span>
        </button>
      ) : (
        <div className="relative overflow-hidden rounded-lg border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Uploaded civic issue" className="max-h-72 w-full object-cover" />
          <button
            type="button"
            onClick={clear}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/75"
            aria-label="Remove image"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <div className="border-t border-border bg-surface px-3 py-2 text-[12px] text-ink-500">{fileName}</div>
        </div>
      )}
      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-[12.5px] text-critical">
          <ImageOff className="h-3.5 w-3.5" /> {error}
        </p>
      )}
    </div>
  );
}
