"use client";

import { useState } from "react";
import { createRoot } from "react-dom/client";
import { NumerologyResponse } from "@/features/onboarding/types";
import { ShareCardContent } from "./ShareCardContent";

type Props = {
  result: NumerologyResponse;
  displayName?: string;
};

async function captureShareCard(result: NumerologyResponse, displayName?: string): Promise<Blob> {
  const html2canvas = (await import("html2canvas")).default;

  const container = document.createElement("div");
  container.style.cssText =
    "position:fixed;top:-9999px;left:-9999px;z-index:-1;";
  document.body.appendChild(container);

  const root = createRoot(container);
  await new Promise<void>((resolve) => {
    root.render(
      <ShareCardContent result={result} displayName={displayName} />,
    );
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

function getTelegramWebApp() {
  if (typeof window !== "undefined" && window.Telegram?.WebApp) {
    return window.Telegram.WebApp;
  }
  return null;
}

export function ShareButton({ result, displayName }: Props) {
  const [status, setStatus] = useState<"idle" | "capturing" | "done" | "error">("idle");

  async function handleShare() {
    if (status === "capturing") return;
    setStatus("capturing");

    try {
      const blob = await captureShareCard(result, displayName);
      const file = new File([blob], "my-numerology.png", { type: "image/png" });

      // Try native share (works in Telegram on mobile)
      if (
        typeof navigator !== "undefined" &&
        navigator.share &&
        navigator.canShare?.({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: "Мой нумерологический расклад",
          text: `Моё число жизненного пути — ${result.life_path_number}. Узнай свои числа!`,
        });
        setStatus("done");
      } else {
        // Fallback: download
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

  function handleShareLink() {
    const tg = getTelegramWebApp();
    const botUsername = process.env.NEXT_PUBLIC_BOT_USERNAME;
    if (tg && botUsername) {
      const text = `Моё число жизненного пути — ${result.life_path_number} ✦ Узнай свои числа!`;
      const url = `https://t.me/share/url?url=https://t.me/${botUsername}&text=${encodeURIComponent(text)}`;
      tg.openTelegramLink?.(url);
    }
  }

  const label =
    status === "capturing"
      ? "Генерируем..."
      : status === "done"
        ? "✓ Готово"
        : status === "error"
          ? "Попробовать ещё раз"
          : "Поделиться раскладом";

  const botUsername = process.env.NEXT_PUBLIC_BOT_USERNAME;
  const hasTelegram = typeof window !== "undefined" && !!window.Telegram?.WebApp;

  return (
    <div className="flex gap-2">
      {/* Image share button */}
      <button
        type="button"
        onClick={handleShare}
        disabled={status === "capturing"}
        className="flex-1 rounded-2xl py-3 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-60"
        style={{
          border: "1px solid var(--border-subtle)",
          color: status === "done" ? "var(--accent-green)" : "var(--text-secondary)",
          background: "transparent",
        }}
      >
        <span className="flex items-center justify-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          {label}
        </span>
      </button>

      {/* Telegram direct share */}
      {hasTelegram && botUsername && (
        <button
          type="button"
          onClick={handleShareLink}
          className="flex items-center justify-center rounded-2xl px-4 py-3 transition active:scale-[0.98]"
          style={{
            background: "rgba(123, 94, 248, 0.12)",
            border: "1px solid rgba(123, 94, 248, 0.25)",
            color: "var(--accent-soft)",
          }}
          title="Отправить другу в Telegram"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
        </button>
      )}
    </div>
  );
}
