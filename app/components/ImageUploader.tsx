"use client";

import { useRef, useCallback } from "react";

interface Props {
  onImageLoaded: (dataUrl: string) => void;
}

export default function ImageUploader({ onImageLoaded }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          onImageLoaded(reader.result);
        }
      };
      reader.readAsDataURL(file);
    },
    [onImageLoaded],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  return (
    <div className="w-full max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-6 text-center">
        🖼️ 画像をアップロード
      </h2>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
        className="
          border-2 border-dashed border-zinc-600 rounded-2xl p-12
          flex flex-col items-center justify-center gap-4
          cursor-pointer transition-all duration-200
          hover:border-blue-500 hover:bg-blue-500/5
          min-h-[240px]
        "
      >
        <div className="text-5xl">📂</div>
        <p className="text-zinc-300 text-center">
          クリックまたはドラッグ&ドロップで
          <br />
          画像を選択
        </p>
        <p className="text-zinc-500 text-sm">JPG, PNG, WebP 対応</p>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
