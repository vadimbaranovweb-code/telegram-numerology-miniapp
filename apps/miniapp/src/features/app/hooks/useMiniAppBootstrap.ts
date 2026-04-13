"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { trackEvent } from "@/features/app/lib/analytics";
import {
  CompatibilityPreviewResponse,
  PremiumCheckoutSessionResponse,
  RelationshipContext,
} from "@/features/compatibility/types";
import { DailyInsight } from "@/features/daily/types";
import { NumerologyResponse } from "@/features/onboarding/types";
import {
  AppProfile,
  AppSnapshot,
  ProfilePreviewResponse,
  TemporaryProfile,
} from "@/features/profile/types";
import { addCalculationEntry } from "@/features/profile/calculationHistory";
import { TelegramAuthState } from "@/features/telegram/hooks/useTelegramAuth";
import { TelegramBootstrapState } from "@/features/telegram/hooks/useTelegramBootstrap";
import { openTelegramInvoiceUrl } from "@/features/telegram/hooks/useTelegramWebApp";
import { TelegramWebAppContext } from "@/features/telegram/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";
const APP_SNAPSHOT_STORAGE_KEY = "numerology-miniapp-snapshot-v1";

export type BootstrapStatus = "bootstrapping" | "onboarding" | "ready";
export type AppStateSource =
  | "bootstrap_snapshot"
  | "bootstrap_partial"
  | "bootstrap_empty"
  | "local_snapshot"
  | "local_fallback"
  | "fresh_onboarding"
  | null;
export type HomeFocus = "overview" | "today" | "compatibility";
export type EntrySection =
  | "onboarding"
  | "first_reading"
  | "overview"
  | "today"
  | "compatibility";
export type PrimaryHomeAction =
  | "complete_onboarding"
  | "generate_first_reading"
  | "open_today"
  | "open_compatibility"
  | "continue_compatibility"
  | "open_reading"
  | "review_profile"
  | null;

type HomePresentationState = {
  homeFocus: HomeFocus;
  entrySection: EntrySection;
  sectionBadges: Record<string, string>;
  sectionDescriptions: Record<string, string>;
  sectionStates: Record<string, string>;
  sectionActions: Record<string, string>;
  primaryAction: PrimaryHomeAction;
  headline: string | null;
  supportingText: string | null;
  nextStep: string | null;
};

