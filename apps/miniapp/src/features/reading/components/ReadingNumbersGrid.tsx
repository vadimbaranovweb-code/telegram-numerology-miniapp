import { NumerologyResponse } from "@/features/onboarding/types";
import { lang } from "@/i18n";
import { LifePathCard } from "./LifePathCard";
import { NumberCard } from "./NumberCard";
import { ShareButton } from "./ShareButton";

type Props = {
  result: NumerologyResponse;
  displayName?: string;
};

export function ReadingNumbersGrid({ result, displayName }: Props) {
  const isRu = lang === "ru";

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
        suppressHydrationWarning
      >
        {isRu ? "Твои числа" : "Your numbers"}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {/* Featured Life Path — spans full width */}
        <LifePathCard value={result.life_path_number} isRu={isRu} />

        {/* Secondary numbers — 2-col grid */}
        <NumberCard
          label={isRu ? "Личный год" : "Personal Year"}
          value={result.personal_year_number}
          isRu={isRu}
        />
        <NumberCard
          label={isRu ? "Предназначение" : "Destiny"}
          value={result.destiny_number}
          isRu={isRu}
        />
        <NumberCard
          label={isRu ? "Личный месяц" : "Personal Month"}
          value={result.personal_month_number}
          isRu={isRu}
        />
        <NumberCard
          label={isRu ? "Зов души" : "Soul Urge"}
          value={result.soul_urge_number}
          isRu={isRu}
        />
      </div>

      <div className="mt-4">
        <ShareButton result={result} displayName={displayName} />
      </div>
    </article>
  );
}
