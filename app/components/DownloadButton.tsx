"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
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

type ActionKind = "share" | "openView" | null;

const VIEW_BLOB_URL_KEY = "wallpaper_view_blob_url";
const RETURN_TO_KEY = "returnTo";

export default function DownloadButton({
  device,
  croppedSrc,
  animalId,
  stickerXPercent,
}: Props) {
  const router = useRouter();
  const fileName = `wallpaper_${device.id}_${device.width}x${device.height}.png`;
  const openViewLockRef = useRef(false);
  const actionRef = useRef<ActionKind>(null);

  const shareSupported = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return typeof navigator.share === "function" && typeof File !== "undefined";
  }, []);

  const clearPendingAction = useCallback(() => {
    actionRef.current = null;
  }, []);

  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) clearPendingAction();
    };
    const onVisibilityChange = () => {
      if (!document.hidden) clearPendingAction();
    };

    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [clearPendingAction]);

  const revokeObjectUrlLater = useCallback((url: string, delayMs: number = 60000) => {
    window.setTimeout(() => URL.revokeObjectURL(url), delayMs);
  }, []);

  const canvasToPngBlob = useCallback((canvas: HTMLCanvasElement) => {
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Failed to create PNG blob"));
          return;
        }
        resolve(blob);
      }, "image/png");
    });
  }, []);

  const loadImage = useCallback((src: string) => {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  }, []);

  const renderWallpaperCanvas = useCallback(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = device.width;
    canvas.height = device.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");

    const bgImg = await loadImage(croppedSrc);
    ctx.drawImage(bgImg, 0, 0, device.width, device.height);

    const animal = getAnimalById(animalId);
    if (!animal) throw new Error("Animal not found");
    const animalImg = await loadImage(animal.src);

    const stickerAspect = animalImg.naturalWidth / animalImg.naturalHeight;
    const pos = getStickerPosition(
      device,
      stickerAspect,
      STICKER_H_NATIVE,
      stickerXPercent / 100,
    );

    ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(animalImg, pos.x, pos.y, pos.w, pos.h);

    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    return canvas;
  }, [animalId, croppedSrc, device, loadImage, stickerXPercent]);

  const makePngBlob = useCallback(async () => {
    const canvas = await renderWallpaperCanvas();
    return canvasToPngBlob(canvas);
  }, [canvasToPngBlob, renderWallpaperCanvas]);

  const openView = useCallback(async () => {
    if (openViewLockRef.current) return;
    openViewLockRef.current = true;
    window.setTimeout(() => {
      openViewLockRef.current = false;
    }, 800);

    actionRef.current = "openView";
    try {
      const blob = await makePngBlob();
      const url = URL.createObjectURL(blob);
      const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      sessionStorage.setItem(RETURN_TO_KEY, returnTo);
      const prevUrl = sessionStorage.getItem(VIEW_BLOB_URL_KEY);
      if (prevUrl) URL.revokeObjectURL(prevUrl);
      sessionStorage.setItem(VIEW_BLOB_URL_KEY, url);
      router.push("/view");
    } catch (err) {
      console.error(err);
    } finally {
      clearPendingAction();
    }
  }, [clearPendingAction, makePngBlob, router]);

  const handleDownload = useCallback(async () => {
    try {
      const blob = await makePngBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.rel = "noopener";
      a.click();
      revokeObjectUrlLater(url);
    } catch (err) {
      console.error(err);
    }
  }, [fileName, makePngBlob, revokeObjectUrlLater]);

  const handleOpenForSave = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!e.isTrusted) return;
      await openView();
    },
    [openView],
  );

  const handleShare = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!e.isTrusted) return;

      if (!shareSupported || typeof navigator === "undefined") {
        await openView();
        return;
      }

      actionRef.current = "share";
      try {
        const blob = await makePngBlob();
        const file = new File([blob], fileName, { type: "image/png" });
        const nav = navigator as Navigator & {
          canShare?: (data?: ShareData) => boolean;
        };

        if (nav.canShare && !nav.canShare({ files: [file] })) {
          await openView();
          return;
        }

        await navigator.share({
          title: "Wallpaper PNG",
          files: [file],
        });
      } catch (err: unknown) {
        const name = err instanceof DOMException ? err.name : "";
        if (name === "AbortError") {
          // User canceled share sheet; do not trigger openView.
          return;
        }
        console.error(err);
      } finally {
        clearPendingAction();
      }
    },
    [clearPendingAction, fileName, makePngBlob, openView, shareSupported],
  );

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={handleDownload}
        className="
          px-10 py-4 rounded-full text-lg font-bold
          bg-gradient-to-r from-green-500 to-emerald-600
          text-white shadow-xl shadow-green-600/30
          hover:from-green-400 hover:to-emerald-500
          transition-all duration-200 hover:scale-[1.03]
        "
      >
        PNGをダウンロード
      </button>

      <button
        onClick={handleOpenForSave}
        className="
          px-8 py-3 rounded-full text-sm font-semibold
          border border-zinc-600 bg-zinc-900 text-zinc-100
          hover:border-zinc-400 hover:bg-zinc-800
          transition-all duration-200
        "
      >
        画像を表示（保存用）
      </button>

      <button
        onClick={handleShare}
        className="
          px-8 py-3 rounded-full text-sm font-semibold
          border border-blue-500/50 bg-blue-500/10 text-blue-300
          hover:bg-blue-500/20
          transition-all duration-200
        "
      >
        共有（推奨）
      </button>
    </div>
  );
}
