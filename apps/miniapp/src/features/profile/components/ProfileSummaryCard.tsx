import { NumerologyResponse } from "@/features/onboarding/types";
import { TemporaryProfile } from "@/features/profile/types";
import { ShareButton } from "@/features/reading/components/ShareButton";

type ProfileSummaryCardProps = {
  profile: TemporaryProfile;
  result?: NumerologyResponse | null;
  sectionBadge?: string | null;
  sectionState?: string | null;
  sectionDescription?: string | null;
  sectionAction?: string | null;
  onReset: () => void | Promise<void>;
};

export function ProfileSummaryCard({
  profile,
  result = null,
  sectionBadge = null,
  sectionState = null,
  sectionDescription = null,
  onReset,
}: ProfileSummaryCardProps) {
  const resolvedName = profile.display_name?.trim() || "Профиль";

  return (
    <article
      className="rounded-[28px] p-6"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: "var(--text-muted)" }}
            >
              Профиль
            </p>
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
          <h2
            className="mt-3 text-2xl font-bold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {resolvedName}
          </h2>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="shrink-0 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition"
          style={{
            border: "1px solid var(--border-subtle)",
            color: "var(--text-secondary)",
          }}
        >
          Сброс
        </button>
      </div>

      <dl className="mt-5 grid gap-3 text-sm">
        <div
          className="rounded-2xl px-4 py-3"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <dt
            className="text-[11px] uppercase tracking-[0.18em]"
            style={{ color: "var(--text-muted)" }}
          >
            Дата рождения
          </dt>
          <dd
            className="mt-1 text-base font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {profile.birth_date}
          </dd>
        </div>
        <div
          className="rounded-2xl px-4 py-3"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <dt
            className="text-[11px] uppercase tracking-[0.18em]"
            style={{ color: "var(--text-muted)" }}
          >
            Ежедневные инсайты
          </dt>
          <dd
            className="mt-1 text-base font-semibold"
            style={{
              color: profile.daily_opt_in ? "var(--accent-green)" : "var(--text-secondary)",
            }}
          >
            {profile.daily_opt_in ? "Включены" : "Не включены"}
          </dd>
        </div>
      </dl>

      <p className="mt-4 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
        {sectionDescription ??
          "Твои данные формируют расклад, ежедневный ритм и анализ совместимости."}
      </p>

      {result && (
        <div className="mt-5">
          <ShareButton result={result} displayName={profile.display_name ?? undefined} />
        </div>
      )}
    </article>
  );
}
