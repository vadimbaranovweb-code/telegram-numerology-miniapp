import { NumerologyResponse } from "@/features/onboarding/types";
import { NumberCard } from "./NumberCard";
import { ShareButton } from "./ShareButton";

type Props = {
  result: NumerologyResponse;
  displayName?: string;
};

export function ReadingNumbersGrid({ result, displayName }: Props) {
  return (
    <article
      className="rounded-[24px] p-5"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
      }}
    >
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.22em]"
        style={{ color: "var(--accent-soft)" }}
      >
        Reading preview
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <NumberCard label="Life Path"      value={result.life_path_number} />
        <NumberCard label="Personal Year"  value={result.personal_year_number} />
        <NumberCard label="Personal Month" value={result.personal_month_number} />
        <NumberCard label="Destiny"        value={result.destiny_number} />
        <NumberCard label="Soul Urge"      value={result.soul_urge_number} />
      </div>
      <div className="mt-4">
        <ShareButton result={result} displayName={displayName} />
      </div>
    </article>
  );
}
