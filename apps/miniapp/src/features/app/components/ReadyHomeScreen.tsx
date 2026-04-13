"use client";

import { useEffect, useState } from "react";

import type {
  AppStateSource,
  EntrySection,
  HomeFocus,
  PrimaryHomeAction,
} from "@/features/app/hooks/useMiniAppBootstrap";
import { CompatibilityTeaserCard } from "@/features/compatibility/components/CompatibilityTeaserCard";
import type { CompatibilityUiStage } from "@/features/compatibility/components/CompatibilityTeaserCard";
import { CompatFlow } from "@/features/compatibility/components/CompatFlow";
import {
  CompatibilityPreviewResponse,
  RelationshipContext,
} from "@/features/compatibility/types";
import { DailyInsight } from "@/features/daily/types";
import { TemporaryProfile } from "@/features/profile/types";
import { DailyPlaceholderCard } from "@/features/daily/components/DailyPlaceholderCard";
import { WeekCalendar } from "@/features/daily/components/WeekCalendar";
import { NumerologyResponse } from "@/features/onboarding/types";
import { CalculationHistory } from "@/features/profile/components/CalculationHistory";
import { ProfileSummaryCard } from "@/features/profile/components/ProfileSummaryCard";
import { ReadingStory } from "@/features/reading/components/ReadingStory";
import { PurchaseSuccessCard } from "@/features/premium/components/PurchaseSuccessCard";
import { PersonalYearCard } from "@/features/reading/components/PersonalYearCard";
import { BottomTabBar, TabId } from "./BottomTabBar";
import { BottomSheet } from "./BottomSheet";
import { GenerationLoadingScreen } from "./GenerationLoadingScreen";
import { NewCalculationSheet } from "./NewCalculationSheet";
import { FormEvent } from "react";

type HomeScreen = "hub" | "reading" | "compat" | "compat_flow";

type ReadyHomeScreenProps = {
  profile: TemporaryProfile;
  result: NumerologyResponse;
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
  sourceBirthDateCompat: string;
  onSourceBirthDateChange: (value: string) => void;
  onTargetBirthDateChange: (value: string) => void;
  onTargetDisplayNameChange: (value: string) => void;
  onCompatibilitySubmit: (event: FormEvent<HTMLFormElement>) => void;
  onNewCalculation: (birthDate: string, name: string) => Promise<void>;
  onResetProfile: () => void | Promise<void>;
  pendingNavigation: "reading" | null;
  onClearPendingNavigation: () => void;
  onClearCompatibility: () => void;
};

function resolveInitialHomeScreen(): HomeScreen {
  return "hub";
}

