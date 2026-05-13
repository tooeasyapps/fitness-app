"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { User, X } from "lucide-react";

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
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Small delay to ensure the UI is fully rendered before showing
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const dismissTooltip = () => {
    setShowTooltip(false);
  };

  return (
    <div className="relative">
      <div className="inline-flex rounded-lg border bg-white p-1 shadow-sm">
        {clients.map((c) => {
          const isVer = c.name === "Ver";
          const isSelected = selected === c.id;
          return (
            <button
              key={c.id}
              onClick={() => {
                onSelect(c.id);
                dismissTooltip(); // Also dismiss if they naturally click it
              }}
              className={cn(
                "px-4 sm:px-6 py-2 text-sm font-semibold rounded-md transition-all flex items-center gap-1.5",
                isSelected
                  ? isVer
                    ? "bg-ver text-white shadow"
                    : "bg-val text-white shadow"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <User className={cn("h-4 w-4", isSelected ? "text-white" : "text-slate-400")} />
              {c.name}
            </button>
          );
        })}
      </div>

      {/* Onboarding Tooltip */}
      {showTooltip && (
        <div className="absolute right-0 top-full mt-3 w-64 bg-slate-900 text-white p-3 rounded-lg shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Arrow pointing up */}
          <div className="absolute -top-2 right-6 w-4 h-4 bg-slate-900 rotate-45" />
          
          <div className="relative z-10 flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-sm">Select your profile</p>
              <p className="text-xs text-slate-300 mt-1">
                Switch to your profile to log check-ins, record weights, and view your progress.
              </p>
            </div>
            <button 
              onClick={dismissTooltip}
              className="text-slate-400 hover:text-white p-0.5 rounded-sm shrink-0"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <button 
            onClick={dismissTooltip}
            className="w-full mt-3 bg-white text-slate-900 text-xs font-semibold py-1.5 rounded-md hover:bg-slate-100 transition-colors"
          >
            Got it
          </button>
        </div>
      )}
    </div>
  );
}
