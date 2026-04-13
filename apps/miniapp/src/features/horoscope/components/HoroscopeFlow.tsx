"use client";

import { useState } from "react";
import { DrumDatePicker } from "@/features/onboarding/components/DrumDatePicker";
import { GenerationLoadingScreen } from "@/features/app/components/GenerationLoadingScreen";
import type {
  HoroscopeReadingResponse,
  HoroscopeCompatibilityResponse,
  ZodiacCard,
} from "../types";

type HoroscopeFlowStep = "menu" | "reading_date" | "reading_result" | "compat_date" | "compat_result";

type HoroscopeFlowProps = {
  birthDate: string;
  horoscopeResult: HoroscopeReadingResponse | null;
  horoscopeCompatResult: HoroscopeCompatibilityResponse | null;
  isSubmitting: boolean;
  error: string | null;
  onSubmitReading: (birthDate: string) => void;
  onSubmitCompat: (sourceBirthDate: string, targetBirthDate: string, targetName: string) => void;
  onClose: () => void;
};

export function HoroscopeFlow({
  birthDate: defaultBirthDate,
  horoscopeResult,
  horoscopeCompatResult,
  isSubmitting,
  error,
  onSubmitReading,
  onSubmitCompat,
  onClose,
}: HoroscopeFlowProps) {
  const [step, setStep] = useState<HoroscopeFlowStep>("menu");
  const [readingDate, setReadingDate] = useState(defaultBirthDate);
  const [compatSourceDate, setCompatSourceDate] = useState(defaultBirthDate);
  const [compatTargetDate, setCompatTargetDate] = useState("");
  const [compatTargetName, setCompatTargetName] = useState("");

  if (isSubmitting) {
    return (
      <FlowShell onClose={onClose} showBack={false}>
        <GenerationLoadingScreen />
      </FlowShell>
    );
  }

  // Auto-advance to result after data arrives
  if (horoscopeResult && step === "reading_date") {
    setStep("reading_result");
  }
  if (horoscopeCompatResult && step === "compat_date") {
    setStep("compat_result");
  }

  // ── Menu ──────────────────────────────────────────────────────────
  if (step === "menu") {
    return (
      <FlowShell onClose={onClose} showBack={false}>
        <div className="px-1 pt-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--accent-soft)" }}>
            Гороскоп
          </p>
          <h2 className="mt-3 text-[24px] font-bold tracking-tight leading-tight" style={{ color: "var(--text-primary)" }}>
            Что хочешь узнать?
          </h2>
          <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
            Выбери тип астрологического расклада.
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <MenuButton icon="★" label="Мой гороскоп" desc="Знак, стихия, прогноз дня" onClick={() => setStep("reading_date")} />
          <MenuButton icon="♥" label="Совместимость знаков" desc="Проверь зодиакальную химию" onClick={() => setStep("compat_date")} />
        </div>
      </FlowShell>
    );
  }

  // ── Reading: date input ───────────────────────────────────────────
  if (step === "reading_date") {
    return (
      <FlowShell onClose={() => setStep("menu")} showBack backLabel="Назад">
        <div className="px-1 pt-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--accent-soft)" }}>
            Гороскоп
          </p>
          <h2 className="mt-3 text-[22px] font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Дата рождения
          </h2>
        </div>

        <div className="mt-5 space-y-5">
          <DrumDatePicker value={readingDate} onChange={setReadingDate} />

          {error && <ErrorBlock message={error} />}

          <button
            type="button"
            disabled={!readingDate}
            onClick={() => onSubmitReading(readingDate)}
            className="w-full rounded-2xl py-4 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-50"
            style={{ background: "var(--grad-cta)" }}
          >
            Получить расклад →
          </button>
        </div>
      </FlowShell>
    );
  }

  // ── Reading: result ───────────────────────────────────────────────
  if (step === "reading_result" && horoscopeResult) {
    const { zodiac, daily_forecast, personal_reading, cards } = horoscopeResult;
    return (
      <FlowShell onClose={onClose} showBack backLabel="Главная">
        {/* Header */}
        <div className="px-1 pt-2 mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--accent-soft)" }}>
            Гороскоп
          </p>
          <h2 className="mt-2 text-[22px] font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            {zodiac.symbol} {zodiac.sign_ru}
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            {zodiac.date_range} · {zodiac.element_ru} · {zodiac.ruling_planet}
          </p>
        </div>

        {/* Cards */}
        {cards.map((card, i) => (
          <div key={i} className="mt-3">
            <InfoCard card={card} />
          </div>
        ))}

        {/* Strengths / Weaknesses */}
        <div className="mt-3">
          <TraitCard
            label="Сильные стороны"
            items={personal_reading.strengths}
            color="#34D399"
            icon="✦"
          />
        </div>
        <div className="mt-3">
          <TraitCard
            label="Зоны роста"
            items={personal_reading.weaknesses}
            color="#F472B6"
            icon="◆"
          />
        </div>

        {/* Lucky number */}
        <div className="mt-3">
          <div
            className="rounded-[20px] p-5"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "#60A5FA" }}>
              Число дня
            </p>
            <p className="mt-2 text-[32px] font-bold" style={{ color: "var(--text-primary)" }}>
              {daily_forecast.lucky_number}
            </p>
            <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
              Фокус: {daily_forecast.focus_area}
            </p>
          </div>
        </div>

        <div className="h-8" />
      </FlowShell>
    );
  }

  // ── Compat: date input ────────────────────────────────────────────
  if (step === "compat_date") {
    return (
      <FlowShell onClose={() => setStep("menu")} showBack backLabel="Назад">
        <div className="px-1 pt-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--accent-soft)" }}>
            Совместимость знаков
          </p>
          <h2 className="mt-3 text-[22px] font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Даты рождения
          </h2>
        </div>

        <div className="mt-5 space-y-5">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--accent-soft)" }}>
              Первый человек
            </label>
            <DrumDatePicker value={compatSourceDate} onChange={setCompatSourceDate} />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--accent-soft)" }}>
              Второй человек
            </label>
            <DrumDatePicker value={compatTargetDate} onChange={setCompatTargetDate} />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--text-muted)" }}>
              Имя <span style={{ opacity: 0.6 }}>(необязательно)</span>
            </label>
            <input
              type="text"
              placeholder="Имя второго человека"
              value={compatTargetName}
              onChange={(e) => setCompatTargetName(e.target.value)}
              className="w-full rounded-2xl px-4 py-3 text-sm outline-none transition"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
            />
          </div>

          {error && <ErrorBlock message={error} />}

          <button
            type="button"
            disabled={!compatSourceDate || !compatTargetDate}
            onClick={() => onSubmitCompat(compatSourceDate, compatTargetDate, compatTargetName)}
            className="w-full rounded-2xl py-4 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-50"
            style={{ background: "var(--grad-cta)" }}
          >
            Проверить совместимость →
          </button>
        </div>
      </FlowShell>
    );
  }

  // ── Compat: result ────────────────────────────────────────────────
  if (step === "compat_result" && horoscopeCompatResult) {
    const { source_zodiac, target_zodiac, compatibility, cards } = horoscopeCompatResult;
    return (
      <FlowShell onClose={onClose} showBack backLabel="Главная">
        <div className="px-1 pt-2 mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--accent-soft)" }}>
            Совместимость знаков
          </p>
          <h2 className="mt-2 text-[22px] font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            {source_zodiac.symbol} {source_zodiac.sign_ru} + {target_zodiac.symbol} {target_zodiac.sign_ru}
          </h2>
        </div>

        {/* Score ring */}
        <div
          className="rounded-[24px] p-6 flex flex-col items-center"
          style={{ background: "var(--bg-surface)", border: "1px solid rgba(96,165,250,0.2)", boxShadow: "0 12px 40px rgba(0,0,0,0.3)" }}
        >
          <div
            className="flex h-24 w-24 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(#60A5FA ${compatibility.score * 3.6}deg, rgba(96,165,250,0.1) 0deg)`,
            }}
          >
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full"
              style={{ background: "var(--bg-surface)" }}
            >
              <span className="text-2xl font-bold" style={{ color: "#60A5FA" }}>
                {compatibility.score}
              </span>
            </div>
          </div>
          <p className="mt-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {compatibility.headline}
          </p>
          <p className="mt-1 text-xs text-center" style={{ color: "var(--text-secondary)" }}>
            {compatibility.body}
          </p>
        </div>

        {/* Cards */}
        {cards.map((card, i) => (
          <div key={i} className="mt-3">
            <InfoCard card={card} />
          </div>
        ))}

        <div className="h-8" />
      </FlowShell>
    );
  }

  // Fallback
  return (
    <FlowShell onClose={onClose} showBack={false}>
      <p style={{ color: "var(--text-muted)" }}>Загрузка...</p>
    </FlowShell>
  );
}

