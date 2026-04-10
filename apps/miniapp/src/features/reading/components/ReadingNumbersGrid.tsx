import { NumerologyResponse } from "@/features/onboarding/types";

import { NumberCard } from "./NumberCard";

export function ReadingNumbersGrid({ result }: { result: NumerologyResponse }) {
  return (
    <article className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-[0_10px_30px_rgba(89,63,31,0.08)]">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
        Reading preview
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <NumberCard label="Life Path" value={result.life_path_number} />
        <NumberCard label="Personal Year" value={result.personal_year_number} />
        <NumberCard label="Personal Month" value={result.personal_month_number} />
        <NumberCard label="Destiny" value={result.destiny_number} />
        <NumberCard label="Soul Urge" value={result.soul_urge_number} />
      </div>
    </article>
  );
}
