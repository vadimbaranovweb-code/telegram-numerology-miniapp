"use client";

import { useEffect, useRef, useState } from "react";
import { t } from "@/i18n";
import { BottomSheet } from "@/features/app/components/BottomSheet";
import { ReadingCard, ReadingPreview } from "../types";

const CARD_ACCENTS: Record<string, string> = {
  "Core Energy":        "#7B5EF8",
  "Strength":           "#F59E0B",
  "Blind Spot":         "#C084FC",
  "Relationship Style": "#F472B6",
  "Current Timing":     "#60A5FA",
  "Inner Drive":        "#C084FC",
};

const CARD_TYPE_SLUGS: Record<string, string> = {
  "Core Energy":        "core_energy",
  "Strength":           "strength",
  "Blind Spot":         "blind_spot",
  "Relationship Style": "relationship_style",
  "Current Timing":     "current_timing",
  "Inner Drive":        "inner_drive",
};

const CARD_INFO: Record<string, { title: string; what: string; how: string }> = {
  "Core Energy": {
    title: "Ключевая энергия",
    what: "Твоё Число Жизненного Пути — главная вибрация твоей жизни. Определяет твою природу, уроки и основной путь.",
    how: "Складываются все цифры даты рождения до однозначного числа (или мастер-числа 11, 22, 33). Например, 14.03.1990 → 1+4+0+3+1+9+9+0 = 27 → 2+7 = 9.",
  },
  "Strength": {
    title: "Сила",
    what: "Твои природные таланты и качества, которые помогают двигаться вперёд. То, что даётся тебе легко.",
    how: "Выводится из Числа Судьбы (суммы числовых значений букв полного имени по Пифагорейской системе).",
  },
  "Blind Spot": {
    title: "Слепое пятно",
    what: "То, что ты склонен игнорировать или отрицать в себе. Осознание этого — ключ к росту.",
    how: "Определяется из Числа Зова Души (суммы значений только гласных букв имени).",
  },
  "Relationship Style": {
    title: "Стиль в отношениях",
    what: "Как ты строишь связи с другими людьми — что ищешь, что даёшь, что тебе важно в близости.",
    how: "На основе Числа Судьбы и Числа Жизненного Пути вместе.",
  },
  "Current Timing": {
    title: "Текущий момент",
    what: "В каком году 9-летнего цикла ты сейчас находишься и что это означает для твоих действий.",
    how: "Личный Год = сумма числа и месяца рождения + цифры текущего года, сведённая к однозначному.",
  },
  "Inner Drive": {
    title: "Внутренний мотив",
    what: "То, что движет тобой изнутри — скрытые желания и глубинные стремления.",
    how: "Число Зова Души — сумма числовых значений гласных букв полного имени.",
  },
};

const READING_BENEFITS = [
  "Все карты расклада полностью открыты",
  "Сильные стороны, слепые пятна и текущая энергия",
  "Полный анализ совместимости с партнёром",
  "Сохранено в профиле навсегда",
];

function getAccent(label: string): string {
  for (const [key, color] of Object.entries(CARD_ACCENTS)) {
    if (label.toLowerCase().includes(key.toLowerCase())) return color;
  }
  return "#7B5EF8";
}

function getCardTypeSlug(label: string): string {
  for (const [key, slug] of Object.entries(CARD_TYPE_SLUGS)) {
    if (label.toLowerCase().includes(key.toLowerCase())) return slug;
  }
  return label.toLowerCase().replace(/\s+/g, "_");
}

function getIllustrationUrl(lifePathNumber: number, cardTypeSlug: string): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  return `${base}/illustrations/serve/${lifePathNumber}/${cardTypeSlug}`;
}

function getCardInfo(label: string): { title: string; what: string; how: string } | null {
  for (const [key, info] of Object.entries(CARD_INFO)) {
    if (label.toLowerCase().includes(key.toLowerCase())) return info;
  }
  return null;
}

