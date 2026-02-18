"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const VIEW_BLOB_URL_KEY = "wallpaper_view_blob_url";
const LAST_PREVIEW_ROUTE_KEY = "lastPreviewRoute";
const INITIAL_ROUTE = "/?step=upload";
const RELOAD_REDIRECT_GUARD_KEY = "reloadRedirectGuard";

function isReloadNavigation(): boolean {
  const navEntry = performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;
  const navType = navEntry?.type;
  const legacyType =
    (performance as Performance & {
      navigation?: { type?: number };
    }).navigation?.type ?? -1;

  return navType === "reload" || legacyType === 1;
}

export default function ViewPage() {
  const router = useRouter();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        sessionStorage.removeItem(VIEW_BLOB_URL_KEY);
      }
    };
  }, [blobUrl]);

  useEffect(() => {
    const isReload = isReloadNavigation();
    const guard = sessionStorage.getItem(RELOAD_REDIRECT_GUARD_KEY);
    if (isReload && guard !== "1") {
      sessionStorage.setItem(RELOAD_REDIRECT_GUARD_KEY, "1");
      window.location.replace(INITIAL_ROUTE);
      return;
    }
    sessionStorage.removeItem(RELOAD_REDIRECT_GUARD_KEY);
  }, []);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      const url = sessionStorage.getItem(VIEW_BLOB_URL_KEY);
      setBlobUrl(url);
    });

    return () => window.cancelAnimationFrame(id);
  }, []);

  const handleReturn = useCallback(() => {
    const target =
      sessionStorage.getItem(LAST_PREVIEW_ROUTE_KEY) ?? "/?step=preview";
    router.replace(target);
  }, [router]);

  return (
    <main className="min-h-[100dvh] bg-zinc-950 text-zinc-100 flex flex-col">
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <h1 className="text-xl font-bold">保存用画像</h1>
        <p className="mt-2 text-sm text-zinc-400">
          長押し、またはブラウザの共有メニューから保存してください。
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        {blobUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={blobUrl}
            alt="Generated wallpaper"
            className="max-h-[80vh] w-auto max-w-full rounded-xl border border-zinc-700"
          />
        ) : (
          <div className="text-center text-zinc-400">
            表示する画像が見つかりませんでした。
          </div>
        )}
      </div>

      <div className="border-t border-zinc-800 px-4 py-4 text-center">
        <button
          onClick={handleReturn}
          className="text-sm text-zinc-300 underline hover:text-zinc-100"
        >
          アプリに戻る
        </button>
      </div>
    </main>
  );
}
