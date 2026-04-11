"use client";

import { useEffect, useState } from "react";
import { CompatibilityZoneScores, RelationshipContext } from "../types";
import { BottomSheet } from "@/features/app/components/BottomSheet";

const ZONES: Array<{
  key: keyof CompatibilityZoneScores;
  label: string;
  icon: string;
  color: string;
  desc: string;
}> = [
  { key: "romance",       label: "Романтика",   icon: "♥", color: "#F472B6", desc: "Притяжение, страсть, эмоциональная близость" },
  { key: "communication", label: "Общение",      icon: "◈", color: "#60A5FA", desc: "Как вы разговариваете, слышите друг друга" },
  { key: "values",        label: "Ценности",     icon: "✦", color: "#A78BFA", desc: "Насколько совпадают жизненные приоритеты" },
  { key: "dynamics",      label: "Динамика",     icon: "⚡", color: "#F59E0B", desc: "Энергия взаимодействия, темп, ритм" },
  { key: "longevity",     label: "Перспектива",  icon: "∞", color: "#34D399", desc: "Потенциал долгосрочных отношений" },
];

const CONTEXT_LABELS: Record<RelationshipContext, string> = {
  romantic: "Романтические",
  friend: "Дружеские",
  work: "Рабочие",
};

const INFO = {
  what: "Пять зон показывают, как ваши числа жизненного пути взаимодействуют в разных аспектах отношений.",
  how: "Базовая совместимость по паре чисел жизненного пути корректируется в зависимости от типа отношений — романтические, дружеские или рабочие.",
};

export function CompatibilityZonesCard({
  zones,
  context,
}: {
  zones: CompatibilityZoneScores;
  context: RelationshipContext;
}) {
  const [animated, setAnimated] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 200); return () => clearTimeout(t); }, []);

  return (
    <>
      <div
        className="rounded-[24px] p-5"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", boxShadow: "0 12px 40px rgba(0,0,0,0.3)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--text-muted)" }}>
              Зоны взаимодействия
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
              {CONTEXT_LABELS[context]} отношения
            </p>
          </div>
          <button
            type="button"
            onClick={() => setInfoOpen(true)}
            className="flex h-6 w-6 items-center justify-center rounded-full"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--border-subtle)", color: "var(--text-muted)", fontSize: 11, fontWeight: 700 }}
          >
            i
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {ZONES.map((zone, idx) => {
            const val = zones[zone.key];
            return (
              <div key={zone.key}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm" style={{ color: zone.color }}>{zone.icon}</span>
                    <span className="text-[12px] font-semibold" style={{ color: "var(--text-primary)" }}>{zone.label}</span>
                  </div>
                  <span className="text-[11px] font-bold" style={{ color: zone.color }}>{val}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: animated ? `${val}%` : "0%",
                      background: `linear-gradient(to right, ${zone.color}99, ${zone.color})`,
                      transition: `width 0.9s cubic-bezier(0.4,0,0.2,1)`,
                      transitionDelay: `${idx * 80}ms`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {infoOpen && (
        <BottomSheet onClose={() => setInfoOpen(false)}>
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--accent-soft)" }}>Зоны взаимодействия</p>
              <h3 className="mt-2 text-[20px] font-bold" style={{ color: "var(--text-primary)" }}>Что это значит</h3>
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
            <div className="space-y-2">
              {ZONES.map((z) => (
                <div key={z.key} className="flex items-start gap-2">
                  <span style={{ color: z.color }}>{z.icon}</span>
                  <div>
                    <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{z.label} — </span>
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{z.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </BottomSheet>
      )}
    </>
  );
}
