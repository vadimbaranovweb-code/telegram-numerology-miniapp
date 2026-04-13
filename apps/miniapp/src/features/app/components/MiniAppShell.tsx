"use client";

import { useState } from "react";
import { ReadyHomeScreen } from "@/features/app/components/ReadyHomeScreen";
import { HeroSection } from "@/features/onboarding/components/HeroSection";
import { NextStepsCard } from "@/features/onboarding/components/NextStepsCard";
import { OnboardingStepper } from "@/features/onboarding/components/OnboardingStepper";
import { BootstrapScreen } from "@/features/profile/components/BootstrapScreen";
import { TelegramContextCard } from "@/features/telegram/components/TelegramContextCard";
import { useTelegramAuth } from "@/features/telegram/hooks/useTelegramAuth";
import { useTelegramBootstrap } from "@/features/telegram/hooks/useTelegramBootstrap";
import { useTelegramWebApp } from "@/features/telegram/hooks/useTelegramWebApp";

import { useMiniAppBootstrap } from "../hooks/useMiniAppBootstrap";
import { GenerationLoadingScreen } from "./GenerationLoadingScreen";
import { StarField } from "./StarField";

export function MiniAppShell() {
  const [onboardingStep, setOnboardingStep] = useState<1 | 2>(1);
  const telegramContext = useTelegramWebApp();
  const telegramAuth = useTelegramAuth(telegramContext);
  const { bootstrapState: telegramBootstrap, refreshBootstrap } =
    useTelegramBootstrap(telegramAuth);
  const {
    birthDate,
    fullName,
    dailyOptIn,
    profile,
    result,
    homeHeadline,
    homeSupportingText,
    homeNextStep,
    dailyInsight,
    isDailyLoading,
    todayState,
    isCompatibilityExpanded,
    relationshipContext,
    targetBirthDate,
    targetDisplayName,
    compatibilityPreview,
    compatibilityError,
    isCompatibilitySubmitting,
    isPaywallOpen,
    isPurchaseSuccessOpen,
    bootstrapStatus,
    isPremium,
    premiumStatus,
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
    error,
    isSubmitting,
    isFormValid,
    readingPreview,
    setBirthDate,
    setFullName,
    setDailyOptIn,
    setRelationshipContext,
    sourceBirthDateCompat,
    setSourceBirthDateCompat,
    setTargetBirthDate,
    setTargetDisplayName,
    openCompatibilityTeaser,
    openPaywall,
    closePaywall,
    completePurchase,
    openPurchaseSuccessPreview,
    handleSubmit,
    handleCompatibilitySubmit,
    handleNewCalculation,
    handleResetProfile,
    pendingNavigation,
    clearPendingNavigation,
    clearCompatibility,
    horoscopeResult,
    horoscopeCompatResult,
    isHoroscopeSubmitting,
    horoscopeError,
    handleHoroscopeReading,
    handleHoroscopeCompat,
    clearHoroscope,
  } = useMiniAppBootstrap(
    telegramContext,
    telegramAuth,
    telegramBootstrap,
    refreshBootstrap,
  );

  return (
    <main
      className="relative min-h-screen px-4"
      style={{
        background: "var(--grad-hero)",
        color: "var(--text-primary)",
        paddingTop: "calc(var(--tg-content-safe-area-inset-top, 0px) + var(--tg-safe-area-inset-top, env(safe-area-inset-top, 0px)) + 16px)",
        paddingBottom: bootstrapStatus === "ready" ? "0" : "1.5rem",
      }}
    >
      <StarField />
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md flex-col gap-5">
        {bootstrapStatus === "bootstrapping" ? (
          <BootstrapScreen />
        ) : (
          <>
            {bootstrapStatus === "onboarding" && (
              <HeroSection compact={onboardingStep === 2} />
            )}
            <TelegramContextCard
              context={telegramContext}
              authState={telegramAuth}
              bootstrapState={telegramBootstrap}
            />

            {bootstrapStatus === "onboarding" ? (
              isSubmitting ? (
                <GenerationLoadingScreen />
              ) : (
                <OnboardingStepper
                  birthDate={birthDate}
                  fullName={fullName}
                  dailyOptIn={dailyOptIn}
                  isSubmitting={isSubmitting}
                  isFormValid={isFormValid}
                  error={error}
                  telegramFirstName={telegramContext.user?.first_name ?? undefined}
                  onBirthDateChange={setBirthDate}
                  onFullNameChange={setFullName}
                  onDailyOptInChange={setDailyOptIn}
                  onSubmit={handleSubmit}
                  onStepChange={(s) => setOnboardingStep(s as 1 | 2)}
                />
              )
            ) : null}

            {bootstrapStatus === "ready" && profile && result ? (
              <ReadyHomeScreen
                profile={profile}
                result={result}
                homeHeadline={homeHeadline}
                homeSupportingText={homeSupportingText}
                homeNextStep={homeNextStep}
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
                primaryAction={primaryAction}
                todayState={todayState}
                dailyInsight={dailyInsight}
                isDailyLoading={isDailyLoading}
                isCompatibilityExpanded={isCompatibilityExpanded}
                relationshipContext={relationshipContext}
                targetBirthDate={targetBirthDate}
                targetDisplayName={targetDisplayName}
                compatibilityPreview={compatibilityPreview}
                compatibilityError={compatibilityError}
                isCompatibilitySubmitting={isCompatibilitySubmitting}
                isPaywallOpen={isPaywallOpen}
                isPurchaseSuccessOpen={isPurchaseSuccessOpen}
                isPremium={isPremium}
                premiumStatus={premiumStatus}
                onExpandCompatibility={openCompatibilityTeaser}
                onOpenPaywall={openPaywall}
                onClosePaywall={closePaywall}
                onCompletePurchase={completePurchase}
                onOpenPurchaseSuccessPreview={openPurchaseSuccessPreview}
                onRelationshipContextChange={setRelationshipContext}
                sourceBirthDateCompat={sourceBirthDateCompat}
                onSourceBirthDateChange={setSourceBirthDateCompat}
                onTargetBirthDateChange={setTargetBirthDate}
                onTargetDisplayNameChange={setTargetDisplayName}
                onCompatibilitySubmit={handleCompatibilitySubmit}
                onNewCalculation={handleNewCalculation}
                onResetProfile={handleResetProfile}
                pendingNavigation={pendingNavigation}
                onClearPendingNavigation={clearPendingNavigation}
                onClearCompatibility={clearCompatibility}
                horoscopeResult={horoscopeResult}
                horoscopeCompatResult={horoscopeCompatResult}
                isHoroscopeSubmitting={isHoroscopeSubmitting}
                horoscopeError={horoscopeError}
                onHoroscopeReading={handleHoroscopeReading}
                onHoroscopeCompat={handleHoroscopeCompat}
                onClearHoroscope={clearHoroscope}
              />
            ) : (
              <section className="grid gap-3">
                <NextStepsCard />
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
