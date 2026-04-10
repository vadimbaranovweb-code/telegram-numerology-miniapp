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
      className={
        isHighlighted
          ? "rounded-[24px] border border-amber-400 bg-[linear-gradient(135deg,#fff4d8_0%,#f7ecd4_100%)] p-5 shadow-[0_14px_36px_rgba(120,83,29,0.16)] ring-2 ring-amber-200/80"
          : "rounded-[24px] border border-amber-200/80 bg-[linear-gradient(135deg,#fff4d8_0%,#f7ecd4_100%)] p-5 shadow-[0_10px_30px_rgba(120,83,29,0.10)]"
      }
    >
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-800">
        Today
      </p>
      {isHighlighted ? (
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
          In focus
        </p>
      ) : null}
      {sectionBadge || sectionState ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {sectionBadge ? (
            <span className="rounded-full bg-amber-900 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-50">
              {sectionBadge}
            </span>
          ) : null}
          {sectionState ? (
            <span className="rounded-full border border-amber-400/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-800">
              {sectionState.replaceAll("_", " ")}
            </span>
          ) : null}
        </div>
      ) : null}
      <div className="mt-3 space-y-2">
        <h3 className="text-xl font-semibold tracking-tight text-stone-950">
          {title}
        </h3>
        <p className="text-sm leading-6 text-stone-700">{body}</p>
      </div>
      <div className="mt-4 rounded-2xl border border-amber-300/70 bg-white/60 px-4 py-3 text-sm text-stone-700">
        {footer}
      </div>
    </article>
  );
}
