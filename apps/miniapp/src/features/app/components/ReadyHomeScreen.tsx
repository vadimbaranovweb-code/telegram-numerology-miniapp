"use client";

import { useState } from "react";

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
import { PremiumPaywallCard } from "@/features/premium/components/PremiumPaywallCard";
import { PurchaseSuccessCard } from "@/features/premium/components/PurchaseSuccessCard";
import { BottomTabBar, TabId } from "./BottomTabBar";
import { BottomSheet } from "./BottomSheet";
import { GenerationLoadingScreen } from "./GenerationLoadingScreen";
import { PersonalYearCard } from "@/features/reading/components/PersonalYearCard";
import { FormEvent } from "react";

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

/** Maps tab id → the section keys it contains */
const TAB_SECTIONS: Record<TabId, string[]> = {
  home: ["overview", "reading"],
  today: ["today"],
  compat: ["compatibility"],
  profile: ["profile"],
};

/** Maps section key → tab */
const SECTION_TAB: Record<string, TabId> = {
  overview: "home",
  reading: "home",
  today: "today",
  compatibility: "compat",
  profile: "profile",
};

function resolveInitialTab(entrySection: EntrySection): TabId {
  return SECTION_TAB[entrySection] ?? "home";
}

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
  const [activeTab, setActiveTab] = useState<TabId>(() =>
    resolveInitialTab(entrySection),
  );

  // When paywall/success is open, force compat tab so context is correct
  function handleTabChange(tab: TabId) {
    setActiveTab(tab);
    if (tab === "compat" && !isCompatibilityExpanded) {
      onExpandCompatibility();
    }
  }

  // Sections visible in the current tab
  const orderedSections = sectionOrder.filter((s) =>
    availableSections.includes(s),
  );
  const visibleSections = orderedSections.filter(
    (s) => TAB_SECTIONS[activeTab]?.includes(s),
  );

  const compatStage = resolveCompatibilityUiStage({ preview: compatibilityPreview, isPremium });

  return (
    <>
      {/* Scrollable tab content with bottom padding for tab bar */}
      <div className="grid gap-3 pb-24">
        {activeTab === "home" && (
          <>
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
              onTabChange={handleTabChange}
            />
            <PersonalYearCard
              personalYear={result.personal_year_number}
              personalMonth={result.personal_month_number}
            />

            {visibleSections.includes("reading") && (
              <>
                <ReadingStory
                  preview={readingPreview}
                  lifePathNumber={result.life_path_number}
                  sectionBadge={sectionBadges.reading ?? null}
                  sectionState={sectionStates.reading ?? null}
                  sectionDescription={sectionDescriptions.reading ?? null}
                  sectionAction={sectionActions.reading ?? null}
                />
                <ReadingNumbersGrid
                  result={result}
                  displayName={profile.display_name ?? undefined}
                />
              </>
            )}
          </>
        )}

        {activeTab === "today" && (
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
        )}

        {activeTab === "compat" && isCompatibilitySubmitting && (
          <GenerationLoadingScreen />
        )}

        {activeTab === "compat" && !isCompatibilitySubmitting && (
          <CompatibilityTeaserCard
            isExpanded={isCompatibilityExpanded}
            isHighlighted={homeFocus === "compatibility"}
            sectionBadge={sectionBadges.compatibility ?? null}
            sectionState={sectionStates.compatibility ?? null}
            sectionDescription={sectionDescriptions.compatibility ?? null}
            sectionAction={sectionActions.compatibility ?? null}
            stage={compatStage}
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
        )}

        {activeTab === "profile" && (
          <ProfileSummaryCard
            profile={profile}
            sectionBadge={sectionBadges.profile ?? null}
            sectionState={sectionStates.profile ?? null}
            sectionDescription={sectionDescriptions.profile ?? null}
            sectionAction={sectionActions.profile ?? null}
            onReset={onResetProfile}
          />
        )}
      </div>

      <BottomTabBar activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Paywall bottom sheet */}
      {isPaywallOpen && compatibilityPreview ? (
        <BottomSheet onClose={onClosePaywall}>
          <PremiumPaywallCard
            preview={compatibilityPreview}
            isPremium={isPremium}
            premiumStatus={premiumStatus}
            onContinue={onCompletePurchase}
            onBack={onClosePaywall}
          />
        </BottomSheet>
      ) : null}

      {/* Purchase success bottom sheet */}
      {isPurchaseSuccessOpen && compatibilityPreview ? (
        <BottomSheet onClose={onOpenPurchaseSuccessPreview}>
          <PurchaseSuccessCard
            preview={compatibilityPreview}
            isPremium={isPremium}
            premiumStatus={premiumStatus}
            onOpenCompatibility={onOpenPurchaseSuccessPreview}
          />
        </BottomSheet>
      ) : null}
    </>
  );
}

