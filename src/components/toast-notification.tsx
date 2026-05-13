"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface ToastProps {
  message: string;
  color: "ver" | "val";
  show: boolean;
  onClose: () => void;
}

export function ToastNotification({ message, color, show, onClose }: ToastProps) {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      // Trigger entrance animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimating(true);
        });
      });
      // Auto-dismiss after 3 seconds
      const timer = setTimeout(() => {
        setAnimating(false);
        setTimeout(() => {
          setVisible(false);
          onClose();
        }, 300);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setAnimating(false);
      setTimeout(() => setVisible(false), 300);
    }
  }, [show, onClose]);

  if (!visible) return null;

  const bgColor = color === "ver" ? "bg-ver" : "bg-val";
  const emoji = color === "ver" ? "💪" : "🔥";

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
      <div
        className={`${bgColor} text-white rounded-xl shadow-2xl px-5 py-4 flex items-center gap-3 pointer-events-auto transition-all duration-300 ease-out ${
          animating
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 -translate-y-4 scale-95"
        }`}
      >
        <span className="text-2xl">{emoji}</span>
        <p className="flex-1 text-sm font-semibold leading-snug">{message}</p>
        <button
          onClick={() => {
            setAnimating(false);
            setTimeout(() => {
              setVisible(false);
              onClose();
            }, 300);
          }}
          className="shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
