/**
 * Programmatic pixel art animal generator.
 * Each animal is defined as a pixel grid and rendered to a data URL via canvas.
 */

type PixelGrid = string[][];

// Color palette
const _ = "transparent";
const K = "#222222"; // black outline
const W = "#FFFFFF"; // white
const O = "#FF9933"; // orange
const P = "#FFB6C1"; // pink
const G = "#66CC66"; // green
const Y = "#FFDD44"; // yellow
// const B = "#4488FF"; // blue (reserved for future animals)
const BR = "#8B6914"; // brown
// const GR = "#888888"; // gray (reserved for future animals)
const DG = "#555555"; // dark gray

const ANIMALS: Record<string, { grid: PixelGrid; name: string }> = {
  cat: {
    name: "ネコ",
    grid: [
      [_, _, K, _, _, _, _, K, _, _],
      [_, K, O, K, _, _, K, O, K, _],
      [K, O, O, O, K, K, O, O, O, K],
      [K, O, O, O, O, O, O, O, O, K],
      [K, O, K, O, O, O, O, K, O, K],
      [K, O, O, O, K, K, O, O, O, K],
      [_, K, O, O, O, O, O, O, K, _],
      [_, _, K, O, O, O, O, K, _, _],
      [_, K, O, O, O, O, O, O, K, _],
      [K, O, O, O, O, O, O, O, O, K],
      [K, O, O, O, O, O, O, O, O, K],
      [_, K, K, O, O, O, O, K, K, _],
      [_, _, K, K, _, _, K, K, _, _],
    ],
  },
  dog: {
    name: "イヌ",
    grid: [
      [_, K, K, _, _, _, _, K, K, _],
      [K, BR, BR, K, _, _, K, BR, BR, K],
      [K, BR, BR, BR, K, K, BR, BR, BR, K],
      [_, K, BR, BR, BR, BR, BR, BR, K, _],
      [_, K, BR, K, BR, BR, K, BR, K, _],
      [_, K, BR, BR, BR, BR, BR, BR, K, _],
      [_, K, BR, BR, K, K, BR, BR, K, _],
      [_, _, K, BR, BR, BR, BR, K, _, _],
      [_, K, BR, BR, BR, BR, BR, BR, K, _],
      [K, BR, BR, BR, BR, BR, BR, BR, BR, K],
      [K, BR, BR, BR, BR, BR, BR, BR, BR, K],
      [_, K, K, BR, BR, BR, BR, K, K, _],
      [_, _, K, K, _, _, K, K, _, _],
    ],
  },
  rabbit: {
    name: "ウサギ",
    grid: [
      [_, _, K, _, _, _, _, K, _, _],
      [_, K, W, K, _, _, K, W, K, _],
      [_, K, P, K, _, _, K, P, K, _],
      [_, K, W, K, _, _, K, W, K, _],
      [_, _, K, W, K, K, W, K, _, _],
      [_, K, W, W, W, W, W, W, K, _],
      [K, W, W, K, W, W, K, W, W, K],
      [K, W, W, W, W, W, W, W, W, K],
      [K, W, W, W, P, P, W, W, W, K],
      [_, K, W, W, W, W, W, W, K, _],
      [_, K, W, W, W, W, W, W, K, _],
      [_, _, K, K, W, W, K, K, _, _],
      [_, _, K, K, _, _, K, K, _, _],
    ],
  },
  panda: {
    name: "パンダ",
    grid: [
      [_, K, K, _, _, _, _, K, K, _],
      [K, K, K, K, _, _, K, K, K, K],
      [_, K, W, W, K, K, W, W, K, _],
      [_, K, W, W, W, W, W, W, K, _],
      [_, K, K, K, W, W, K, K, K, _],
      [_, K, W, W, K, K, W, W, K, _],
      [_, _, K, W, W, W, W, K, _, _],
      [_, K, W, W, W, W, W, W, K, _],
      [_, K, K, W, W, W, W, K, K, _],
      [_, K, K, W, W, W, W, K, K, _],
      [_, K, K, K, W, W, K, K, K, _],
      [_, _, K, K, _, _, K, K, _, _],
      [_, _, _, _, _, _, _, _, _, _],
    ],
  },
  penguin: {
    name: "ペンギン",
    grid: [
      [_, _, _, K, K, K, K, _, _, _],
      [_, _, K, DG, DG, DG, DG, K, _, _],
      [_, K, DG, DG, DG, DG, DG, DG, K, _],
      [_, K, DG, K, DG, DG, K, DG, K, _],
      [_, K, DG, DG, DG, DG, DG, DG, K, _],
      [_, _, K, DG, Y, Y, DG, K, _, _],
      [_, K, DG, W, W, W, W, DG, K, _],
      [K, DG, W, W, W, W, W, W, DG, K],
      [K, DG, W, W, W, W, W, W, DG, K],
      [_, K, DG, W, W, W, W, DG, K, _],
      [_, _, K, DG, DG, DG, DG, K, _, _],
      [_, _, K, Y, K, K, Y, K, _, _],
      [_, _, _, _, _, _, _, _, _, _],
    ],
  },
  frog: {
    name: "カエル",
    grid: [
      [_, K, K, _, _, _, _, K, K, _],
      [K, G, G, K, _, _, K, G, G, K],
      [K, W, K, G, K, K, G, K, W, K],
      [_, K, G, G, G, G, G, G, K, _],
      [_, K, G, G, G, G, G, G, K, _],
      [K, G, G, G, G, G, G, G, G, K],
      [K, G, K, _, _, _, _, K, G, K],
      [_, K, G, G, G, G, G, G, K, _],
      [_, _, K, G, G, G, G, K, _, _],
      [_, K, G, G, G, G, G, G, K, _],
      [_, K, G, G, G, G, G, G, K, _],
      [_, _, K, K, _, _, K, K, _, _],
      [_, _, _, _, _, _, _, _, _, _],
    ],
  },
};

const PIXEL_SIZE = 12; // each "pixel" renders as 12×12 real pixels → 120×156 final

/**
 * Render a pixel grid to a canvas and return it as a data URL.
 * Works only in the browser.
 */
export function renderAnimalToDataURL(animalId: string): string {
  const animal = ANIMALS[animalId];
  if (!animal) return "";
  const { grid } = animal;
  const rows = grid.length;
  const cols = grid[0].length;
  const canvas = document.createElement("canvas");
  canvas.width = cols * PIXEL_SIZE;
  canvas.height = rows * PIXEL_SIZE;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const color = grid[r][c];
      if (color === "transparent") continue;
      ctx.fillStyle = color;
      ctx.fillRect(c * PIXEL_SIZE, r * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
    }
  }
  return canvas.toDataURL("image/png");
}

export function getAnimalList() {
  return Object.entries(ANIMALS).map(([id, { name }]) => ({ id, name }));
}
