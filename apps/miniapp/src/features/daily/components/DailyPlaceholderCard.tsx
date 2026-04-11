import { t } from "@/i18n";
import { DailyInsight } from "@/features/daily/types";

type DailyPlaceholderCardProps = {
  dailyOptIn: boolean;
  todayState: "locked" | "opted_out" | "ready";
  isHighlighted?: boolean;
  sectionBadge?: string | null;
  sectionState?: string | null;
  sectionDescription?: string | null;
  sectionAction?: string | null;
  dailyInsight: DailyInsight | null;
  isLoading: boolean;
};

export function DailyPlaceholderCard({
  dailyOptIn,
  todayState,
  isHighlighted = false,
  sectionBadge = null,
  sectionState = null,
  sectionDescription = null,
  sectionAction = null,
  dailyInsight,
  isLoading,
}: DailyPlaceholderCardProps) {
  const title = dailyInsight
    ? dailyInsight.headline
    : todayState === "ready"
      ? t.daily.title_ready
      : todayState === "opted_out"
        ? t.daily.title_opted_out
        : t.daily.title_locked;

  const body = dailyInsight
    ? dailyInsight.body
    : sectionDescription
      ? sectionDescription
    : todayState === "ready"
      ? t.daily.body_ready
      : todayState === "opted_out"
        ? t.daily.body_opted_out
        : t.daily.body_locked;

  const footer = isLoading
    ? t.daily.footer_loading
    : dailyInsight
      ? dailyInsight.reflection
      : sectionAction === "open_today"
        ? t.daily.footer_see_now
      : todayState === "ready"
        ? t.daily.footer_available
        : dailyOptIn
          ? t.daily.footer_enabled
          : t.daily.footer_off;

  return (
    <article
      className="rounded-[28px] p-6"
      style={{
        background: "var(--bg-surface)",
        border: isHighlighted
          ? "1px solid rgba(96,165,250,0.4)"
          : "1px solid rgba(96,165,250,0.15)",
        boxShadow: isHighlighted
          ? "0 14px 36px rgba(0,0,0,0.4), 0 0 40px rgba(96,165,250,0.06)"
          : "0 10px 30px rgba(0,0,0,0.35)",
      }}
    >
      {/* Header row */}
      <div className="flex flex-wrap items-center gap-2">
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: "var(--accent-blue)" }}
          suppressHydrationWarning
        >
          {t.daily.label}
        </p>
        {isHighlighted ? (
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]"
            style={{
              background: "rgba(96,165,250,0.12)",
              color: "var(--accent-blue)",
            }}
            suppressHydrationWarning
          >
            {t.daily.in_focus}
          </span>
        ) : null}
        {sectionBadge ? (
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]"
            style={{
              background: "var(--bg-elevated)",
              color: "var(--text-secondary)",
            }}
          >
            {sectionBadge}
          </span>
        ) : null}
        {sectionState ? (
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]"
            style={{
              border: "1px solid var(--border-subtle)",
              color: "var(--text-muted)",
            }}
          >
            {sectionState.replaceAll("_", " ")}
          </span>
        ) : null}
      </div>

      {/* Content */}
      <div className="mt-4 space-y-2">
        <h3
          className="text-xl font-bold tracking-tight"
          style={{ color: "var(--text-primary)" }}
          suppressHydrationWarning
        >
          {title}
        </h3>
        <p
          className="text-sm leading-6"
          style={{ color: "var(--text-secondary)" }}
          suppressHydrationWarning
        >
          {body}
        </p>
      </div>

      {/* Footer hint */}
      <div
        className="mt-5 rounded-2xl px-4 py-3 text-sm"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid rgba(96,165,250,0.12)",
          color: "var(--text-muted)",
        }}
        suppressHydrationWarning
      >
        {isLoading ? (
          <span style={{ color: "var(--accent-blue)" }}>{footer}</span>
        ) : (
          footer
        )}
      </div>
    </article>
  );
}
