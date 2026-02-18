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
  const [displayScale, setDisplayScale] = useState(1);

  // Calculate display scale with debounce and threshold to reduce iOS viewport jitter.
  useEffect(() => {
    let rafId: number | null = null;
    let timerId: number | null = null;

    const updateScale = () => {
      const viewportHeight =
        window.visualViewport?.height ?? window.innerHeight;
      const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
      const maxH = viewportHeight * 0.6;
      const maxW = Math.min(360, viewportWidth - 48);
      const rawScale = Math.min(maxW / device.width, maxH / device.height);
      const roundedScale = Math.max(0.1, Math.round(rawScale * 1000) / 1000);
      setDisplayScale((prev) =>
        Math.abs(prev - roundedScale) < 0.01 ? prev : roundedScale,
      );
    };

    const scheduleScaleUpdate = () => {
      if (timerId !== null) window.clearTimeout(timerId);
      timerId = window.setTimeout(() => {
        if (rafId !== null) window.cancelAnimationFrame(rafId);
        rafId = window.requestAnimationFrame(updateScale);
      }, 100);
    };

    updateScale();
    window.addEventListener("resize", scheduleScaleUpdate);
    window.addEventListener("orientationchange", scheduleScaleUpdate);
    window.visualViewport?.addEventListener("resize", scheduleScaleUpdate);

    return () => {
      window.removeEventListener("resize", scheduleScaleUpdate);
      window.removeEventListener("orientationchange", scheduleScaleUpdate);
      window.visualViewport?.removeEventListener("resize", scheduleScaleUpdate);
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

    const dw = Math.max(1, Math.round(device.width * displayScale));
    const dh = Math.max(1, Math.round(device.height * displayScale));
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
  }, [bgImg, animalImg, device, displayScale, stickerXPercent]);

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-xl font-bold text-center">プレビュー</h2>
      <p className="text-zinc-400 text-sm text-center">
        スタンプはDynamic Island直上に自動配置されます
      </p>

      <div
        className="preview-shell rounded-[2rem] overflow-hidden border-4 border-zinc-700 shadow-2xl"
        style={{
          width: Math.max(1, Math.round(device.width * displayScale)),
          height: Math.max(1, Math.round(device.height * displayScale)),
        }}
      >
        <canvas
          ref={canvasRef}
          className="block pixel-canvas"
          style={{ imageRendering: "pixelated" }}
        />
      </div>
    </div>
  );
}