export function useMiniAppBootstrap(
  telegramContext?: TelegramWebAppContext,
  telegramAuth?: TelegramAuthState,
  telegramBootstrap?: TelegramBootstrapState,
  refreshTelegramBootstrap?: () => Promise<TelegramBootstrapState | null>,
) {
  const [birthDate, setBirthDate] = useState("");
  const [fullName, setFullName] = useState("");
  const [dailyOptIn, setDailyOptIn] = useState(false);
  const [profile, setProfile] = useState<TemporaryProfile | null>(null);
  const [result, setResult] = useState<NumerologyResponse | null>(null);
  const [homeHeadline, setHomeHeadline] = useState<string | null>(null);
  const [homeSupportingText, setHomeSupportingText] = useState<string | null>(null);
  const [homeNextStep, setHomeNextStep] = useState<string | null>(null);
  const [todayState, setTodayState] =
    useState<"locked" | "opted_out" | "ready">("locked");
  const [dailyInsight, setDailyInsight] = useState<DailyInsight | null>(null);
  const [isDailyLoading, setIsDailyLoading] = useState(false);
  const [isCompatibilityExpanded, setIsCompatibilityExpanded] = useState(false);
  const [relationshipContext, setRelationshipContext] =
    useState<RelationshipContext>("romantic");
  const [sourceBirthDateCompat, setSourceBirthDateCompat] = useState("");
  const [targetBirthDate, setTargetBirthDate] = useState("");
  const [targetDisplayName, setTargetDisplayName] = useState("");
  const [compatibilityPreview, setCompatibilityPreview] =
    useState<CompatibilityPreviewResponse | null>(null);
  const [compatibilityError, setCompatibilityError] = useState<string | null>(null);
  const [isCompatibilitySubmitting, setIsCompatibilitySubmitting] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isPurchaseSuccessOpen, setIsPurchaseSuccessOpen] = useState(false);
  const [bootstrapStatus, setBootstrapStatus] =
    useState<BootstrapStatus>("bootstrapping");
  const [isPremium, setIsPremium] = useState(false);
  const [premiumStatus, setPremiumStatus] =
    useState<"free" | "premium" | null>(null);
  const [appStateSource, setAppStateSource] = useState<AppStateSource>(null);
  const [restorationMode, setRestorationMode] =
    useState<TelegramBootstrapState["restorationMode"]>(null);
  const [resumePoint, setResumePoint] =
    useState<TelegramBootstrapState["resumePoint"]>(null);
  const [availableSections, setAvailableSections] = useState<string[]>([]);
  const [sectionOrder, setSectionOrder] = useState<string[]>([]);
  const [homeFocus, setHomeFocus] = useState<HomeFocus>("overview");
  const [entrySection, setEntrySection] = useState<EntrySection>("onboarding");
  const [sectionBadges, setSectionBadges] = useState<Record<string, string>>({});
  const [sectionDescriptions, setSectionDescriptions] = useState<Record<string, string>>({});
  const [sectionStates, setSectionStates] = useState<Record<string, string>>({});
  const [sectionActions, setSectionActions] = useState<Record<string, string>>({});
  const [pendingNavigation, setPendingNavigation] = useState<"reading" | null>(null);
  const [primaryAction, setPrimaryAction] = useState<PrimaryHomeAction>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tracks which telegramBootstrap object was last fully applied.
  // Prevents re-running full rehydration when profile/result change after a new calculation.
  const appliedBootstrapRef = useRef<TelegramBootstrapState | null>(null);

  const isFormValid = useMemo(() => Boolean(birthDate), [birthDate]);
  const readingPreview = useMemo(() => result?.reading_preview ?? null, [result]);

  const applyHomePresentationState = useCallback(
    (state: HomePresentationState) => {
      setHomeFocus(state.homeFocus);
      setEntrySection(state.entrySection);
      setSectionBadges(state.sectionBadges);
      setSectionDescriptions(state.sectionDescriptions);
      setSectionStates(state.sectionStates);
      setSectionActions(state.sectionActions);
      setPrimaryAction(state.primaryAction);
      setHomeHeadline(state.headline);
      setHomeSupportingText(state.supportingText);
      setHomeNextStep(state.nextStep);
    },
    [],
  );

  const applyLocalHomeLayout = useCallback(
    (layout: ReturnType<typeof buildLocalHomeLayout>) => {
      setAvailableSections(layout.availableSections);
      setSectionOrder(layout.sectionOrder);
      setResumePoint(layout.resumePoint);
      setIsCompatibilityExpanded(layout.entrySection === "compatibility");
      applyHomePresentationState({
        homeFocus: layout.homeFocus,
        entrySection: layout.entrySection,
        sectionBadges: layout.sectionBadges,
        sectionDescriptions: layout.sectionDescriptions,
        sectionStates: layout.sectionStates,
        sectionActions: layout.sectionActions,
        primaryAction: layout.primaryAction,
        headline: layout.headline,
        supportingText: layout.supportingText,
        nextStep: layout.nextStep,
      });
    },
    [applyHomePresentationState],
  );

  const applyTelegramHomeState = useCallback((
    state: Pick<
      TelegramBootstrapState,
      | "restorationMode"
      | "resumePoint"
      | "availableSections"
      | "sectionOrder"
      | "homeFocus"
      | "entrySection"
      | "sectionBadges"
      | "sectionDescriptions"
      | "sectionStates"
      | "sectionActions"
      | "primaryAction"
      | "headline"
      | "supportingText"
      | "nextStep"
      | "todayState"
      | "compatibilityPreview"
    >,
  ) => {
    setRestorationMode(state.restorationMode);
    setResumePoint(state.resumePoint);
    setAvailableSections(state.availableSections);
    setSectionOrder(state.sectionOrder);
    applyHomePresentationState({
      homeFocus: state.homeFocus ?? "overview",
      entrySection: state.entrySection ?? "overview",
      sectionBadges: state.sectionBadges,
      sectionDescriptions: state.sectionDescriptions,
      sectionStates: state.sectionStates,
      sectionActions: state.sectionActions,
      primaryAction: state.primaryAction,
      headline: state.headline,
      supportingText: state.supportingText,
      nextStep: state.nextStep,
    });
    setTodayState(state.todayState ?? "locked");
    setCompatibilityPreview(state.compatibilityPreview);
    setIsCompatibilityExpanded(state.entrySection === "compatibility");
  }, [applyHomePresentationState]);

  const applyFreshOnboardingState = useCallback(() => {
    setProfile(null);
    setResult(null);
    setHomeHeadline(null);
    setHomeSupportingText(null);
    setHomeNextStep(null);
    setTodayState("locked");
    setDailyInsight(null);
    setIsCompatibilityExpanded(false);
    setCompatibilityPreview(null);
    setCompatibilityError(null);
    setIsPaywallOpen(false);
    setIsPurchaseSuccessOpen(false);
    setAppStateSource("fresh_onboarding");
    setIsPremium(false);
    setPremiumStatus(null);
    setRestorationMode("empty");
    setResumePoint("onboarding");
    setAvailableSections([]);
    setSectionOrder([]);
    setHomeFocus("overview");
    setEntrySection("onboarding");
    setSectionBadges({});
    setSectionDescriptions({});
    setSectionStates({});
    setSectionActions({});
    setPrimaryAction(null);
    setBootstrapStatus("onboarding");
  }, []);

  const applyLocalSnapshotState = useCallback((
    snapshot: AppSnapshot,
    source: Extract<AppStateSource, "local_snapshot" | "local_fallback">,
  ) => {
    setAppStateSource(source);
    setRestorationMode("restored_reading");
    setCompatibilityPreview(null);
    const localLayout = buildLocalHomeLayout({
      dailyOptIn: snapshot.profile.daily_opt_in,
      hasCompatibilityPreview: false,
    });
    applyLocalHomeLayout(localLayout);
    hydrateFromSnapshot(snapshot);
  }, [applyLocalHomeLayout]);

  const resolveBootstrapStatusFromTelegram = useCallback((
    state: Pick<TelegramBootstrapState, "primaryAction">,
  ): BootstrapStatus => {
    if (
      state.primaryAction === "complete_onboarding" ||
      state.primaryAction === "generate_first_reading"
    ) {
      return "onboarding";
    }

    return "ready";
  }, []);

  const applyTelegramBootstrapProfile = useCallback(
    (profile: TemporaryProfile, fallbackDisplayName: string | null) => {
      setBirthDate(profile.birth_date || "");
      setFullName(profile.display_name || fallbackDisplayName || "");
      setDailyOptIn(profile.daily_opt_in);
    },
    [],
  );

  const applyTelegramBootstrapIdentity = useCallback(
    (
      state: Pick<
        TelegramBootstrapState,
        "userDisplayName" | "dailyOptIn" | "isPremium" | "premiumStatus"
      >,
    ) => {
      setBirthDate("");
      setFullName(state.userDisplayName || "");
      setDailyOptIn(state.dailyOptIn);
      setIsPremium(state.isPremium);
      setPremiumStatus(state.premiumStatus);
    },
    [],
  );

  const applyTelegramBootstrapAppState = useCallback(
    (
      state: Pick<
        TelegramBootstrapState,
        | "restorationMode"
        | "resumePoint"
        | "availableSections"
        | "sectionOrder"
        | "homeFocus"
        | "entrySection"
        | "sectionBadges"
        | "sectionDescriptions"
        | "sectionStates"
        | "sectionActions"
        | "primaryAction"
        | "isPremium"
        | "premiumStatus"
        | "headline"
        | "supportingText"
        | "nextStep"
        | "todayState"
        | "compatibilityPreview"
      >,
      source: AppStateSource,
    ) => {
      setAppStateSource(source);
      setIsPremium(state.isPremium);
      setPremiumStatus(state.premiumStatus);
      applyTelegramHomeState(state);
    },
    [applyTelegramHomeState],
  );

  useEffect(() => {
    trackEvent("welcome_viewed", {
      entry_point: "miniapp_home",
    });
    trackEvent("daily_opt_in_viewed", {
      prompt_variant: "inline_onboarding_checkbox",
    });

    try {
      const rawSnapshot = window.localStorage.getItem(APP_SNAPSHOT_STORAGE_KEY);

      if (!rawSnapshot) {
        applyFreshOnboardingState();
        return;
      }

      const parsedSnapshot = JSON.parse(rawSnapshot) as AppSnapshot;

      if (!parsedSnapshot.profile || !parsedSnapshot.numerology) {
        clearStoredSnapshot();
        applyFreshOnboardingState();
        return;
      }

      applyLocalSnapshotState(parsedSnapshot, "local_snapshot");
    } catch {
      clearStoredSnapshot();
      applyFreshOnboardingState();
    }
  }, [applyFreshOnboardingState, applyLocalSnapshotState]);

  useEffect(() => {
    if (!telegramBootstrap || telegramBootstrap.status !== "loaded") {
      return;
    }

    // If this exact bootstrap object was already applied, only update bootstrapStatus if needed.
    // This prevents re-running full rehydration when profile/result change after handleNewCalculation,
    // which would overwrite new calculation data with the stale bootstrap snapshot.
    const isNewBootstrap = appliedBootstrapRef.current !== telegramBootstrap;
    if (!isNewBootstrap) {
      if (!profile && !result) {
        setBootstrapStatus(resolveBootstrapStatusFromTelegram(telegramBootstrap));
      }
      return;
    }
    appliedBootstrapRef.current = telegramBootstrap;

    // Never downgrade isPremium — backend may lag payment confirmation (race with bot)
    // or lose state entirely (Railway SQLite on /tmp resets on restart).
    // localStorage is the authoritative source for locally-confirmed purchases.
    const localIsPremium = (() => {
      try {
        const raw = window.localStorage.getItem(APP_SNAPSHOT_STORAGE_KEY);
        if (!raw) return false;
        const parsed = JSON.parse(raw) as AppSnapshot;
        return parsed.isPremium === true;
      } catch { return false; }
    })();
    const resolvedIsPremium = localIsPremium || telegramBootstrap.isPremium;
    const resolvedBootstrap = resolvedIsPremium !== telegramBootstrap.isPremium
      ? { ...telegramBootstrap, isPremium: resolvedIsPremium, premiumStatus: "premium" as const }
      : telegramBootstrap;

    const resolvedBootstrapSource = resolveBootstrapSource(
      telegramBootstrap.restorationMode,
    );

    if (telegramBootstrap.appSnapshot) {
      applyTelegramBootstrapAppState(resolvedBootstrap, resolvedBootstrapSource);
      const snapshotWithPremium = { ...telegramBootstrap.appSnapshot, isPremium: resolvedIsPremium };
      persistSnapshot(snapshotWithPremium);
      hydrateFromSnapshot(snapshotWithPremium);
      return;
    }

    applyTelegramBootstrapAppState(resolvedBootstrap, resolvedBootstrapSource);

    if (telegramBootstrap.appProfile) {
      setProfile(telegramBootstrap.appProfile);
      applyTelegramBootstrapProfile(
        telegramBootstrap.appProfile,
        telegramBootstrap.userDisplayName,
      );
    } else {
      setProfile(null);
      applyTelegramBootstrapIdentity(telegramBootstrap);
    }

    setResult(null);
    setDailyInsight(null);
    setCompatibilityError(null);
    setIsPaywallOpen(false);
    setIsPurchaseSuccessOpen(false);

    if (!profile && !result) {
      setBootstrapStatus(resolveBootstrapStatusFromTelegram(telegramBootstrap));
    }
  }, [
    applyTelegramBootstrapAppState,
    applyTelegramBootstrapIdentity,
    applyTelegramBootstrapProfile,
    profile,
    resolveBootstrapStatusFromTelegram,
    result,
    telegramBootstrap,
  ]);

  useEffect(() => {
    async function loadDailyInsight() {
      if (bootstrapStatus !== "ready" || !profile || todayState !== "ready") {
        setDailyInsight(null);
        return;
      }

      setIsDailyLoading(true);

      try {
        const params = new URLSearchParams({
          birth_date: profile.birth_date,
        });
        const response = await fetch(`${API_BASE_URL}/daily/today?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Could not load today's card.");
        }

        const data = (await response.json()) as DailyInsight;
        setDailyInsight(data);
        trackEvent("daily_card_viewed", {
          entry_point: "home_today_card",
          daily_template_version: data.source,
        });
      } catch {
        setDailyInsight(null);
      } finally {
        setIsDailyLoading(false);
      }
    }

    void loadDailyInsight();
  }, [bootstrapStatus, profile, todayState]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const isTelegramBacked =
      telegramAuth?.status === "authenticated" && Boolean(telegramAuth.sessionToken);
    trackEvent("birth_date_submitted", {
      birth_year: birthDate ? Number.parseInt(birthDate.slice(0, 4), 10) : null,
      input_method: "date_picker",
    });

    if (fullName.trim()) {
      trackEvent("name_submitted", {
        name_length: fullName.trim().length,
      });
    } else {
      trackEvent("name_skipped");
    }

    trackEvent("reading_generation_started");

    try {
      let savedProfileResponse: AppProfile | null = null;
      let numerologyData: NumerologyResponse | null = null;

      if (isTelegramBacked && telegramAuth.sessionToken) {
        const onboardingResponse = await fetch(`${API_BASE_URL}/onboarding/profile`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session_token: telegramAuth.sessionToken,
            birth_date: birthDate,
            display_name: fullName || null,
            daily_opt_in: dailyOptIn,
          }),
        });

        if (onboardingResponse.ok) {
          const onboardingData = (await onboardingResponse.json()) as {
            profile_saved: boolean;
            profile: AppProfile;
          };
          savedProfileResponse = onboardingData.profile;
        }

        await fetch(`${API_BASE_URL}/onboarding/complete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session_token: telegramAuth.sessionToken,
          }),
        }).catch(() => {
          // First reading request below remains the more important transition step.
        });

        const firstReadingResponse = await fetch(`${API_BASE_URL}/readings/first`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session_token: telegramAuth.sessionToken,
            force_regenerate: false,
          }),
        });

        if (firstReadingResponse.ok) {
          numerologyData =
            (await firstReadingResponse.json()) as NumerologyResponse;
        }
      }

      const resolvedNumerologyData = numerologyData
        ? numerologyData
        : await loadNumerologyFallback({
            birthDate,
            fullName,
          });
      const profileData = savedProfileResponse
        ? {
            ...savedProfileResponse,
            onboarding_completed: true,
          } satisfies AppProfile
        : isTelegramBacked
          ? buildClientProfileFallback({
              birthDate,
              fullName,
              dailyOptIn,
            })
          : await loadProfilePreviewFallback({
              birthDate,
              fullName,
              dailyOptIn,
            });

      const snapshot = {
        profile: profileData,
        numerology: resolvedNumerologyData,
      } satisfies AppSnapshot;

      const shouldUseBackendBootstrapTruth =
        isTelegramBacked &&
        Boolean(refreshTelegramBootstrap);

      if (shouldUseBackendBootstrapTruth && refreshTelegramBootstrap) {
        const refreshedBootstrap = await refreshTelegramBootstrap();

        if (refreshedBootstrap?.appSnapshot) {
          setAppStateSource("bootstrap_snapshot");
          setRestorationMode(refreshedBootstrap.restorationMode);
          setResumePoint(refreshedBootstrap.resumePoint);
          setAvailableSections(refreshedBootstrap.availableSections);
          setSectionOrder(refreshedBootstrap.sectionOrder);
          setHomeFocus(refreshedBootstrap.homeFocus ?? "overview");
          setEntrySection(refreshedBootstrap.entrySection ?? "overview");
          setPrimaryAction(refreshedBootstrap.primaryAction);
          const refreshedWithPremium = { ...refreshedBootstrap.appSnapshot, isPremium: refreshedBootstrap.isPremium };
          persistSnapshot(refreshedWithPremium);
          hydrateFromSnapshot(refreshedWithPremium);
        } else {
          persistSnapshot(snapshot);
          applyLocalSnapshotState(snapshot, "local_fallback");
        }
      } else {
        setAppStateSource(numerologyData ? "bootstrap_partial" : "local_fallback");
        setRestorationMode("restored_reading");
        applyLocalHomeLayout(
          buildLocalHomeLayout({
            dailyOptIn: profileData.daily_opt_in,
            hasCompatibilityPreview: false,
          }),
        );
        if (!numerologyData) {
          await persistBackendSnapshot(snapshot);
        }
        persistSnapshot(snapshot);
        hydrateFromSnapshot(snapshot);
      }
      trackEvent("reading_generation_completed", {
        reading_version: resolvedNumerologyData.calculation_version,
        cards_count: resolvedNumerologyData.reading_preview.cards.length,
        cache_hit: false,
      });
      addCalculationEntry({
        type: "numerology",
        birthDate,
        displayName: fullName || null,
        lifePathNumber: resolvedNumerologyData.life_path_number,
      });
      trackEvent("first_reading_viewed", {
        cards_count: resolvedNumerologyData.reading_preview.cards.length,
        reading_version: resolvedNumerologyData.calculation_version,
      });
      trackEvent(
        dailyOptIn ? "daily_opt_in_accepted" : "daily_opt_in_skipped",
        {
          prompt_variant: "inline_onboarding_checkbox",
        },
      );
      setPendingNavigation("reading");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong while calculating your numbers.",
      );
      setResult(null);
      setDailyInsight(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleNewCalculation(newBirthDate: string, newName: string) {
    setIsSubmitting(true);
    setError(null);
    try {
      const numerologyData = await loadNumerologyFallback({
        birthDate: newBirthDate,
        fullName: newName,
      });
      const profileData = buildClientProfileFallback({
        birthDate: newBirthDate,
        fullName: newName,
        dailyOptIn,
      });
      setBirthDate(newBirthDate);
      setFullName(newName);

      // Pass isPremium explicitly — avoid stale closure after async await
      const snapshot: AppSnapshot = { profile: profileData, numerology: numerologyData, isPremium };
      persistSnapshot(snapshot);
      hydrateFromSnapshot(snapshot);

      addCalculationEntry({
        type: "numerology",
        birthDate: newBirthDate,
        displayName: newName || null,
        lifePathNumber: numerologyData.life_path_number,
      });
      setPendingNavigation("reading");

      // Sync to backend if Telegram-backed
      if (telegramAuth?.status === "authenticated" && telegramAuth.sessionToken) {
        fetch(`${API_BASE_URL}/onboarding/profile`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_token: telegramAuth.sessionToken,
            birth_date: newBirthDate,
            display_name: newName || null,
            daily_opt_in: dailyOptIn,
          }),
        }).then(() =>
          fetch(`${API_BASE_URL}/readings/first`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              session_token: telegramAuth.sessionToken,
              force_regenerate: true,
            }),
          }),
        ).catch(() => {});
      }
    } catch {
      setError("Ошибка расчёта. Попробуйте ещё раз.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCompatibilitySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profile) {
      return;
    }

    setCompatibilityError(null);
    setIsCompatibilitySubmitting(true);
    trackEvent("compatibility_started", {
      entry_point: "home_compatibility_teaser",
    });
    trackEvent("compatibility_context_selected", {
      relationship_context: relationshipContext,
    });
    trackEvent("compatibility_birth_date_submitted", {
      relationship_context: relationshipContext,
    });
    trackEvent("compatibility_generation_started", {
      relationship_context: relationshipContext,
    });

    try {
      const response = await fetch(`${API_BASE_URL}/compatibility/preview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_token:
            telegramAuth?.status === "authenticated"
              ? telegramAuth.sessionToken
              : null,
          source_birth_date: sourceBirthDateCompat || profile.birth_date,
          target_birth_date: targetBirthDate,
          relationship_context: relationshipContext,
          target_display_name: targetDisplayName || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Could not generate compatibility preview.");
      }

      const data = (await response.json()) as CompatibilityPreviewResponse;
      setCompatibilityPreview(data);
      const localLayout = buildLocalHomeLayout({
        dailyOptIn: profile.daily_opt_in,
        hasCompatibilityPreview: true,
      });
      setRestorationMode("restored_home");
      applyLocalHomeLayout(localLayout);
      setIsPaywallOpen(false);
      setIsPurchaseSuccessOpen(false);
      trackEvent("compatibility_generation_completed", {
        relationship_context: relationshipContext,
        cards_count: data.preview.cards.length,
      });
      trackEvent("compatibility_preview_viewed", {
        relationship_context: relationshipContext,
        cards_count: data.preview.cards.length,
      });
    } catch (submitError) {
      setCompatibilityError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong while preparing compatibility preview.",
      );
    } finally {
      setIsCompatibilitySubmitting(false);
    }
  }

  async function handleResetProfile() {
    await clearBackendSnapshot();
    clearStoredSnapshot();
    setProfile(null);
    setResult(null);
    setHomeHeadline(null);
    setHomeSupportingText(null);
    setHomeNextStep(null);
    setTodayState("locked");
    setDailyInsight(null);
    setIsCompatibilityExpanded(false);
    setRelationshipContext("romantic");
    setTargetBirthDate("");
    setTargetDisplayName("");
    setCompatibilityPreview(null);
    setCompatibilityError(null);
    setIsPaywallOpen(false);
    setIsPurchaseSuccessOpen(false);
    setBirthDate("");
    setFullName("");
    setDailyOptIn(false);
    setIsPremium(false);
    setPremiumStatus(null);
    setError(null);
    setBootstrapStatus("onboarding");
    setAppStateSource("fresh_onboarding");
    setRestorationMode("empty");
    setResumePoint("onboarding");
    setAvailableSections([]);
    setSectionOrder([]);
    setHomeFocus("overview");
    setEntrySection("onboarding");
    setSectionBadges({});
    setSectionDescriptions({});
    setSectionStates({});
    setSectionActions({});
    setPrimaryAction(null);
  }

  function hydrateFromSnapshot(snapshot: AppSnapshot) {
    setProfile(snapshot.profile);
    setResult(snapshot.numerology);
    setBirthDate(snapshot.profile.birth_date);
    setFullName(snapshot.profile.display_name ?? "");
    setDailyOptIn(snapshot.profile.daily_opt_in);
    setTodayState(snapshot.profile.daily_opt_in ? "ready" : "opted_out");
    if (snapshot.isPremium != null) {
      setIsPremium(snapshot.isPremium);
      setPremiumStatus(snapshot.isPremium ? "premium" : "free");
    }
    setBootstrapStatus("ready");
  }

  function persistSnapshot(snapshot: AppSnapshot) {
    // If snapshot explicitly carries isPremium, trust it; otherwise fall back to current state.
    const resolvedPremium = snapshot.isPremium ?? isPremium;
    const withPremium = { ...snapshot, isPremium: resolvedPremium };
    window.localStorage.setItem(APP_SNAPSHOT_STORAGE_KEY, JSON.stringify(withPremium));
  }

  function clearStoredSnapshot() {
    window.localStorage.removeItem(APP_SNAPSHOT_STORAGE_KEY);
  }

  async function persistBackendSnapshot(snapshot: AppSnapshot) {
    if (
      telegramAuth?.status !== "authenticated" ||
      !telegramAuth.sessionToken
    ) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/bootstrap/snapshot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_token: telegramAuth.sessionToken,
          app_profile: snapshot.profile,
          first_reading: snapshot.numerology,
        }),
      });

      if (!response.ok) {
        throw new Error("Could not persist bootstrap snapshot.");
      }
    } catch {
      // Keep local snapshot fallback during the temporary backend transition.
    }
  }

  async function clearBackendSnapshot() {
    if (
      telegramAuth?.status !== "authenticated" ||
      !telegramAuth.sessionToken
    ) {
      return;
    }

    try {
      const params = new URLSearchParams({
        session_token: telegramAuth.sessionToken,
      });

      const response = await fetch(
        `${API_BASE_URL}/bootstrap/snapshot?${params.toString()}`,
        {
        method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Could not clear bootstrap snapshot.");
      }
    } catch {
      // Local reset still happens even if temporary backend state clear fails.
    }
  }

  function openCompatibilityTeaser() {
    setIsCompatibilityExpanded(true);
    trackEvent("compatibility_teaser_viewed", {
      entry_point: "home_ready_screen",
    });
  }

  function openPaywall() {
    if (isPremium) {
      setIsPaywallOpen(false);
      setIsPurchaseSuccessOpen(true);
      return;
    }

    setIsPaywallOpen(true);

    if (compatibilityPreview) {
      trackEvent("paywall_viewed", {
        paywall_context: "compatibility",
        offer_key: compatibilityPreview.paywall.offer_key,
      });
    }
  }

  function closePaywall() {
    setIsPaywallOpen(false);
  }

  async function completePurchase() {
    if (
      telegramAuth?.status === "authenticated" &&
      telegramAuth.sessionToken
    ) {
      const offerKey = compatibilityPreview?.paywall.offer_key ?? "compatibility_unlock_monthly";
      const compatRequestId = compatibilityPreview?.compatibility_request_id ?? null;

      try {
        trackEvent("offer_selected", {
          paywall_context: compatibilityPreview ? "compatibility" : "reading",
          offer_key: offerKey,
        });

        const checkoutResponse = await fetch(
          `${API_BASE_URL}/premium/checkout-session`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              session_token: telegramAuth.sessionToken,
              offer_key: offerKey,
              compatibility_request_id: compatRequestId,
            }),
          },
        );

        if (!checkoutResponse.ok) {
          throw new Error("Could not create premium checkout session.");
        }

        const checkoutSession =
          (await checkoutResponse.json()) as PremiumCheckoutSessionResponse;

        trackEvent("checkout_started", {
          paywall_context: compatibilityPreview ? "compatibility" : "reading",
          offer_key: offerKey,
          provider: checkoutSession.provider,
          checkout_mode: checkoutSession.mode,
          checkout_session_id: checkoutSession.checkout_session_id,
          checkout_surface:
            checkoutSession.invoice_url && telegramContext?.canOpenInvoice
              ? "telegram_invoice"
              : "simulated_fallback",
        });

        if (
          checkoutSession.invoice_url &&
          telegramContext?.canOpenInvoice &&
          openTelegramInvoiceUrl(
            checkoutSession.invoice_url,
            (status) => {
              if (status === "paid") {
                void (async () => {
                  if (refreshTelegramBootstrap) {
                    await refreshTelegramBootstrap();
                  }
                  // Re-persist snapshot with premium flag
                  setIsPremium(true);
                  setPremiumStatus("premium");
                  const currentSnapshot = window.localStorage.getItem(APP_SNAPSHOT_STORAGE_KEY);
                  if (currentSnapshot) {
                    try {
                      const parsed = JSON.parse(currentSnapshot) as AppSnapshot;
                      window.localStorage.setItem(APP_SNAPSHOT_STORAGE_KEY, JSON.stringify({ ...parsed, isPremium: true }));
                    } catch { /* keep existing */ }
                  }
                  setIsPaywallOpen(false);
                  setIsPurchaseSuccessOpen(true);
                  trackEvent("purchase_completed", {
                    paywall_context: "compatibility",
                    offer_selected:
                      compatibilityPreview?.paywall.offer_key ?? null,
                    payment_method: "telegram_stars",
                  });
                })();
              }
            },
          )
        ) {
          setIsPaywallOpen(false);
          return;
        }

        await fetch(`${API_BASE_URL}/premium/unlock`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session_token: telegramAuth.sessionToken,
            offer_key: offerKey,
          }),
        });

        if (refreshTelegramBootstrap) {
          await refreshTelegramBootstrap();
        }
        // Re-persist snapshot with premium flag (fallback path)
        setIsPremium(true);
        setPremiumStatus("premium");
        const currentSnapshot = window.localStorage.getItem(APP_SNAPSHOT_STORAGE_KEY);
        if (currentSnapshot) {
          try {
            const parsed = JSON.parse(currentSnapshot) as AppSnapshot;
            window.localStorage.setItem(APP_SNAPSHOT_STORAGE_KEY, JSON.stringify({ ...parsed, isPremium: true }));
          } catch { /* keep existing */ }
        }
      } catch {
        // Keep the temporary success flow available even if premium state refresh fails.
      }
    }

    setIsPaywallOpen(false);
    setIsPurchaseSuccessOpen(true);
    trackEvent("purchase_completed", {
      paywall_context: "compatibility",
      offer_selected: compatibilityPreview?.paywall.offer_key ?? null,
    });
  }

  function openPurchaseSuccessPreview() {
    setIsPurchaseSuccessOpen(false);
    setIsCompatibilityExpanded(true);
  }

  return {
    birthDate,
    fullName,
    dailyOptIn,
    profile,
    result,
    homeHeadline,
    homeSupportingText,
    homeNextStep,
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
    setIsPurchaseSuccessOpen,
    openCompatibilityTeaser,
    openPaywall,
    closePaywall,
    completePurchase,
    openPurchaseSuccessPreview,
    handleSubmit,
    handleNewCalculation,
    handleCompatibilitySubmit,
    handleResetProfile,
    pendingNavigation,
    clearPendingNavigation: () => setPendingNavigation(null),
  };
}

async function loadNumerologyFallback({
  birthDate,
  fullName,
}: {
  birthDate: string;
  fullName: string;
}): Promise<NumerologyResponse> {
  const response = await fetch(`${API_BASE_URL}/numerology/calculate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      birth_date: birthDate,
      full_name: fullName || null,
    }),
  });

  if (!response.ok) {
    throw new Error("Could not generate your reading preview.");
  }

  return (await response.json()) as NumerologyResponse;
}