// ── Sub-components ──────────────────────────────────────────────────

function MenuButton({ icon, label, desc, onClick }: { icon: string; label: string; desc: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-[20px] p-5 text-left transition active:scale-[0.98]"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", boxShadow: "0 6px 20px rgba(0,0,0,0.25)" }}
    >
      <span
        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-xl"
        style={{ background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.2)", color: "#60A5FA" }}
      >
        {icon}
      </span>
      <div>
        <span className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>{label}</span>
        <p className="mt-0.5 text-xs" style={{ color: "var(--text-secondary)" }}>{desc}</p>
      </div>
      <svg className="ml-auto flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-muted)" }}>
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  );
}

function InfoCard({ card }: { card: ZodiacCard }) {
  return (
    <div
      className="rounded-[20px] p-5"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", boxShadow: "0 6px 20px rgba(0,0,0,0.25)" }}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "#60A5FA" }}>
        {card.label}
      </p>
      <h4 className="mt-2 text-[16px] font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
        {card.headline}
      </h4>
      <p className="mt-1.5 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
        {card.body}
      </p>
    </div>
  );
}

function TraitCard({ label, items, color, icon }: { label: string; items: string[]; color: string; icon: string }) {
  return (
    <div
      className="rounded-[20px] p-5"
      style={{ background: "var(--bg-surface)", border: `1px solid ${color}25` }}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color }}>
        {label}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-full px-3 py-1.5 text-xs font-medium"
            style={{ background: `${color}12`, border: `1px solid ${color}25`, color }}
          >
            {icon} {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function ErrorBlock({ message }: { message: string }) {
  return (
    <p
      className="rounded-2xl px-4 py-3 text-sm"
      style={{ background: "rgba(244,114,182,0.08)", border: "1px solid rgba(244,114,182,0.25)", color: "#F9A8D4" }}
    >
      {message}
    </p>
  );
}

function FlowShell({ children, onClose, showBack, backLabel }: { children: React.ReactNode; onClose: () => void; showBack: boolean; backLabel?: string }) {
  return (
    <div className="min-h-screen pb-10">
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
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", color: "var(--text-muted)" }}
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
