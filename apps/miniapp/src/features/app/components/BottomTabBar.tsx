"use client";

import { t } from "@/i18n";

export type TabId = "home" | "explore" | "profile";

type BottomTabBarProps = {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
};

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  {
    id: "home",
    label: t.nav.home,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    id: "explore",
    label: t.nav.explore,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M16.24 7.76l-4.24 2.12-2.12 4.24 4.24-2.12 2.12-4.24z" />
      </svg>
    ),
  },
  {
    id: "profile",
    label: t.nav.profile,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
];

export function BottomTabBar({ activeTab, onTabChange }: BottomTabBarProps) {
  return (
    <div
      className="fixed z-50"
      style={{
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
        left: "50%",
        transform: "translateX(-50%)",
        width: "calc(100% - 32px)",
        maxWidth: "calc(var(--max-w, 448px) - 32px)",
      }}
    >
      <nav
        className="flex items-center rounded-[22px]"
        style={{
          background: "rgba(22, 22, 45, 0.75)",
          backdropFilter: "blur(24px) saturate(1.4)",
          WebkitBackdropFilter: "blur(24px) saturate(1.4)",
          border: "1px solid rgba(123, 94, 248, 0.12)",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.45), 0 0 0 0.5px rgba(255,255,255,0.04) inset",
          padding: "6px 4px",
        }}
      >
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-[16px] py-2 transition-all duration-200 active:scale-95"
              style={{
                color: isActive ? "var(--accent-soft)" : "var(--text-muted)",
                background: isActive
                  ? "rgba(123, 94, 248, 0.12)"
                  : "transparent",
                border: "none",
              }}
              suppressHydrationWarning
            >
              <span
                className="transition-transform duration-200"
                style={{
                  transform: isActive ? "scale(1.08)" : "scale(1)",
                  filter: isActive
                    ? "drop-shadow(0 0 6px rgba(123,94,248,0.5))"
                    : "none",
                }}
              >
                {tab.icon}
              </span>
              <span
                className="text-[9px] font-semibold uppercase tracking-[0.1em]"
                suppressHydrationWarning
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