async function loadProfilePreviewFallback({
  birthDate,
  fullName,
  dailyOptIn,
}: {
  birthDate: string;
  fullName: string;
  dailyOptIn: boolean;
}): Promise<TemporaryProfile> {
  const response = await fetch(`${API_BASE_URL}/profile/preview`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      birth_date: birthDate,
      display_name: fullName || null,
      daily_opt_in: dailyOptIn,
    }),
  });

  if (!response.ok) {
    return buildClientProfileFallback({
      birthDate,
      fullName,
      dailyOptIn,
    });
  }

  return {
    ...(await response.json()),
    onboarding_completed: true,
  } as ProfilePreviewResponse;
}

function buildClientProfileFallback({
  birthDate,
  fullName,
  dailyOptIn,
}: {
  birthDate: string;
  fullName: string;
  dailyOptIn: boolean;
}): TemporaryProfile {
  return {
    display_name: fullName || null,
    birth_date: birthDate,
    daily_opt_in: dailyOptIn,
    onboarding_completed: true,
  };
}

function resolveBootstrapSource(
  restorationMode: TelegramBootstrapState["restorationMode"],
): AppStateSource {
  if (restorationMode === "restored_home" || restorationMode === "restored_reading") {
    return "bootstrap_snapshot";
  }

  if (restorationMode === "restored_profile") {
    return "bootstrap_partial";
  }

  if (restorationMode === "empty") {
    return "bootstrap_empty";
  }

  return null;
}

