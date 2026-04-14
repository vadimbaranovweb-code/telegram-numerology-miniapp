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
import { HoroscopeFlow } from "@/features/horoscope/components/HoroscopeFlow";
import type {
  HoroscopeReadingResponse,
  HoroscopeCompatibilityResponse,
} from "@/features/horoscope/types";
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

type HomeScreen = "hub" | "reading" | "compat" | "compat_flow" | "horoscope_flow" | "daily_horoscope";

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
  horoscopeResult: HoroscopeReadingResponse | null;
  horoscopeCompatResult: HoroscopeCompatibilityResponse | null;
  isHoroscopeSubmitting: boolean;
  horoscopeError: string | null;
  onHoroscopeReading: (birthDate: string) => void;
  onHoroscopeCompat: (sourceBirthDate: string, targetBirthDate: string, targetName: string) => void;
  onClearHoroscope: () => void;
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
  horoscopeResult,
  horoscopeCompatResult,
  isHoroscopeSubmitting,
  horoscopeError,
  onHoroscopeReading,
  onHoroscopeCompat,
  onClearHoroscope,
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

  function openHoroscope() {
    onClearHoroscope();
    setActiveTab("home");
    setHomeScreen("horoscope_flow");
  }

  function openDailyHoroscope() {
    setActiveTab("home");
    setHomeScreen("daily_horoscope");
  }

  function goBackToHub() {
    setHomeScreen("hub");
  }

  const compatStage = resolveCompatibilityUiStage({ preview: compatibilityPreview, isPremium });

  // Full-screen daily horoscope view (read-only card)
  if (activeTab === "home" && homeScreen === "daily_horoscope" && horoscopeResult) {
    const { zodiac, daily_forecast, personal_reading } = horoscopeResult;
    return (
      <div className="px-4 pb-10">
        {/* Back button */}
        <div className="flex items-center gap-3 py-2">
          <button
            type="button"
            onClick={goBackToHub}
            className="flex items-center gap-2 transition active:opacity-60"
            style={{ color: "var(--text-muted)", background: "none", border: "none" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span className="text-sm font-medium">Главная</span>
          </button>
        </div>

        {/* Header */}
        <div className="px-1 pt-2 mb-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: "#60A5FA" }}>
            {daily_forecast.weekday}, {daily_forecast.forecast_date.split("-").reverse().join(".")}
          </p>
          <h2 className="mt-2 text-[24px] font-bold tracking-tight leading-tight" style={{ color: "var(--text-primary)" }}>
            {zodiac.symbol} {zodiac.sign_ru} — прогноз дня
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            {zodiac.date_range} · {zodiac.element_ru} · {zodiac.ruling_planet}
          </p>
        </div>

        {/* Daily forecast card */}
        <div
          className="rounded-[24px] p-6"
          style={{ background: "var(--bg-surface)", border: "1px solid rgba(96,165,250,0.2)", boxShadow: "0 12px 40px rgba(0,0,0,0.3)" }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "#60A5FA" }}>
            Прогноз дня
          </p>
          <h3 className="mt-3 text-[18px] font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            {daily_forecast.headline}
          </h3>
          <p className="mt-2 text-sm leading-7" style={{ color: "var(--text-secondary)" }}>
            {daily_forecast.body}
          </p>
        </div>

        {/* Lucky number */}
        <div className="mt-3 flex gap-3">
          <div
            className="flex-1 rounded-[20px] p-5"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "#60A5FA" }}>
              Число дня
            </p>
            <p className="mt-2 text-[32px] font-bold" style={{ color: "var(--text-primary)" }}>
              {daily_forecast.lucky_number}
            </p>
          </div>
          <div
            className="flex-1 rounded-[20px] p-5"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "#60A5FA" }}>
              Фокус
            </p>
            <p className="mt-2 text-[18px] font-bold" style={{ color: "var(--text-primary)" }}>
              {daily_forecast.focus_area}
            </p>
          </div>
        </div>

        {/* Strengths */}
        <div
          className="mt-3 rounded-[20px] p-5"
          style={{ background: "var(--bg-surface)", border: "1px solid rgba(52,211,153,0.15)" }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "#34D399" }}>
            Сильные стороны {zodiac.sign_ru}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {personal_reading.strengths.map((s) => (
              <span key={s} className="rounded-full px-3 py-1.5 text-xs font-medium" style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", color: "#34D399" }}>
                ✦ {s}
              </span>
            ))}
          </div>
        </div>

        {/* Element */}
        <div
          className="mt-3 rounded-[20px] p-5"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--accent-soft)" }}>
            Стихия {zodiac.element_ru}
          </p>
          <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
            {personal_reading.element_summary}
          </p>
        </div>

        {/* CTA to full horoscope */}
        <button
          type="button"
          onClick={openHoroscope}
          className="mt-4 w-full rounded-2xl py-3.5 text-sm font-semibold text-white transition active:scale-[0.98]"
          style={{ background: "var(--grad-cta)", boxShadow: "0 6px 20px rgba(123,94,248,0.35)" }}
        >
          Полный гороскоп →
        </button>

        <div className="h-8" />
      </div>
    );
  }

  // Full-screen horoscope flow
  if (activeTab === "home" && homeScreen === "horoscope_flow") {
    return (
      <div className="px-4 pb-10">
        <HoroscopeFlow
          birthDate={profile.birth_date}
          horoscopeResult={horoscopeResult}
          horoscopeCompatResult={horoscopeCompatResult}
          isSubmitting={isHoroscopeSubmitting}
          error={horoscopeError}
          onSubmitReading={onHoroscopeReading}
          onSubmitCompat={onHoroscopeCompat}
          onClose={goBackToHub}
        />
      </div>
    );
  }

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
            horoscopeResult={horoscopeResult}
            onOpenReading={openReading}
            onOpenCompat={openCompat}
            onOpenHoroscope={openHoroscope}
            onOpenDailyHoroscope={openDailyHoroscope}
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
            onSelectHoroscope={() => { setNewCalcOpen(false); openHoroscope(); }}
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
  horoscopeResult,
  onOpenReading,
  onOpenCompat,
  onOpenHoroscope,
  onOpenDailyHoroscope,
  onNewCalc,
}: {
  profile: TemporaryProfile;
  result: NumerologyResponse;
  hasCompatibilityPreview: boolean;
  isPremium: boolean;
  todayState: "locked" | "opted_out" | "ready";
  dailyInsight: DailyInsight | null;
  isDailyLoading: boolean;
  horoscopeResult: HoroscopeReadingResponse | null;
  onOpenReading: () => void;
  onOpenCompat: () => void;
  onOpenHoroscope: () => void;
  onOpenDailyHoroscope: () => void;
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

      {/* Daily horoscope card */}
      {isPremium && horoscopeResult && (
        <button
          type="button"
          onClick={onOpenDailyHoroscope}
          className="w-full rounded-[24px] p-5 text-left transition active:scale-[0.98]"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid rgba(96,165,250,0.15)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          }}
        >
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: "#60A5FA" }}>
              {horoscopeResult.daily_forecast.weekday}, {horoscopeResult.daily_forecast.forecast_date.split("-").reverse().join(".")}
            </p>
            <span className="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em]" style={{ background: "rgba(96,165,250,0.12)", color: "#60A5FA" }}>
              {horoscopeResult.zodiac.symbol} {horoscopeResult.zodiac.sign_ru}
            </span>
          </div>
          <h3 className="mt-3 text-[15px] font-bold" style={{ color: "var(--text-primary)" }}>
            {horoscopeResult.daily_forecast.headline}
          </h3>
          <p className="mt-1.5 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
            {horoscopeResult.daily_forecast.body.length > 120
              ? horoscopeResult.daily_forecast.body.slice(0, 120) + "..."
              : horoscopeResult.daily_forecast.body}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: "rgba(96,165,250,0.1)", color: "#60A5FA" }}>
                Число дня: {horoscopeResult.daily_forecast.lucky_number}
              </span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {horoscopeResult.daily_forecast.focus_area}
              </span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2.2" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
          </div>
        </button>
      )}

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
        subtitle={isPremium ? "Персональный астрологический расклад" : "Знак, прогноз дня, совместимость"}
        badge={isPremium ? "Открыто" : "Премиум"}
        onClick={onOpenHoroscope}
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

