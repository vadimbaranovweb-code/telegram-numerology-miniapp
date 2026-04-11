"use client";

import { FormEvent, useState } from "react";
import { t } from "@/i18n";
import { DrumDatePicker } from "@/features/onboarding/components/DrumDatePicker";
import { GenerationLoadingScreen } from "@/features/app/components/GenerationLoadingScreen";
import { CompatibilityPreviewResponse, RelationshipContext } from "../types";

type CompatFlowStep = "type" | "date" | "result";

type CompatFlowProps = {
  relationshipContext: RelationshipContext;
  targetBirthDate: string;
  targetDisplayName: string;
  preview: CompatibilityPreviewResponse | null;
  isPremium: boolean;
  isSubmitting: boolean;
  error: string | null;
  onRelationshipContextChange: (v: RelationshipContext) => void;
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
  targetBirthDate,
  targetDisplayName,
  preview,
  isPremium,
  isSubmitting,
  error,
  onRelationshipContextChange,
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
            Дата рождения<br />партнёра
          </h2>
        </div>

        <form className="mt-5 space-y-4" onSubmit={onSubmit}>
          <DrumDatePicker value={targetBirthDate} onChange={onTargetBirthDateChange} />

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
            disabled={!targetBirthDate}
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
  const cards = preview?.preview.cards ?? [];
  const VISIBLE_COUNT = 2;

  return (
    <CompatFlowShell onClose={onClose} showBack backLabel="Главная">
      {/* Header */}
      <div className="px-1 pt-2">
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

      {/* Cards */}
      <div className="mt-5 space-y-3">
        {cards.map((card, index) => {
          const isBlurred = index >= VISIBLE_COUNT && !isPremium;
          return (
            <div
              key={`${card.type}-${index}`}
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: "var(--bg-surface)",
                border: `1px solid ${isBlurred ? "rgba(123,94,248,0.2)" : "var(--border-subtle)"}`,
              }}
            >
              {isBlurred && (
                <div
                  className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl"
                  style={{
                    backdropFilter: "blur(6px)",
                    WebkitBackdropFilter: "blur(6px)",
                    background: "linear-gradient(to bottom, rgba(17,17,40,0.25), rgba(17,17,40,0.85))",
                  }}
                >
                  <span
                    className="text-xs font-semibold uppercase tracking-[0.18em]"
                    style={{ color: "var(--accent-soft)" }}
                  >
                    ✦ Заблокировано
                  </span>
                </div>
              )}
              <div className="p-4">
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                  style={{ color: isBlurred ? "var(--accent-soft)" : "var(--text-muted)" }}
                >
                  {card.type.replaceAll("_", " ")}
                </p>
                <h4
                  className="mt-2 text-base font-bold leading-tight"
                  style={{ color: "var(--text-primary)" }}
                >
                  {card.headline}
                </h4>
                <p
                  className="mt-2 text-sm leading-6"
                  style={{ color: "var(--text-secondary)", filter: isBlurred ? "blur(3px)" : "none" }}
                >
                  {card.body}
                </p>
              </div>
            </div>
          );
        })}
      </div>

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
            {t.paywall.title}
          </h4>
          <ul className="mt-3 space-y-2">
            {t.paywall.benefits.map((b) => (
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
