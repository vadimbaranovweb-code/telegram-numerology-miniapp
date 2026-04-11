"use client";

import { useState } from "react";
import { NumerologyResponse } from "@/features/onboarding/types";
import { lang } from "@/i18n";
import { BottomSheet } from "@/features/app/components/BottomSheet";
import { LifePathCard } from "./LifePathCard";
import { NumberCard } from "./NumberCard";
import { ShareButton } from "./ShareButton";

type NumberInfo = {
  label: string;
  what: string;
  how: string;
};

const NUMBER_INFO: Record<string, NumberInfo> = {
  personal_year: {
    label: "Личный год",
    what: "Показывает, в какой фазе 9-летнего цикла ты находишься. Каждый год цикла несёт свою тему — от нового начала (1) до завершения (9).",
    how: "Сумма числа дня рождения + числа месяца рождения + цифр текущего года, сведённая к однозначному числу (или мастер-числу).",
  },
  destiny: {
    label: "Предназначение",
    what: "Число Судьбы отражает твою жизненную миссию и таланты, которые ты призван развивать и реализовывать.",
    how: "Сумма числовых значений всех букв полного имени при рождении по Пифагорейской таблице (A=1, B=2 … Z=26 → сворачивается до 1–9).",
  },
  personal_month: {
    label: "Личный месяц",
    what: "Уточняет тему текущего месяца внутри твоего Личного Года. Помогает лучше планировать действия прямо сейчас.",
    how: "Сумма Личного Года + числа текущего месяца, сведённая к однозначному числу.",
  },
  soul_urge: {
    label: "Зов души",
    what: "Твои глубинные желания и внутренние мотивы — то, что по-настоящему движет тобой, часто скрытое от других.",
    how: "Сумма числовых значений только гласных букв полного имени при рождении, сведённая к однозначному числу.",
  },
};

type Props = {
  result: NumerologyResponse;
  displayName?: string;
};

export function ReadingNumbersGrid({ result, displayName }: Props) {
  const isRu = lang === "ru";
  const [activeInfo, setActiveInfo] = useState<NumberInfo | null>(null);

  return (
    <>
      <article
        className="rounded-[24px] p-5"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
        }}
      >
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: "var(--accent-soft)" }}
          suppressHydrationWarning
        >
          {isRu ? "Твои числа" : "Your numbers"}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {/* Featured Life Path — spans full width */}
          <LifePathCard value={result.life_path_number} isRu={isRu} />

          {/* Secondary numbers */}
          <NumberCard
            label={isRu ? "Личный год" : "Personal Year"}
            value={result.personal_year_number}
            isRu={isRu}
            onInfo={() => setActiveInfo(NUMBER_INFO.personal_year)}
          />
          <NumberCard
            label={isRu ? "Предназначение" : "Destiny"}
            value={result.destiny_number}
            isRu={isRu}
            onInfo={() => setActiveInfo(NUMBER_INFO.destiny)}
          />
          <NumberCard
            label={isRu ? "Личный месяц" : "Personal Month"}
            value={result.personal_month_number}
            isRu={isRu}
            onInfo={() => setActiveInfo(NUMBER_INFO.personal_month)}
          />
          <NumberCard
            label={isRu ? "Зов души" : "Soul Urge"}
            value={result.soul_urge_number}
            isRu={isRu}
            onInfo={() => setActiveInfo(NUMBER_INFO.soul_urge)}
          />
        </div>

        <div className="mt-4">
          <ShareButton result={result} displayName={displayName} />
        </div>
      </article>

      {/* Info bottom sheet */}
      {activeInfo && (
        <BottomSheet onClose={() => setActiveInfo(null)}>
          <div className="space-y-4">
            <div>
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.22em]"
                style={{ color: "var(--accent-soft)" }}
              >
                {activeInfo.label}
              </p>
              <h3
                className="mt-2 text-[20px] font-bold tracking-tight"
                style={{ color: "var(--text-primary)" }}
              >
                Что это значит
              </h3>
            </div>

            <div
              className="rounded-2xl p-4 space-y-3"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
            >
              <div>
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                  style={{ color: "var(--text-muted)" }}
                >
                  Что это
                </p>
                <p className="mt-1.5 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
                  {activeInfo.what}
                </p>
              </div>
              <div style={{ height: 1, background: "var(--border-subtle)" }} />
              <div>
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                  style={{ color: "var(--text-muted)" }}
                >
                  Как считается
                </p>
                <p className="mt-1.5 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
                  {activeInfo.how}
                </p>
              </div>
            </div>
          </div>
        </BottomSheet>
      )}
    </>
  );
}
