"use client";

import { DeviceTemplate, groupDevices } from "../lib/devices";

interface Props {
  onSelect: (device: DeviceTemplate) => void;
  selectedId: string | null;
}

export default function DeviceSelector({ onSelect, selectedId }: Props) {
  const groups = groupDevices();

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-6 text-center">📱 機種を選択</h2>
      {Object.entries(groups).map(([groupName, devices]) => (
        <div key={groupName} className="mb-6">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            {groupName}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {devices.map((d) => (
              <button
                key={d.id}
                onClick={() => onSelect(d)}
                className={`
                  relative rounded-xl border-2 p-3 text-left transition-all duration-200
                  hover:scale-[1.03] hover:shadow-lg
                  ${
                    selectedId === d.id
                      ? "border-blue-500 bg-blue-500/10 shadow-blue-500/20 shadow-md"
                      : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-500"
                  }
                `}
              >
                <div className="text-sm font-medium text-zinc-100 leading-tight">
                  {d.name.replace("iPhone ", "")}
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  {d.width}×{d.height}
                </div>
                {selectedId === d.id && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
