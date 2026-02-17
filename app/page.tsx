"use client";

import { useState, useCallback } from "react";
import { DeviceTemplate } from "./lib/devices";
import DeviceSelector from "./components/DeviceSelector";
import ImageUploader from "./components/ImageUploader";
import ImageCropper from "./components/ImageCropper";
import AnimalSelector from "./components/AnimalSelector";
import WallpaperPreview from "./components/WallpaperPreview";
import DownloadButton from "./components/DownloadButton";

type Step = "device" | "upload" | "crop" | "animal" | "preview";

const STEP_ORDER: Step[] = ["device", "upload", "crop", "animal", "preview"];
const STEP_LABELS: Record<Step, string> = {
  device: "機種選択",
  upload: "画像",
  crop: "トリミング",
  animal: "スタンプ",
  preview: "プレビュー",
};

export default function Home() {
  const [step, setStep] = useState<Step>("device");
  const [device, setDevice] = useState<DeviceTemplate | null>(null);
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [animalId, setAnimalId] = useState<string | null>(null);
  const [stickerXPercent, setStickerXPercent] = useState<number>(50);

  const currentStepIdx = STEP_ORDER.indexOf(step);

  const handleDeviceSelect = useCallback((d: DeviceTemplate) => {
    setDevice(d);
    setStep("upload");
  }, []);

  const handleImageLoaded = useCallback((dataUrl: string) => {
    setRawImage(dataUrl);
    setStep("crop");
  }, []);

  const handleCropDone = useCallback((dataUrl: string) => {
    setCroppedImage(dataUrl);
    setStep("animal");
  }, []);

  const handleAnimalSelect = useCallback((id: string) => {
    setAnimalId(id);
    setStep("preview");
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            📱 iPhone Wallpaper Creator
          </h1>
          {device && (
            <span className="text-xs text-zinc-500">
              {device.name} ({device.width}×{device.height})
            </span>
          )}
        </div>
      </header>

      {/* Step indicator */}
      <div className="max-w-3xl mx-auto w-full px-4 py-4">
        <div className="flex items-center gap-1">
          {STEP_ORDER.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <button
                onClick={() => {
                  if (i < currentStepIdx) setStep(s);
                }}
                disabled={i > currentStepIdx}
                className={`
                  flex-1 text-center py-2 px-1 rounded-lg text-xs font-medium transition-all
                  ${
                    s === step
                      ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                      : i < currentStepIdx
                        ? "text-zinc-400 hover:text-zinc-200 cursor-pointer"
                        : "text-zinc-600 cursor-not-allowed"
                  }
                `}
              >
                {STEP_LABELS[s]}
              </button>
              {i < STEP_ORDER.length - 1 && (
                <div
                  className={`w-4 h-px mx-1 ${
                    i < currentStepIdx ? "bg-blue-500" : "bg-zinc-700"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {step === "device" && (
          <DeviceSelector
            onSelect={handleDeviceSelect}
            selectedId={device?.id ?? null}
          />
        )}

        {step === "upload" && (
          <ImageUploader onImageLoaded={handleImageLoaded} />
        )}

        {step === "crop" && device && rawImage && (
          <ImageCropper
            imageSrc={rawImage}
            aspectRatio={device.width / device.height}
            onCropDone={handleCropDone}
          />
        )}

        {step === "animal" && (
          <AnimalSelector onSelect={handleAnimalSelect} selectedId={animalId} />
        )}

        {step === "preview" && device && croppedImage && animalId && (
          <div className="flex flex-col items-center gap-8">
            <div className="w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900/60 p-4">
              <label className="mb-2 block text-sm font-medium text-zinc-200">
                横位置: {Math.round(stickerXPercent)}%
              </label>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={stickerXPercent}
                onChange={(e) => setStickerXPercent(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
              <p className="mt-2 text-xs text-zinc-400">
                Dynamic Islandの幅内だけで左右移動します。
              </p>
            </div>
            <WallpaperPreview
              device={device}
              croppedSrc={croppedImage}
              animalId={animalId}
              stickerXPercent={stickerXPercent}
            />
            <DownloadButton
              device={device}
              croppedSrc={croppedImage}
              animalId={animalId}
              stickerXPercent={stickerXPercent}
            />
          </div>
        )}

        {/* Back button */}
        {step !== "device" && (
          <button
            onClick={() => {
              const idx = STEP_ORDER.indexOf(step);
              if (idx > 0) setStep(STEP_ORDER[idx - 1]);
            }}
            className="
              mt-8 px-6 py-2 rounded-full text-sm
              border border-zinc-700 text-zinc-400
              hover:border-zinc-500 hover:text-zinc-200
              transition-all
            "
          >
            ← 戻る
          </button>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-4 text-center text-xs text-zinc-600">
        画像はすべてブラウザ内で処理されます。サーバーへのアップロードはありません。
      </footer>
    </div>
  );
}
