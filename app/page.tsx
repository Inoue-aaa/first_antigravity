"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DEVICE_TEMPLATES, DeviceTemplate } from "./lib/devices";
import DeviceSelector from "./components/DeviceSelector";
import ImageUploader from "./components/ImageUploader";
import ImageCropper from "./components/ImageCropper";
import AnimalSelector from "./components/AnimalSelector";
import WallpaperPreview from "./components/WallpaperPreview";
import DownloadButton from "./components/DownloadButton";

type Step = "device" | "upload" | "crop" | "animal" | "preview";

type PersistedEditorState = {
  step: Step;
  deviceId: string | null;
  rawImage: string | null;
  croppedImage: string | null;
  animalId: string | null;
  stickerXPercent: number;
};

const STEP_ORDER: Step[] = ["device", "upload", "crop", "animal", "preview"];
const STEP_LABELS: Record<Step, string> = {
  device: "機種選択",
  upload: "画像アップロード",
  crop: "トリミング",
  animal: "スタンプ選択",
  preview: "プレビュー",
};

const EDITOR_STATE_KEY = "wallpaper_editor_state";

function isStep(value: unknown): value is Step {
  return typeof value === "string" && STEP_ORDER.includes(value as Step);
}

function readPersistedEditorState(): PersistedEditorState | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(EDITOR_STATE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedEditorState>;
    if (!isStep(parsed.step)) return null;
    return {
      step: parsed.step,
      deviceId: typeof parsed.deviceId === "string" ? parsed.deviceId : null,
      rawImage: typeof parsed.rawImage === "string" ? parsed.rawImage : null,
      croppedImage:
        typeof parsed.croppedImage === "string" ? parsed.croppedImage : null,
      animalId: typeof parsed.animalId === "string" ? parsed.animalId : null,
      stickerXPercent:
        typeof parsed.stickerXPercent === "number" ? parsed.stickerXPercent : 50,
    };
  } catch {
    return null;
  }
}

export default function Home() {
  const initialState = useMemo(() => readPersistedEditorState(), []);

  const [step, setStep] = useState<Step>(initialState?.step ?? "device");
  const [device, setDevice] = useState<DeviceTemplate | null>(() => {
    if (!initialState?.deviceId) return null;
    return DEVICE_TEMPLATES.find((d) => d.id === initialState.deviceId) ?? null;
  });
  const [rawImage, setRawImage] = useState<string | null>(
    initialState?.rawImage ?? null,
  );
  const [croppedImage, setCroppedImage] = useState<string | null>(
    initialState?.croppedImage ?? null,
  );
  const [animalId, setAnimalId] = useState<string | null>(
    initialState?.animalId ?? null,
  );
  const [stickerXPercent, setStickerXPercent] = useState<number>(
    initialState?.stickerXPercent ?? 50,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const data: PersistedEditorState = {
      step,
      deviceId: device?.id ?? null,
      rawImage,
      croppedImage,
      animalId,
      stickerXPercent,
    };

    try {
      sessionStorage.setItem(EDITOR_STATE_KEY, JSON.stringify(data));
    } catch {
      // Ignore quota errors on very large data URLs.
    }
  }, [animalId, croppedImage, device, rawImage, step, stickerXPercent]);

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
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            iPhone Wallpaper Creator
          </h1>
          {device && (
            <span className="text-xs text-zinc-500">
              {device.name} ({device.width}×{device.height})
            </span>
          )}
        </div>
      </header>

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
                Dynamic Island の幅内だけで左右移動します。
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
            戻る
          </button>
        )}
      </main>

      <footer className="border-t border-zinc-800 py-4 text-center text-xs text-zinc-600">
        画像はすべてブラウザ内で処理されます。サーバーへのアップロードはありません。
      </footer>
    </div>
  );
}
