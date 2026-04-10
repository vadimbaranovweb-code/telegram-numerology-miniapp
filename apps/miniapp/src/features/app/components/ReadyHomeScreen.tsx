"use client";

import type {
  AppStateSource,
  EntrySection,
  HomeFocus,
  PrimaryHomeAction,
} from "@/features/app/hooks/useMiniAppBootstrap";
import { CompatibilityTeaserCard } from "@/features/compatibility/components/CompatibilityTeaserCard";
import type { CompatibilityUiStage } from "@/features/compatibility/components/CompatibilityTeaserCard";
import {
  CompatibilityPreviewResponse,
  RelationshipContext,
} from "@/features/compatibility/types";
import { DailyInsight } from "@/features/daily/types";
import { TemporaryProfile } from "@/features/profile/types";
import { DailyPlaceholderCard } from "@/features/daily/components/DailyPlaceholderCard";
import { NumerologyResponse } from "@/features/onboarding/types";
import { ProfileSummaryCard } from "@/features/profile/components/ProfileSummaryCard";
import { ReadingNumbersGrid } from "@/features/reading/components/ReadingNumbersGrid";
import { ReadingStory } from "@/features/reading/components/ReadingStory";
import { ReadingPreview } from "@/features/reading/types";
import type { ReactNode } from "react";
import { FormEvent, useRef } from "react";
import { PremiumPaywallCard } from "@/features/premium/components/PremiumPaywallCard";
import { PurchaseSuccessCard } from "@/features/premium/components/PurchaseSuccessCard";

type ReadyHomeScreenProps = {
  profile: TemporaryProfile;
  result: NumerologyResponse;
  readingPreview: ReadingPreview;
  homeHeadline: string | null;
  homeSupportingText: string | null;
  homeNextStep: string | null;
  appStateSource: AppStateSource;
  restorationMode:
    | "empty"
    | "restored_profile"
    | "restored_reading"
    | "restored_home"
    | null;
  resumePoint:
    | "onboarding"
    | "first_reading"
    | "today"
    | "compatibility_preview"
    | "home"
    | null;
  availableSections: string[];
  sectionOrder: string[];
  homeFocus: HomeFocus;
  entrySection: EntrySection;
  sectionBadges: Record<string, string>;
  sectionDescriptions: Record<string, string>;
  sectionStates: Record<string, string>;
  sectionActions: Record<string, string>;
  primaryAction: PrimaryHomeAction;
  todayState: "locked" | "opted_out" | "ready";
  dailyInsight: DailyInsight | null;
  isDailyLoading: boolean;
  isCompatibilityExpanded: boolean;
  relationshipContext: RelationshipContext;
  targetBirthDate: string;
  targetDisplayName: string;
  compatibilityPreview: CompatibilityPreviewResponse | null;
  compatibilityError: string | null;
  isCompatibilitySubmitting: boolean;
  isPaywallOpen: boolean;
  isPurchaseSuccessOpen: boolean;
  isPremium: boolean;
  premiumStatus: "free" | "premium" | null;
  onExpandCompatibility: () => void;
  onOpenPaywall: () => void;
  onClosePaywall: () => void;
  onCompletePurchase: () => void;
  onOpenPurchaseSuccessPreview: () => void;
  onRelationshipContextChange: (value: RelationshipContext) => void;
  onTargetBirthDateChange: (value: string) => void;
  onTargetDisplayNameChange: (value: string) => void;
  onCompatibilitySubmit: (event: FormEvent<HTMLFormElement>) => void;
  onResetProfile: () => void | Promise<void>;
};

