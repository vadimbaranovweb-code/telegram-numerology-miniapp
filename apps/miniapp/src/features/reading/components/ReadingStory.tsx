"use client";

import { useEffect, useRef, useState } from "react";
import { t } from "@/i18n";
import { NumerologyResponse } from "@/features/onboarding/types";
import { BottomSheet } from "@/features/app/components/BottomSheet";
import { LifePathRingCard } from "./LifePathRingCard";
import { PersonalityRadarCard } from "./PersonalityRadarCard";
import { YearCycleCard } from "./YearCycleCard";
import { PythagoreanMatrixCard } from "./PythagoreanMatrixCard";
import { PinnaclesCard } from "./PinnaclesCard";
import { KarmicLessonsCard } from "./KarmicLessonsCard";

const READING_BENEFITS = [
  "Все блоки расклада полностью открыты",
  "Матрица Пифагора, пики судьбы, кармические уроки",
  "Сила и теневая сторона с AI-описанием",
  "Полный анализ совместимости с партнёром",
  "Сохранено в профиле навсегда",
];

export function ReadingStory({
  result,
  isPremium,
  onUnlock,
  onUnlockBlockVisible,
  onGoHome,
}: {
  result: NumerologyResponse;
  isPremium?: boolean;
  onUnlock?: () => void;
  onUnlockBlockVisible?: (visible: boolean) => void;
  onGoHome?: () => void;
}) {
  const [isUnlocking, setIsUnlocking] = useState(false);
  const unlockRef = useRef<HTMLDivElement>(null);
  const ai = result.ai_insights;

  useEffect(() => {
    if (!unlockRef.current || !onUnlockBlockVisible) return;
    const el = unlockRef.current;
    const obs = new IntersectionObserver(
      ([entry]) => onUnlockBlockVisible(entry.isIntersecting),
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [onUnlockBlockVisible]);

  async function handleUnlock() {
    if (!onUnlock) return;
    setIsUnlocking(true);
    try { await onUnlock(); } finally { setIsUnlocking(false); }
  }

  return (
    <div className="space-y-3">
      {/* ── OPEN BLOCK 1: Life Path Ring ── */}
      <LifePathRingCard
        lifePathNumber={result.life_path_number}
        aiInsights={ai}
      />

      {/* ── OPEN BLOCK 2: Personality Radar ── */}
      {result.personality_scores && (
        <PersonalityRadarCard
          scores={result.personality_scores}
          aiInsights={ai}
        />
      )}

      {/* ── OPEN BLOCK 3: Year Cycle ── */}
      <YearCycleCard
        personalYear={result.personal_year_number}
        personalMonth={result.personal_month_number}
        aiInsights={ai}
      />

      {/* ── BLURRED: Strength & Shadow ── */}
      <StrengthShadowCard
        destinyNumber={result.destiny_number}
        soulUrgeNumber={result.soul_urge_number}
        aiInsights={ai}
        isPremium={isPremium}
        onUnlock={onUnlock}
      />

      {/* ── BLURRED: Pythagorean Matrix ── */}
      {result.pythagorean_matrix && Object.keys(result.pythagorean_matrix).length > 0 && (
        <PythagoreanMatrixCard matrix={result.pythagorean_matrix} isPremium={isPremium} onUnlock={onUnlock} />
      )}

      {/* ── BLURRED: Pinnacles ── */}
      {result.pinnacles && result.pinnacles.length > 0 && (
        <PinnaclesCard pinnacles={result.pinnacles} aiInsights={ai} isPremium={isPremium} onUnlock={onUnlock} />
      )}

      {/* ── BLURRED: Karmic Lessons ── */}
      {result.karmic_lessons && (
        <KarmicLessonsCard karmicLessons={result.karmic_lessons} aiInsights={ai} isPremium={isPremium} onUnlock={onUnlock} />
      )}

      {/* ── PAYWALL BLOCK (hidden when premium) ── */}
      {!isPremium && onUnlock && (
        <div
          ref={unlockRef}
          className="rounded-[24px] p-5"
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
            Расклад + совместимость
          </h4>
          <p className="mt-1 text-sm leading-5" style={{ color: "var(--text-secondary)" }}>
            Одна покупка открывает всё сразу.
          </p>
          <ul className="mt-3 space-y-2">
            {READING_BENEFITS.map((b) => (
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
              ⭐ 350
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
            {isUnlocking ? "Открываем оплату..." : t.paywall.cta}
          </button>
          <p className="mt-3 text-center text-xs" style={{ color: "var(--text-muted)" }}>
            {t.paywall.footer}
          </p>
        </div>
      )}

      {/* ── HOME BUTTON (after premium unlock) ── */}
      {isPremium && onGoHome && (
        <button
          type="button"
          onClick={onGoHome}
          className="w-full rounded-2xl py-4 text-sm font-semibold transition active:scale-[0.98]"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-secondary)",
          }}
        >
          ← На главную
        </button>
      )}
    </div>
  );
}

// ─── Strength & Shadow (blurred) ────────────────────────────────────

function StrengthShadowCard({
  destinyNumber,
  soulUrgeNumber,
  aiInsights,
  isPremium,
  onUnlock,
}: {
  destinyNumber: number | null;
  soulUrgeNumber: number | null;
  aiInsights: NumerologyResponse["ai_insights"];
  isPremium?: boolean;
  onUnlock?: () => void;
}) {
  const [infoOpen, setInfoOpen] = useState(false);

  const strengthHeadline = aiInsights?.strength_headline ?? (destinyNumber ? `Сила числа ${destinyNumber}` : "Природные сильные стороны");
  const strengthBody = aiInsights?.strength_body ?? "Твои таланты и качества, которые помогают двигаться вперёд. То, что даётся тебе легко от природы.";
  const shadowHeadline = aiInsights?.shadow_headline ?? (soulUrgeNumber ? `Тень числа ${soulUrgeNumber}` : "Слепые пятна");
  const shadowBody = aiInsights?.shadow_body ?? "То, что ты склонен игнорировать или отрицать в себе. Осознание этого — ключ к росту.";

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
            Сила и тень
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

        {/* Blurred content */}
        <div className="relative px-5 pb-5 overflow-hidden rounded-b-[24px]">
          {!isPremium && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer"
              style={{
                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
                background: "linear-gradient(to bottom, rgba(17,17,40,0.1), rgba(17,17,40,0.7))",
              }}
              onClick={onUnlock}
            >
              <span className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--accent-soft)" }}>
                ✦ Нажми чтобы разблокировать
              </span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl p-3" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "#F59E0B" }}>✦ Сила</p>
              <p className="mt-1.5 text-[13px] font-bold leading-tight" style={{ color: "var(--text-primary)" }}>{strengthHeadline}</p>
              <p className="mt-1 text-[10px] leading-4" style={{ color: "var(--text-secondary)" }}>{strengthBody}</p>
            </div>
            <div className="rounded-2xl p-3" style={{ background: "rgba(192,132,252,0.08)", border: "1px solid rgba(192,132,252,0.2)" }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "#C084FC" }}>◉ Тень</p>
              <p className="mt-1.5 text-[13px] font-bold leading-tight" style={{ color: "var(--text-primary)" }}>{shadowHeadline}</p>
              <p className="mt-1 text-[10px] leading-4" style={{ color: "var(--text-secondary)" }}>{shadowBody}</p>
            </div>
          </div>
        </div>
      </div>

      {infoOpen && (
        <BottomSheet onClose={() => setInfoOpen(false)}>
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--accent-soft)" }}>
                Сила и тень
              </p>
              <h3 className="mt-2 text-[20px] font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
                Что это значит
              </h3>
            </div>
            <div className="rounded-2xl p-4 space-y-3" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>Сила (Число Судьбы)</p>
                <p className="mt-1.5 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>Природные таланты и качества, которые помогают двигаться вперёд — выводится из суммы числовых значений всех букв полного имени.</p>
              </div>
              <div style={{ height: 1, background: "var(--border-subtle)" }} />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>Тень (Зов Души)</p>
                <p className="mt-1.5 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>То, что ты склонен игнорировать в себе. Осознание этого — ключ к росту. Выводится из суммы значений только гласных букв имени.</p>
              </div>
            </div>
          </div>
        </BottomSheet>
      )}
    </>
  );
}
