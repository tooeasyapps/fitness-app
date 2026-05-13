"use client";

import { cn } from "@/lib/utils";

interface Client {
  id: number;
  name: string;
}

export function ClientSwitcher({
  clients,
  selected,
  onSelect,
}: {
  clients: Client[];
  selected: number | null;
  onSelect: (id: number) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border bg-white p-1 shadow-sm">
      {clients.map((c) => {
        const isVer = c.name === "Ver";
        const isSelected = selected === c.id;
        return (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={cn(
              "px-6 py-2 text-sm font-semibold rounded-md transition-all",
              isSelected
                ? isVer
                  ? "bg-ver text-white shadow"
                  : "bg-val text-white shadow"
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            {c.name}
          </button>
        );
      })}
    </div>
  );
}
