"use client";

import { FormEvent, useState } from "react";
import { t } from "@/i18n";

import { DrumDatePicker } from "@/features/onboarding/components/DrumDatePicker";
import {
  CompatibilityPreviewResponse,
  RelationshipContext,
} from "@/features/compatibility/types";

export type CompatibilityUiStage =
  | "input"
  | "preview_locked"
  | "preview_premium";

type CompatibilityTeaserCardProps = {
  isExpanded: boolean;
  isHighlighted?: boolean;
  sectionBadge?: string | null;
  sectionState?: string | null;
  sectionDescription?: string | null;
  sectionAction?: string | null;
  stage: CompatibilityUiStage;
  relationshipContext: RelationshipContext;
  targetBirthDate: string;
  targetDisplayName: string;
  preview: CompatibilityPreviewResponse | null;
  premiumStatus: "free" | "premium" | null;
  isSubmitting: boolean;
  error: string | null;
  onExpand: () => void;
  onOpenPaywall: () => void;
  onRelationshipContextChange: (value: RelationshipContext) => void;
  onTargetBirthDateChange: (value: string) => void;
  onTargetDisplayNameChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

const CONTEXT_OPTIONS: { value: RelationshipContext; icon: string }[] = [
  { value: "romantic", icon: "♥" },
  { value: "friend",   icon: "✦" },
  { value: "work",     icon: "◈" },
];

export function CompatibilityTeaserCard({
  isExpanded,
  isHighlighted = false,
  sectionBadge = null,
  sectionState = null,
  sectionDescription = null,
  sectionAction = null,
  stage,
  relationshipContext,
  targetBirthDate,
  targetDisplayName,
  preview,
  premiumStatus,
  isSubmitting,
  error,
  onExpand,
  onOpenPaywall,
  onRelationshipContextChange,
  onTargetBirthDateChange,
  onTargetDisplayNameChange,
  onSubmit,
}: CompatibilityTeaserCardProps) {
  const hasPreviewStage = stage !== "input";
  const expandButtonLabel =
    sectionAction === "continue_compatibility"
      ? t.compatibility.expand_continue
      : t.compatibility.expand;
  const submitButtonLabel =
    sectionAction === "continue_compatibility"
      ? t.compatibility.submit_continue
      : t.compatibility.submit;

  return (
    <article
      className="rounded-[28px] p-6"
      style={{
        background: "var(--bg-surface)",
        border: isHighlighted
          ? "1px solid var(--border-glow)"
          : "1px solid var(--border-subtle)",
        boxShadow: isHighlighted
          ? "0 18px 45px rgba(0,0,0,0.5), 0 0 60px rgba(123,94,248,0.08)"
          : "0 10px 30px rgba(0,0,0,0.4)",
      }}
    >
      {/* Badge row */}
      <div className="flex flex-wrap items-center gap-2">
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: "var(--accent-soft)" }}
          suppressHydrationWarning
        >
          {t.compatibility.label}
        </p>
        {isHighlighted ? (
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]"
            style={{
              background: "rgba(123,94,248,0.15)",
              color: "var(--accent-primary)",
            }}
            suppressHydrationWarning
          >
            {t.daily.in_focus}
          </span>
        ) : null}
        {sectionBadge ? (
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]"
            style={{
              background: "var(--bg-elevated)",
              color: "var(--text-secondary)",
            }}
          >
            {sectionBadge}
          </span>
        ) : null}
        {sectionState ? (
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]"
            style={{
              border: "1px solid var(--border-subtle)",
              color: "var(--text-muted)",
            }}
          >
            {sectionState.replaceAll("_", " ")}
          </span>
        ) : null}
      </div>

      <CompatibilityStageHeader stage={stage} sectionDescription={sectionDescription} />

      {/* Expand button (collapsed input state) */}
      {!isExpanded && !hasPreviewStage ? (
        <button
          type="button"
          onClick={onExpand}
          className="mt-5 w-full rounded-2xl py-3.5 text-sm font-semibold transition active:scale-[0.98]"
          style={{ background: "var(--grad-cta)", color: "#fff" }}
        >
          {expandButtonLabel}
        </button>
      ) : null}

      {/* Input form (expanded) */}
      {isExpanded ? (
        <form className="mt-5 space-y-5" onSubmit={onSubmit}>
          {/* Relationship context pills */}
          <div className="space-y-2">
            <label
              className="text-xs font-semibold uppercase tracking-[0.18em]"
              style={{ color: "var(--text-muted)" }}
              suppressHydrationWarning
            >
              {t.compatibility.type_label}
            </label>
            <div className="flex gap-2">
              {CONTEXT_OPTIONS.map((opt) => {
                const isActive = relationshipContext === opt.value;
                const label =
                  opt.value === "romantic" ? t.compatibility.type_romantic
                  : opt.value === "friend"  ? t.compatibility.type_friend
                  : t.compatibility.type_work;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onRelationshipContextChange(opt.value)}
                    className="flex flex-1 flex-col items-center gap-1 rounded-2xl py-3 text-xs font-semibold transition"
                    style={{
                      background: isActive
                        ? "rgba(123,94,248,0.18)"
                        : "var(--bg-elevated)",
                      border: isActive
                        ? "1px solid var(--border-glow)"
                        : "1px solid var(--border-subtle)",
                      color: isActive ? "var(--accent-soft)" : "var(--text-secondary)",
                    }}
                    suppressHydrationWarning
                  >
                    <span style={{ fontSize: 18 }}>{opt.icon}</span>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Birth date drum picker */}
          <div className="space-y-2">
            <label
              className="text-xs font-semibold uppercase tracking-[0.18em]"
              style={{ color: "var(--text-muted)" }}
              suppressHydrationWarning
            >
              {t.compatibility.birth_date}
            </label>
            <DrumDatePicker
              value={targetBirthDate}
              onChange={onTargetBirthDateChange}
            />
          </div>

          {/* Name input */}
          <div className="space-y-2">
            <label
              className="text-xs font-semibold uppercase tracking-[0.18em]"
              style={{ color: "var(--text-muted)" }}
              suppressHydrationWarning
            >
              {t.compatibility.name}
            </label>
            <input
              type="text"
              placeholder={t.compatibility.name_optional}
              value={targetDisplayName}
              onChange={(e) => onTargetDisplayNameChange(e.target.value)}
              className="w-full rounded-2xl px-4 py-3 text-sm outline-none transition"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={!targetBirthDate || isSubmitting}
            className="w-full rounded-2xl py-3.5 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: "var(--grad-cta)", color: "#fff" }}
            suppressHydrationWarning
          >
            {isSubmitting ? t.compatibility.generating : submitButtonLabel}
          </button>
        </form>
      ) : null}

      {/* Error */}
      {error ? (
        <p
          className="mt-4 rounded-2xl px-4 py-3 text-sm"
          style={{
            background: "rgba(244,114,182,0.08)",
            border: "1px solid rgba(244,114,182,0.25)",
            color: "var(--accent-rose)",
          }}
        >
          {error}
        </p>
      ) : null}

      {/* Preview */}
      {preview ? (
        <CompatibilityPreviewCard
          stage={stage}
          preview={preview}
          premiumStatus={premiumStatus}
          onOpenPaywall={onOpenPaywall}
        />
      ) : null}
    </article>
  );
}