function buildLocalHomeLayout({
  dailyOptIn,
  hasCompatibilityPreview,
}: {
  dailyOptIn: boolean;
  hasCompatibilityPreview: boolean;
}): {
  availableSections: string[];
  sectionOrder: string[];
  resumePoint: "today" | "compatibility_preview" | "home";
  homeFocus: HomeFocus;
  entrySection: EntrySection;
  sectionBadges: Record<string, string>;
  sectionDescriptions: Record<string, string>;
  sectionStates: Record<string, string>;
  sectionActions: Record<string, string>;
  primaryAction: PrimaryHomeAction;
  headline: string;
  supportingText: string;
  nextStep: string;
} {
  const sectionOrder = ["overview", "profile", "reading"];

  if (dailyOptIn) {
    sectionOrder.push("today");
  }

  sectionOrder.push("compatibility");

  const availableSections = [...sectionOrder];

  if (hasCompatibilityPreview) {
    const sectionBadges: Record<string, string> = {
      overview: "Ready",
      reading: "Saved",
      compatibility: "Preview saved",
    };
    const sectionDescriptions: Record<string, string> = {
      overview: "A quick summary of what is ready right now.",
      profile: "Your saved birth date and display details.",
      reading: "Your core numerology reading and numbers.",
      compatibility: "Your latest preview is saved and ready to continue.",
    };
    const sectionStates: Record<string, string> = {
      overview: "ready",
      profile: "saved",
      reading: "saved",
      compatibility: "previewed",
    };
    const sectionActions: Record<string, string> = {
      overview: "review_home",
      profile: "review_profile",
      reading: "open_reading",
      compatibility: "continue_compatibility",
    };

    if (dailyOptIn) {
      sectionBadges.today = "Ready now";
      sectionDescriptions.today =
        "A single daily insight based on your current cycle.";
      sectionStates.today = "ready";
      sectionActions.today = "open_today";
    }

    return {
      availableSections,
      sectionOrder,
      resumePoint: "compatibility_preview",
      homeFocus: "compatibility",
      entrySection: "compatibility",
      sectionBadges,
      sectionDescriptions,
      sectionStates,
      sectionActions,
      primaryAction: "continue_compatibility",
      headline: "Your compatibility preview is ready to pick up.",
      supportingText: dailyOptIn
        ? "Your reading is saved, today's insight is available, and the latest compatibility preview is waiting for you."
        : "Your reading is saved, and your latest compatibility preview is ready to continue.",
      nextStep: "Continue compatibility",
    };
  }

  if (dailyOptIn) {
    return {
      availableSections,
      sectionOrder,
      resumePoint: "today",
      homeFocus: "today",
      entrySection: "today",
      sectionBadges: {
        overview: "Ready",
        reading: "Saved",
        today: "Ready now",
        compatibility: "Available",
      },
      sectionDescriptions: {
        overview: "A quick summary of what is ready right now.",
        profile: "Your saved birth date and display details.",
        reading: "Your core numerology reading and numbers.",
        today: "A single daily insight based on your current cycle.",
        compatibility: "Start a compatibility preview from your saved reading.",
      },
      sectionStates: {
        overview: "ready",
        profile: "saved",
        reading: "saved",
        today: "ready",
        compatibility: "ready",
      },
      sectionActions: {
        overview: "review_home",
        profile: "review_profile",
        reading: "open_reading",
        today: "open_today",
        compatibility: "open_compatibility",
      },
      primaryAction: "open_today",
      headline: "Today's insight is ready.",
      supportingText:
        "Your first reading is saved and daily guidance is turned on, so you can jump straight into today's card.",
      nextStep: "Open today's card",
    };
  }

  return {
    availableSections,
    sectionOrder,
    resumePoint: "home",
    homeFocus: "overview",
    entrySection: "overview",
    sectionBadges: {
      overview: "Ready",
      reading: "Saved",
      compatibility: "Available",
    },
    sectionDescriptions: {
      overview: "A quick summary of what is ready right now.",
      profile: "Your saved birth date and display details.",
      reading: "Your core numerology reading and numbers.",
      compatibility: "Start a compatibility preview from your saved reading.",
    },
    sectionStates: {
      overview: "ready",
      profile: "saved",
      reading: "saved",
      compatibility: "ready",
    },
    sectionActions: {
      overview: "review_home",
      profile: "review_profile",
      reading: "open_reading",
      compatibility: "open_compatibility",
    },
    primaryAction: "open_compatibility",
    headline: "Your reading is ready to explore.",
    supportingText:
      "You can revisit your core numbers now and continue into compatibility whenever you want.",
    nextStep: "Explore compatibility",
  };
}
