import { ARCHETYPES } from "./NumberCard";

type LifePathCardProps = {
  value: number;
  isRu?: boolean;
};

export function LifePathCard({ value, isRu = false }: LifePathCardProps) {
  const archetype = ARCHETYPES[value];
  const name = archetype ? (isRu ? archetype.nameRu : archetype.name) : null;
  const keyword = archetype ? (isRu ? archetype.keywordRu : archetype.keyword) : null;

  // Ring gauge geometry
  const r = 42;
  const size = 110;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r; // ≈ 264

  const barValue = value > 9 ? value % 9 || 9 : value;
  const progress = barValue / 9;
  const dashoffset = circumference * (1 - progress);

  return (
    <div
      className="col-span-2 rounded-2xl p-4"
      style={{
        background: "linear-gradient(135deg, rgba(123,94,248,0.12) 0%, rgba(26,26,53,0.95) 60%)",
        border: "1px solid rgba(123,94,248,0.25)",
      }}
    >
      <div className="flex items-center gap-4">
        {/* Ring gauge */}
        <div className="relative flex-shrink-0">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            style={{ display: "block" }}
          >
            {/* Background ring */}
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="#1A1A35"
              strokeWidth="7"
            />
            {/* Glow ring (blurred) */}
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="#7B5EF8"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashoffset}
              transform={`rotate(-90 ${cx} ${cy})`}
              opacity="0.18"
            />
            {/* Progress ring */}
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="url(#lpGrad)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashoffset}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
            {/* Gradient def */}
            <defs>
              <linearGradient id="lpGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7B5EF8" />
                <stop offset="100%" stopColor="#C084FC" />
              </linearGradient>
            </defs>
            {/* Center number */}
            <text
              x={cx}
              y={cy + 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="30"
              fontWeight="800"
              letterSpacing="-1"
              fill="#F1F0F7"
            >
              {value}
            </text>
          </svg>
        </div>

        {/* Text info */}
        <div className="flex flex-col gap-1 min-w-0">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: "var(--text-muted)" }}
          >
            Life Path
          </p>
          {name ? (
            <p
              className="text-xl font-bold tracking-tight leading-tight"
              style={{ color: "var(--text-primary)" }}
              suppressHydrationWarning
            >
              {name}
            </p>
          ) : null}
          {keyword ? (
            <p
              className="text-xs font-semibold uppercase tracking-[0.16em]"
              style={{ color: "var(--accent-soft)" }}
              suppressHydrationWarning
            >
              {keyword}
            </p>
          ) : null}
          {/* Mini scale */}
          <div className="mt-2 flex gap-1">
            {Array.from({ length: 9 }, (_, i) => (
              <div
                key={i}
                className="rounded-full"
                style={{
                  width: i + 1 === barValue ? 12 : 5,
                  height: 5,
                  background:
                    i + 1 <= barValue
                      ? "linear-gradient(90deg, #7B5EF8, #C084FC)"
                      : "rgba(255,255,255,0.07)",
                  transition: "width 0.4s ease",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