export function ReadyHomeScreen({
  profile,
  result,
  readingPreview,
  homeHeadline,
  homeSupportingText,
  homeNextStep,
  appStateSource,
  restorationMode,
  resumePoint,
  availableSections,
  sectionOrder,
  homeFocus,
  entrySection,
  sectionBadges,
  sectionDescriptions,
  sectionStates,
  sectionActions,
  primaryAction,
  todayState,
  dailyInsight,
  isDailyLoading,
  isCompatibilityExpanded,
  relationshipContext,
  targetBirthDate,
  targetDisplayName,
  compatibilityPreview,
  compatibilityError,
  isCompatibilitySubmitting,
  isPaywallOpen,
  isPurchaseSuccessOpen,
  isPremium,
  premiumStatus,
  onExpandCompatibility,
  onOpenPaywall,
  onClosePaywall,
  onCompletePurchase,
  onOpenPurchaseSuccessPreview,
  onRelationshipContextChange,
  onTargetBirthDateChange,
  onTargetDisplayNameChange,
  onCompatibilitySubmit,
  onResetProfile,
}: ReadyHomeScreenProps) {
  const orderedSections = sectionOrder.filter((section) =>
    availableSections.includes(section),
  );
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const primaryHomeAction = resolvePrimaryHomeAction({
    primaryAction,
    entrySection,
    sectionOrder: orderedSections,
    sectionActions,
  });
  const sectionActionMap = buildSectionActionMap({
    sectionOrder: orderedSections,
    sectionActions,
  });

  function scrollToSection(section: string) {
    sectionRefs.current[section]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function handleResolvedAction(action: { section: string; action: string } | null) {
    if (!action) {
      return;
    }

    if (
      action.action === "open_compatibility" ||
      action.action === "continue_compatibility"
    ) {
      onExpandCompatibility();
      window.setTimeout(() => {
        scrollToSection(action.section);
      }, 120);
      return;
    }

    scrollToSection(action.section);
  }

  function handlePrimaryHomeAction() {
    handleResolvedAction(primaryHomeAction);
  }

  const sectionContent = {
    overview: (
      <HomeSectionIntro
        headline={homeHeadline}
        supportingText={homeSupportingText}
        nextStep={homeNextStep}
        appStateSource={appStateSource}
        restorationMode={restorationMode}
        resumePoint={resumePoint}
        availableSections={availableSections}
        sectionOrder={sectionOrder}
        homeFocus={homeFocus}
        entrySection={entrySection}
        sectionBadges={sectionBadges}
        sectionDescriptions={sectionDescriptions}
        sectionStates={sectionStates}
        sectionActions={sectionActions}
        primaryActionLabel={primaryHomeAction?.label ?? null}
        onPrimaryAction={handlePrimaryHomeAction}
        onSectionAction={handleResolvedAction}
        sectionActionMap={sectionActionMap}
      />
    ),
    profile: (
      <ProfileSummaryCard
        profile={profile}
        sectionBadge={sectionBadges.profile ?? null}
        sectionState={sectionStates.profile ?? null}
        sectionDescription={sectionDescriptions.profile ?? null}
        sectionAction={sectionActions.profile ?? null}
        onReset={onResetProfile}
      />
    ),
    reading: (
      <>
        <ReadingStory
          preview={readingPreview}
          sectionBadge={sectionBadges.reading ?? null}
          sectionState={sectionStates.reading ?? null}
          sectionDescription={sectionDescriptions.reading ?? null}
          sectionAction={sectionActions.reading ?? null}
        />
        <ReadingNumbersGrid result={result} />
      </>
    ),
    today: (
      <DailyPlaceholderCard
        dailyOptIn={profile.daily_opt_in}
        todayState={todayState}
        isHighlighted={homeFocus === "today"}
        sectionBadge={sectionBadges.today ?? null}
        sectionState={sectionStates.today ?? null}
        sectionDescription={sectionDescriptions.today ?? null}
        sectionAction={sectionActions.today ?? null}
        dailyInsight={dailyInsight}
        isLoading={isDailyLoading}
      />
    ),
    compatibility: (
      <CompatibilityTeaserCard
        isExpanded={isCompatibilityExpanded}
        isHighlighted={homeFocus === "compatibility"}
        sectionBadge={sectionBadges.compatibility ?? null}
        sectionState={sectionStates.compatibility ?? null}
        sectionDescription={sectionDescriptions.compatibility ?? null}
        sectionAction={sectionActions.compatibility ?? null}
        stage={resolveCompatibilityUiStage({
          preview: compatibilityPreview,
          isPremium,
        })}
        relationshipContext={relationshipContext}
        targetBirthDate={targetBirthDate}
        targetDisplayName={targetDisplayName}
        preview={compatibilityPreview}
        premiumStatus={premiumStatus}
        isSubmitting={isCompatibilitySubmitting}
        error={compatibilityError}
        onExpand={onExpandCompatibility}
        onOpenPaywall={onOpenPaywall}
        onRelationshipContextChange={onRelationshipContextChange}
        onTargetBirthDateChange={onTargetBirthDateChange}
        onTargetDisplayNameChange={onTargetDisplayNameChange}
        onSubmit={onCompatibilitySubmit}
      />
    ),
  } satisfies Record<string, ReactNode>;

  return (
    <section className="grid gap-3">
      {orderedSections.map((section) => (
        <div
          key={section}
          ref={(node) => {
            sectionRefs.current[section] = node;
          }}
        >
          {section !== "overview" ? (
            <SectionMetadataHeader
              section={section}
              badge={sectionBadges[section] ?? null}
              state={sectionStates[section] ?? null}
              description={sectionDescriptions[section] ?? null}
              action={sectionActions[section] ?? null}
              actionLabel={sectionActionMap[section]?.label ?? null}
              onAction={() => handleResolvedAction(sectionActionMap[section] ?? null)}
            />
          ) : null}
          {sectionContent[section]}
        </div>
      ))}
      {isPaywallOpen && compatibilityPreview ? (
        <PremiumPaywallCard
          preview={compatibilityPreview}
          isPremium={isPremium}
          premiumStatus={premiumStatus}
          onContinue={onCompletePurchase}
          onBack={onClosePaywall}
        />
      ) : null}
      {isPurchaseSuccessOpen && compatibilityPreview ? (
        <PurchaseSuccessCard
          preview={compatibilityPreview}
          isPremium={isPremium}
          premiumStatus={premiumStatus}
          onOpenCompatibility={onOpenPurchaseSuccessPreview}
        />
      ) : null}
    </section>
  );
}

function resolveCompatibilityUiStage({
  preview,
  isPremium,
}: {
  preview: CompatibilityPreviewResponse | null;
  isPremium: boolean;
}): CompatibilityUiStage {
  if (!preview) {
    return "input";
  }

  if (isPremium) {
    return "preview_premium";
  }

  return "preview_locked";
}

function SectionMetadataHeader({
  section,
  badge,
  state,
  description,
  action,
  actionLabel,
  onAction,
}: {
  section: string;
  badge: string | null;
  state: string | null;
  description: string | null;
  action: string | null;
  actionLabel: string | null;
  onAction: () => void;
}) {
  if (!badge && !state && !description && !action) {
    return null;
  }

  const toneClassName = getSectionMetadataTone(state);

  return (
    <div
      className={`mb-2 rounded-2xl px-4 py-3 shadow-[0_8px_24px_rgba(89,63,31,0.06)] ${toneClassName}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
          {formatSectionLabel(section)}
        </p>
        {badge ? (
          <span className="rounded-full bg-stone-900 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-50">
            {badge}
          </span>
        ) : null}
        {state ? (
          <span className="rounded-full border border-stone-300 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
            {state.replaceAll("_", " ")}
          </span>
        ) : null}
      </div>
      {description ? (
        <p className="mt-2 text-sm leading-6 text-stone-600">{description}</p>
      ) : null}
      {action ? (
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
            Next: {formatPrimaryActionLabel(action)}
          </p>
          {actionLabel ? (
            <button
              type="button"
              onClick={onAction}
              className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-700 underline decoration-stone-300 underline-offset-4 transition hover:text-stone-950"
            >
              {actionLabel}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function getSectionMetadataTone(state: string | null) {
  switch (state) {
    case "previewed":
      return "border border-amber-200/80 bg-amber-50/70";
    case "ready":
      return "border border-emerald-200/80 bg-emerald-50/60";
    case "saved":
      return "border border-stone-200/80 bg-white/70";
    default:
      return "border border-stone-200/80 bg-white/70";
  }
}

function getOverviewMetadataTone(state: string | null) {
  switch (state) {
    case "previewed":
      return "border border-amber-200/80 bg-amber-50";
    case "ready":
      return "border border-emerald-200/80 bg-emerald-50";
    case "saved":
      return "border border-stone-200 bg-stone-50";
    default:
      return "border border-stone-200 bg-stone-50";
  }
}

function HomeSectionIntro({
  headline,
  supportingText,
  nextStep,
  appStateSource,
  restorationMode,
  resumePoint,
  availableSections,
  sectionOrder,
  homeFocus,
  entrySection,
  sectionBadges,
  sectionDescriptions,
  sectionStates,
  sectionActions,
  primaryActionLabel,
  onPrimaryAction,
  onSectionAction,
  sectionActionMap,
}: {
  headline: string | null;
  supportingText: string | null;
  nextStep: string | null;
  appStateSource: AppStateSource;
  restorationMode:
    | "empty"
    | "restored_profile"
    | "restored_reading"
    | "restored_home"
    | null;
  resumePoint:
    | "onboarding"
    | "first_reading"
    | "today"
    | "compatibility_preview"
    | "home"
    | null;
  availableSections: string[];
  sectionOrder: string[];
  homeFocus: HomeFocus;
  entrySection: EntrySection;
  sectionBadges: Record<string, string>;
  sectionDescriptions: Record<string, string>;
  sectionStates: Record<string, string>;
  sectionActions: Record<string, string>;
  primaryActionLabel: string | null;
  onPrimaryAction: () => void;
  onSectionAction: (action: { section: string; action: string } | null) => void;
  sectionActionMap: Record<string, { section: string; action: string; label: string }>;
}) {
  const debugLines = [
    appStateSource ? `Source: ${appStateSource.replaceAll("_", " ")}` : null,
    restorationMode
      ? `Restore mode: ${restorationMode.replaceAll("_", " ")}`
      : null,
    `Entry: ${entrySection.replaceAll("_", " ")}`,
    `Focus area: ${homeFocus}${resumePoint ? ` from ${resumePoint.replaceAll("_", " ")}` : ""}`,
    availableSections.length > 0
      ? `Sections: ${availableSections.join(" -> ")}`
      : null,
    sectionOrder.length > 0 ? `Flow order: ${sectionOrder.join(" -> ")}` : null,
  ].filter(Boolean) as string[];
  const resolvedNextStep = nextStep
    ? formatNextStepLabel(nextStep)
    : primaryActionLabel;
  const orderedSectionMetadata = [
    ...sectionOrder.filter((section) => section in sectionBadges),
    ...Object.keys(sectionBadges).filter((section) => !sectionOrder.includes(section)),
  ];

  return (
    <article className="rounded-[24px] border border-white/80 bg-white/85 p-5 shadow-[0_10px_30px_rgba(89,63,31,0.08)]">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
        Overview
      </p>
      <div className="mt-3 space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-950">
          {headline ?? "Your reading is ready to explore."}
        </h2>
        <p className="text-sm leading-6 text-stone-600">
          {supportingText ??
            "You can revisit your core numbers, check what is ready now, and continue into compatibility whenever you want."}
        </p>
        {resolvedNextStep ? (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            Up next: {resolvedNextStep}
          </p>
        ) : null}
        {primaryActionLabel ? (
          <button
            type="button"
            onClick={onPrimaryAction}
            className="mt-2 inline-flex min-h-11 items-center justify-center rounded-2xl bg-stone-950 px-4 py-3 text-sm font-semibold text-stone-50 transition hover:bg-stone-800"
          >
            {primaryActionLabel}
          </button>
        ) : null}
      </div>

      {Object.keys(sectionBadges).length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {orderedSectionMetadata.map((section) => (
            <button
              key={section}
              type="button"
              onClick={() => onSectionAction(sectionActionMap[section] ?? null)}
              disabled={!sectionActionMap[section]}
              className={`rounded-2xl px-3 py-2 text-left transition ${getOverviewMetadataTone(
                sectionStates[section] ?? null,
              )} ${
                section === homeFocus
                  ? "ring-2 ring-stone-300/80"
                  : ""
              } ${
                sectionActionMap[section]
                  ? "cursor-pointer hover:translate-y-[-1px] hover:shadow-[0_10px_24px_rgba(89,63,31,0.08)]"
                  : "cursor-default"
              }`}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-600">
                {formatSectionLabel(section)}: {sectionBadges[section]}
              </p>
              {section === entrySection && section === homeFocus ? (
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                  Start here
                </p>
              ) : section === entrySection ? (
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                  Starting point
                </p>
              ) : section === homeFocus ? (
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                  In focus
                </p>
              ) : null}
              {sectionStates[section] ? (
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                  Status: {sectionStates[section].replaceAll("_", " ")}
                </p>
              ) : null}
              {sectionDescriptions[section] ? (
                <p className="mt-1 text-xs leading-5 text-stone-500">
                  {sectionDescriptions[section]}
                </p>
              ) : null}
              {sectionActions[section] ? (
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                  Next: {formatPrimaryActionLabel(sectionActions[section])}
                </p>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}

      {process.env.NODE_ENV !== "production" && debugLines.length > 0 ? (
        <details className="mt-4 rounded-2xl border border-stone-200 bg-stone-50/80 px-4 py-3 text-sm text-stone-600">
          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            Home state details
          </summary>
          <div className="mt-3 space-y-2">
            {debugLines.map((line) => (
              <p key={line} className="text-xs leading-5 text-stone-500">
                {line}
              </p>
            ))}
          </div>
        </details>
      ) : null}
    </article>
  );
}

function resolvePrimaryHomeAction({
  primaryAction,
  entrySection,
  sectionOrder,
  sectionActions,
}: {
  primaryAction: PrimaryHomeAction;
  entrySection: EntrySection;
  sectionOrder: string[];
  sectionActions: Record<string, string>;
}) {
  const priorityActions = [
    "continue_compatibility",
    "open_compatibility",
    "open_today",
    "open_reading",
    "review_profile",
  ] as const;

  const orderedCandidates = [entrySection, ...sectionOrder].filter(
    (section, index, sections) => sections.indexOf(section) === index,
  );

  if (primaryAction) {
    const matchingSection = orderedCandidates.find(
      (section) => sectionActions[section] === primaryAction,
    );

    if (matchingSection) {
      return {
        section: matchingSection,
        action: primaryAction,
        label: formatPrimaryActionLabel(primaryAction),
      };
    }
  }

  for (const action of priorityActions) {
    const matchingSection = orderedCandidates.find(
      (section) => sectionActions[section] === action,
    );

    if (!matchingSection) {
      continue;
    }

    return {
      section: matchingSection,
      action,
      label: formatPrimaryActionLabel(action),
    };
  }

  return null;
}

function buildSectionActionMap({
  sectionOrder,
  sectionActions,
}: {
  sectionOrder: string[];
  sectionActions: Record<string, string>;
}) {
  return Object.fromEntries(
    sectionOrder
      .filter((section) => Boolean(sectionActions[section]))
      .map((section) => [
        section,
        {
          section,
          action: sectionActions[section],
          label: formatPrimaryActionLabel(sectionActions[section]),
        },
      ]),
  );
}

function formatPrimaryActionLabel(action: string) {
  switch (action) {
    case "complete_onboarding":
      return "Complete onboarding";
    case "generate_first_reading":
      return "Generate your first reading";
    case "continue_compatibility":
      return "Continue compatibility";
    case "open_compatibility":
      return "Explore compatibility";
    case "open_today":
      return "See today's insight";
    case "open_reading":
      return "Revisit your reading";
    case "review_profile":
      return "Open your profile";
    default:
      return action.replaceAll("_", " ");
  }
}

function formatSectionLabel(section: string) {
  switch (section) {
    case "overview":
      return "Overview";
    case "profile":
      return "Profile";
    case "reading":
      return "Your reading";
    case "today":
      return "Today";
    case "compatibility":
      return "Compatibility";
    default:
      return section
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
}

function formatNextStepLabel(nextStep: string) {
  switch (nextStep) {
    case "Continue compatibility":
      return "Continue compatibility";
    case "Open today's card":
      return "See today's insight";
    default:
      return nextStep;
  }
}
