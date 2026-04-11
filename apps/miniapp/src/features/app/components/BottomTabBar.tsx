"use client";

import { t } from "@/i18n";

export type TabId = "home" | "today" | "compat" | "profile";

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
        <path d="M12 2l2.4 7.2H22l-6.2 4.5 2.4 7.3L12 17.1l-6.2 4 2.4-7.3L2 9.2h7.6L12 2z" />
      </svg>
    ),
  },
  {
    id: "today",
    label: t.nav.today,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
  },
  {
    id: "compat",
    label: t.nav.compat,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="12" r="5" />
        <circle cx="15" cy="12" r="5" />
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
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: "var(--bg-surface)",
        borderTop: "1px solid var(--border-subtle)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="mx-auto flex max-w-md">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className="flex flex-1 flex-col items-center justify-center gap-1 py-3 transition-all active:scale-95"
              style={{
                color: isActive ? "var(--accent-soft)" : "var(--text-muted)",
                background: "transparent",
                border: "none",
              }}
              suppressHydrationWarning
            >
              <span
                className="transition-transform"
                style={{
                  transform: isActive ? "scale(1.1)" : "scale(1)",
                  filter: isActive
                    ? "drop-shadow(0 0 6px var(--accent-primary))"
                    : "none",
                }}
              >
                {tab.icon}
              </span>
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.12em]"
                suppressHydrationWarning
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
