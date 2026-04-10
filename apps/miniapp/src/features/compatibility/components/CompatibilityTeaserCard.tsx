import { FormEvent } from "react";

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

const CONTEXT_OPTIONS: RelationshipContext[] = ["romantic", "friend", "work"];

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
      ? "Continue compatibility"
      : "Explore compatibility";
  const submitButtonLabel =
    sectionAction === "continue_compatibility"
      ? "Continue compatibility"
      : "Generate preview";

  return (
    <article
      className={
        isHighlighted
          ? "rounded-[24px] border border-stone-300 bg-white p-5 shadow-[0_14px_36px_rgba(89,63,31,0.12)] ring-2 ring-stone-200/80"
          : "rounded-[24px] border border-stone-200 bg-white p-5 shadow-[0_10px_30px_rgba(89,63,31,0.08)]"
      }
    >
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
        Compatibility
      </p>
      {isHighlighted ? (
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
          In focus
        </p>
      ) : null}
      {sectionBadge || sectionState ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {sectionBadge ? (
            <span className="rounded-full bg-stone-900 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-50">
              {sectionBadge}
            </span>
          ) : null}
          {sectionState ? (
            <span className="rounded-full border border-stone-300 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
              {sectionState.replaceAll("_", " ")}
            </span>
          ) : null}
        </div>
      ) : null}
      <CompatibilityStageHeader
        stage={stage}
        sectionDescription={sectionDescription}
      />

      {!isExpanded && !hasPreviewStage ? (
        <button
          type="button"
          onClick={onExpand}
          className="mt-5 w-full rounded-2xl bg-stone-950 px-4 py-3 text-sm font-semibold text-stone-50 transition hover:bg-stone-800"
        >
          {expandButtonLabel}
        </button>
      ) : null}

      {isExpanded ? (
        <form className="mt-5 space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700" htmlFor="relationshipContext">
              Context
            </label>
            <select
              id="relationshipContext"
              value={relationshipContext}
              onChange={(event) =>
                onRelationshipContextChange(event.target.value as RelationshipContext)
              }
              className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500"
            >
              {CONTEXT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700" htmlFor="targetBirthDate">
              Their birth date
            </label>
            <input
              id="targetBirthDate"
              type="date"
              value={targetBirthDate}
              onChange={(event) => onTargetBirthDateChange(event.target.value)}
              className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700" htmlFor="targetDisplayName">
              Their name
            </label>
            <input
              id="targetDisplayName"
              type="text"
              placeholder="Optional"
              value={targetDisplayName}
              onChange={(event) => onTargetDisplayNameChange(event.target.value)}
              className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={!targetBirthDate || isSubmitting}
            className="w-full rounded-2xl bg-amber-300 px-4 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Generating..." : submitButtonLabel}
          </button>
        </form>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

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
    <div className="mt-3 space-y-2">
      <h3 className="text-2xl font-semibold tracking-tight text-stone-950">
        {content.title}
      </h3>
      <p className="text-sm leading-6 text-stone-600">{content.description}</p>
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
    <div className="mt-5 space-y-3">
      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
          {isPremiumStage ? "Saved compatibility" : "Preview"}
        </p>
        <h4 className="mt-2 text-xl font-semibold tracking-tight text-stone-950">
          {preview.preview.title}
        </h4>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          {isPremiumStage
            ? "Your saved compatibility preview is still the active return point, and premium access is now available for the next layer of this flow."
            : preview.preview.summary}
        </p>
      </div>

      <CompatibilityPreviewBody stage={stage} preview={preview} />

      {premiumContinuation ? (
        <div className="rounded-2xl border border-emerald-200 bg-[linear-gradient(135deg,#eef9f1_0%,#e0f4e6_100%)] p-4 text-stone-950">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Premium continuation
          </p>
          <h5 className="mt-2 text-lg font-semibold tracking-tight">
            The next compatibility layer is now open.
          </h5>
          <p className="mt-2 text-sm leading-6 text-stone-700">
            This temporary premium layer keeps the flow moving until the fuller
            compatibility result is implemented.
          </p>

          <div className="mt-4 grid gap-3">
            {premiumContinuation.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-emerald-200/80 bg-white/80 p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  {item.eyebrow}
                </p>
                <h6 className="mt-2 text-base font-semibold text-stone-950">
                  {item.title}
                </h6>
                <p className="mt-2 text-sm leading-6 text-stone-700">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {isPremiumStage ? (
        <div className="rounded-2xl border border-emerald-200/80 bg-white/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Premium path
          </p>
          <h5 className="mt-2 text-lg font-semibold tracking-tight text-stone-950">
            This saved match now has an active premium continuation.
          </h5>
          <p className="mt-2 text-sm leading-6 text-stone-700">
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

  return (
    <div className="space-y-3">
      {isPremiumStage ? (
        <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
            Visible layer
          </p>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            These are the first compatibility signals that were visible before the
            premium unlock.
          </p>
        </div>
      ) : null}

      {visibleCards.map((card, index) => (
        <div
          key={`${card.type}-${index}`}
          className={
            !isPremiumStage && index === preview.preview.cards.length - 1
              ? "rounded-2xl border border-dashed border-stone-300 bg-stone-100/80 p-4 opacity-80"
              : "rounded-2xl border border-stone-200 bg-stone-50 p-4"
          }
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            {card.type.replace("_", " ")}
          </p>
          <h5 className="mt-2 text-lg font-semibold text-stone-950">
            {card.headline}
          </h5>
          <p className="mt-2 text-sm leading-6 text-stone-600">{card.body}</p>
        </div>
      ))}

      {isPremiumStage && lockedDepthCard ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Unlocked layer
          </p>
          <h5 className="mt-2 text-lg font-semibold text-stone-950">
            Premium access is active for the deeper layer
          </h5>
          <p className="mt-2 text-sm leading-6 text-stone-700">
            This session has already unlocked premium, so the next iteration of
            this flow can open the deeper compatibility read without asking for
            unlock again.
          </p>
          <div className="mt-3 rounded-2xl border border-emerald-200/80 bg-white/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
              Coming next
            </p>
            <h6 className="mt-2 text-base font-semibold text-stone-950">
              {lockedDepthCard.headline}
            </h6>
            <p className="mt-2 text-sm leading-6 text-stone-700">
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
  if (stage === "preview_premium") {
    return (
      <div className="rounded-2xl border border-emerald-900 bg-emerald-950 p-4 text-emerald-50">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
          Premium active
        </p>
        <p className="mt-2 text-sm leading-6 text-emerald-100">
          Your premium access is already active for this session, and this saved
          compatibility preview remains the current continuation point.
        </p>
        <div className="mt-4 rounded-2xl border border-emerald-700/70 bg-emerald-900/60 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-200">
            Status
          </p>
          <p className="mt-1 text-sm font-medium text-emerald-50">
            {premiumStatus ?? "premium"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-stone-900 bg-stone-950 p-4 text-stone-50">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-300">
        Full reading
      </p>
      <p className="mt-2 text-sm leading-6 text-stone-200">
        Unlock the full compatibility reading with deeper cards for{" "}
        {preview.paywall.price_local} {preview.paywall.currency}.
      </p>
      <button
        type="button"
        onClick={onOpenPaywall}
        className="mt-4 w-full rounded-2xl bg-amber-300 px-4 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-200"
      >
        Unlock full compatibility
      </button>
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
      title: "Your saved compatibility is ready to continue.",
      description:
        sectionDescription ??
        "Your saved preview is ready to continue, and premium access is already active for this session.",
    };
  }

  if (stage === "preview_locked") {
    return {
      title: "Your compatibility preview is ready.",
      description:
        sectionDescription ??
        "Your saved preview shows the first compatibility signals and leads into the premium unlock.",
    };
  }

  return {
    title: "See how your dynamic feels with another person.",
    description:
      sectionDescription ??
      "Start with a quick preview to see the first compatibility signals before you unlock the full reading.",
  };
}
