/** Rectangle describing the Dynamic Island position at native resolution */
export interface IslandRect {
  /** left edge X in px */
  x: number;
  /** top edge Y in px */
  y: number;
  /** width in px */
  w: number;
  /** height in px */
  h: number;
}

export interface DeviceTemplate {
  id: string;
  name: string;
  width: number;
  height: number;
  group: string;
  /** Dynamic Island rect at native resolution */
  islandRect: IslandRect;
}

/**
 * Island rects per resolution group (approximate, at native resolution).
 * Measured from top-left of screen.
 */

// 1179x2556 — iPhone 16, 15, 15 Pro, 14 Pro
const ISLAND_1179: IslandRect = { x: 466, y: 30, w: 248, h: 72 };

// 1290x2796 — iPhone 16 Plus, 15 Plus, 15 Pro Max, 14 Pro Max
const ISLAND_1290: IslandRect = { x: 509, y: 33, w: 272, h: 78 };

// 1206x2622 — iPhone 16 Pro
const ISLAND_1206: IslandRect = { x: 479, y: 30, w: 248, h: 72 };

// 1320x2868 — iPhone 16 Pro Max
const ISLAND_1320: IslandRect = { x: 524, y: 33, w: 272, h: 78 };

export const DEVICE_TEMPLATES: DeviceTemplate[] = [
  // ---- iPhone 16 ----
  {
    id: "16",
    name: "iPhone 16",
    width: 1179,
    height: 2556,
    group: "iPhone 16",
    islandRect: ISLAND_1179,
  },
  {
    id: "16plus",
    name: "iPhone 16 Plus",
    width: 1290,
    height: 2796,
    group: "iPhone 16",
    islandRect: ISLAND_1290,
  },
  {
    id: "16pro",
    name: "iPhone 16 Pro",
    width: 1206,
    height: 2622,
    group: "iPhone 16",
    islandRect: ISLAND_1206,
  },
  {
    id: "16promax",
    name: "iPhone 16 Pro Max",
    width: 1320,
    height: 2868,
    group: "iPhone 16",
    islandRect: ISLAND_1320,
  },
  // ---- iPhone 15 ----
  {
    id: "15",
    name: "iPhone 15",
    width: 1179,
    height: 2556,
    group: "iPhone 15",
    islandRect: ISLAND_1179,
  },
  {
    id: "15plus",
    name: "iPhone 15 Plus",
    width: 1290,
    height: 2796,
    group: "iPhone 15",
    islandRect: ISLAND_1290,
  },
  {
    id: "15pro",
    name: "iPhone 15 Pro",
    width: 1179,
    height: 2556,
    group: "iPhone 15",
    islandRect: ISLAND_1179,
  },
  {
    id: "15promax",
    name: "iPhone 15 Pro Max",
    width: 1290,
    height: 2796,
    group: "iPhone 15",
    islandRect: ISLAND_1290,
  },
  // ---- iPhone 14 Pro ----
  {
    id: "14pro",
    name: "iPhone 14 Pro",
    width: 1179,
    height: 2556,
    group: "iPhone 14",
    islandRect: ISLAND_1179,
  },
  {
    id: "14promax",
    name: "iPhone 14 Pro Max",
    width: 1290,
    height: 2796,
    group: "iPhone 14",
    islandRect: ISLAND_1290,
  },
];

/** Group device templates by `group` field */
export function groupDevices(): Record<string, DeviceTemplate[]> {
  const groups: Record<string, DeviceTemplate[]> = {};
  for (const d of DEVICE_TEMPLATES) {
    if (!groups[d.group]) groups[d.group] = [];
    groups[d.group].push(d);
  }
  return groups;
}

/**
 * Compute the fixed sticker position in NATIVE resolution pixels.
 * The sticker is centered horizontally, placed just above the Dynamic Island.
 */
const STICKER_H_NATIVE = 32;
const Y_OFFSET_PX = -2;

export { STICKER_H_NATIVE };

export function getStickerPosition(
  device: DeviceTemplate,
  stickerAspectWH: number,
  chosenH: number = STICKER_H_NATIVE,
  xRatio: number = 0.5,
) {
  // Fixed size; align bottom to island top by y formula below.
  const stickerHNative = Math.max(1, Math.round(chosenH));
  const stickerWNative = Math.max(
    1,
    Math.round(stickerHNative * stickerAspectWH),
  );
  const yRaw = device.islandRect.y - stickerHNative + Y_OFFSET_PX;
  const minX = device.islandRect.x;
  const maxX = Math.max(
    minX,
    device.islandRect.x + device.islandRect.w - stickerWNative,
  );
  const t = Math.max(0, Math.min(1, xRatio));
  const xRaw = minX + t * (maxX - minX);

  // Clamp within island bounds; y follows strict formula above.
  const x = Math.round(Math.max(minX, Math.min(xRaw, maxX)));
  const y = Math.round(Math.max(0, yRaw));

  return { x, y, w: stickerWNative, h: stickerHNative };
}
