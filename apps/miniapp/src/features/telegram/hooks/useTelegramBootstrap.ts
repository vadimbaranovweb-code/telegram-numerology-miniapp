"use client";

import { useCallback, useEffect, useState } from "react";

import { trackEvent } from "@/features/app/lib/analytics";
import { CompatibilityPreviewResponse } from "@/features/compatibility/types";
import { NumerologyResponse } from "@/features/onboarding/types";
import { AppSnapshot, TemporaryProfile } from "@/features/profile/types";
import { TelegramAuthState } from "@/features/telegram/hooks/useTelegramAuth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";

export type TelegramBootstrapState = {
  status: "idle" | "loading" | "loaded" | "error";
  restorationMode:
    | "empty"
    | "restored_profile"
    | "restored_reading"
    | "restored_home"
    | null;
  userDisplayName: string | null;
  isPremium: boolean;
  premiumStatus: "free" | "premium" | null;
  onboardingCompleted: boolean;
  dailyOptIn: boolean;
  profileReady: boolean;
  todayAvailable: boolean;
  todayState: "locked" | "opted_out" | "ready" | null;
  hasFirstReading: boolean;
  compatibilityAvailable: boolean;
  homeFocus: "overview" | "today" | "compatibility" | null;
  entrySection:
    | "onboarding"
    | "first_reading"
    | "overview"
    | "today"
    | "compatibility"
    | null;
  sectionBadges: Record<string, string>;
  sectionDescriptions: Record<string, string>;
  sectionStates: Record<string, string>;
  sectionActions: Record<string, string>;
  availableSections: string[];
  sectionOrder: string[];
  compatibilityState: "locked" | "ready" | "previewed" | null;
  currentView: "onboarding" | "first_reading" | "home" | null;
  resumePoint:
    | "onboarding"
    | "first_reading"
    | "today"
    | "compatibility_preview"
    | "home"
    | null;
  headline: string | null;
  supportingText: string | null;
  nextStep: string | null;
  primaryAction:
    | "complete_onboarding"
    | "generate_first_reading"
    | "open_today"
    | "open_compatibility"
    | "continue_compatibility"
    | null;
  unfinishedFlow: string | null;
  appProfile: TemporaryProfile | null;
  appSnapshot: AppSnapshot | null;
  compatibilityPreview: CompatibilityPreviewResponse | null;
  errorMessage: string | null;
};

type UseTelegramBootstrapResult = {
  bootstrapState: TelegramBootstrapState;
  refreshBootstrap: () => Promise<TelegramBootstrapState | null>;
};

const EMPTY_BOOTSTRAP_STATE: TelegramBootstrapState = {
  status: "idle",
  restorationMode: null,
  userDisplayName: null,
  isPremium: false,
  premiumStatus: null,
  onboardingCompleted: false,
  dailyOptIn: false,
  profileReady: false,
  todayAvailable: false,
  todayState: null,
  hasFirstReading: false,
  compatibilityAvailable: false,
  homeFocus: null,
  entrySection: null,
  sectionBadges: {},
  sectionDescriptions: {},
  sectionStates: {},
  sectionActions: {},
  availableSections: [],
  sectionOrder: [],
  compatibilityState: null,
  currentView: null,
  resumePoint: null,
  headline: null,
  supportingText: null,
  nextStep: null,
  primaryAction: null,
  unfinishedFlow: null,
  appProfile: null,
  appSnapshot: null,
  compatibilityPreview: null,
  errorMessage: null,
};

type BootstrapResponse = {
  restoration_mode:
    | "empty"
    | "restored_profile"
    | "restored_reading"
    | "restored_home";
  user: {
    display_name: string | null;
    is_premium: boolean;
    premium_status: "free" | "premium";
  };
  profile: {
    onboarding_completed: boolean;
    daily_opt_in: boolean;
  };
  home_state: {
    profile_ready: boolean;
    today_available: boolean;
    today_state: "locked" | "opted_out" | "ready";
    has_first_reading: boolean;
    compatibility_available: boolean;
    focus_section: "overview" | "today" | "compatibility";
    entry_section:
      | "onboarding"
      | "first_reading"
      | "overview"
      | "today"
      | "compatibility";
    section_badges: Record<string, string>;
    section_descriptions: Record<string, string>;
    section_states: Record<string, string>;
    section_actions: Record<string, string>;
    available_sections: string[];
    section_order: string[];
    compatibility_state: "locked" | "ready" | "previewed";
    current_view: "onboarding" | "first_reading" | "home";
    resume_point:
      | "onboarding"
      | "first_reading"
      | "today"
      | "compatibility_preview"
      | "home";
    headline: string;
    supporting_text: string;
    next_step: string;
    primary_action:
      | "complete_onboarding"
      | "generate_first_reading"
      | "open_today"
      | "open_compatibility"
      | "continue_compatibility";
    unfinished_flow: string | null;
  };
  app_profile: TemporaryProfile | null;
  first_reading: NumerologyResponse | null;
  compatibility_preview: CompatibilityPreviewResponse | null;
};

