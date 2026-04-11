"use client";

import { useEffect, useState } from "react";
import { AiInsights } from "@/features/onboarding/types";
import { BottomSheet } from "@/features/app/components/BottomSheet";

const LIFE_PATH_ARCHETYPES: Record<number, { name: string; icon: string; color: string }> = {
  1: { name: "Первопроходец", icon: "⚡", color: "#F59E0B" },
  2: { name: "Дипломат",      icon: "☽", color: "#60A5FA" },
  3: { name: "Творец",        icon: "✦", color: "#F472B6" },
  4: { name: "Строитель",     icon: "◼", color: "#34D399" },
  5: { name: "Искатель",      icon: "◈", color: "#FB923C" },
  6: { name: "Хранитель",     icon: "♥", color: "#A78BFA" },
  7: { name: "Мыслитель",     icon: "◉", color: "#7B5EF8" },
  8: { name: "Властитель",    icon: "∞", color: "#FBBF24" },
  9: { name: "Мудрец",        icon: "✿", color: "#C084FC" },
};

const INFO = {
  what: "Число Жизненного Пути — ключевая вибрация твоей жизни. Определяет твою природу, основные уроки и путь развития.",
  how: "Складываются все цифры даты рождения до однозначного числа (или мастер-числа 11, 22, 33). Например, 14.03.1990 → 1+4+0+3+1+9+9+0 = 27 → 2+7 = 9.",
};

export function LifePathRingCard({
  lifePathNumber,
  aiInsights,
}: {
  lifePathNumber: number;
  aiInsights: AiInsights | null;
}) {
  const [animated, setAnimated] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const archetype = LIFE_PATH_ARCHETYPES[lifePathNumber] ?? LIFE_PATH_ARCHETYPES[9];
  const accent = archetype.color;

  // Ring geometry
  const radius = 52;
  const stroke = 6;
  const circumference = 2 * Math.PI * radius;
  const fill = (lifePathNumber / 9) * circumference;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 120);
    return () => clearTimeout(t);
  }, []);

  const headline = aiInsights?.life_path_headline ?? archetype.name;
  const body = aiInsights?.life_path_body ?? `Число жизненного пути ${lifePathNumber} — твоя главная вибрация. Оно определяет, как ты движешься по жизни и какие уроки тебе предназначены.`;

  return (
    <>
      <div
        className="rounded-[24px] p-5"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: accent }}>
            Жизненный путь
          </p>
          <button
            type="button"
            onClick={() => setInfoOpen(true)}
            className="flex h-6 w-6 items-center justify-center rounded-full transition active:scale-90"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--border-subtle)", color: "var(--text-muted)", fontSize: 11, fontWeight: 700 }}
            aria-label="Что это"
          >
            i
          </button>
        </div>

        {/* Ring + number */}
        <div className="mt-4 flex items-center gap-5">
          <div className="relative flex-shrink-0" style={{ width: 120, height: 120 }}>
            <svg width="120" height="120" viewBox="0 0 120 120">
              {/* Track */}
              <circle
                cx="60" cy="60" r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={stroke}
              />
              {/* Fill */}
              <circle
                cx="60" cy="60" r={radius}
                fill="none"
                stroke={accent}
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={animated ? circumference - fill : circumference}
                transform="rotate(-90 60 60)"
                style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
              />
            </svg>
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[38px] font-black leading-none" style={{ color: "var(--text-primary)" }}>
                {lifePathNumber}
              </span>
              <span className="text-lg leading-none mt-0.5">{archetype.icon}</span>
            </div>
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 mb-2"
              style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}
            >
              <span className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: accent }}>
                {archetype.name}
              </span>
            </div>
            <h3 className="text-[16px] font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
              {headline}
            </h3>
            <p className="mt-1.5 text-xs leading-5" style={{ color: "var(--text-secondary)" }}>
              {body}
            </p>
          </div>
        </div>
      </div>

      {infoOpen && (
        <BottomSheet onClose={() => setInfoOpen(false)}>
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: accent }}>
                Жизненный путь · {lifePathNumber}
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
