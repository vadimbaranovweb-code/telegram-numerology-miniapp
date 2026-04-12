/**
 * ShareCardContent — visual card rendered off-screen and captured by html2canvas.
 * Uses ONLY hardcoded hex colors (no CSS variables — html2canvas doesn't resolve them).
 * Fixed size: 375×667px (iPhone aspect ratio for best sharing UX).
 */

import { NumerologyResponse } from "@/features/onboarding/types";

const C = {
  bg:        "#0A0A14",
  surface:   "#111128",
  elevated:  "#1A1A35",
  accent:    "#7B5EF8",
  soft:      "#C084FC",
  gold:      "#F59E0B",
  pink:      "#F472B6",
  blue:      "#60A5FA",
  text:      "#F1F0F7",
  secondary: "#9B96C4",
  muted:     "#5C587A",
  border:    "rgba(255,255,255,0.08)",
};

const ARCHETYPES_RU: Record<number, string> = {
  1: "Первопроходец",
  2: "Дипломат",
  3: "Творец",
  4: "Строитель",
  5: "Искатель",
  6: "Хранитель",
  7: "Мистик",
  8: "Лидер",
  9: "Гуманист",
};

const LP_EMOJI: Record<number, string> = {
  1: "🔥", 2: "🤝", 3: "🎨", 4: "🏗", 5: "🌍", 6: "💚", 7: "🔮", 8: "⚡", 9: "✨",
};

type Props = {
  result: NumerologyResponse;
  displayName?: string;
};

export function ShareCardContent({ result, displayName }: Props) {
  const archetype = ARCHETYPES_RU[result.life_path_number] ?? "";
  const emoji = LP_EMOJI[result.life_path_number] ?? "✦";
  const name = displayName?.trim() || null;

  return (
    <div
      style={{
        width: 375,
        height: 667,
        background: C.bg,
        fontFamily: "'SF Pro Display', 'Inter', 'Segoe UI', sans-serif",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Radial glow — top */}
      <div
        style={{
          position: "absolute",
          top: -80,
          left: "50%",
          transform: "translateX(-50%)",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(123,94,248,0.20) 0%, rgba(192,132,252,0.06) 40%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      {/* Secondary glow — bottom */}
      <div
        style={{
          position: "absolute",
          bottom: -60,
          right: -40,
          width: 240,
          height: 240,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(244,114,182,0.12) 0%, transparent 70%)",
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
              textTransform: "uppercase" as const,
            }}
          >
            Нумерология
          </span>
        </div>
        {name && (
          <span style={{ color: C.secondary, fontSize: 13, fontWeight: 600 }}>{name}</span>
        )}
      </div>

      {/* Hero — big life path number with orb */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 8,
          paddingBottom: 4,
        }}
      >
        {/* Orb with glow ring */}
        <div
          style={{
            width: 150,
            height: 150,
            borderRadius: "50%",
            background: "radial-gradient(circle at 40% 35%, rgba(192,132,252,0.20), rgba(123,94,248,0.08))",
            border: "1.5px solid rgba(123,94,248,0.40)",
            boxShadow: "0 0 60px rgba(123,94,248,0.15), 0 0 120px rgba(123,94,248,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 18,
          }}
        >
          <span
            style={{
              color: C.text,
              fontSize: 84,
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
            textTransform: "uppercase" as const,
            marginBottom: 6,
          }}
        >
          Число жизненного пути
        </p>

        {/* Archetype */}
        <p
          style={{
            color: C.soft,
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: "0.02em",
          }}
        >
          {emoji} {archetype}
        </p>
      </div>

      {/* Numbers grid */}
      <div
        style={{
          padding: "0 28px 16px",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8,
        }}
      >
        {[
          { label: "Год",     value: result.personal_year_number,  color: C.accent },
          { label: "Месяц",   value: result.personal_month_number, color: C.blue },
          { label: "Судьба",  value: result.destiny_number,        color: C.pink },
          { label: "Душа",    value: result.soul_urge_number,      color: C.gold },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              background: C.elevated,
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              padding: "10px 8px",
              textAlign: "center" as const,
            }}
          >
            <p
              style={{
                color: C.muted,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase" as const,
                marginBottom: 4,
              }}
            >
              {item.label}
            </p>
            <p
              style={{
                color: item.value !== null ? item.color : C.muted,
                fontSize: 24,
                fontWeight: 800,
                lineHeight: 1,
              }}
            >
              {item.value ?? "—"}
            </p>
          </div>
        ))}
      </div>

      {/* CTA banner */}
      <div
        style={{
          margin: "0 28px 24px",
          padding: "14px 20px",
          borderRadius: 18,
          background: "linear-gradient(135deg, rgba(123,94,248,0.18) 0%, rgba(192,132,252,0.10) 100%)",
          border: "1px solid rgba(123,94,248,0.25)",
          textAlign: "center" as const,
        }}
      >
        <p style={{ color: C.text, fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
          Узнай свои числа ✦
        </p>
        <p style={{ color: C.secondary, fontSize: 11 }}>
          Открой бота и получи персональный расклад
        </p>
      </div>
    </div>
  );
}