function CompatibilityStageHeader({
  stage,
  sectionDescription,
}: {
  stage: CompatibilityUiStage;
  sectionDescription: string | null;
}) {
  const content = resolveCompatibilityStageHeader(stage, sectionDescription);

  return (
    <div className="mt-4 space-y-2">
      {/* Orbits illustration for input stage */}
      {stage === "input" ? <OrbitsIllustration /> : null}
      <h3
        className="text-[22px] font-bold tracking-tight"
        style={{ color: "var(--text-primary)" }}
      >
        {content.title}
      </h3>
      <p className="text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
        {content.description}
      </p>
    </div>
  );
}

function OrbitsIllustration() {
  return (
    <div className="flex justify-center py-3">
      <svg
        width="96"
        height="48"
        viewBox="0 0 96 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left orb */}
        <circle cx="30" cy="24" r="22" stroke="rgba(123,94,248,0.5)" strokeWidth="1.5" />
        <circle cx="30" cy="24" r="14" stroke="rgba(123,94,248,0.25)" strokeWidth="1" />
        <circle cx="30" cy="24" r="5" fill="rgba(123,94,248,0.7)" />
        {/* Right orb */}
        <circle cx="66" cy="24" r="22" stroke="rgba(192,132,252,0.5)" strokeWidth="1.5" />
        <circle cx="66" cy="24" r="14" stroke="rgba(192,132,252,0.25)" strokeWidth="1" />
        <circle cx="66" cy="24" r="5" fill="rgba(192,132,252,0.7)" />
        {/* Connection line */}
        <line x1="35" y1="24" x2="61" y2="24" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 3" />
        {/* Center glow */}
        <circle cx="48" cy="24" r="3" fill="rgba(255,255,255,0.3)" />
      </svg>
    </div>
  );
}