export function ReadyHomeScreen({
  profile,
  result,
  entrySection,
  sectionBadges,
  sectionDescriptions,
  sectionStates,
  sectionActions,
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
  sourceBirthDateCompat,
  onSourceBirthDateChange,
  onTargetBirthDateChange,
  onTargetDisplayNameChange,
  onCompatibilitySubmit,
  onNewCalculation,
  onResetProfile,
  pendingNavigation,
  onClearPendingNavigation,
  onClearCompatibility,
}: ReadyHomeScreenProps) {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [homeScreen, setHomeScreen] = useState<HomeScreen>(() =>
    resolveInitialHomeScreen(),
  );
  const [readingCtaVisible, setReadingCtaVisible] = useState(true);
  const [newCalcOpen, setNewCalcOpen] = useState(false);

  // Navigate to reading when hook signals (after onboarding or new calculation)
  useEffect(() => {
    if (pendingNavigation === "reading") {
      setActiveTab("home");
      setHomeScreen("reading");
      onClearPendingNavigation();
    }
  }, [pendingNavigation, onClearPendingNavigation]);

  async function handleNewCalc(newBirthDate: string, newName: string) {
    setNewCalcOpen(false);
    await onNewCalculation(newBirthDate, newName);
    // Navigation handled by pendingNavigation useEffect
  }

  function handleTabChange(tab: TabId) {
    setActiveTab(tab);
    if (tab === "home") {
      // returning to home tab → show hub (not sub-screen)
      setHomeScreen("hub");
    }
  }

  function openReading() {
    setActiveTab("home");
    setHomeScreen("reading");
  }

  function openCompat() {
    setActiveTab("home");
    setHomeScreen("compat_flow");
  }

  function openFreshCompat() {
    onClearCompatibility();
    setActiveTab("home");
    setHomeScreen("compat_flow");
  }

  function goBackToHub() {
    setHomeScreen("hub");
  }

  const compatStage = resolveCompatibilityUiStage({ preview: compatibilityPreview, isPremium });

  // Full-screen compat flow — no tab bar, no scroll wrapper
  if (activeTab === "home" && homeScreen === "compat_flow") {
    return (
      <>
        <div className="px-4 pb-10">
          <CompatFlow
            relationshipContext={relationshipContext}
            sourceBirthDate={sourceBirthDateCompat || profile.birth_date}
            targetBirthDate={targetBirthDate}
            targetDisplayName={targetDisplayName}
            preview={compatibilityPreview}
            isPremium={isPremium}
            isSubmitting={isCompatibilitySubmitting}
            error={compatibilityError}
            onRelationshipContextChange={onRelationshipContextChange}
            onSourceBirthDateChange={onSourceBirthDateChange}
            onTargetBirthDateChange={onTargetBirthDateChange}
            onTargetDisplayNameChange={onTargetDisplayNameChange}
            onSubmit={onCompatibilitySubmit}
            onUnlock={onCompletePurchase}
            onClose={goBackToHub}
          />
        </div>
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

  return (
    <>
      {/* Scrollable content */}
      <div className={`grid gap-3 ${activeTab === "home" && homeScreen === "reading" ? "pb-40" : "pb-28"}`}>

        {/* ── HOME TAB: Hub ── */}
        {activeTab === "home" && homeScreen === "hub" && (
          <HomeHub
            profile={profile}
            result={result}
            hasCompatibilityPreview={!!compatibilityPreview}
            isPremium={isPremium}
            todayState={todayState}
            dailyInsight={dailyInsight}
            isDailyLoading={isDailyLoading}
            onOpenReading={openReading}
            onOpenCompat={openCompat}
            onNewCalc={() => setNewCalcOpen(true)}
          />
        )}

        {/* ── HOME TAB: Reading ── */}
        {activeTab === "home" && homeScreen === "reading" && (
          <>
            <ReadingStory
              result={result}
              isPremium={isPremium}
              onUnlock={onCompletePurchase}
              onUnlockBlockVisible={(visible) => setReadingCtaVisible(!visible)}
              onGoHome={goBackToHub}
              onOpenCompat={openCompat}
            />
          </>
        )}

        {/* ── EXPLORE TAB ── */}
        {activeTab === "explore" && (
          <ExploreScreen />
        )}

        {/* ── PROFILE TAB ── */}
        {activeTab === "profile" && (
          <>
            <ProfileSummaryCard
              profile={profile}
              result={result}
              sectionBadge={sectionBadges.profile ?? null}
              sectionState={sectionStates.profile ?? null}
              sectionDescription={sectionDescriptions.profile ?? null}
              sectionAction={sectionActions.profile ?? null}
              onReset={onResetProfile}
            />
            <CalculationHistory />
          </>
        )}
      </div>

      {/* Fixed CTA on reading screen — hides when unlock block is in view or user is premium */}
      {activeTab === "home" && homeScreen === "reading" && !isPremium && (
        <div
          className="fixed left-0 right-0 z-40 mx-auto max-w-md px-4 transition-opacity duration-300"
          style={{
            bottom: "calc(env(safe-area-inset-bottom, 0px) + 26px)",
            opacity: readingCtaVisible ? 1 : 0,
            pointerEvents: readingCtaVisible ? "auto" : "none",
          }}
        >
          <button
            type="button"
            onClick={onCompletePurchase}
            className="w-full rounded-2xl py-4 text-sm font-semibold text-white transition active:scale-[0.98]"
            style={{
              background: "var(--grad-cta)",
              boxShadow: "0 8px 28px rgba(123,94,248,0.4)",
            }}
          >
            Получить полный расклад →
          </button>
        </div>
      )}

      {/* Fixed close button on sub-screens (reading, compat) */}
      {activeTab === "home" && homeScreen === "reading" && (
        <button
          type="button"
          onClick={goBackToHub}
          className="fixed z-50 flex h-10 w-10 items-center justify-center rounded-full transition active:scale-90"
          style={{
            top: "calc(env(safe-area-inset-top, 0px) + 16px)",
            right: 16,
            background: "rgba(22, 22, 45, 0.8)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#fff",
            boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
          }}
          aria-label="Закрыть"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Tab bar — only on hub and non-home tabs */}
      {!(activeTab === "home" && homeScreen !== "hub") && (
        <BottomTabBar activeTab={activeTab} onTabChange={handleTabChange} />
      )}

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

      {/* New calculation bottom sheet */}
      {newCalcOpen && (
        <BottomSheet onClose={() => setNewCalcOpen(false)}>
          <NewCalculationSheet
            onSelectNumerology={handleNewCalc}
            onSelectCompat={() => { setNewCalcOpen(false); openFreshCompat(); }}
            onClose={() => setNewCalcOpen(false)}
          />
        </BottomSheet>
      )}
    </>
  );
}

// ─── Sub-components ────────────────────────────────────────────────

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

/** Back button shown at top of reading/compat sub-screens */
function ScreenBackButton({ label, onBack }: { label: string; onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="flex items-center gap-2 py-1 transition active:opacity-60"
      style={{ color: "var(--text-muted)", background: "none", border: "none" }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
      </svg>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

/** Home hub with banner cards */
function HomeHub({
  profile,
  result,
  hasCompatibilityPreview,
  isPremium,
  todayState,
  dailyInsight,
  isDailyLoading,
  onOpenReading,
  onOpenCompat,
  onNewCalc,
}: {
  profile: TemporaryProfile;
  result: NumerologyResponse;
  hasCompatibilityPreview: boolean;
  isPremium: boolean;
  todayState: "locked" | "opted_out" | "ready";
  dailyInsight: DailyInsight | null;
  isDailyLoading: boolean;
  onOpenReading: () => void;
  onOpenCompat: () => void;
  onNewCalc: () => void;
}) {
  const name = profile.display_name ? `, ${profile.display_name.split(" ")[0]}` : "";

  return (
    <>
      {/* Greeting */}
      <div className="px-1 pt-1">
        <h1
          className="text-[22px] font-bold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          Привет{name} 👋
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Что хочешь исследовать сегодня?
        </p>
      </div>

      {/* New calculation CTA */}
      <button
        type="button"
        onClick={onNewCalc}
        className="w-full rounded-2xl py-3.5 text-sm font-semibold text-white transition active:scale-[0.98]"
        style={{
          background: "var(--grad-cta)",
          boxShadow: "0 6px 20px rgba(123,94,248,0.35)",
        }}
      >
        Новый расчёт +
      </button>

      {/* Week calendar + daily insight */}
      <WeekCalendar />
      <DailyPlaceholderCard
        dailyOptIn={todayState !== "opted_out"}
        todayState={todayState}
        dailyInsight={dailyInsight}
        isLoading={isDailyLoading}
      />

      {/* Personal year card */}
      <PersonalYearCard
        personalYear={result.personal_year_number}
        personalMonth={result.personal_month_number}
      />

      {/* Banner cards */}
      <HomeBanner
        icon="✦"
        accentColor="#7B5EF8"
        title="Нумерология"
        subtitle={`Жизненный путь · ${result.life_path_number}`}
        badge="Готово"
        onClick={onOpenReading}
      />
      <HomeBanner
        icon="♥"
        accentColor="#F472B6"
        title="Совместимость"
        subtitle={isPremium ? "Полный расклад доступен" : hasCompatibilityPreview ? "Превью готово" : "Проверь энергии с партнёром"}
        badge={isPremium ? "Открыто" : hasCompatibilityPreview ? "Превью" : undefined}
        onClick={onOpenCompat}
      />
      <HomeBanner
        icon="★"
        accentColor="#60A5FA"
        title="Гороскоп"
        subtitle={isPremium ? "Будет доступен в ближайшем обновлении" : "Персональный астрологический расклад"}
        badge={isPremium ? "Включено" : "Скоро"}
        disabled={!isPremium}
        onClick={() => {}}
      />
    </>
  );
}

function HomeBanner({
  icon,
  accentColor,
  title,
  subtitle,
  badge,
  disabled = false,
  onClick,
}: {
  icon: string;
  accentColor: string;
  title: string;
  subtitle: string;
  badge?: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-[24px] p-5 text-left transition active:scale-[0.98]"
      style={{
        background: "var(--bg-surface)",
        border: `1px solid ${disabled ? "var(--border-subtle)" : "var(--border-subtle)"}`,
        boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
        opacity: disabled ? 0.55 : 1,
        cursor: disabled ? "default" : "pointer",
      }}
    >
      <div className="flex items-center gap-4">
        {/* Icon orb */}
        <div
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-xl"
          style={{
            background: `${accentColor}18`,
            border: `1px solid ${accentColor}30`,
            color: accentColor,
          }}
        >
          {icon}
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p
              className="text-[15px] font-semibold leading-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {title}
            </p>
            {badge && (
              <span
                className="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em]"
                style={{
                  background: disabled ? "var(--bg-elevated)" : `${accentColor}20`,
                  color: disabled ? "var(--text-muted)" : accentColor,
                }}
              >
                {badge}
              </span>
            )}
          </div>
          <p
            className="mt-0.5 text-xs leading-5 truncate"
            style={{ color: "var(--text-secondary)" }}
          >
            {subtitle}
          </p>
        </div>

        {/* Arrow */}
        {!disabled && (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "var(--text-muted)", flexShrink: 0 }}
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        )}
      </div>
    </button>
  );
}

/** Explore tab placeholder */
function ExploreScreen() {
  const articles = [
    { icon: "✦", title: "Что такое число жизненного пути?", tag: "Основы" },
    { icon: "◈", title: "Мастер-числа 11, 22, 33 — в чём особенность?", tag: "Нумерология" },
    { icon: "♥", title: "Совместимость по числам: мифы и реальность", tag: "Совместимость" },
  ];

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
        Статьи · скоро
      </p>
      <h2
        className="mt-3 text-[20px] font-bold tracking-tight"
        style={{ color: "var(--text-primary)" }}
      >
        Обзор
      </h2>
      <p className="mt-1 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
        Здесь появятся статьи и материалы по нумерологии.
      </p>

      <ul className="mt-5 space-y-3">
        {articles.map((a) => (
          <li
            key={a.title}
            className="flex items-start gap-3 rounded-2xl px-4 py-3"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              opacity: 0.55,
            }}
          >
            <span
              className="mt-0.5 text-base flex-shrink-0"
              style={{ color: "var(--accent-soft)" }}
            >
              {a.icon}
            </span>
            <div>
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: "var(--text-muted)" }}
              >
                {a.tag}
              </p>
              <p
                className="mt-0.5 text-sm font-medium leading-5"
                style={{ color: "var(--text-primary)" }}
              >
                {a.title}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}
