const ARCHETYPES: Record<number, { name: string; keyword: string; nameRu: string; keywordRu: string }> = {
  1:  { name: "Leader",       keyword: "Independence", nameRu: "Лидер",       keywordRu: "Независимость" },
  2:  { name: "Diplomat",     keyword: "Harmony",      nameRu: "Дипломат",    keywordRu: "Гармония"      },
  3:  { name: "Creator",      keyword: "Expression",   nameRu: "Творец",      keywordRu: "Самовыражение" },
  4:  { name: "Builder",      keyword: "Stability",    nameRu: "Строитель",   keywordRu: "Стабильность"  },
  5:  { name: "Explorer",     keyword: "Freedom",      nameRu: "Искатель",    keywordRu: "Свобода"       },
  6:  { name: "Nurturer",     keyword: "Compassion",   nameRu: "Хранитель",   keywordRu: "Забота"        },
  7:  { name: "Seeker",       keyword: "Wisdom",       nameRu: "Мудрец",      keywordRu: "Мудрость"      },
  8:  { name: "Achiever",     keyword: "Power",        nameRu: "Достигатор",  keywordRu: "Сила"          },
  9:  { name: "Humanitarian", keyword: "Completion",   nameRu: "Гуманист",    keywordRu: "Завершение"    },
  11: { name: "Visionary",    keyword: "Intuition",    nameRu: "Визионер",    keywordRu: "Интуиция"      },
  22: { name: "Architect",    keyword: "Mastery",      nameRu: "Архитектор",  keywordRu: "Мастерство"    },
  33: { name: "Teacher",      keyword: "Healing",      nameRu: "Учитель",     keywordRu: "Исцеление"     },
};

export function NumberCard({
  label,
  value,
  isRu = false,
  onInfo,
}: {
  label: string;
  value: number | null;
  isRu?: boolean;
  onInfo?: () => void;
}) {
  const archetype = value != null ? ARCHETYPES[value] : null;
  const keyword = archetype
    ? (isRu ? archetype.keywordRu : archetype.keyword)
    : null;

  // Normalise master numbers to 1-9 for the progress bar
  const barValue = value != null ? (value > 9 ? value % 9 || 9 : value) : 0;
  const barPct = value != null ? `${Math.round((barValue / 9) * 100)}%` : "0%";

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-1 relative"
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <div className="flex items-start justify-between gap-1">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.2em] leading-4"
          style={{ color: "var(--text-muted)" }}
        >
          {label}
        </p>
        {onInfo && (
          <button
            type="button"
            onClick={onInfo}
            className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full transition active:scale-90"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-muted)",
              fontSize: 10,
              fontWeight: 700,
            }}
            aria-label="Что это"
          >
            i
          </button>
        )}
      </div>
      <p
        className="text-[40px] font-bold leading-none tracking-tight"
        style={{ color: "var(--text-primary)" }}
      >
        {value ?? "—"}
      </p>
      {keyword ? (
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.16em]"
          style={{ color: "var(--accent-soft)" }}
          suppressHydrationWarning
        >
          {keyword}
        </p>
      ) : null}
      {/* Scale bar */}
      {value != null ? (
        <div
          className="mt-2 rounded-full overflow-hidden"
          style={{ height: 3, background: "rgba(255,255,255,0.06)" }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: barPct,
              background: "linear-gradient(90deg, #7B5EF8, #C084FC)",
              transition: "width 0.8s cubic-bezier(0.22,1,0.36,1)",
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

export { ARCHETYPES };
