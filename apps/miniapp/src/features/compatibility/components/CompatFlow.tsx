"use client";

import { FormEvent, useState } from "react";
import { t } from "@/i18n";
import { DrumDatePicker } from "@/features/onboarding/components/DrumDatePicker";
import { GenerationLoadingScreen } from "@/features/app/components/GenerationLoadingScreen";
import { CompatibilityPreviewResponse, RelationshipContext } from "../types";
import { CompatibilityRingCard } from "./CompatibilityRingCard";
import { CompatibilityZonesCard } from "./CompatibilityZonesCard";
import { DestinyTogetherCard } from "./DestinyTogetherCard";
import { DeepConnectionCard } from "./DeepConnectionCard";

type CompatFlowStep = "type" | "date" | "result";

type CompatFlowProps = {
  relationshipContext: RelationshipContext;
  sourceBirthDate: string;
  targetBirthDate: string;
  targetDisplayName: string;
  preview: CompatibilityPreviewResponse | null;
  isPremium: boolean;
  isSubmitting: boolean;
  error: string | null;
  onRelationshipContextChange: (v: RelationshipContext) => void;
  onSourceBirthDateChange: (v: string) => void;
  onTargetBirthDateChange: (v: string) => void;
  onTargetDisplayNameChange: (v: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onUnlock: () => void;
  onClose: () => void;
};

const RELATION_OPTIONS: { value: RelationshipContext; icon: string; label: string }[] = [
  { value: "romantic", icon: "♥", label: "Романтика" },
  { value: "friend",   icon: "✦", label: "Дружба"   },
  { value: "work",     icon: "◈", label: "Работа"   },
];

export function CompatFlow({
  relationshipContext,
  sourceBirthDate,
  targetBirthDate,
  targetDisplayName,
  preview,
  isPremium,
  isSubmitting,
  error,
  onRelationshipContextChange,
  onSourceBirthDateChange,
  onTargetBirthDateChange,
  onTargetDisplayNameChange,
  onSubmit,
  onUnlock,
  onClose,
}: CompatFlowProps) {
  const [step, setStep] = useState<CompatFlowStep>(() => {
    if (preview) return "result";
    return "type";
  });
  const [isUnlocking, setIsUnlocking] = useState(false);

  function goToDate() { setStep("date"); }
  function goToType() { setStep("type"); }

  // After submit completes (preview appears) → auto-advance to result
  if (isSubmitting) {
    return (
      <CompatFlowShell onClose={onClose} showBack={false}>
        <GenerationLoadingScreen />
      </CompatFlowShell>
    );
  }

  if (preview && step !== "result") {
    setStep("result");
  }

  async function handleUnlock() {
    setIsUnlocking(true);
    try {
      await onUnlock();
    } finally {
      setIsUnlocking(false);
    }
  }

  // ── Step 1: Type selection ──────────────────────────────────────
  if (step === "type") {
    return (
      <CompatFlowShell onClose={onClose} showBack={false}>
        <div className="px-1 pt-2">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.22em]"
            style={{ color: "var(--accent-soft)" }}
          >
            Совместимость · 1 / 2
          </p>
          <h2
            className="mt-3 text-[24px] font-bold tracking-tight leading-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Как ваши энергии<br />сочетаются?
          </h2>
          <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
            Выбери тип отношений для анализа совместимости.
          </p>
        </div>

        <div className="mt-6 space-y-3">
          {RELATION_OPTIONS.map((opt) => {
            const isActive = relationshipContext === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onRelationshipContextChange(opt.value); goToDate(); }}
                className="flex w-full items-center gap-4 rounded-[20px] p-5 text-left transition active:scale-[0.98]"
                style={{
                  background: isActive ? "rgba(123,94,248,0.12)" : "var(--bg-surface)",
                  border: `1px solid ${isActive ? "var(--border-glow)" : "var(--border-subtle)"}`,
                  boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
                }}
              >
                <span
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-xl"
                  style={{
                    background: "rgba(123,94,248,0.12)",
                    border: "1px solid rgba(123,94,248,0.2)",
                    color: "var(--accent-soft)",
                  }}
                >
                  {opt.icon}
                </span>
                <span
                  className="text-base font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {opt.label}
                </span>
                <svg
                  className="ml-auto flex-shrink-0"
                  width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  style={{ color: "var(--text-muted)" }}
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            );
          })}
        </div>
      </CompatFlowShell>
    );
  }

  // ── Step 2: Date + name ─────────────────────────────────────────
  if (step === "date") {
    return (
      <CompatFlowShell onClose={goToType} showBack backLabel="Назад">
        <div className="px-1 pt-2">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.22em]"
            style={{ color: "var(--accent-soft)" }}
          >
            Совместимость · 2 / 2
          </p>
          <h2
            className="mt-3 text-[22px] font-bold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Даты рождения
          </h2>
        </div>

        <form className="mt-5 space-y-5" onSubmit={onSubmit}>
          {/* Person 1 */}
          <div>
            <label
              className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em]"
              style={{ color: "var(--accent-soft)" }}
            >
              Первый человек
            </label>
            <DrumDatePicker value={sourceBirthDate} onChange={onSourceBirthDateChange} />
          </div>

          {/* Person 2 */}
          <div>
            <label
              className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em]"
              style={{ color: "var(--accent-soft)" }}
            >
              Второй человек
            </label>
            <DrumDatePicker value={targetBirthDate} onChange={onTargetBirthDateChange} />
          </div>

          <div>
            <label
              className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em]"
              style={{ color: "var(--text-muted)" }}
            >
              {t.compatibility.name} <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(необязательно)</span>
            </label>
            <input
              type="text"
              placeholder={t.compatibility.name_optional}
              value={targetDisplayName}
              onChange={(e) => onTargetDisplayNameChange(e.target.value)}
              className="w-full rounded-2xl px-4 py-3 text-sm outline-none transition"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent-primary)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border-subtle)"; }}
            />
          </div>

          {error && (
            <p
              className="rounded-2xl px-4 py-3 text-sm"
              style={{
                background: "rgba(244,114,182,0.08)",
                border: "1px solid rgba(244,114,182,0.25)",
                color: "#F9A8D4",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!sourceBirthDate || !targetBirthDate}
            className="w-full rounded-2xl py-4 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-50"
            style={{ background: "var(--grad-cta)" }}
          >
            Получить расчёт →
          </button>
        </form>
      </CompatFlowShell>
    );
  }

  // ── Result ──────────────────────────────────────────────────────
  return (
    <CompatFlowShell onClose={onClose} showBack backLabel="Главная">
      {/* Header */}
      <div className="px-1 pt-2 mb-4">
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: "var(--accent-soft)" }}
        >
          {t.compatibility.label}
        </p>
        <h2
          className="mt-2 text-[22px] font-bold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          {preview?.preview.title ?? "Расклад готов"}
        </h2>
        <p className="mt-1 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
          {preview?.preview.summary}
        </p>
      </div>

      {/* Block 1 — Ring + score (always visible) */}
      {preview && (
        <CompatibilityRingCard
          score={preview.compatibility_score}
          sourceLifePath={preview.source_life_path}
          targetLifePath={preview.target_life_path}
          targetName={targetDisplayName}
          aiInsights={preview.ai_insights}
        />
      )}

      {/* Block 2 — Zones (always visible) */}
      {preview?.zone_scores && (
        <div className="mt-3">
          <CompatibilityZonesCard
            zones={preview.zone_scores}
            context={relationshipContext}
          />
        </div>
      )}

      {/* Block 3 — Tension points */}
      {preview && (
        <div className="mt-3">
          <TensionCard
            tensionBody={preview.ai_insights?.tension_body ?? null}
            isPremium={isPremium}
            onUnlock={handleUnlock}
          />
        </div>
      )}

      {/* Block 4 — Destiny Together */}
      {preview && (
        <div className="mt-3">
          <DestinyTogetherCard
            sourceLifePath={preview.source_life_path}
            targetLifePath={preview.target_life_path}
            aiInsights={preview.ai_insights}
            isPremium={isPremium}
            onUnlock={handleUnlock}
          />
        </div>
      )}

      {/* Block 5 — Deep Connection */}
      {preview && (
        <div className="mt-3">
          <DeepConnectionCard
            aiInsights={preview.ai_insights}
            isPremium={isPremium}
            onUnlock={handleUnlock}
          />
        </div>
      )}

      {/* Unlock section (if not premium) */}
      {!isPremium && preview && (
        <div
          className="mt-4 rounded-[20px] p-5"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-glow)",
            boxShadow: "0 0 40px rgba(123,94,248,0.08)",
          }}
        >
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.22em]"
            style={{ color: "var(--accent-soft)" }}
          >
            {t.paywall.label}
          </p>
          <h4
            className="mt-2 text-[18px] font-bold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Расклад + совместимость
          </h4>
          <p className="mt-1 text-sm leading-5" style={{ color: "var(--text-secondary)" }}>
            Одна покупка открывает всё сразу — навсегда.
          </p>
          <ul className="mt-3 space-y-2">
            {[
              "Полный нумерологический расклад: матрица Пифагора, пики судьбы, кармические уроки",
              "Сила и тень — AI-анализ твоих природных талантов и слепых пятен",
              "Совместимость без ограничений — проверяй с кем угодно",
              "Гороскоп — персональный астрологический расклад (скоро)",
              "История всех расчётов сохранена в профиле",
            ].map((b) => (
              <li key={b} className="flex items-start gap-2.5">
                <span style={{ color: "var(--accent-primary)", flexShrink: 0, marginTop: 1 }}>✦</span>
                <span className="text-sm leading-6" style={{ color: "var(--text-secondary)" }}>{b}</span>
              </li>
            ))}
          </ul>
          <div
            className="mt-4 flex items-baseline gap-2 rounded-2xl px-4 py-3"
            style={{ background: "var(--bg-elevated)", border: "1px solid rgba(123,94,248,0.2)" }}
          >
            <span className="text-[26px] font-bold" style={{ color: "var(--text-primary)" }}>
              ⭐ {preview.paywall.price_local ?? 350}
            </span>
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
              {t.paywall.stars} · {t.paywall.one_time}
            </span>
          </div>
          <button
            type="button"
            onClick={handleUnlock}
            disabled={isUnlocking}
            className="mt-4 w-full rounded-2xl py-4 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"
            style={{ background: "var(--grad-cta)" }}
          >
            {isUnlocking ? "Открываем оплату..." : t.compatibility.unlock_cta}
          </button>
          <p className="mt-3 text-center text-xs" style={{ color: "var(--text-muted)" }}>
            {t.paywall.footer}
          </p>
        </div>
      )}

      {/* Spacer for bottom */}
      <div className="h-8" />
    </CompatFlowShell>
  );
}

