import { FormEvent } from "react";
import { t } from "@/i18n";
import { DrumDatePicker } from "./DrumDatePicker";

type OnboardingFormProps = {
  birthDate: string;
  fullName: string;
  dailyOptIn: boolean;
  isSubmitting: boolean;
  isFormValid: boolean;
  error: string | null;
  onBirthDateChange: (value: string) => void;
  onFullNameChange: (value: string) => void;
  onDailyOptInChange: (value: boolean) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function OnboardingForm({
  birthDate,
  fullName,
  dailyOptIn,
  isSubmitting,
  isFormValid,
  error,
  onBirthDateChange,
  onFullNameChange,
  onDailyOptInChange,
  onSubmit,
}: OnboardingFormProps) {
  return (
    <section
      className="rounded-[28px] p-5"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
      }}
    >
      <form className="space-y-5" onSubmit={onSubmit}>
        {/* Birth date */}
        <div className="space-y-3">
          <label
            className="block text-[11px] font-semibold uppercase tracking-[0.22em]"
            style={{ color: "var(--text-muted)" }}
            suppressHydrationWarning
          >
            {t.onboarding.birth_label}
          </label>
          <DrumDatePicker value={birthDate} onChange={onBirthDateChange} />
        </div>

        {/* Name */}
        <div className="space-y-2">
          <label
            className="block text-[11px] font-semibold uppercase tracking-[0.22em]"
            htmlFor="fullName"
            style={{ color: "var(--text-muted)" }}
            suppressHydrationWarning
          >
            {t.onboarding.name_label}
            <span
              className="ml-2 normal-case tracking-normal text-xs font-normal"
              style={{ color: "var(--text-muted)" }}
            >
              {t.onboarding.name_optional}
            </span>
          </label>
          <input
            id="fullName"
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

        {/* Privacy note */}
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
          className="w-full rounded-2xl px-4 py-3.5 text-sm font-semibold text-white transition"
          style={{
            background: isFormValid && !isSubmitting
              ? "var(--grad-cta)"
              : "var(--bg-elevated)",
            color: isFormValid && !isSubmitting
              ? "white"
              : "var(--text-muted)",
            cursor: !isFormValid || isSubmitting ? "not-allowed" : "pointer",
            opacity: !isFormValid || isSubmitting ? 0.6 : 1,
          }}
          suppressHydrationWarning
        >
          {isSubmitting ? t.onboarding.submitting : t.onboarding.submit}
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
  );
}
