"use client";

import { useState } from "react";
import { DrumDatePicker } from "@/features/onboarding/components/DrumDatePicker";

type NewCalculationSheetProps = {
  onSelectNumerology: (birthDate: string, name: string) => void;
  onSelectCompat: () => void;
  onSelectHoroscope: () => void;
  onClose: () => void;
};

type Step = "menu" | "numerology";

export function NewCalculationSheet({
  onSelectNumerology,
  onSelectCompat,
  onSelectHoroscope,
  onClose,
}: NewCalculationSheetProps) {
  const [step, setStep] = useState<Step>("menu");
  const [birthDate, setBirthDate] = useState("");
  const [name, setName] = useState("");

  if (step === "numerology") {
    const isValid = birthDate.length === 10;

    return (
      <div className="space-y-5">
        <button
          type="button"
          onClick={() => setStep("menu")}
          className="flex items-center gap-1.5 text-sm font-medium transition active:opacity-60"
          style={{ color: "var(--text-muted)", background: "none", border: "none" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Назад
        </button>

        <div>
          <h3
            className="text-lg font-bold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Нумерологический расчёт
          </h3>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Введи дату рождения для нового расклада.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label
              className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em]"
              style={{ color: "var(--text-muted)" }}
            >
              Дата рождения
            </label>
            <DrumDatePicker value={birthDate} onChange={setBirthDate} />
          </div>

          <div>
            <label
              className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em]"
              style={{ color: "var(--text-muted)" }}
            >
              Имя <span style={{ color: "var(--text-muted)", opacity: 0.6 }}>(необязательно)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Имя для персонализации"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition focus:ring-1"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
              }}
            />
          </div>
        </div>

        <button
          type="button"
          disabled={!isValid}
          onClick={() => onSelectNumerology(birthDate, name)}
          className="w-full rounded-2xl py-3.5 text-sm font-semibold text-white transition active:scale-[0.98]"
          style={{
            background: isValid ? "var(--grad-cta)" : "var(--bg-elevated)",
            boxShadow: isValid ? "0 6px 20px rgba(123,94,248,0.35)" : "none",
            color: isValid ? "#fff" : "var(--text-muted)",
            opacity: isValid ? 1 : 0.6,
          }}
        >
          Рассчитать →
        </button>
      </div>
    );
  }

  // Menu step
  return (
    <div className="space-y-4">
      <div className="px-1">
        <h3
          className="text-lg font-bold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          Новый расчёт
        </h3>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Выбери тип расчёта
        </p>
      </div>

      <div className="space-y-2.5">
        <SheetOption
          icon="✦"
          accentColor="#7B5EF8"
          title="Нумерология"
          subtitle="Расчёт по дате рождения"
          onClick={() => setStep("numerology")}
        />
        <SheetOption
          icon="♥"
          accentColor="#F472B6"
          title="Совместимость"
          subtitle="Проверь энергии с партнёром"
          onClick={onSelectCompat}
        />
        <SheetOption
          icon="★"
          accentColor="#60A5FA"
          title="Гороскоп"
          subtitle="Знак, прогноз, совместимость"
          onClick={onSelectHoroscope}
        />
      </div>
    </div>
  );
}

function SheetOption({
  icon,
  accentColor,
  title,
  subtitle,
  disabled = false,
  onClick,
}: {
  icon: string;
  accentColor: string;
  title: string;
  subtitle: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-left transition active:scale-[0.98]"
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
        opacity: disabled ? 0.45 : 1,
        cursor: disabled ? "default" : "pointer",
      }}
    >
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-lg"
        style={{
          background: `${accentColor}18`,
          border: `1px solid ${accentColor}30`,
          color: accentColor,
        }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className="text-[14px] font-semibold leading-tight"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </p>
        <p
          className="mt-0.5 text-xs"
          style={{ color: "var(--text-secondary)" }}
        >
          {subtitle}
        </p>
      </div>
      {!disabled && (
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ color: "var(--text-muted)", flexShrink: 0 }}
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      )}
    </button>
  );
}
