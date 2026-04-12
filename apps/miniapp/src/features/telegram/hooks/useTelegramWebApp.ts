"use client";

import { useEffect, useState } from "react";

import { trackEvent } from "@/features/app/lib/analytics";
import { TelegramWebAppContext } from "@/features/telegram/types";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData?: string;
        initDataUnsafe?: {
          user?: {
            id?: number;
            first_name?: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
        };
        colorScheme?: string;
        platform?: string;
        version?: string;
        ready?: () => void;
        expand?: () => void;
        openInvoice?: (
          url: string,
          callback?: (status: string) => void,
        ) => void;
        openTelegramLink?: (url: string) => void;
      };
    };
  }
}

const EMPTY_CONTEXT: TelegramWebAppContext = {
  isAvailable: false,
  initData: null,
  colorScheme: null,
  platform: null,
  version: null,
  canOpenInvoice: false,
  user: null,
};

export function useTelegramWebApp() {
  const [context, setContext] = useState<TelegramWebAppContext>(EMPTY_CONTEXT);

  useEffect(() => {
    const ctx = readTelegramContext();
    setContext(ctx);

    if (!ctx.isAvailable) {
      trackEvent("telegram_context_missing", {
        bootstrap_mode: "browser_fallback",
      });
      return;
    }

    const webApp = window.Telegram?.WebApp;
    webApp?.ready?.();
    webApp?.expand?.();
    trackEvent("telegram_context_loaded", {
      platform: ctx.platform,
      version: ctx.version,
      has_init_data: Boolean(ctx.initData),
      telegram_user_id: ctx.user?.id ?? null,
    });
  }, []);

  return context;
}

function readTelegramContext(): TelegramWebAppContext {
  if (typeof window === "undefined") {
    return EMPTY_CONTEXT;
  }

  const webApp = window.Telegram?.WebApp;

  if (!webApp) {
    return EMPTY_CONTEXT;
  }

  return {
    isAvailable: true,
    initData: webApp.initData ?? null,
    colorScheme: webApp.colorScheme ?? null,
    platform: webApp.platform ?? null,
    version: webApp.version ?? null,
    canOpenInvoice: typeof webApp.openInvoice === "function",
    user: webApp.initDataUnsafe?.user ?? null,
  };
}

export function openTelegramInvoiceUrl(
  invoiceUrl: string,
  onResult?: (status: string) => void,
): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const webApp = window.Telegram?.WebApp;

  if (!webApp?.openInvoice) {
    return false;
  }

  webApp.openInvoice(invoiceUrl, onResult);
  return true;
}
