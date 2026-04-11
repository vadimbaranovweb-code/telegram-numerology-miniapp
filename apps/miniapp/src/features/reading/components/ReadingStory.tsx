import { ReadingCard, ReadingPreview } from "../types";

const CARD_ACCENTS: Record<string, string> = {
  "Core Energy":        "#7B5EF8",
  "Strength":           "#F59E0B",
  "Blind Spot":         "#C084FC",
  "Relationship Style": "#F472B6",
  "Current Timing":     "#60A5FA",
  "Inner Drive":        "#C084FC",
};

const CARD_TYPE_SLUGS: Record<string, string> = {
  "Core Energy":        "core_energy",
  "Strength":           "strength",
  "Blind Spot":         "blind_spot",
  "Relationship Style": "relationship_style",
  "Current Timing":     "current_timing",
  "Inner Drive":        "inner_drive",
};

function getAccent(label: string): string {
  for (const [key, color] of Object.entries(CARD_ACCENTS)) {
    if (label.toLowerCase().includes(key.toLowerCase())) return color;
  }
  return "#7B5EF8";
}

function getCardTypeSlug(label: string): string {
  for (const [key, slug] of Object.entries(CARD_TYPE_SLUGS)) {
    if (label.toLowerCase().includes(key.toLowerCase())) return slug;
  }
  return label.toLowerCase().replace(/\s+/g, "_");
}

function getIllustrationUrl(lifePathNumber: number, cardTypeSlug: string): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  return `${base}/illustrations/serve/${lifePathNumber}/${cardTypeSlug}`;
}

export function ReadingStory({
  preview,
  lifePathNumber,
  sectionBadge = null,
  sectionState = null,
  sectionDescription = null,
  sectionAction = null,
}: {
  preview: ReadingPreview;
  lifePathNumber?: number;
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
          <ReadingStoryCard
            key={card.label}
            card={card}
            lifePathNumber={lifePathNumber}
          />
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

function ReadingStoryCard({
  card,
  lifePathNumber,
}: {
  card: ReadingCard;
  lifePathNumber?: number;
}) {
  const accent = getAccent(card.label);
  const slug = getCardTypeSlug(card.label);
  const showImage = lifePathNumber !== undefined && !!process.env.NEXT_PUBLIC_API_BASE_URL;
  const imgUrl = showImage ? getIllustrationUrl(lifePathNumber!, slug) : null;

  return (
    <div
      className="rounded-2xl overflow-hidden transition"
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      {/* Illustration header */}
      {imgUrl ? (
        <div
          className="relative w-full overflow-hidden illus-container"
          style={{ height: 120 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
            onError={(e) => {
              const container = (e.target as HTMLImageElement).closest(".illus-container") as HTMLElement | null;
              if (container) container.style.display = "none";
            }}
            style={{ display: "block" }}
          />
          {/* Bottom fade to card background */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0"
            style={{
              height: 48,
              background: `linear-gradient(to bottom, transparent, var(--bg-elevated))`,
            }}
          />
          {/* Accent top-left dot */}
          <div
            className="absolute left-3 top-3 rounded-full"
            style={{ width: 6, height: 6, background: accent }}
          />
        </div>
      ) : null}

      {/* Card text */}
      <div className="p-4">
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
    </div>
  );
}
