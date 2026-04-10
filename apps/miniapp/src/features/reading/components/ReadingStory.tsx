import { ReadingCard, ReadingPreview } from "../types";

const CARD_ACCENTS: Record<string, string> = {
  "Core Energy":      "#7B5EF8",
  "Strength":         "#F59E0B",
  "Blind Spot":       "#C084FC",
  "Relationship Style": "#F472B6",
  "Current Timing":   "#60A5FA",
  "Inner Drive":      "#C084FC",
};

function getAccent(label: string): string {
  for (const [key, color] of Object.entries(CARD_ACCENTS)) {
    if (label.toLowerCase().includes(key.toLowerCase())) return color;
  }
  return "#7B5EF8";
}

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
    <article
      className="rounded-[24px] p-5"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
      }}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: "var(--text-muted)" }}
        >
          First reading
        </p>
        {sectionBadge && (
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]"
            style={{ background: "var(--accent-primary)", color: "white" }}
          >
            {sectionBadge}
          </span>
        )}
        {sectionState && (
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]"
            style={{
              border: "1px solid var(--border-subtle)",
              color: "var(--text-muted)",
            }}
          >
            {sectionState.replaceAll("_", " ")}
          </span>
        )}
      </div>

      <div className="mt-3 space-y-1">
        <h2
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          {preview.title}
        </h2>
        <p className="text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
          {sectionDescription ?? preview.summary}
        </p>
        {sectionAction && (
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: "var(--text-muted)" }}
          >
            Up next: {formatSectionActionLabel(sectionAction)}
          </p>
        )}
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
  const accent = getAccent(card.label);

  return (
    <div
      className="rounded-2xl p-4 transition"
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.2em]"
        style={{ color: accent }}
      >
        {card.label}
      </p>
      <h3
        className="mt-2 text-[17px] font-semibold leading-tight"
        style={{ color: "var(--text-primary)" }}
      >
        {card.headline}
      </h3>
      <p
        className="mt-2 text-sm leading-6"
        style={{ color: "var(--text-secondary)" }}
      >
        {card.body}
      </p>
    </div>
  );
}
