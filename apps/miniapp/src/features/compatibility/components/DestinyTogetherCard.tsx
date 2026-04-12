"use client";

import { CompatibilityAiInsights } from "../types";
import { BottomSheet } from "@/features/app/components/BottomSheet";
import { useState } from "react";

function reduceToDigit(n: number): number {
  while (n > 9) { n = String(n).split("").reduce((s, d) => s + parseInt(d), 0); }
  return n;
}

const DESTINY_MEANINGS: Record<number, string> = {
  1: "Союз первопроходцев — совместно открываете новые пути",
  2: "Союз равновесия — глубокая чуткость друг к другу",
  3: "Союз творчества — вместе создаёте и вдохновляете",
  4: "Союз основания — строите что-то прочное и долгосрочное",
  5: "Союз свободы — вместе исследуете жизнь без границ",
  6: "Союз гармонии — забота и тепло в центре ваших отношений",
  7: "Союз мудрости — вместе ищете глубину и смысл",
  8: "Союз силы — амбициозный тандем с большими целями",
  9: "Союз завершения — вместе несёте что-то важное в мир",
};

const INFO = {
  what: "Число союза — сумма двух чисел жизненного пути, сведённая к однозначному. Оно отражает совместный путь и то, что вы создаёте вместе.",
  how: "Сложите оба числа жизненного пути и сведите до однозначного числа. Например, 3 + 7 = 10 → 1+0 = 1.",
};

export function DestinyTogetherCard({
  sourceLifePath,
  targetLifePath,
  aiInsights,
  isPremium = false,
  onUnlock,
}: {
  sourceLifePath: number;
  targetLifePath: number;
  aiInsights: CompatibilityAiInsights | null;
  isPremium?: boolean;
  onUnlock?: () => void;
}) {
  const [infoOpen, setInfoOpen] = useState(false);
  const combined = reduceToDigit(sourceLifePath + targetLifePath);
  const meaning = DESTINY_MEANINGS[combined] ?? "Уникальное сочетание энергий";

  return (
    <>
      <div
        className="rounded-[24px]"
        style={{ background: "var(--bg-surface)", border: "1px solid rgba(123,94,248,0.2)", boxShadow: "0 12px 40px rgba(0,0,0,0.3)" }}
      >
        {/* Visible header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--text-muted)" }}>
            Судьба вместе
          </p>
          <button
            type="button"
            onClick={() => setInfoOpen(true)}
            className="flex h-6 w-6 items-center justify-center rounded-full"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--border-subtle)", color: "var(--text-muted)", fontSize: 11, fontWeight: 700 }}
          >
            i
          </button>
        </div>

        <div className="relative px-5 pb-5 overflow-hidden rounded-b-[24px]">
          {!isPremium && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer"
              style={{ backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", background: "linear-gradient(to bottom, rgba(17,17,40,0.1), rgba(17,17,40,0.7))" }}
              onClick={onUnlock}
            >
              <span className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--accent-soft)" }}>✦ Нажми чтобы разблокировать</span>
            </div>
          )}

          <div className="flex items-center gap-4">
            <div
              className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl"
              style={{ background: "rgba(123,94,248,0.15)", border: "1px solid rgba(123,94,248,0.3)" }}
            >
              <span className="text-[28px] font-black" style={{ color: "#7B5EF8" }}>{combined}</span>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--accent-soft)" }}>
                Число союза · {sourceLifePath} + {targetLifePath}
              </p>
              <p className="mt-1 text-[14px] font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
                {aiInsights?.destiny_headline ?? meaning}
              </p>
              <p className="mt-1.5 text-xs leading-5" style={{ color: "var(--text-secondary)" }}>
                {aiInsights?.destiny_body ?? meaning}
              </p>
            </div>
          </div>
        </div>
      </div>

      {infoOpen && (
        <BottomSheet onClose={() => setInfoOpen(false)}>
          <div className="space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--accent-soft)" }}>Судьба вместе</p>
            <h3 className="text-[20px] font-bold" style={{ color: "var(--text-primary)" }}>Что это значит</h3>
            <div className="rounded-2xl p-4 space-y-3" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>Что это</p>
                <p className="mt-1.5 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>{INFO.what}</p>
              </div>
              <div style={{ height: 1, background: "var(--border-subtle)" }} />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>Как считается</p>
                <p className="mt-1.5 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>{INFO.how}</p>
              </div>
            </div>
          </div>
        </BottomSheet>
      )}
    </>
  );
}