function resolveCompatibilityUiStage({
  preview,
  isPremium,
}: {
  preview: CompatibilityPreviewResponse | null;
  isPremium: boolean;
}): CompatibilityUiStage {
  if (!preview) return "input";
  if (isPremium) return "preview_premium";
  return "preview_locked";
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
  onTabChange,
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
  onTabChange: (tab: TabId) => void;
}) {
  const debugLines = [
    appStateSource ? `Source: ${appStateSource.replaceAll("_", " ")}` : null,
    restorationMode
      ? `Restore mode: ${restorationMode.replaceAll("_", " ")}`
      : null,
    `Entry: ${entrySection.replaceAll("_", " ")}`,
    `Focus: ${homeFocus}${resumePoint ? ` from ${resumePoint.replaceAll("_", " ")}` : ""}`,
    availableSections.length > 0
      ? `Sections: ${availableSections.join(" → ")}`
      : null,
    sectionOrder.length > 0 ? `Flow: ${sectionOrder.join(" → ")}` : null,
  ].filter(Boolean) as string[];

  // Section badges that belong to other tabs (shown as quick-nav pills)
  const otherTabBadges = Object.entries(sectionBadges).filter(
    ([section]) => !TAB_SECTIONS.home.includes(section),
  );

  return (
    <article
      className="rounded-[24px] p-5"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
      }}
    >
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.22em]"
        style={{ color: "var(--text-muted)" }}
      >
        Overview
      </p>
      <div className="mt-3 space-y-2">
        <h2
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          {headline ?? "Your reading is ready."}
        </h2>
        <p className="text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
          {supportingText ??
            "Explore your core numbers below, or navigate with the tabs."}
        </p>
        {nextStep ? (
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: "var(--text-muted)" }}
          >
            Up next: {nextStep}
          </p>
        ) : null}
      </div>

      {/* Quick-nav pills to other tabs that have badges */}
      {otherTabBadges.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {otherTabBadges.map(([section, badge]) => {
            const targetTab = SECTION_TAB[section];
            if (!targetTab) return null;
            const isFocused = homeFocus === section;
            return (
              <button
                key={section}
                type="button"
                onClick={() => onTabChange(targetTab)}
                className="rounded-2xl px-3 py-2 text-left transition active:scale-[0.97]"
                style={{
                  background: isFocused
                    ? "rgba(123,94,248,0.12)"
                    : "var(--bg-elevated)",
                  border: isFocused
                    ? "1px solid var(--accent-primary)"
                    : "1px solid var(--border-subtle)",
                }}
              >
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.14em]"
                  style={{
                    color: isFocused
                      ? "var(--accent-soft)"
                      : "var(--text-secondary)",
                  }}
                >
                  {formatSectionLabel(section)}: {badge}
                </p>
                {isFocused ? (
                  <p
                    className="mt-0.5 text-[10px] uppercase tracking-[0.12em]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    In focus
                  </p>
                ) : null}
                {sectionDescriptions[section] ? (
                  <p className="mt-1 text-xs leading-5" style={{ color: "var(--text-muted)" }}>
                    {sectionDescriptions[section]}
                  </p>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}

      {process.env.NODE_ENV !== "production" && debugLines.length > 0 ? (
        <details
          className="mt-4 rounded-2xl px-4 py-3 text-sm"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <summary
            className="cursor-pointer text-[11px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: "var(--text-muted)" }}
          >
            Home state
          </summary>
          <div className="mt-3 space-y-1">
            {debugLines.map((line) => (
              <p key={line} className="text-xs leading-5" style={{ color: "var(--text-muted)" }}>
                {line}
              </p>
            ))}
          </div>
        </details>
      ) : null}
    </article>
  );
}

function formatSectionLabel(section: string) {
  switch (section) {
    case "overview":
      return "Overview";
    case "profile":
      return "Profile";
    case "reading":
      return "Reading";
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
