"use client";

import { CompatibilityAiInsights } from "../types";
import { BottomSheet } from "@/features/app/components/BottomSheet";
import { useState } from "react";

const INFO = {
  what: "Глубинная связь — уровень совместимости на уровне ценностей, внутренних мотивов и эмоционального резонанса.",
  how: "Анализируется взаимодействие архетипов обоих чисел жизненного пути с учётом их скрытых качеств и теневых сторон.",
};

export function DeepConnectionCard({
  aiInsights,
  onUnlock,
}: {
  aiInsights: CompatibilityAiInsights | null;
  onUnlock?: () => void;
}) {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <>
      <div
        className="rounded-[24px]"
        style={{ background: "var(--bg-surface)", border: "1px solid rgba(123,94,248,0.2)", boxShadow: "0 12px 40px rgba(0,0,0,0.3)" }}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--text-muted)" }}>
            Глубинная связь
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
          <div
            className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer"
            style={{ backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", background: "linear-gradient(to bottom, rgba(17,17,40,0.1), rgba(17,17,40,0.7))" }}
            onClick={onUnlock}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--accent-soft)" }}>✦ Нажми чтобы разблокировать</span>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl p-3" style={{ background: "rgba(192,132,252,0.08)", border: "1px solid rgba(192,132,252,0.2)" }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "#C084FC" }}>◉ Резонанс душ</p>
              <p className="mt-1.5 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
                {aiInsights?.deep_connection_body ?? "Глубокий анализ эмоционального и духовного резонанса между вашими энергиями."}
              </p>
            </div>
            <div className="rounded-2xl p-3" style={{ background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.2)" }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "#60A5FA" }}>✦ Совет паре</p>
              <p className="mt-1.5 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
                {aiInsights?.advice ?? "Персональная рекомендация для вашего числового сочетания."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {infoOpen && (
        <BottomSheet onClose={() => setInfoOpen(false)}>
          <div className="space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--accent-soft)" }}>Глубинная связь</p>
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