function CompatibilityPreviewCard({
  stage,
  preview,
  premiumStatus,
  onOpenPaywall,
}: {
  stage: CompatibilityUiStage;
  preview: CompatibilityPreviewResponse;
  premiumStatus: "free" | "premium" | null;
  onOpenPaywall: () => void;
}) {
  const isPremiumStage = stage === "preview_premium";
  const premiumContinuation = isPremiumStage
    ? buildPremiumContinuationSnapshot(preview)
    : null;

  return (
    <div className="mt-6 space-y-3">
      {/* Preview header card */}
      <div
        className="rounded-2xl p-4"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: isPremiumStage ? "var(--accent-green)" : "var(--accent-soft)" }}
        >
          {isPremiumStage ? "Saved compatibility" : "Preview"}
        </p>
        <h4
          className="mt-2 text-lg font-bold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          {preview.preview.title}
        </h4>
        <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
          {isPremiumStage
            ? "Your saved compatibility preview is still the active return point, and premium access is now available for the next layer of this flow."
            : preview.preview.summary}
        </p>
      </div>

      <CompatibilityPreviewBody stage={stage} preview={preview} />

      {premiumContinuation ? (
        <div
          className="rounded-2xl p-4"
          style={{
            background: "rgba(52,211,153,0.05)",
            border: "1px solid rgba(52,211,153,0.2)",
          }}
        >
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: "var(--accent-green)" }}
          >
            Premium continuation
          </p>
          <h5
            className="mt-2 text-base font-bold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            The next compatibility layer is now open.
          </h5>
          <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
            This temporary premium layer keeps the flow moving until the fuller
            compatibility result is implemented.
          </p>

          <div className="mt-4 grid gap-3">
            {premiumContinuation.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl p-4"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid rgba(52,211,153,0.15)",
                }}
              >
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.16em]"
                  style={{ color: "var(--accent-green)" }}
                >
                  {item.eyebrow}
                </p>
                <h6
                  className="mt-2 text-base font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {item.title}
                </h6>
                <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {isPremiumStage ? (
        <div
          className="rounded-2xl p-4"
          style={{
            background: "rgba(52,211,153,0.05)",
            border: "1px solid rgba(52,211,153,0.15)",
          }}
        >
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: "var(--accent-green)" }}
          >
            Premium path
          </p>
          <h5
            className="mt-2 text-base font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            This saved match now has an active premium continuation.
          </h5>
          <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
            The current temporary flow keeps this preview, its context, and the
            unlocked layer together so the next compatibility iteration can build
            on one consistent return point.
          </p>
        </div>
      ) : null}

      <CompatibilityFooterCard
        stage={stage}
        preview={preview}
        premiumStatus={premiumStatus}
        onOpenPaywall={onOpenPaywall}
      />
    </div>
  );
}

