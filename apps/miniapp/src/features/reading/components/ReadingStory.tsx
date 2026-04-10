import { ReadingCard, ReadingPreview } from "../types";

export function ReadingStory({
  preview,
  sectionBadge = null,
  sectionState = null,
  sectionDescription = null,
  sectionAction = null,
}: {
  preview: ReadingPreview;
  sectionBadge?: string | null;
  sectionState?: string | null;
  sectionDescription?: string | null;
  sectionAction?: string | null;
}) {
  return (
    <article className="rounded-[24px] border border-white/80 bg-white/90 p-5 shadow-[0_10px_30px_rgba(89,63,31,0.08)]">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
        First reading
      </p>
      {sectionBadge || sectionState ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {sectionBadge ? (
            <span className="rounded-full bg-stone-900 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-50">
              {sectionBadge}
            </span>
          ) : null}
          {sectionState ? (
            <span className="rounded-full border border-stone-300 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
              {sectionState.replaceAll("_", " ")}
            </span>
          ) : null}
        </div>
      ) : null}
      <div className="mt-3 space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-950">
          {preview.title}
        </h2>
        <p className="text-sm leading-6 text-stone-600">
          {sectionDescription ?? preview.summary}
        </p>
        {sectionAction ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
            Up next: {formatSectionActionLabel(sectionAction)}
          </p>
        ) : null}
      </div>

      <div className="mt-5 space-y-3">
        {preview.cards.map((card) => (
          <ReadingStoryCard key={card.label} card={card} />
        ))}
      </div>
    </article>
  );
}

function formatSectionActionLabel(action: string) {
  switch (action) {
    case "open_reading":
      return "Revisit your reading";
    default:
      return action.replaceAll("_", " ");
  }
}

function ReadingStoryCard({ card }: { card: ReadingCard }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
        {card.label}
      </p>
      <h3 className="mt-2 text-lg font-semibold leading-7 text-stone-950">
        {card.headline}
      </h3>
      <p className="mt-2 text-sm leading-6 text-stone-600">{card.body}</p>
    </div>
  );
}
