"use client";

import { useState, useEffect } from "react";

import { TelegramWebAppContext } from "@/features/telegram/types";
import { TelegramAuthState } from "@/features/telegram/hooks/useTelegramAuth";
import { TelegramBootstrapState } from "@/features/telegram/hooks/useTelegramBootstrap";

type TelegramContextCardProps = {
  context: TelegramWebAppContext;
  authState: TelegramAuthState;
  bootstrapState: TelegramBootstrapState;
};

export function TelegramContextCard({
  context,
  authState,
  bootstrapState,
}: TelegramContextCardProps) {
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsDebugMode(window.location.search.includes("debug=1"));
  }, []);

  function copySessionToken() {
    if (!authState.sessionToken) return;
    void navigator.clipboard.writeText(authState.sessionToken).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  const userLabel = context.user?.username
    ? `@${context.user.username}`
    : context.user?.first_name ?? "Unknown";
  const summaryLine =
    bootstrapState.status === "loaded"
      ? `App is ready for ${formatPrimaryAction(
          bootstrapState.primaryAction,
          bootstrapState.nextStep,
        )}`
      : authState.status === "authenticated"
        ? "Telegram sign-in is complete. The app is loading your current progress."
        : context.isAvailable
          ? "Telegram is connected, but sign-in has not finished yet."
          : "Browser mode stays available for local development.";

  const debugRows = [
    {
      label: "Platform",
      value: context.platform ?? "browser",
    },
    {
      label: "User",
      value: userLabel,
    },
    {
      label: "Init data",
      value: context.initData ? "Available" : "Missing",
    },
    {
      label: "Auth status",
      value: authState.status,
    },
    {
      label: "Bootstrap",
      value: bootstrapState.status,
    },
    authState.sessionToken
      ? {
          label: "Session",
          value: authState.sessionToken,
        }
      : null,
    bootstrapState.status === "loaded"
      ? {
          label: "Primary action",
          value: bootstrapState.primaryAction ?? "not set",
        }
      : null,
    bootstrapState.status === "loaded"
      ? {
          label: "Unfinished flow",
          value: bootstrapState.unfinishedFlow ?? "none",
        }
      : null,
    bootstrapState.status === "loaded"
      ? {
          label: "Next step",
          value: bootstrapState.nextStep ?? "not set",
        }
      : null,
    bootstrapState.status === "loaded"
      ? {
          label: "Premium",
          value: bootstrapState.isPremium
            ? bootstrapState.premiumStatus ?? "premium"
            : "free",
        }
      : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

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
        Telegram bootstrap
      </p>
      <div className="mt-3 space-y-2">
        <h2
          className="text-xl font-bold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          {context.isAvailable
            ? "Mini App context detected."
            : "Running in browser mode."}
        </h2>
        <p className="text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
          {context.isAvailable
            ? "Telegram is available, so the app can restore the user's progress and open the right next step."
            : "Telegram WebApp was not found, so the app keeps the local MVP flow available outside Telegram."}
        </p>
        <p className="text-sm leading-6" style={{ color: "var(--text-muted)" }}>
          {summaryLine}
        </p>
      </div>

      {(process.env.NODE_ENV !== "production" || isDebugMode) ? (
        <details
          className="mt-4 rounded-2xl px-4 py-3 text-sm"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-secondary)",
          }}
        >
          <summary
            className="cursor-pointer text-[11px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: "var(--text-muted)" }}
          >
            Telegram debug
          </summary>
          <div className="mt-3 grid gap-3 text-sm">
            {debugRows.map((row) => (
              <div
                key={row.label}
                className="rounded-2xl px-4 py-3"
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
              >
                <p
                  className="text-[10px] uppercase tracking-[0.18em]"
                  style={{ color: "var(--text-muted)" }}
                >
                  {row.label}
                </p>
                <p className="mt-1 break-all font-medium" style={{ color: "var(--text-primary)" }}>
                  {row.value}
                </p>
              </div>
            ))}
            {isDebugMode && authState.sessionToken ? (
              <button
                onClick={copySessionToken}
                className="rounded-2xl px-4 py-3 text-left transition"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--accent-primary)",
                }}
              >
                <p
                  className="text-[10px] uppercase tracking-[0.18em]"
                  style={{ color: "var(--accent-soft)" }}
                >
                  Admin
                </p>
                <p className="mt-1 font-medium" style={{ color: "var(--text-primary)" }}>
                  {copied ? "Copied! ✓" : "Copy session token"}
                </p>
              </button>
            ) : null}
          </div>
        </details>
      ) : null}

      {authState.errorMessage ? (
        <p
          className="mt-4 rounded-2xl px-4 py-3 text-sm"
          style={{
            background: "rgba(244,63,94,0.1)",
            border: "1px solid rgba(244,63,94,0.2)",
            color: "#FDA4AF",
          }}
        >
          {authState.errorMessage}
        </p>
      ) : null}

      {bootstrapState.errorMessage ? (
        <p
          className="mt-4 rounded-2xl px-4 py-3 text-sm"
          style={{
            background: "rgba(244,63,94,0.1)",
            border: "1px solid rgba(244,63,94,0.2)",
            color: "#FDA4AF",
          }}
        >
          {bootstrapState.errorMessage}
        </p>
      ) : null}
    </article>
  );
}

function formatPrimaryAction(
  primaryAction: TelegramBootstrapState["primaryAction"],
  nextStep: string | null,
): string {
  switch (primaryAction) {
    case "complete_onboarding":
      return "completing onboarding";
    case "generate_first_reading":
      return "generating the first reading";
    case "open_today":
      return "opening today's card";
    case "open_compatibility":
      return "opening compatibility";
    case "continue_compatibility":
      return "continuing compatibility";
    default:
      return nextStep ?? "the next step";
  }
}