export function useTelegramBootstrap(
  authState: TelegramAuthState,
): UseTelegramBootstrapResult {
  const [bootstrapState, setBootstrapState] =
    useState<TelegramBootstrapState>(EMPTY_BOOTSTRAP_STATE);

  const refreshBootstrap = useCallback(async () => {
    if (authState.status !== "authenticated" || !authState.sessionToken) {
      setBootstrapState(EMPTY_BOOTSTRAP_STATE);
      return null;
    }

    setBootstrapState((current) =>
      current.status === "loaded"
        ? current
        : {
            ...EMPTY_BOOTSTRAP_STATE,
            status: "loading",
          },
    );

    trackEvent("telegram_bootstrap_started", {
      has_session_token: true,
    });

    try {
      const params = new URLSearchParams({
        session_token: authState.sessionToken,
      });
      const response = await fetch(`${API_BASE_URL}/bootstrap?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Could not load app bootstrap.");
      }

      const data = (await response.json()) as BootstrapResponse;
      const resolvedAppProfile = data.app_profile;
      const nextState: TelegramBootstrapState = {
        status: "loaded",
        restorationMode: data.restoration_mode,
        userDisplayName: data.user.display_name,
        isPremium: data.user.is_premium,
        premiumStatus: data.user.premium_status,
        onboardingCompleted: data.profile.onboarding_completed,
        dailyOptIn: data.profile.daily_opt_in,
        profileReady: data.home_state.profile_ready,
        todayAvailable: data.home_state.today_available,
        todayState: data.home_state.today_state,
        hasFirstReading: data.home_state.has_first_reading,
        compatibilityAvailable: data.home_state.compatibility_available,
        homeFocus: data.home_state.focus_section,
        entrySection: data.home_state.entry_section,
        sectionBadges: data.home_state.section_badges,
        sectionDescriptions: data.home_state.section_descriptions,
        sectionStates: data.home_state.section_states,
        sectionActions: data.home_state.section_actions,
        availableSections: data.home_state.available_sections,
        sectionOrder: data.home_state.section_order,
        compatibilityState: data.home_state.compatibility_state,
        currentView: data.home_state.current_view,
        resumePoint: data.home_state.resume_point,
        headline: data.home_state.headline,
        supportingText: data.home_state.supporting_text,
        nextStep: data.home_state.next_step,
        primaryAction: data.home_state.primary_action,
        unfinishedFlow: data.home_state.unfinished_flow,
        appProfile: resolvedAppProfile,
        appSnapshot:
          resolvedAppProfile && data.first_reading
            ? {
                profile: resolvedAppProfile,
                numerology: data.first_reading,
              }
            : null,
        compatibilityPreview: data.compatibility_preview,
        errorMessage: null,
      };
      setBootstrapState(nextState);
      trackEvent("telegram_bootstrap_completed", {
        restoration_mode: data.restoration_mode,
        is_premium: data.user.is_premium,
        premium_status: data.user.premium_status,
        profile_ready: data.home_state.profile_ready,
        today_available: data.home_state.today_available,
        today_state: data.home_state.today_state,
        onboarding_completed: data.profile.onboarding_completed,
        has_first_reading: data.home_state.has_first_reading,
        compatibility_available: data.home_state.compatibility_available,
        focus_section: data.home_state.focus_section,
        entry_section: data.home_state.entry_section,
        section_badges: Object.keys(data.home_state.section_badges).join(","),
        section_descriptions: Object.keys(data.home_state.section_descriptions).join(","),
        section_states: Object.keys(data.home_state.section_states).join(","),
        section_actions: Object.keys(data.home_state.section_actions).join(","),
        available_sections: data.home_state.available_sections.join(","),
        section_order: data.home_state.section_order.join(","),
        compatibility_state: data.home_state.compatibility_state,
        current_view: data.home_state.current_view,
        resume_point: data.home_state.resume_point,
        headline: data.home_state.headline,
        next_step: data.home_state.next_step,
        primary_action: data.home_state.primary_action,
        unfinished_flow: data.home_state.unfinished_flow,
      });
      return nextState;
    } catch (error) {
      const failedState: TelegramBootstrapState = {
        ...EMPTY_BOOTSTRAP_STATE,
        status: "error",
        errorMessage:
          error instanceof Error ? error.message : "Bootstrap request failed.",
      };
      setBootstrapState(failedState);
      trackEvent("telegram_bootstrap_failed");
      return failedState;
    }
  }, [authState]);

  useEffect(() => {
    void refreshBootstrap();
  }, [refreshBootstrap]);

  return {
    bootstrapState,
    refreshBootstrap,
  };
}
