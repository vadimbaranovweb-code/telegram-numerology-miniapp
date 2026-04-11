"use client";

import { useState } from "react";
import { createRoot } from "react-dom/client";
import { NumerologyResponse } from "@/features/onboarding/types";
import { ShareCardContent } from "./ShareCardContent";
import { lang } from "@/i18n";

type Props = {
  result: NumerologyResponse;
  displayName?: string;
};

async function captureShareCard(result: NumerologyResponse, displayName?: string): Promise<Blob> {
  const html2canvas = (await import("html2canvas")).default;

  // Create off-screen container
  const container = document.createElement("div");
  container.style.cssText =
    "position:fixed;top:-9999px;left:-9999px;z-index:-1;";
  document.body.appendChild(container);

  // Render card into container
  const root = createRoot(container);
  await new Promise<void>((resolve) => {
    root.render(
      <ShareCardContent result={result} displayName={displayName} />,
    );
    // Give React one frame to paint
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

  try {
    const el = container.firstElementChild as HTMLElement;
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#0A0A14",
      logging: false,
    });

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
        "image/png",
        0.95,
      );
    });
  } finally {
    root.unmount();
    document.body.removeChild(container);
  }
}

export function ShareButton({ result, displayName }: Props) {
  const [status, setStatus] = useState<"idle" | "capturing" | "done" | "error">("idle");

  async function handleShare() {
    if (status === "capturing") return;
    setStatus("capturing");

    try {
      const blob = await captureShareCard(result, displayName);
      const file = new File([blob], "my-numerology.png", { type: "image/png" });

      if (
        typeof navigator !== "undefined" &&
        navigator.share &&
        navigator.canShare?.({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: "My Numerology Reading",
        });
        setStatus("done");
      } else {
        // Fallback: trigger download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "my-numerology.png";
        a.click();
        URL.revokeObjectURL(url);
        setStatus("done");
      }
    } catch {
      setStatus("error");
    }

    setTimeout(() => setStatus("idle"), 2500);
  }

  const label =
    status === "capturing"
      ? "Generating..."
      : status === "done"
        ? "✓ Saved"
        : status === "error"
          ? "Try again"
          : lang === "ru"
            ? "↑ Поделиться раскладом"
            : "↑ Share my reading";

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={status === "capturing"}
      className="w-full rounded-2xl py-3 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-60"
      style={{
        border: "1px solid var(--border-subtle)",
        color: status === "done" ? "var(--accent-green)" : "var(--text-secondary)",
        background: "transparent",
      }}
      suppressHydrationWarning
    >
      {label}
    </button>
  );
}
