"use client";

import { useEffect, useState } from "react";
import { PersonalityScores, AiInsights } from "@/features/onboarding/types";
import { BottomSheet } from "@/features/app/components/BottomSheet";

const AXES = [
  { key: "leadership", label: "Лидерство" },
  { key: "intuition",  label: "Интуиция"  },
  { key: "creativity", label: "Творчество" },
  { key: "logic",      label: "Логика"    },
  { key: "empathy",    label: "Эмпатия"   },
] as const;

const INFO = {
  what: "Профиль личности строится из числа Жизненного Пути и отражает распределение твоих природных качеств по пяти ключевым измерениям.",
  how: "Каждое число от 1 до 9 задаёт уникальный профиль: интенсивность лидерства, интуиции, творчества, логики и эмпатии определяется архетипом твоего числа.",
};

function polarToCartesian(cx: number, cy: number, r: number, angleIndex: number, total: number) {
  const angle = (angleIndex / total) * 2 * Math.PI - Math.PI / 2;
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  };
}

function buildPolygon(cx: number, cy: number, maxR: number, values: number[], maxVal: number, total: number) {
  return values
    .map((v, i) => {
      const r = (v / maxVal) * maxR;
      const { x, y } = polarToCartesian(cx, cy, r, i, total);
      return `${x},${y}`;
    })
    .join(" ");
}

export function PersonalityRadarCard({
  scores,
  aiInsights,
}: {
  scores: PersonalityScores;
  aiInsights: AiInsights | null;
}) {
  const [animated, setAnimated] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(t);
  }, []);

  const cx = 80;
  const cy = 80;
  const maxR = 58;
  const maxVal = 10;
  const values = AXES.map((a) => scores[a.key]);
  const total = AXES.length;

  // Grid rings at 25%, 50%, 75%, 100%
  const gridRings = [0.25, 0.5, 0.75, 1.0];

  const polygonPoints = buildPolygon(cx, cy, maxR, animated ? values : values.map(() => 0), maxVal, total);
  const gridPoints = (fraction: number) =>
    AXES.map((_, i) => {
      const { x, y } = polarToCartesian(cx, cy, maxR * fraction, i, total);
      return `${x},${y}`;
    }).join(" ");

  const summary = aiInsights?.personality_summary ?? "Уникальный профиль, сформированный числом жизненного пути.";

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
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--text-muted)" }}>
            Профиль личности
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

        <div className="mt-4 flex items-center gap-4">
          {/* SVG Radar */}
          <svg width="160" height="160" viewBox="0 0 160 160" className="flex-shrink-0">
            {/* Grid rings */}
            {gridRings.map((f) => (
              <polygon
                key={f}
                points={gridPoints(f)}
                fill="none"
                stroke="rgba(255,255,255,0.07)"
                strokeWidth="1"
              />
            ))}
            {/* Axis lines */}
            {AXES.map((_, i) => {
              const { x, y } = polarToCartesian(cx, cy, maxR, i, total);
              return (
                <line
                  key={i}
                  x1={cx} y1={cy} x2={x} y2={y}
                  stroke="rgba(255,255,255,0.07)"
                  strokeWidth="1"
                />
              );
            })}
            {/* Data polygon */}
            <polygon
              points={polygonPoints}
              fill="rgba(123,94,248,0.18)"
              stroke="#7B5EF8"
              strokeWidth="2"
              strokeLinejoin="round"
              style={{ transition: "points 0.9s cubic-bezier(0.4,0,0.2,1)" }}
            />
            {/* Dots */}
            {(animated ? values : values.map(() => 0)).map((v, i) => {
              const r = (v / maxVal) * maxR;
              const { x, y } = polarToCartesian(cx, cy, r, i, total);
              return (
                <circle
                  key={i} cx={x} cy={y} r={3}
                  fill="#7B5EF8"
                  style={{ transition: "cx 0.9s ease, cy 0.9s ease" }}
                />
              );
            })}
            {/* Axis labels */}
            {AXES.map((axis, i) => {
              const { x, y } = polarToCartesian(cx, cy, maxR + 14, i, total);
              return (
                <text
                  key={axis.key}
                  x={x} y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="8"
                  fill="rgba(255,255,255,0.45)"
                  fontWeight="600"
                >
                  {axis.label}
                </text>
              );
            })}
          </svg>

          {/* Score list */}
          <div className="flex-1 space-y-2">
            {AXES.map((axis) => {
              const val = scores[axis.key];
              return (
                <div key={axis.key}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-semibold" style={{ color: "var(--text-muted)" }}>
                      {axis.label}
                    </span>
                    <span className="text-[10px] font-bold" style={{ color: "var(--text-primary)" }}>
                      {val}/10
                    </span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: animated ? `${val * 10}%` : "0%",
                        background: "var(--accent-primary)",
                        transition: "width 0.9s cubic-bezier(0.4,0,0.2,1)",
                        transitionDelay: "0.1s",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="mt-3 text-xs leading-5" style={{ color: "var(--text-secondary)" }}>
          {summary}
        </p>
      </div>

      {infoOpen && (
        <BottomSheet onClose={() => setInfoOpen(false)}>
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--accent-soft)" }}>
                Профиль личности
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