/** Explore tab with articles */
function ExploreScreen() {
  const [openArticle, setOpenArticle] = useState<number | null>(null);

  const articles = [
    {
      tag: "Основы",
      title: "Что такое число жизненного пути?",
      image: "/articles/life-path.svg",
      body: "Число жизненного пути — главное число в нумерологии. Оно вычисляется из полной даты рождения путём последовательного сложения цифр до однозначного числа (или мастер-числа 11, 22, 33).\n\nНапример, дата 15.03.1990: 1+5+0+3+1+9+9+0 = 28, 2+8 = 10, 1+0 = 1. Число жизненного пути — 1.\n\nКаждое число от 1 до 9 несёт свою энергию:\n• 1 — лидерство и независимость\n• 2 — партнёрство и дипломатия\n• 3 — творчество и самовыражение\n• 4 — стабильность и порядок\n• 5 — свобода и перемены\n• 6 — забота и ответственность\n• 7 — анализ и духовность\n• 8 — амбиции и материальный успех\n• 9 — мудрость и гуманизм\n\nЭто число не меняется в течение жизни и показывает твою основную жизненную задачу.",
    },
    {
      tag: "Нумерология",
      title: "Мастер-числа 11, 22, 33",
      image: "/articles/master-numbers.svg",
      body: "Мастер-числа — особые двузначные числа, которые не сводятся к однозначным при расчёте. Они несут усиленную вибрацию и особую миссию.\n\n11 — Интуитивный визионер. Обострённая чувствительность, способность видеть то, что скрыто от других. Часто встречается у духовных учителей и творческих людей.\n\n22 — Мастер-строитель. Способность воплощать грандиозные идеи в реальность. Это число великих проектов и системного мышления.\n\n33 — Мастер-целитель. Самое редкое мастер-число. Глубокое сострадание и способность исцелять через любовь. Встречается у людей, посвятивших жизнь служению другим.\n\nЕсли твоё число жизненного пути — мастер-число, это говорит о повышенном потенциале и ответственности. Энергия мастер-числа может проявляться не сразу, а раскрываться с опытом.",
    },
    {
      tag: "Совместимость",
      title: "Совместимость по числам: как это работает?",
      image: "/articles/compatibility.svg",
      body: "Нумерологическая совместимость основана на сравнении чисел жизненного пути двух людей. Некоторые числа естественно гармонируют, другие создают напряжение.\n\nОтличная совместимость:\n• 1 и 5 — оба ценят свободу\n• 2 и 6 — забота и гармония\n• 3 и 9 — творческий союз\n• 4 и 8 — деловое партнёрство\n\nСложные сочетания:\n• 1 и 1 — борьба за лидерство\n• 4 и 5 — стабильность vs перемены\n• 7 и 3 — глубина vs поверхностность\n\nВажно помнить: нумерология показывает энергетические тенденции, а не приговор. Любая пара может быть счастливой, если оба готовы работать над отношениями. Числа лишь подсвечивают зоны, где стоит быть внимательнее.",
    },
    {
      tag: "Астрология",
      title: "Четыре стихии зодиака",
      image: "/articles/zodiac-elements.svg",
      body: "Двенадцать знаков зодиака делятся на четыре стихии, каждая из которых определяет базовый темперамент.\n\n🔥 Огонь (Овен, Лев, Стрелец)\nЭнергия, страсть, инициативность. Огненные знаки — прирождённые лидеры. Они действуют быстро и вдохновляют других.\n\n🌍 Земля (Телец, Дева, Козерог)\nСтабильность, практичность, надёжность. Земные знаки строят прочный фундамент и ценят материальный мир.\n\n💨 Воздух (Близнецы, Весы, Водолей)\nИнтеллект, общение, идеи. Воздушные знаки живут в мире мыслей и социальных связей.\n\n💧 Вода (Рак, Скорпион, Рыбы)\nЭмоции, интуиция, глубина. Водные знаки чувствуют тоньше других и обладают развитой эмпатией.\n\nСтихии помогают понять, как знаки взаимодействуют: Огонь и Воздух усиливают друг друга, Земля и Вода — дополняют.",
    },
    {
      tag: "Нумерология",
      title: "Что такое персональный год?",
      image: "/articles/personal-year.svg",
      body: "Персональный год — это девятилетний цикл, в котором каждый год несёт свою энергию. Он рассчитывается из дня и месяца рождения + текущий год.\n\n• Год 1 — новые начинания, старт цикла\n• Год 2 — терпение, партнёрства\n• Год 3 — творчество, общение, радость\n• Год 4 — работа, фундамент, дисциплина\n• Год 5 — перемены, свобода, путешествия\n• Год 6 — семья, ответственность, дом\n• Год 7 — самопознание, уединение, анализ\n• Год 8 — финансы, карьера, власть\n• Год 9 — завершение, отпускание, мудрость\n\nЗная свой персональный год, можно лучше планировать важные решения. Например, год 1 идеален для старта бизнеса, а год 9 — для завершения отживших отношений и проектов.",
    },
    {
      tag: "Астрология",
      title: "Совместимость знаков зодиака",
      image: "/articles/zodiac-compat.svg",
      body: "Астрологическая совместимость определяется взаимодействием стихий, модальностей и аспектов между знаками.\n\nКлассические пары с высокой совместимостью:\n• Овен + Лев — огненная страсть и взаимное восхищение\n• Телец + Рак — уют, стабильность, семейные ценности\n• Близнецы + Водолей — интеллектуальная связь и свобода\n• Скорпион + Рыбы — глубокая эмоциональная связь\n\nНапряжённые, но развивающие пары:\n• Овен + Козерог — амбиции сталкиваются\n• Лев + Скорпион — борьба за контроль\n• Близнецы + Дева — разный подход к деталям\n\nКвадратуры (знаки через 90°) создают напряжение, но и мощный рост. Трины (120°) — естественная гармония. Оппозиции (180°) — притяжение противоположностей.\n\nАстрология — это карта возможностей, а не ограничений.",
    },
  ];

  if (openArticle !== null) {
    const article = articles[openArticle];
    return (
      <>
        <button
          type="button"
          onClick={() => setOpenArticle(null)}
          className="flex items-center gap-2 py-1 transition active:opacity-60"
          style={{ color: "var(--text-muted)", background: "none", border: "none" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span className="text-sm font-medium">Назад</span>
        </button>

        <article
          className="rounded-[24px] overflow-hidden"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={article.image} alt={article.title} className="w-full h-40 object-cover" />
          <div className="p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--accent-soft)" }}>
              {article.tag}
            </p>
            <h2 className="mt-2 text-[20px] font-bold tracking-tight leading-tight" style={{ color: "var(--text-primary)" }}>
              {article.title}
            </h2>
            <div className="mt-4 text-sm leading-7 whitespace-pre-line" style={{ color: "var(--text-secondary)" }}>
              {article.body}
            </div>
          </div>
        </article>
      </>
    );
  }

  return (
    <>
      <div className="px-1">
        <h2 className="text-[20px] font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Обзор
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Статьи про нумерологию и астрологию
        </p>
      </div>

      <div className="space-y-3">
        {articles.map((a, i) => (
          <button
            key={a.title}
            type="button"
            onClick={() => setOpenArticle(i)}
            className="w-full rounded-[20px] overflow-hidden text-left transition active:scale-[0.98]"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", boxShadow: "0 6px 20px rgba(0,0,0,0.25)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={a.image} alt={a.title} className="w-full h-32 object-cover" />
            <div className="px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--accent-soft)" }}>
                {a.tag}
              </p>
              <p className="mt-1 text-[14px] font-semibold leading-5" style={{ color: "var(--text-primary)" }}>
                {a.title}
              </p>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}
