"use client";

import { ANIMAL_STICKERS } from "../lib/animals";

interface Props {
  onSelect: (animalId: string) => void;
  selectedId: string | null;
}

export default function AnimalSelector({ onSelect, selectedId }: Props) {
  const animals = ANIMAL_STICKERS;

  return (
    <div className="w-full max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-6 text-center">
        🐾 ドット絵スタンプを選択
      </h2>
      <div className="grid grid-cols-3 gap-4">
        {animals.map((a) => (
          <button
            key={a.id}
            onClick={() => onSelect(a.id)}
            className={`
              flex flex-col items-center gap-2 p-4 rounded-xl
              border-2 transition-all duration-200
              hover:scale-[1.05]
              ${
                selectedId === a.id
                  ? "border-purple-500 bg-purple-500/10 shadow-purple-500/20 shadow-md"
                  : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-500"
              }
            `}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={a.src}
              alt={a.name}
              className="w-16 h-20 object-contain"
              style={{ imageRendering: "pixelated" }}
            />
            <span className="text-sm text-zinc-300">{a.name}</span>
            {selectedId === a.id && (
              <div className="w-2 h-2 rounded-full bg-purple-500" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
