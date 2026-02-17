"use client";

import { useCallback } from "react";
import {
  DeviceTemplate,
  getStickerPosition,
  STICKER_H_NATIVE,
} from "../lib/devices";
import { getAnimalById } from "../lib/animals";

interface Props {
  device: DeviceTemplate;
  croppedSrc: string;
  animalId: string;
  stickerXPercent: number;
}

export default function DownloadButton({
  device,
  croppedSrc,
  animalId,
  stickerXPercent,
}: Props) {
  const handleDownload = useCallback(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = device.width;
    canvas.height = device.height;
    const ctx = canvas.getContext("2d")!;

    // Draw background at full resolution
    const bgImg = new Image();
    bgImg.src = croppedSrc;
    await new Promise<void>((res) => {
      bgImg.onload = () => res();
    });
    ctx.drawImage(bgImg, 0, 0, device.width, device.height);

    // Draw animal at fixed position (same computation as preview)
    const animal = getAnimalById(animalId);
    if (!animal) return;
    const animalImg = new Image();
    animalImg.src = animal.src;
    await new Promise<void>((res) => {
      animalImg.onload = () => res();
    });

    const stickerAspect = animalImg.naturalWidth / animalImg.naturalHeight;
    const pos = getStickerPosition(
      device,
      stickerAspect,
      STICKER_H_NATIVE,
      stickerXPercent / 100,
    );

    // Drop shadow (matches preview)
    ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(animalImg, pos.x, pos.y, pos.w, pos.h);

    // Reset shadow
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Download
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `wallpaper_${device.id}_${device.width}x${device.height}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }, [device, croppedSrc, animalId, stickerXPercent]);

  return (
    <button
      onClick={handleDownload}
      className="
        px-10 py-4 rounded-full text-lg font-bold
        bg-gradient-to-r from-green-500 to-emerald-600
        text-white shadow-xl shadow-green-600/30
        hover:from-green-400 hover:to-emerald-500
        transition-all duration-200 hover:scale-[1.03]
        flex items-center gap-3
      "
    >
      <span className="text-2xl">⬇️</span>
      PNGをダウンロード
    </button>
  );
}
