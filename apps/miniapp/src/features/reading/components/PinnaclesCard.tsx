"use client";

import { useState } from "react";
import { PinnacleInfo, AiInsights } from "@/features/onboarding/types";
import { BottomSheet } from "@/features/app/components/BottomSheet";

const PINNACLE_THEMES: Record<number, string> = {
  1: "Самостоятельность и лидерство",
  2: "Терпение и сотрудничество",
  3: "Творчество и самовыражение",
  4: "Труд и строительство",
  5: "Свобода и перемены",
  6: "Семья и ответственность",
  7: "Духовный поиск",
  8: "Материальный успех",
  9: "Служение и мудрость",
};

const INFO = {
  what: "Четыре Пика Судьбы — крупные жизненные главы. Каждый пик задаёт главную тему на определённый период жизни.",
  how: "Вычисляются из числа месяца, дня и года рождения. Первый пик заканчивается в возрасте 36 минус Число Жизненного Пути, далее каждый пик длится 9 лет.",
};

export function PinnaclesCard({
  pinnacles,
  aiInsights,
  onUnlock,
}: {
  pinnacles: PinnacleInfo[];
  aiInsights: AiInsights | null;
  onUnlock?: () => void;
}) {
  const [infoOpen, setInfoOpen] = useState(false);
  const current = pinnacles.find((p) => p.is_current);
  const body = aiInsights?.pinnacle_body ?? (current
    ? `Пик ${current.number} — период ${PINNACLE_THEMES[current.number] ?? ""}. Это определяет главную тему данного отрезка жизни.`
    : "");

  return (
    <>
      <div
        className="rounded-[24px]"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid rgba(123,94,248,0.2)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
        }}
      >
        {/* Visible header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--text-muted)" }}>
            Пики судьбы
          </p>
          <button
            type="button"
            onClick={() => setInfoOpen(true)}
            className="flex h-6 w-6 items-center justify-center rounded-full"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--border-subtle)", color: "var(--text-muted)", fontSize: 11, fontWeight: 700 }}
            aria-label="Что это"
          >
            i
          </button>
        </div>

        {/* Blurred content */}
        <div className="relative px-5 pb-5 overflow-hidden rounded-b-[24px]">
          {/* Blur overlay */}
          <div
            className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer"
            style={{
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              background: "linear-gradient(to bottom, rgba(17,17,40,0.15), rgba(17,17,40,0.85))",
            }}
            onClick={onUnlock}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--accent-soft)" }}>
              ✦ Нажми чтобы разблокировать
            </span>
          </div>

          {/* Timeline */}
          <div className="mt-4 flex items-start gap-0">
            {pinnacles.map((p, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                {/* Node */}
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-base font-black"
                  style={{
                    background: p.is_current ? "rgba(123,94,248,0.25)" : "var(--bg-elevated)",
                    border: p.is_current ? "2px solid #7B5EF8" : "1px solid var(--border-subtle)",
                    color: p.is_current ? "#7B5EF8" : "var(--text-muted)",
                  }}
                >
                  {p.number}
                </div>
                {/* Connector */}
                {i < pinnacles.length - 1 && (
                  <div className="absolute" />
                )}
                {/* Age label */}
                <p className="mt-1.5 text-[9px] font-semibold text-center" style={{ color: "var(--text-muted)" }}>
                  {p.start_age}–{p.end_age ?? "∞"}
                </p>
                <p className="mt-0.5 text-[8px] text-center leading-tight px-1" style={{ color: p.is_current ? "var(--accent-soft)" : "var(--text-muted)", opacity: 0.7 }}>
                  {(PINNACLE_THEMES[p.number] ?? "").split(" ").slice(0, 2).join(" ")}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-3 text-xs leading-5" style={{ color: "var(--text-secondary)" }}>
            {body}
          </p>
        </div>
      </div>

      {infoOpen && (
        <BottomSheet onClose={() => setInfoOpen(false)}>
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--accent-soft)" }}>
                Пики судьбы
              </p>
              <h3 className="mt-2 text-[20px] font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
                Что это значит
              </h3>
            </div>
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