export function ReadingStory({
  preview,
  lifePathNumber,
  blurFromIndex = 2,
  sectionBadge = null,
  sectionState = null,
  sectionDescription = null,
  sectionAction = null,
  onUnlock,
  onUnlockBlockVisible,
}: {
  preview: ReadingPreview;
  lifePathNumber?: number;
  blurFromIndex?: number;
  sectionBadge?: string | null;
  sectionState?: string | null;
  sectionDescription?: string | null;
  sectionAction?: string | null;
  onUnlock?: () => void;
  onUnlockBlockVisible?: (visible: boolean) => void;
}) {
  const [activeInfoCard, setActiveInfoCard] = useState<ReadingCard | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const activeInfo = activeInfoCard ? getCardInfo(activeInfoCard.label) : null;
  const unlockRef = useRef<HTMLDivElement>(null);

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
    try {
      await onUnlock();
    } finally {
      setIsUnlocking(false);
    }
  }

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
        <div className="flex items-center gap-2 flex-wrap">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.22em]"
            style={{ color: "var(--text-muted)" }}
            suppressHydrationWarning
          >
            {t.reading.label}
          </p>
          {sectionBadge && (
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]"
              style={{ background: "var(--accent-primary)", color: "white" }}
            >
              {sectionBadge}
            </span>
          )}
          {sectionState && (
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]"
              style={{
                border: "1px solid var(--border-subtle)",
                color: "var(--text-muted)",
              }}
            >
              {sectionState.replaceAll("_", " ")}
            </span>
          )}
        </div>

        <div className="mt-3 space-y-1">
          <h2
            className="text-2xl font-bold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {preview.title}
          </h2>
          <p className="text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
            {sectionDescription ?? preview.summary}
          </p>
        </div>

        <div className="mt-5 space-y-3">
          {preview.cards.map((card, index) => (
            <ReadingStoryCard
              key={card.label}
              card={card}
              lifePathNumber={lifePathNumber}
              isBlurred={index >= blurFromIndex}
              onInfo={() => setActiveInfoCard(card)}
            />
          ))}
        </div>

        {/* Unlock / price block */}
        {onUnlock && (
          <div
            ref={unlockRef}
            className="mt-4 rounded-[20px] p-5"
            style={{
              background: "var(--bg-elevated)",
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
              style={{ background: "var(--bg-surface)", border: "1px solid rgba(123,94,248,0.2)" }}
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
      </article>

      {/* Info bottom sheet */}
      {activeInfoCard && activeInfo && (
        <BottomSheet onClose={() => setActiveInfoCard(null)}>
          <div className="space-y-4">
            <div>
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.22em]"
                style={{ color: getAccent(activeInfoCard.label) }}
              >
                {activeInfoCard.label}
              </p>
              <h3
                className="mt-2 text-[20px] font-bold tracking-tight"
                style={{ color: "var(--text-primary)" }}
              >
                {activeInfo.title}
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
              <div
                style={{ height: 1, background: "var(--border-subtle)" }}
              />
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

function ReadingStoryCard({
  card,
  lifePathNumber,
  isBlurred,
  onInfo,
}: {
  card: ReadingCard;
  lifePathNumber?: number;
  isBlurred: boolean;
  onInfo: () => void;
}) {
  const accent = getAccent(card.label);
  const slug = getCardTypeSlug(card.label);
  const showImage = lifePathNumber !== undefined && !!process.env.NEXT_PUBLIC_API_BASE_URL;
  const imgUrl = showImage ? getIllustrationUrl(lifePathNumber!, slug) : null;
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      {/* Blur overlay on locked cards */}
      {isBlurred && (
        <div
          className="absolute inset-0 z-10 rounded-2xl flex items-center justify-center"
          style={{
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            background: "linear-gradient(to bottom, rgba(17,17,40,0.25) 0%, rgba(17,17,40,0.80) 100%)",
          }}
        >
          <span
            className="text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ color: "var(--accent-soft)" }}
          >
            ✦ Заблокировано
          </span>
        </div>
      )}

      {/* Card text */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: accent }}
          >
            {card.label}
          </p>
          <button
            type="button"
            onClick={onInfo}
            className="flex h-6 w-6 items-center justify-center rounded-full transition active:scale-90"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-muted)",
              fontSize: 11,
              fontWeight: 700,
              flexShrink: 0,
            }}
            aria-label="Что это"
          >
            i
          </button>
        </div>
        <h3
          className="mt-2 text-[17px] font-semibold leading-tight"
          style={{ color: "var(--text-primary)" }}
        >
          {card.headline}
        </h3>
        <p
          className="mt-2 text-sm leading-6"
          style={{ color: "var(--text-secondary)" }}
        >
          {card.body}
        </p>
      </div>

      {/* Illustration at bottom */}
      {imgUrl && !imgError && (
        <div className="relative w-full overflow-hidden illus-container" style={{ height: 120 }}>
          {/* Skeleton loader */}
          {!imgLoaded && (
            <div
              className="absolute inset-0 animate-pulse"
              style={{ background: "var(--bg-elevated)" }}
            />
          )}
          {/* Top fade */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-10"
            style={{
              height: 40,
              background: `linear-gradient(to bottom, var(--bg-elevated), transparent)`,
            }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
            style={{
              display: "block",
              opacity: imgLoaded ? 1 : 0,
              transition: "opacity 0.4s ease",
            }}
            onLoad={() => setImgLoaded(true)}
            onError={() => {
              setImgError(true);
              const container = document.querySelector(".illus-container") as HTMLElement | null;
              if (container) container.style.display = "none";
            }}
          />
          {/* Accent dot */}
          <div
            className="absolute left-3 bottom-3 rounded-full"
            style={{ width: 6, height: 6, background: accent }}
          />
        </div>
      )}
    </div>
  );
}
