"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface Props {
  imageSrc: string;
  aspectRatio: number; // width / height
  onCropDone: (croppedDataUrl: string) => void;
}

export default function ImageCropper({
  imageSrc,
  aspectRatio,
  onCropDone,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, cx: 0, cy: 0 });
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });
  const [scale, setScale] = useState(1);

  // Load image
  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      setImg(image);

      // Fit canvas into container (max 600px wide)
      const maxW = Math.min(600, window.innerWidth - 48);
      const sc = maxW / image.width;
      const cw = image.width * sc;
      const ch = image.height * sc;
      setCanvasSize({ w: cw, h: ch });
      setScale(sc);

      // Init crop rect centered, max size
      const targetRatio = aspectRatio;
      let cropW: number, cropH: number;
      if (image.width / image.height > targetRatio) {
        cropH = image.height;
        cropW = cropH * targetRatio;
      } else {
        cropW = image.width;
        cropH = cropW / targetRatio;
      }
      setCrop({
        x: (image.width - cropW) / 2,
        y: (image.height - cropH) / 2,
        w: cropW,
        h: cropH,
      });
    };
    image.src = imageSrc;
  }, [imageSrc, aspectRatio]);

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    ctx.drawImage(img, 0, 0, canvasSize.w, canvasSize.h);

    // Dim outside crop
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, canvasSize.w, canvasSize.h);

    // Draw crop area (clear the dim)
    const sx = crop.x * scale;
    const sy = crop.y * scale;
    const sw = crop.w * scale;
    const sh = crop.h * scale;

    ctx.save();
    ctx.beginPath();
    ctx.rect(sx, sy, sw, sh);
    ctx.clip();
    ctx.drawImage(img, 0, 0, canvasSize.w, canvasSize.h);
    ctx.restore();

    // Crop border
    ctx.strokeStyle = "#3B82F6";
    ctx.lineWidth = 2;
    ctx.strokeRect(sx, sy, sw, sh);

    // Grid lines (rule of thirds)
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1;
    for (let i = 1; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(sx + (sw / 3) * i, sy);
      ctx.lineTo(sx + (sw / 3) * i, sy + sh);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(sx, sy + (sh / 3) * i);
      ctx.lineTo(sx + sw, sy + (sh / 3) * i);
      ctx.stroke();
    }
  }, [img, crop, canvasSize, scale]);

  const getPointerPos = useCallback(
    (e: React.PointerEvent) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) / scale,
        y: (e.clientY - rect.top) / scale,
      };
    },
    [scale],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const pos = getPointerPos(e);
      if (
        pos.x >= crop.x &&
        pos.x <= crop.x + crop.w &&
        pos.y >= crop.y &&
        pos.y <= crop.y + crop.h
      ) {
        setDragging(true);
        setDragStart({ x: pos.x, y: pos.y, cx: crop.x, cy: crop.y });
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      }
    },
    [crop, getPointerPos],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging || !img) return;
      const pos = getPointerPos(e);
      const dx = pos.x - dragStart.x;
      const dy = pos.y - dragStart.y;
      let nx = dragStart.cx + dx;
      let ny = dragStart.cy + dy;
      nx = Math.max(0, Math.min(nx, img.width - crop.w));
      ny = Math.max(0, Math.min(ny, img.height - crop.h));
      setCrop((c) => ({ ...c, x: nx, y: ny }));
    },
    [dragging, dragStart, img, crop.w, crop.h, getPointerPos],
  );

  const handlePointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  const handleCrop = useCallback(() => {
    if (!img) return;
    const offscreen = document.createElement("canvas");
    offscreen.width = crop.w;
    offscreen.height = crop.h;
    const ctx = offscreen.getContext("2d")!;
    ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);
    onCropDone(offscreen.toDataURL("image/png"));
  }, [img, crop, onCropDone]);

  if (!img) {
    return <div className="text-center text-zinc-400 py-12">読み込み中...</div>;
  }

  return (
    <div className="w-full flex flex-col items-center gap-6">
      <h2 className="text-xl font-bold text-center">✂️ トリミング</h2>
      <p className="text-zinc-400 text-sm text-center">
        枠をドラッグして位置を調整
      </p>
      <canvas
        ref={canvasRef}
        width={canvasSize.w}
        height={canvasSize.h}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="rounded-lg cursor-move border border-zinc-700"
        style={{ touchAction: "none" }}
      />
      <button
        onClick={handleCrop}
        className="
          px-8 py-3 rounded-full bg-blue-600 text-white font-semibold
          hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/30
        "
      >
        切り抜きを確定 ✓
      </button>
    </div>
  );
}
