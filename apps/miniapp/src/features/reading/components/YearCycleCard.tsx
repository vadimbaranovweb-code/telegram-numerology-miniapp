"use client";

import { useState } from "react";
import { AiInsights } from "@/features/onboarding/types";
import { BottomSheet } from "@/features/app/components/BottomSheet";

const YEAR_THEMES: Record<number, { theme: string; icon: string; desc: string }> = {
  1: { theme: "Новое начало",      icon: "⚡", desc: "Год запуска и чистого листа. Время сеять новые намерения и делать первый шаг." },
  2: { theme: "Партнёрство",       icon: "☽", desc: "Год терпения и кооперации. Важно слушать и укреплять связи с людьми." },
  3: { theme: "Творчество",        icon: "✦", desc: "Год выражения себя. Видимость, общение и радость выходят на первый план." },
  4: { theme: "Структура",         icon: "◼", desc: "Год труда и фундамента. Всё построенное сейчас будет держаться годами." },
  5: { theme: "Перемены",          icon: "◈", desc: "Год движения и свободы. Ожидай неожиданного и будь гибким." },
  6: { theme: "Ответственность",   icon: "♥", desc: "Год заботы о близких и гармонии. Дом и семья в центре внимания." },
  7: { theme: "Рефлексия",         icon: "◉", desc: "Год внутреннего поиска. Уединение и анализ дадут больше, чем активность." },
  8: { theme: "Амбиции",           icon: "∞", desc: "Год силы и результатов. Финансовые и карьерные темы усиливаются." },
  9: { theme: "Завершение",        icon: "✿", desc: "Год закрытия циклов. Отпусти что устарело — освободишь место для нового." },
};

const INFO = {
  what: "9-летний цикл — фундаментальная структура нумерологии. Каждый год цикла несёт свою тему и задаёт главный контекст событий.",
  how: "Личный Год = сумма числа дня рождения + числа месяца + цифр текущего года, сведённая к однозначному числу.",
};

export function YearCycleCard({
  personalYear,
  personalMonth,
  aiInsights,
}: {
  personalYear: number;
  personalMonth: number;
  aiInsights: AiInsights | null;
}) {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);

  const currentTheme = YEAR_THEMES[personalYear];
  const selectedTheme = selectedYear ? YEAR_THEMES[selectedYear] : null;
  const body = aiInsights?.year_energy_body ?? `${currentTheme.desc} Личный месяц ${personalMonth} уточняет энергию прямо сейчас.`;

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
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--text-muted)" }}>
            Энергия года · цикл 9 лет
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

        {/* Current year highlight */}
        <div className="mt-3 flex items-center gap-3">
          <div
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl text-lg"
            style={{ background: "rgba(123,94,248,0.15)", border: "1px solid rgba(123,94,248,0.3)" }}
          >
            {currentTheme.icon}
          </div>
          <div>
            <p className="text-[13px] font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
              Год {personalYear} · {currentTheme.theme}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Месяц {personalMonth} сейчас
            </p>
          </div>
        </div>

        {/* 9-step cycle */}
        <div className="mt-4 flex items-center gap-1.5">
          {Array.from({ length: 9 }, (_, i) => i + 1).map((year) => {
            const isCurrent = year === personalYear;
            const isSelected = year === selectedYear;
            const theme = YEAR_THEMES[year];
            return (
              <button
                key={year}
                type="button"
                onClick={() => setSelectedYear(isSelected ? null : year)}
                className="flex flex-1 flex-col items-center gap-1 rounded-xl py-2 transition active:scale-95"
                style={{
                  background: isCurrent
                    ? "rgba(123,94,248,0.18)"
                    : isSelected
                    ? "rgba(255,255,255,0.06)"
                    : "transparent",
                  border: isCurrent
                    ? "1px solid rgba(123,94,248,0.4)"
                    : "1px solid transparent",
                }}
              >
                <span className="text-base leading-none">{theme.icon}</span>
                <span
                  className="text-[9px] font-bold"
                  style={{ color: isCurrent ? "#7B5EF8" : "var(--text-muted)" }}
                >
                  {year}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected year tooltip */}
        {selectedTheme && selectedYear && (
          <div
            className="mt-3 rounded-2xl p-3"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
          >
            <p className="text-[11px] font-bold" style={{ color: "var(--accent-soft)" }}>
              Год {selectedYear} · {selectedTheme.theme}
            </p>
            <p className="mt-1 text-xs leading-5" style={{ color: "var(--text-secondary)" }}>
              {selectedTheme.desc}
            </p>
          </div>
        )}

        <p className="mt-3 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
          {body}
        </p>
      </div>

      {infoOpen && (
        <BottomSheet onClose={() => setInfoOpen(false)}>
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--accent-soft)" }}>
                9-летний цикл
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