function CompatibilityPreviewBody({
  stage,
  preview,
}: {
  stage: CompatibilityUiStage;
  preview: CompatibilityPreviewResponse;
}) {
  const isPremiumStage = stage === "preview_premium";
  const visibleCards = isPremiumStage
    ? preview.preview.cards.filter((card) => card.type !== "locked_depth")
    : preview.preview.cards;
  const lockedDepthCard = preview.preview.cards.find(
    (card) => card.type === "locked_depth",
  );
  const isLastCardLocked = !isPremiumStage;

  return (
    <div className="space-y-3">
      {isPremiumStage ? (
        <div
          className="rounded-2xl p-4"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: "var(--text-muted)" }}
          >
            Visible layer
          </p>
          <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
            These are the first compatibility signals that were visible before the
            premium unlock.
          </p>
        </div>
      ) : null}

      {visibleCards.map((card, index) => {
        const isLastVisible = !isPremiumStage && index === visibleCards.length - 1;
        return (
          <div
            key={`${card.type}-${index}`}
            className="relative rounded-2xl p-4 overflow-hidden"
            style={{
              background: "var(--bg-elevated)",
              border: `1px solid ${isLastVisible ? "rgba(123,94,248,0.2)" : "var(--border-subtle)"}`,
            }}
          >
            {/* Blur-lock overlay on last card */}
            {isLastVisible && isLastCardLocked ? (
              <div
                className="absolute inset-0 z-10 flex flex-col items-center justify-end rounded-2xl pb-4"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent 0%, rgba(17,17,40,0.7) 40%, rgba(17,17,40,0.95) 100%)",
                  backdropFilter: "blur(2px)",
                  WebkitBackdropFilter: "blur(2px)",
                }}
              >
                <span
                  className="text-xs font-semibold uppercase tracking-[0.18em]"
                  style={{ color: "var(--accent-soft)" }}
                  suppressHydrationWarning
                >
                  {t.compatibility.unlock_label}
                </span>
              </div>
            ) : null}
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: isLastVisible ? "var(--accent-soft)" : "var(--text-muted)" }}
            >
              {card.type.replace("_", " ")}
            </p>
            <h5
              className="mt-2 text-base font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {card.headline}
            </h5>
            <p
              className="mt-2 text-sm leading-6"
              style={{
                color: "var(--text-secondary)",
                filter: isLastVisible ? "blur(3px)" : "none",
              }}
            >
              {card.body}
            </p>
          </div>
        );
      })}

      {isPremiumStage && lockedDepthCard ? (
        <div
          className="rounded-2xl p-4"
          style={{
            background: "rgba(52,211,153,0.05)",
            border: "1px solid rgba(52,211,153,0.2)",
          }}
        >
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: "var(--accent-green)" }}
          >
            Unlocked layer
          </p>
          <h5
            className="mt-2 text-base font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Premium access is active for the deeper layer
          </h5>
          <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
            This session has already unlocked premium, so the next iteration of
            this flow can open the deeper compatibility read without asking for
            unlock again.
          </p>
          <div
            className="mt-3 rounded-2xl p-4"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid rgba(52,211,153,0.15)",
            }}
          >
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: "var(--accent-green)" }}
            >
              Coming next
            </p>
            <h6
              className="mt-2 text-base font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {lockedDepthCard.headline}
            </h6>
            <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
              {lockedDepthCard.body}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CompatibilityFooterCard({
  stage,
  preview,
  premiumStatus,
  onOpenPaywall,
}: {
  stage: CompatibilityUiStage;
  preview: CompatibilityPreviewResponse;
  premiumStatus: "free" | "premium" | null;
  onOpenPaywall: () => void;
}) {
  const [isUnlocking, setIsUnlocking] = useState(false);

  if (stage === "preview_premium") {
    return (
      <div
        className="rounded-2xl p-4"
        style={{
          background: "rgba(52,211,153,0.08)",
          border: "1px solid rgba(52,211,153,0.3)",
        }}
      >
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: "var(--accent-green)" }}
          suppressHydrationWarning
        >
          {t.paywall.premium_label}
        </p>
        <p className="mt-2 text-sm font-semibold" style={{ color: "var(--accent-green)" }}>
          {premiumStatus ?? "premium"}
        </p>
        <p className="mt-1 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
          Полный расклад совместимости открыт в этой сессии.
        </p>
      </div>
    );
  }

  async function handleUnlock() {
    setIsUnlocking(true);
    try {
      await onOpenPaywall();
    } finally {
      setIsUnlocking(false);
    }
  }

  return (
    <div
      className="rounded-[20px] p-5"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-glow)",
        boxShadow: "0 0 40px rgba(123,94,248,0.08)",
      }}
    >
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.22em]"
        style={{ color: "var(--accent-soft)" }}
        suppressHydrationWarning
      >
        {t.paywall.label}
      </p>
      <h4
        className="mt-2 text-[20px] font-bold tracking-tight"
        style={{ color: "var(--text-primary)" }}
        suppressHydrationWarning
      >
        {t.paywall.title}
      </h4>

      {/* Benefits */}
      <ul className="mt-4 space-y-2">
        {t.paywall.benefits.map((b) => (
          <li key={b} className="flex items-start gap-2.5">
            <span style={{ color: "var(--accent-primary)", marginTop: 1, flexShrink: 0 }}>✦</span>
            <span className="text-sm leading-6" style={{ color: "var(--text-secondary)" }} suppressHydrationWarning>
              {b}
            </span>
          </li>
        ))}
      </ul>

      {/* Price */}
      <div
        className="mt-4 flex items-baseline gap-2 rounded-2xl px-4 py-3"
        style={{ background: "var(--bg-elevated)", border: "1px solid rgba(123,94,248,0.2)" }}
      >
        <span className="text-[28px] font-bold" style={{ color: "var(--text-primary)" }}>
          ⭐ {preview.paywall.price_local ?? 350}
        </span>
        <span className="text-sm" style={{ color: "var(--text-muted)" }} suppressHydrationWarning>
          {t.paywall.stars} · {t.paywall.one_time}
        </span>
      </div>

      {/* CTA — opens Telegram Stars native modal directly */}
      <button
        type="button"
        onClick={handleUnlock}
        disabled={isUnlocking}
        className="mt-4 w-full rounded-2xl py-3.5 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"
        style={{ background: "var(--grad-cta)" }}
        suppressHydrationWarning
      >
        {isUnlocking ? "Открываем оплату..." : t.compatibility.unlock_cta}
      </button>

      <p
        className="mt-3 text-center text-xs"
        style={{ color: "var(--text-muted)" }}
        suppressHydrationWarning
      >
        {t.paywall.footer}
      </p>
    </div>
  );
}

