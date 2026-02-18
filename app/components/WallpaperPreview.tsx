"use client";

import { useRef, useEffect, useState } from "react";
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

export default function WallpaperPreview({
  device,
  croppedSrc,
  animalId,
  stickerXPercent,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bgImg, setBgImg] = useState<HTMLImageElement | null>(null);
  const [animalImg, setAnimalImg] = useState<HTMLImageElement | null>(null);
  const [previewWidth, setPreviewWidth] = useState(320);

  // Width-only sizing avoids iOS address-bar height jitter.
  useEffect(() => {
    let rafId: number | null = null;
    let timerId: number | null = null;

    const updateWidth = () => {
      const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
      const target = Math.max(140, Math.min(360, viewportWidth - 48));
      const rounded = Math.round(target);
      setPreviewWidth((prev) =>
        Math.abs(prev - rounded) < 1 ? prev : rounded,
      );
    };

    const scheduleUpdate = () => {
      if (timerId !== null) window.clearTimeout(timerId);
      timerId = window.setTimeout(() => {
        if (rafId !== null) window.cancelAnimationFrame(rafId);
        rafId = window.requestAnimationFrame(updateWidth);
      }, 100);
    };

    updateWidth();
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("orientationchange", scheduleUpdate);
    window.visualViewport?.addEventListener("resize", scheduleUpdate);

    return () => {
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("orientationchange", scheduleUpdate);
      window.visualViewport?.removeEventListener("resize", scheduleUpdate);
      if (timerId !== null) window.clearTimeout(timerId);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [device]);

  // Load background
  useEffect(() => {
    const img = new Image();
    img.onload = () => setBgImg(img);
    img.src = croppedSrc;
  }, [croppedSrc]);

  // Load animal
  useEffect(() => {
    const animal = getAnimalById(animalId);
    if (!animal) return;
    const img = new Image();
    img.onload = () => setAnimalImg(img);
    img.src = animal.src;
  }, [animalId]);

  // Draw preview
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !bgImg) return;
    const ctx = canvas.getContext("2d")!;
    const displayScale = previewWidth / device.width;

    const dw = Math.max(1, Math.round(previewWidth));
    const dh = Math.max(
      1,
      Math.round((previewWidth * device.height) / device.width),
    );
    canvas.width = dw;
    canvas.height = dh;

    // Background
    ctx.drawImage(bgImg, 0, 0, dw, dh);

    // Dynamic Island overlay
    const ir = device.islandRect;
    const irX = ir.x * displayScale;
    const irY = ir.y * displayScale;
    const irW = ir.w * displayScale;
    const irH = ir.h * displayScale;
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    const irRadius = irH / 2;
    ctx.beginPath();
    ctx.roundRect(irX, irY, irW, irH, irRadius);
    ctx.fill();

    // Animal sticker at fixed position with drop shadow
    if (animalImg) {
      const stickerAspect = animalImg.naturalWidth / animalImg.naturalHeight;
      const pos = getStickerPosition(
        device,
        stickerAspect,
        STICKER_H_NATIVE,
        stickerXPercent / 100,
      );
      const drawX = Math.round(pos.x * displayScale);
      const drawY = Math.round(pos.y * displayScale);
      const drawW = Math.max(1, Math.round(pos.w * displayScale));
      const drawH = Math.max(1, Math.round(pos.h * displayScale));

      // Drop shadow
      ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
      ctx.shadowBlur = 4 * displayScale;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2 * displayScale;

      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(animalImg, drawX, drawY, drawW, drawH);

      // Reset shadow
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
  }, [animalImg, bgImg, device, previewWidth, stickerXPercent]);

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-xl font-bold text-center">プレビュー</h2>
      <p className="text-zinc-400 text-sm text-center">
        スタンプはDynamic Island直上に自動配置されます
      </p>

      <div
        className="preview-shell rounded-[2rem] overflow-hidden border-4 border-zinc-700 shadow-2xl"
        style={{
          width: Math.max(1, Math.round(previewWidth)),
          aspectRatio: `${device.width} / ${device.height}`,
        }}
      >
        <canvas
          ref={canvasRef}
          className="block pixel-canvas"
          style={{ imageRendering: "pixelated", width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
}
