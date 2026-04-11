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
      ? "Today's insight is ready."
      : todayState === "opted_out"
        ? "Daily insights are paused for now."
        : "Today's guidance unlocks after your first reading.";

  const body = dailyInsight
    ? dailyInsight.body
    : sectionDescription
      ? sectionDescription
    : todayState === "ready"
      ? "Your first reading is saved and daily guidance is turned on, so you can open one focused insight for today."
      : todayState === "opted_out"
        ? "Your profile and reading are ready. Turn daily insights back on whenever you want a new prompt to return."
        : "Once your profile and first reading are ready, this section becomes your daily check-in point.";

  const footer = isLoading
    ? "Loading today's insight..."
    : dailyInsight
      ? dailyInsight.reflection
      : sectionAction === "open_today"
        ? "See today's insight now."
      : todayState === "ready"
        ? "Today's insight is available now."
        : dailyOptIn
          ? "Daily insights are enabled, and this section will open as soon as today's card is ready."
          : "Daily insights are off right now, but your first reading is still here whenever you want to revisit it.";

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
        >
          Today
        </p>
        {isHighlighted ? (
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]"
            style={{
              background: "rgba(96,165,250,0.12)",
              color: "var(--accent-blue)",
            }}
          >
            In focus
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
        >
          {title}
        </h3>
        <p className="text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
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
