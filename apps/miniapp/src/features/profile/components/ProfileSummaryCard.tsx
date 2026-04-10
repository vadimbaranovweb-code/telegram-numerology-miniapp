import { TemporaryProfile } from "@/features/profile/types";

type ProfileSummaryCardProps = {
  profile: TemporaryProfile;
  sectionBadge?: string | null;
  sectionState?: string | null;
  sectionDescription?: string | null;
  sectionAction?: string | null;
  onReset: () => void | Promise<void>;
};

export function ProfileSummaryCard({
  profile,
  sectionBadge = null,
  sectionState = null,
  sectionDescription = null,
  sectionAction = null,
  onReset,
}: ProfileSummaryCardProps) {
  const resolvedName = profile.display_name?.trim() || "Your profile";

  return (
    <article className="rounded-[24px] border border-stone-200/80 bg-stone-950 p-5 text-stone-50 shadow-[0_10px_30px_rgba(34,24,14,0.18)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">
            Profile
          </p>
          {sectionBadge || sectionState ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {sectionBadge ? (
                <span className="rounded-full bg-stone-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-950">
                  {sectionBadge}
                </span>
              ) : null}
              {sectionState ? (
                <span className="rounded-full border border-stone-700 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-300">
                  {sectionState.replaceAll("_", " ")}
                </span>
              ) : null}
            </div>
          ) : null}
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">
            {resolvedName}
          </h2>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="rounded-full border border-stone-700 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-200 transition hover:border-amber-300 hover:text-amber-200"
        >
          Reset
        </button>
      </div>

      <dl className="mt-5 grid gap-3 text-sm text-stone-200">
        <div className="rounded-2xl border border-stone-800 bg-stone-900/70 px-4 py-3">
          <dt className="text-xs uppercase tracking-[0.18em] text-stone-500">
            Birth date
          </dt>
          <dd className="mt-1 text-base font-medium text-stone-50">
            {profile.birth_date}
          </dd>
        </div>
        <div className="rounded-2xl border border-stone-800 bg-stone-900/70 px-4 py-3">
          <dt className="text-xs uppercase tracking-[0.18em] text-stone-500">
            Daily signal
          </dt>
          <dd className="mt-1 text-base font-medium text-stone-50">
            {profile.daily_opt_in ? "Enabled" : "Not enabled"}
          </dd>
        </div>
      </dl>

      <p className="mt-4 text-sm leading-6 text-stone-300">
        {sectionDescription ??
          "Your saved details shape the reading, daily rhythm, and compatibility flow across the app."}
      </p>
      {sectionAction ? (
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
          Up next: {formatSectionActionLabel(sectionAction)}
        </p>
      ) : null}
    </article>
  );
}

function formatSectionActionLabel(action: string) {
  switch (action) {
    case "review_profile":
      return "Open your profile";
    default:
      return action.replaceAll("_", " ");
  }
}