function buildPremiumContinuationSnapshot(
  preview: CompatibilityPreviewResponse,
): Array<{ eyebrow: string; title: string; body: string }> {
  const dynamicCard =
    preview.preview.cards.find((card) => card.type === "dynamic") ??
    preview.preview.cards[0];
  const tensionCard =
    preview.preview.cards.find((card) => card.type === "tension_hint") ??
    preview.preview.cards[1] ??
    preview.preview.cards[0];

  return [
    {
      eyebrow: "Communication style",
      title: dynamicCard?.headline ?? "Shared rhythm",
      body:
        dynamicCard?.body ??
        "Your strongest communication pattern is the first thing to build on in the deeper compatibility flow.",
    },
    {
      eyebrow: "Pressure point",
      title: tensionCard?.headline ?? "What to watch",
      body:
        tensionCard?.body ??
        "The first tension signal is already visible here, so the next layer should stay grounded in that pattern.",
    },
    {
      eyebrow: "Best next move",
      title: "Use the saved preview as your anchor",
      body:
        "You already have the right pair and context saved in this session. The next premium iteration can build from this exact preview instead of asking you to unlock again.",
    },
  ];
}

function resolveCompatibilityStageHeader(
  stage: CompatibilityUiStage,
  sectionDescription: string | null,
): { title: string; description: string } {
  if (stage === "preview_premium") {
    return {
      title: t.compatibility.stage_premium_title,
      description: sectionDescription ?? t.compatibility.stage_premium_desc,
    };
  }

  if (stage === "preview_locked") {
    return {
      title: t.compatibility.stage_locked_title,
      description: sectionDescription ?? t.compatibility.stage_locked_desc,
    };
  }

  return {
    title: t.compatibility.stage_input_title,
    description: sectionDescription ?? t.compatibility.stage_input_desc,
  };
}
