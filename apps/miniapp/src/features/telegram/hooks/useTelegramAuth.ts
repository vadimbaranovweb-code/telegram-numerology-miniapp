"use client";

import { useEffect, useState } from "react";

import { trackEvent } from "@/features/app/lib/analytics";
import { TelegramWebAppContext } from "@/features/telegram/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";

export type TelegramAuthState = {
  status: "idle" | "loading" | "authenticated" | "error";
  sessionToken: string | null;
  displayName: string | null;
  errorMessage: string | null;
};

const EMPTY_AUTH_STATE: TelegramAuthState = {
  status: "idle",
  sessionToken: null,
  displayName: null,
  errorMessage: null,
};

type TelegramAuthResponse = {
  session_token: string;
  user: {
    display_name: string | null;
  };
};

export function useTelegramAuth(context: TelegramWebAppContext) {
  const [authState, setAuthState] = useState<TelegramAuthState>(EMPTY_AUTH_STATE);

  useEffect(() => {
    async function authenticate() {
      if (!context.isAvailable || !context.initData) {
        setAuthState(EMPTY_AUTH_STATE);
        return;
      }

      setAuthState((current) =>
        current.status === "authenticated"
          ? current
          : {
              status: "loading",
              sessionToken: null,
              displayName: null,
              errorMessage: null,
            },
      );
      trackEvent("telegram_auth_started", {
        telegram_user_id: context.user?.id ?? null,
      });

      try {
        const response = await fetch(`${API_BASE_URL}/auth/telegram`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            init_data: context.initData,
          }),
        });

        if (!response.ok) {
          throw new Error("Could not complete Telegram auth bootstrap.");
        }

        const data = (await response.json()) as TelegramAuthResponse;
        setAuthState({
          status: "authenticated",
          sessionToken: data.session_token,
          displayName: data.user.display_name,
          errorMessage: null,
        });
        trackEvent("telegram_auth_completed", {
          telegram_user_id: context.user?.id ?? null,
          has_session_token: Boolean(data.session_token),
        });
      } catch (error) {
        setAuthState({
          status: "error",
          sessionToken: null,
          displayName: null,
          errorMessage:
            error instanceof Error
              ? error.message
              : "Telegram auth bootstrap failed.",
        });
        trackEvent("telegram_auth_failed", {
          telegram_user_id: context.user?.id ?? null,
        });
      }
    }

    void authenticate();
  }, [context]);

  return authState;
}
