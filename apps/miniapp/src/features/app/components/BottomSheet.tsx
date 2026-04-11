"use client";

import type { ReactNode } from "react";

type BottomSheetProps = {
  onClose: () => void;
  children: ReactNode;
};

export function BottomSheet({ onClose, children }: BottomSheetProps) {
  return (
    <div
      className="fixed inset-0 z-[60]"
      style={{ isolation: "isolate" }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(10,10,20,0.72)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          animation: "backdrop-in 0.22s ease forwards",
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet panel */}
      <div
        className="absolute bottom-0 left-0 right-0 mx-auto max-w-md overflow-y-auto rounded-t-[28px]"
        style={{
          background: "var(--bg-surface)",
          borderTop: "1px solid var(--border-subtle)",
          maxHeight: "88vh",
          animation: "sheet-up 0.32s cubic-bezier(0.32,0.72,0,1) forwards",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div
            className="rounded-full"
            style={{
              width: 40,
              height: 4,
              background: "var(--border-subtle)",
            }}
          />
        </div>

        <div className="px-4 pb-6 pt-2">{children}</div>
      </div>
    </div>
  );
}