// ── Tension Card (blurred) ─────────────────────────────────────────
function TensionCard({ tensionBody, isPremium, onUnlock }: { tensionBody: string | null; isPremium: boolean; onUnlock: () => void }) {
  return (
    <div
      className="rounded-[24px]"
      style={{ background: "var(--bg-surface)", border: "1px solid rgba(123,94,248,0.2)", boxShadow: "0 12px 40px rgba(0,0,0,0.3)" }}
    >
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--text-muted)" }}>
          Точки напряжения
        </p>
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
        <div className="rounded-2xl p-3" style={{ background: "rgba(244,114,182,0.08)", border: "1px solid rgba(244,114,182,0.2)" }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "#F472B6" }}>⚡ Зоны конфликтов</p>
          <p className="mt-1.5 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
            {tensionBody ?? "Где могут возникать конфликты и как их преодолевать вместе."}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Shell with back button ─────────────────────────────────────────
function CompatFlowShell({
  children,
  onClose,
  showBack,
  backLabel,
}: {
  children: React.ReactNode;
  onClose: () => void;
  showBack: boolean;
  backLabel?: string;
}) {
  return (
    <div className="min-h-screen pb-10">
      {/* Top nav */}
      <div className="flex items-center gap-3 py-2">
        {showBack ? (
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 transition active:opacity-60"
            style={{ color: "var(--text-muted)", background: "none", border: "none" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span className="text-sm font-medium">{backLabel ?? "Назад"}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-full transition active:opacity-60"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-muted)",
            }}
            aria-label="Закрыть"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
