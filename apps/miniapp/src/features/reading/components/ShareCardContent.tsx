/**
 * ShareCardContent — visual card rendered off-screen and captured by html2canvas.
 * Uses ONLY hardcoded hex colors (no CSS variables — html2canvas doesn't resolve them).
 * Fixed size: 375×600px.
 */

import { NumerologyResponse } from "@/features/onboarding/types";

const C = {
  bg:       "#0A0A14",
  surface:  "#111128",
  elevated: "#1A1A35",
  accent:   "#7B5EF8",
  soft:     "#C084FC",
  gold:     "#F59E0B",
  text:     "#F1F0F7",
  secondary:"#9B96C4",
  muted:    "#5C587A",
  border:   "rgba(255,255,255,0.08)",
};

const ARCHETYPES: Record<number, string> = {
  1: "The Pioneer",
  2: "The Diplomat",
  3: "The Creator",
  4: "The Builder",
  5: "The Adventurer",
  6: "The Nurturer",
  7: "The Mystic",
  8: "The Achiever",
  9: "The Humanitarian",
};

type Props = {
  result: NumerologyResponse;
  displayName?: string;
};

export function ShareCardContent({ result, displayName }: Props) {
  const archetype = ARCHETYPES[result.life_path_number] ?? "";
  const name = displayName?.trim() || null;

  return (
    <div
      style={{
        width: 375,
        height: 600,
        background: C.bg,
        fontFamily: "'SF Pro Display', 'Inter', 'Segoe UI', sans-serif",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Radial glow background */}
      <div
        style={{
          position: "absolute",
          top: -60,
          left: "50%",
          transform: "translateX(-50%)",
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(123,94,248,0.22) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <div
        style={{
          padding: "28px 28px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: C.soft, fontSize: 16 }}>✦</span>
          <span
            style={{
              color: C.muted,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
            }}
          >
            Numerology
          </span>
        </div>
        {name ? (
          <span style={{ color: C.muted, fontSize: 11 }}>{name}</span>
        ) : (
          <span style={{ color: C.muted, fontSize: 11 }}>{result.birth_date}</span>
        )}
      </div>

      {/* Hero — big life path number */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 16,
        }}
      >
        {/* Orb */}
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: "radial-gradient(circle at 40% 35%, rgba(192,132,252,0.18), rgba(123,94,248,0.06))",
            border: `1px solid rgba(123,94,248,0.35)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <span
            style={{
              color: C.text,
              fontSize: 80,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: "-0.04em",
            }}
          >
            {result.life_path_number}
          </span>
        </div>

        {/* Label */}
        <p
          style={{
            color: C.muted,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          Life Path
        </p>

        {/* Archetype */}
        <p
          style={{
            color: C.soft,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "0.04em",
          }}
        >
          {archetype}
        </p>
      </div>

      {/* Divider */}
      <div
        style={{
          margin: "0 28px",
          height: 1,
          background: C.border,
        }}
      />

      {/* Numbers grid */}
      <div
        style={{
          padding: "20px 28px",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
        }}
      >
        {[
          { label: "Personal Year",  value: result.personal_year_number },
          { label: "Personal Month", value: result.personal_month_number },
          { label: "Destiny",        value: result.destiny_number },
          { label: "Soul Urge",      value: result.soul_urge_number },
          { label: "Born",           value: result.birth_date.slice(0, 4) },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              background: C.elevated,
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              padding: "10px 12px",
            }}
          >
            <p
              style={{
                color: C.muted,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              {item.label}
            </p>
            <p
              style={{
                color: item.value !== null ? C.text : C.muted,
                fontSize: 22,
                fontWeight: 800,
                lineHeight: 1,
              }}
            >
              {item.value ?? "—"}
            </p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "0 28px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        <span style={{ color: C.accent, fontSize: 12 }}>✦</span>
        <span style={{ color: C.muted, fontSize: 11, letterSpacing: "0.08em" }}>
          Your numbers, your story.
        </span>
      </div>
    </div>
  );
}
