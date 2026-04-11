"use client";

import { useState } from "react";
import { BottomSheet } from "@/features/app/components/BottomSheet";

// 3x3 grid layout — row top to bottom is 7,8,9 / 4,5,6 / 1,2,3
const GRID_LAYOUT = [
  [7, 8, 9],
  [4, 5, 6],
  [1, 2, 3],
];

const DIGIT_MEANINGS: Record<number, string> = {
  1: "Воля, лидерство",
  2: "Интуиция, чуткость",
  3: "Интерес к познанию",
  4: "Здоровье, стойкость",
  5: "Логика, анализ",
  6: "Труд, мастерство",
  7: "Удача, везение",
  8: "Долг, ответственность",
  9: "Мудрость, память",
};

const INFO = {
  what: "Пифагорова таблица — квадрат, в ячейках которого записаны цифры твоей даты рождения. Число повторений каждой цифры отражает интенсивность соответствующего качества.",
  how: "Все цифры даты рождения (день + месяц + год) записываются в таблицу 3×3. Пустая ячейка — качество нуждается в развитии. Много цифр — качество ярко выражено.",
};

export function PythagoreanMatrixCard({
  matrix,
  onUnlock,
}: {
  matrix: Record<string, number>;
  onUnlock?: () => void;
}) {
  const [infoOpen, setInfoOpen] = useState(false);
  const [tapped, setTapped] = useState<number | null>(null);

  const maxCount = Math.max(...Object.values(matrix), 1);

  return (
    <>
      <div
        className="rounded-[24px]"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid rgba(123,94,248,0.2)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
        }}
      >
        {/* Visible header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--text-muted)" }}>
            Матрица Пифагора
          </p>
          <button
            type="button"
            onClick={() => setInfoOpen(true)}
            className="flex h-6 w-6 items-center justify-center rounded-full"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--border-subtle)", color: "var(--text-muted)", fontSize: 11, fontWeight: 700 }}
            aria-label="Что это"
          >
            i
          </button>
        </div>

        {/* Blurred content */}
        <div className="relative px-5 pb-5 overflow-hidden rounded-b-[24px]">
          {/* Blur overlay */}
          <div
            className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer"
            style={{
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              background: "linear-gradient(to bottom, rgba(17,17,40,0.15), rgba(17,17,40,0.85))",
            }}
            onClick={onUnlock}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--accent-soft)" }}>
              ✦ Нажми чтобы разблокировать
            </span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {GRID_LAYOUT.map((row) =>
              row.map((digit) => {
                const count = matrix[String(digit)] ?? 0;
                const intensity = count / maxCount;
                return (
                  <div
                    key={digit}
                    className="flex flex-col items-center justify-center rounded-2xl py-3"
                    style={{
                      background: count > 0
                        ? `rgba(123,94,248,${0.1 + intensity * 0.3})`
                        : "var(--bg-elevated)",
                      border: count > 0
                        ? `1px solid rgba(123,94,248,${0.2 + intensity * 0.4})`
                        : "1px solid var(--border-subtle)",
                      minHeight: 64,
                    }}
                  >
                    <span className="text-[20px] font-black leading-none" style={{ color: count > 0 ? "var(--text-primary)" : "var(--text-muted)" }}>
                      {count > 0 ? digit : "—"}
                    </span>
                    <span className="mt-1 text-[9px] font-semibold" style={{ color: "var(--text-muted)" }}>
                      {count > 0 ? "×".repeat(count) : "нет"}
                    </span>
                  </div>
                );
              })
            )}
          </div>
          <p className="mt-3 text-xs" style={{ color: "var(--text-muted)" }}>
            Квадрат твоих дат рождения · тап на ячейку
          </p>
        </div>
      </div>

      {infoOpen && (
        <BottomSheet onClose={() => setInfoOpen(false)}>
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--accent-soft)" }}>
                Матрица Пифагора
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
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>Значения цифр</p>
              {Object.entries(DIGIT_MEANINGS).map(([d, m]) => (
                <div key={d} className="flex items-center gap-3">
                  <span className="text-sm font-bold w-4 text-center" style={{ color: "var(--accent-primary)" }}>{d}</span>
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{m}</span>
                </div>
              ))}
            </div>
          </div>
        </BottomSheet>
      )}
    </>
  );
}
