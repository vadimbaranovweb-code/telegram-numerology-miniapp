import { FormEvent } from "react";

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
    <section className="rounded-[28px] border border-stone-200/80 bg-stone-950 p-5 text-stone-50 shadow-[0_12px_40px_rgba(34,24,14,0.24)]">
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-200" htmlFor="birthDate">
            Birth date
          </label>
          <input
            id="birthDate"
            type="date"
            value={birthDate}
            onChange={(event) => onBirthDateChange(event.target.value)}
            className="w-full rounded-2xl border border-stone-700 bg-stone-900 px-4 py-3 text-sm text-stone-50 outline-none transition focus:border-amber-400"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-200" htmlFor="fullName">
            Name
          </label>
          <input
            id="fullName"
            type="text"
            placeholder="Optional, for deeper profile signals"
            value={fullName}
            onChange={(event) => onFullNameChange(event.target.value)}
            className="w-full rounded-2xl border border-stone-700 bg-stone-900 px-4 py-3 text-sm text-stone-50 outline-none transition placeholder:text-stone-500 focus:border-amber-400"
          />
        </div>

        <label className="flex items-start gap-3 rounded-2xl border border-stone-800 bg-stone-900/70 px-4 py-3 text-sm text-stone-200">
          <input
            type="checkbox"
            checked={dailyOptIn}
            onChange={(event) => onDailyOptInChange(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-stone-600 bg-stone-950 text-amber-300"
          />
          <span className="leading-6">
            Get daily insights ready once your reading is unlocked.
          </span>
        </label>

        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className="w-full rounded-2xl bg-amber-300 px-4 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Calculating..." : "See my numbers"}
        </button>
      </form>

      {error ? (
        <p className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-950/50 px-4 py-3 text-sm text-rose-100">
          {error}
        </p>
      ) : null}
    </section>
  );
}
