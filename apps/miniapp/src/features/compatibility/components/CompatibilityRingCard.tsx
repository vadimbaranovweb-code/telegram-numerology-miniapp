"use client";

import { useEffect, useState } from "react";
import { CompatibilityAiInsights } from "../types";

const SCORE_LABELS: Array<{ min: number; label: string; color: string; desc: string }> = [
  { min: 85, label: "Исключительная", color: "#34D399", desc: "Редкое сочетание энергий" },
  { min: 75, label: "Высокая",        color: "#7B5EF8", desc: "Сильное взаимопонимание"  },
  { min: 60, label: "Хорошая",        color: "#60A5FA", desc: "Есть точки роста"          },
  { min: 45, label: "Средняя",        color: "#F59E0B", desc: "Требует работы обоих"      },
  { min: 0,  label: "Особенная",      color: "#F472B6", desc: "Контраст как источник роста" },
];

function getScoreLabel(score: number) {
  return SCORE_LABELS.find((s) => score >= s.min) ?? SCORE_LABELS[SCORE_LABELS.length - 1];
}

const ARCHETYPES: Record<number, { name: string; icon: string }> = {
  1: { name: "Первопроходец", icon: "⚡" },
  2: { name: "Дипломат",      icon: "☽" },
  3: { name: "Творец",        icon: "✦" },
  4: { name: "Строитель",     icon: "◼" },
  5: { name: "Искатель",      icon: "◈" },
  6: { name: "Хранитель",     icon: "♥" },
  7: { name: "Мыслитель",     icon: "◉" },
  8: { name: "Властитель",    icon: "∞" },
  9: { name: "Мудрец",        icon: "✿" },
};

export function CompatibilityRingCard({
  score,
  sourceLifePath,
  targetLifePath,
  targetName,
  aiInsights,
}: {
  score: number;
  sourceLifePath: number;
  targetLifePath: number;
  targetName?: string;
  aiInsights: CompatibilityAiInsights | null;
}) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 120); return () => clearTimeout(t); }, []);

  const scoreInfo = getScoreLabel(score);
  const radius = 52;
  const stroke = 7;
  const circumference = 2 * Math.PI * radius;
  const fill = (score / 100) * circumference;

  const srcArch = ARCHETYPES[sourceLifePath] ?? ARCHETYPES[9];
  const tgtArch = ARCHETYPES[targetLifePath] ?? ARCHETYPES[9];

  return (
    <div
      className="rounded-[24px] p-5"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", boxShadow: "0 12px 40px rgba(0,0,0,0.3)" }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--text-muted)" }}>
        Совместимость
      </p>

      <div className="mt-4 flex items-center gap-5">
        {/* Ring */}
        <div className="relative flex-shrink-0" style={{ width: 120, height: 120 }}>
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
            <circle
              cx="60" cy="60" r={radius} fill="none"
              stroke={scoreInfo.color} strokeWidth={stroke} strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={animated ? circumference - fill : circumference}
              transform="rotate(-90 60 60)"
              style={{ transition: "stroke-dashoffset 1.3s cubic-bezier(0.4,0,0.2,1)" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[32px] font-black leading-none" style={{ color: "var(--text-primary)" }}>{score}</span>
            <span className="text-[9px] font-bold uppercase tracking-[0.1em]" style={{ color: scoreInfo.color }}>из 100</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 mb-2"
            style={{ background: `${scoreInfo.color}18`, border: `1px solid ${scoreInfo.color}30` }}
          >
            <span className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: scoreInfo.color }}>
              {scoreInfo.label}
            </span>
          </div>
          <p className="text-[15px] font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
            {aiInsights?.chemistry_headline ?? scoreInfo.desc}
          </p>
          <p className="mt-1.5 text-xs leading-5" style={{ color: "var(--text-secondary)" }}>
            {aiInsights?.chemistry_body ?? `Числа жизненного пути ${sourceLifePath} и ${targetLifePath} создают уникальную динамику.`}
          </p>
        </div>
      </div>

      {/* Two archetypes */}
      <div className="mt-4 flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
          <span className="text-base">{srcArch.icon}</span>
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-muted)" }}>Ты · {sourceLifePath}</p>
            <p className="text-[11px] font-bold" style={{ color: "var(--text-primary)" }}>{srcArch.name}</p>
          </div>
        </div>
        <span style={{ color: "var(--text-muted)" }}>✦</span>
        <div className="flex-1 flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
          <span className="text-base">{tgtArch.icon}</span>
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-muted)" }}>{targetName ? targetName.split(" ")[0] : "Партнёр"} · {targetLifePath}</p>
            <p className="text-[11px] font-bold" style={{ color: "var(--text-primary)" }}>{tgtArch.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
