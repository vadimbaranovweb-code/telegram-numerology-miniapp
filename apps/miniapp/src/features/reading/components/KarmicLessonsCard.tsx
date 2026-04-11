"use client";

import { useState } from "react";
import { AiInsights } from "@/features/onboarding/types";
import { BottomSheet } from "@/features/app/components/BottomSheet";

const KARMIC_MEANINGS: Record<number, { title: string; desc: string }> = {
  1: { title: "Самостоятельность", desc: "Учишься опираться на себя и проявлять инициативу." },
  2: { title: "Сотрудничество",    desc: "Учишься доверию, терпению и совместной работе." },
  3: { title: "Самовыражение",     desc: "Учишься говорить, творить и делиться своей правдой." },
  4: { title: "Дисциплина",        desc: "Учишься строить систему и доводить начатое до конца." },
  5: { title: "Свобода",           desc: "Учишься принимать изменения и не цепляться за прошлое." },
  6: { title: "Ответственность",   desc: "Учишься заботиться о других без самопожертвования." },
  7: { title: "Доверие к жизни",   desc: "Учишься отпускать контроль и доверять интуиции." },
  8: { title: "Сила и власть",     desc: "Учишься здоровым отношениям с деньгами и влиянием." },
  9: { title: "Сострадание",       desc: "Учишься отдавать без ожидания возврата." },
};

const INFO = {
  what: "Кармические уроки — цифры от 1 до 9, которые отсутствуют в дате рождения. Они указывают на качества, которые душа пришла развить в этой жизни.",
  how: "Из всех цифр даты рождения (день, месяц, год) выбираются те, которых нет. Каждое отсутствующее число — отдельный урок.",
};

export function KarmicLessonsCard({
  karmicLessons,
  aiInsights,
}: {
  karmicLessons: number[];
  aiInsights: AiInsights | null;
}) {
  const [infoOpen, setInfoOpen] = useState(false);
  const body = aiInsights?.karmic_body ?? (
    karmicLessons.length > 0
      ? `Отсутствующие числа ${karmicLessons.join(", ")} указывают на ключевые уроки этой жизни. Развитие этих качеств приносит наибольший рост.`
      : "Все числа 1–9 присутствуют в дате рождения — уникальная конфигурация, указывающая на разностороннее развитие."
  );

  return (
    <>
      <div
        className="relative rounded-[24px] overflow-hidden"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid rgba(123,94,248,0.2)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
        }}
      >
        {/* Blur overlay */}
        <div
          className="absolute inset-0 z-10 flex items-center justify-center rounded-[24px]"
          style={{
            backdropFilter: "blur(7px)",
            WebkitBackdropFilter: "blur(7px)",
            background: "linear-gradient(to bottom, rgba(17,17,40,0.15), rgba(17,17,40,0.85))",
          }}
        >
          <span className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--accent-soft)" }}>
            ✦ Заблокировано
          </span>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--text-muted)" }}>
              Кармические уроки
            </p>
            <button
              type="button"
              onClick={() => setInfoOpen(true)}
              className="flex h-6 w-6 items-center justify-center rounded-full relative z-20"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--border-subtle)", color: "var(--text-muted)", fontSize: 11, fontWeight: 700 }}
              aria-label="Что это"
            >
              i
            </button>
          </div>

          {karmicLessons.length === 0 ? (
            <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>
              Все числа присутствуют — полная конфигурация.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {karmicLessons.slice(0, 3).map((n) => {
                const meaning = KARMIC_MEANINGS[n];
                return (
                  <div
                    key={n}
                    className="flex items-center gap-3 rounded-2xl px-3 py-2.5"
                    style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
                  >
                    <span
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl text-sm font-black"
                      style={{ background: "rgba(123,94,248,0.15)", color: "#7B5EF8" }}
                    >
                      {n}
                    </span>
                    <div>
                      <p className="text-[11px] font-semibold" style={{ color: "var(--text-primary)" }}>
                        {meaning?.title ?? `Урок ${n}`}
                      </p>
                      <p className="text-[10px] leading-4" style={{ color: "var(--text-muted)" }}>
                        {meaning?.desc ?? ""}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <p className="mt-3 text-xs leading-5" style={{ color: "var(--text-secondary)" }}>
            {body}
          </p>
        </div>
      </div>

      {infoOpen && (
        <BottomSheet onClose={() => setInfoOpen(false)}>
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--accent-soft)" }}>
                Кармические уроки
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
