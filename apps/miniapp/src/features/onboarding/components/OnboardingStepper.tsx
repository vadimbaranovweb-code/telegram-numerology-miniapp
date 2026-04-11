"use client";

import { useState, FormEvent } from "react";
import { t } from "@/i18n";
import { DrumDatePicker } from "./DrumDatePicker";

type OnboardingStepperProps = {
  birthDate: string;
  fullName: string;
  dailyOptIn: boolean;
  isSubmitting: boolean;
  isFormValid: boolean;
  error: string | null;
  telegramFirstName?: string;
  onBirthDateChange: (value: string) => void;
  onFullNameChange: (value: string) => void;
  onDailyOptInChange: (value: boolean) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

type Step = 1 | 2;

export function OnboardingStepper({
  birthDate,
  fullName,
  dailyOptIn,
  isSubmitting,
  isFormValid,
  error,
  telegramFirstName,
  onBirthDateChange,
  onFullNameChange,
  onDailyOptInChange,
  onSubmit,
}: OnboardingStepperProps) {
  const [step, setStep] = useState<Step>(1);
  const [animDir, setAnimDir] = useState<"forward" | "back">("forward");

  function goNext() {
    setAnimDir("forward");
    setStep(2);
  }

  function goBack() {
    setAnimDir("back");
    setStep(1);
  }

  const animStyle = {
    animation:
      animDir === "forward"
        ? "step-enter 0.28s ease forwards"
        : "step-enter-back 0.28s ease forwards",
  };

  return (
    <div>
      {/* Step progress indicator */}
      <div className="mb-5 flex items-center justify-center gap-2">
        {([1, 2] as Step[]).map((s) => (
          <div
            key={s}
            className="rounded-full transition-all duration-300"
            style={{
              width: s === step ? 20 : 6,
              height: 6,
              background:
                s === step
                  ? "var(--accent-primary)"
                  : s < step
                  ? "var(--accent-soft)"
                  : "var(--border-subtle)",
            }}
          />
        ))}
      </div>

      {/* Step 1 — Name */}
      {step === 1 && (
        <section
          key="step-1"
          className="rounded-[28px] p-5"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
            ...animStyle,
          }}
        >
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.22em]"
            style={{ color: "var(--text-muted)" }}
          >
            1 / 2
          </p>
          <h2
            className="mt-3 text-[22px] font-bold tracking-tight"
            style={{ color: "var(--text-primary)" }}
            suppressHydrationWarning
          >
            {t.onboarding.step_name_title}
          </h2>
          <p
            className="mt-1 text-sm leading-6"
            style={{ color: "var(--text-secondary)" }}
            suppressHydrationWarning
          >
            {t.onboarding.step_name_subtitle}
          </p>

          <div className="mt-5 space-y-3">
            {/* Telegram name suggestion */}
            {telegramFirstName && !fullName && (
              <button
                type="button"
                onClick={() => onFullNameChange(telegramFirstName)}
                className="flex w-full items-center gap-2.5 rounded-2xl px-4 py-3 text-left transition active:scale-[0.98]"
                style={{
                  background: "rgba(123,94,248,0.1)",
                  border: "1px solid rgba(123,94,248,0.25)",
                }}
              >
                <span style={{ color: "var(--accent-soft)" }}>✦</span>
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                  suppressHydrationWarning
                >
                  {t.onboarding.step_name_use} «{telegramFirstName}»
                </span>
              </button>
            )}

            <input
              type="text"
              placeholder={t.onboarding.name_placeholder}
              value={fullName}
              onChange={(e) => onFullNameChange(e.target.value)}
              className="w-full rounded-2xl px-4 py-3 text-[15px] outline-none transition"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--accent-primary)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border-subtle)";
              }}
            />
          </div>

          <button
            type="button"
            onClick={goNext}
            className="mt-5 w-full rounded-2xl py-3.5 text-sm font-semibold text-white transition active:scale-[0.98]"
            style={{ background: "var(--grad-cta)" }}
            suppressHydrationWarning
          >
            {t.onboarding.step_name_next}
          </button>
        </section>
      )}

      {/* Step 2 — Date */}
      {step === 2 && (
        <section
          key="step-2"
          className="rounded-[28px] p-5"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
            ...animStyle,
          }}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={goBack}
              className="flex h-8 w-8 items-center justify-center rounded-full transition active:scale-90"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-muted)",
              }}
              aria-label="Back"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: "var(--text-muted)" }}
            >
              2 / 2
            </p>
          </div>

          <h2
            className="mt-3 text-[22px] font-bold tracking-tight"
            style={{ color: "var(--text-primary)" }}
            suppressHydrationWarning
          >
            {t.onboarding.step_date_title}
          </h2>
          <p
            className="mt-1 text-sm leading-6"
            style={{ color: "var(--text-secondary)" }}
            suppressHydrationWarning
          >
            {t.onboarding.step_date_subtitle}
          </p>

          <form className="mt-5 space-y-4" onSubmit={onSubmit}>
            <DrumDatePicker value={birthDate} onChange={onBirthDateChange} />

            {/* Daily opt-in */}
            <label
              className="flex cursor-pointer items-start gap-3 rounded-2xl px-4 py-3"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div className="relative mt-0.5 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={dailyOptIn}
                  onChange={(e) => onDailyOptInChange(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className="h-5 w-5 rounded-md flex items-center justify-center transition"
                  style={{
                    background: dailyOptIn ? "var(--accent-primary)" : "transparent",
                    border: dailyOptIn
                      ? "1px solid var(--accent-primary)"
                      : "1px solid var(--text-muted)",
                  }}
                >
                  {dailyOptIn && (
                    <svg
                      className="h-3 w-3 text-white"
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="2,6 5,9 10,3" />
                    </svg>
                  )}
                </div>
              </div>
              <span
                className="text-sm leading-6"
                style={{ color: "var(--text-secondary)" }}
                suppressHydrationWarning
              >
                {t.onboarding.daily_optin}
              </span>
            </label>

            {/* Privacy */}
            <p
              className="flex items-center gap-1.5 text-xs"
              style={{ color: "var(--text-muted)" }}
              suppressHydrationWarning
            >
              <span>🔒</span>
              <span>{t.onboarding.privacy}</span>
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="w-full rounded-2xl px-4 py-3.5 text-sm font-semibold text-white transition active:scale-[0.98]"
              style={{
                background:
                  isFormValid && !isSubmitting
                    ? "var(--grad-cta)"
                    : "var(--bg-elevated)",
                color:
                  isFormValid && !isSubmitting ? "white" : "var(--text-muted)",
                cursor:
                  !isFormValid || isSubmitting ? "not-allowed" : "pointer",
                opacity: !isFormValid || isSubmitting ? 0.6 : 1,
              }}
              suppressHydrationWarning
            >
              {isSubmitting
                ? t.onboarding.submitting
                : t.onboarding.submit}
            </button>
          </form>

          {error ? (
            <p
              className="mt-4 rounded-2xl px-4 py-3 text-sm"
              style={{
                background: "rgba(244,63,94,0.1)",
                border: "1px solid rgba(244,63,94,0.2)",
                color: "#FDA4AF",
              }}
            >
              {error}
            </p>
          ) : null}
        </section>
      )}
    </div>
  );
}
