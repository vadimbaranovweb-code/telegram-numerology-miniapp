import { lang } from "@/i18n";

type YearInfo = {
  theme: string;
  themeRu: string;
  keyword: string;
  keywordRu: string;
  desc: string;
  descRu: string;
  color: string;
};

const YEAR_INFO: Record<number, YearInfo> = {
  1: {
    theme: "New Beginnings",      themeRu: "Новое начало",
    keyword: "Initiative",        keywordRu: "Инициатива",
    desc:   "A year to plant seeds and start fresh. Your decisions now shape the next 9 years.",
    descRu: "Год для новых начинаний. Решения этого года формируют следующий 9-летний цикл.",
    color: "#F59E0B",
  },
  2: {
    theme: "Patience & Partnership", themeRu: "Терпение и союз",
    keyword: "Cooperation",           keywordRu: "Сотрудничество",
    desc:   "A year of relationships and subtle growth. Build trust, avoid forcing outcomes.",
    descRu: "Год отношений и тонкого роста. Строй доверие, не форсируй события.",
    color: "#60A5FA",
  },
  3: {
    theme: "Creativity & Expression", themeRu: "Творчество и выражение",
    keyword: "Joy",                    keywordRu: "Радость",
    desc:   "A social and expressive year. Ideas flow freely — speak, create, connect.",
    descRu: "Общительный год. Идеи льются свободно — говори, создавай, соединяйся.",
    color: "#F472B6",
  },
  4: {
    theme: "Work & Foundation",  themeRu: "Труд и фундамент",
    keyword: "Structure",         keywordRu: "Структура",
    desc:   "A year of building and discipline. Steady effort now creates lasting security.",
    descRu: "Год строительства и дисциплины. Постоянные усилия создают долгосрочную стабильность.",
    color: "#34D399",
  },
  5: {
    theme: "Change & Freedom",   themeRu: "Перемены и свобода",
    keyword: "Transformation",    keywordRu: "Трансформация",
    desc:   "A dynamic year of shifts and new experiences. Embrace change — resist stagnation.",
    descRu: "Динамичный год перемен и новых опытов. Прими изменения — избегай застоя.",
    color: "#C084FC",
  },
  6: {
    theme: "Love & Responsibility", themeRu: "Любовь и ответственность",
    keyword: "Nurturing",            keywordRu: "Забота",
    desc:   "A year centered on home, family, and service. Deep bonds are formed and tested.",
    descRu: "Год дома, семьи и служения. Глубокие связи формируются и проверяются.",
    color: "#F472B6",
  },
  7: {
    theme: "Reflection & Wisdom", themeRu: "Рефлексия и мудрость",
    keyword: "Inner Work",          keywordRu: "Внутренняя работа",
    desc:   "A year of solitude and deep inner insight. Seek truth within — not outside.",
    descRu: "Год уединения и глубокого понимания. Ищи истину внутри, не снаружи.",
    color: "#7B5EF8",
  },
  8: {
    theme: "Achievement & Power",  themeRu: "Достижения и сила",
    keyword: "Abundance",           keywordRu: "Изобилие",
    desc:   "A year of ambition and material results. What you've built now bears fruit.",
    descRu: "Год амбиций и материальных результатов. То, что ты строил, теперь даёт плоды.",
    color: "#F59E0B",
  },
  9: {
    theme: "Completion & Release", themeRu: "Завершение и отпускание",
    keyword: "Harvest",             keywordRu: "Итог",
    desc:   "A year to close chapters, release the old, and prepare for the new cycle.",
    descRu: "Год закрытия глав, отпускания старого и подготовки к новому циклу.",
    color: "#60A5FA",
  },
};

type PersonalYearCardProps = {
  personalYear: number;
  personalMonth: number;
};

export function PersonalYearCard({ personalYear, personalMonth }: PersonalYearCardProps) {
  const isRu = lang === "ru";
  const info = YEAR_INFO[personalYear] ?? YEAR_INFO[9];
  const prevYear = personalYear === 1 ? 9 : personalYear - 1;
  const nextYear = personalYear === 9 ? 1 : personalYear + 1;
  const prevInfo = YEAR_INFO[prevYear];
  const nextInfo = YEAR_INFO[nextYear];

  // Month progress within personal year (1–12)
  const monthPct = Math.round(((personalMonth - 1) / 12) * 100);

  return (
    <article
      className="rounded-[24px] p-5"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: "var(--text-muted)" }}
          suppressHydrationWarning
        >
          {isRu ? "Твой цикл" : "Your cycle"}
        </p>
        <span
          className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]"
          style={{ background: `${info.color}22`, color: info.color, border: `1px solid ${info.color}44` }}
          suppressHydrationWarning
        >
          {isRu ? info.keywordRu : info.keyword}
        </span>
      </div>

      {/* Year + theme */}
      <div className="mt-3">
        <div className="flex items-baseline gap-2">
          <span
            className="text-[52px] font-bold leading-none tracking-tight"
            style={{ color: info.color }}
          >
            {personalYear}
          </span>
          <span
            className="text-base font-semibold leading-tight"
            style={{ color: "var(--text-primary)" }}
            suppressHydrationWarning
          >
            {isRu ? info.themeRu : info.theme}
          </span>
        </div>
        <p
          className="mt-2 text-sm leading-6"
          style={{ color: "var(--text-secondary)" }}
          suppressHydrationWarning
        >
          {isRu ? info.descRu : info.desc}
        </p>
      </div>

      {/* 9-year cycle dots */}
      <div className="mt-4">
        <p
          className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: "var(--text-muted)" }}
          suppressHydrationWarning
        >
          {isRu ? "Цикл 9 лет" : "9-year cycle"}
        </p>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: 9 }, (_, i) => {
            const yr = i + 1;
            const isActive = yr === personalYear;
            const isPast = yr < personalYear;
            return (
              <div key={yr} className="flex flex-col items-center gap-1">
                <div
                  className="rounded-full transition-all"
                  style={{
                    width: isActive ? 28 : 8,
                    height: 8,
                    background: isActive
                      ? info.color
                      : isPast
                      ? `${info.color}55`
                      : "rgba(255,255,255,0.07)",
                    boxShadow: isActive ? `0 0 10px ${info.color}88` : "none",
                  }}
                />
                {isActive && (
                  <span
                    className="text-[9px] font-bold"
                    style={{ color: info.color }}
                  >
                    {yr}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Month progress within year */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-1.5">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: "var(--text-muted)" }}
            suppressHydrationWarning
          >
            {isRu ? `Личный месяц ${personalMonth}` : `Personal month ${personalMonth}`}
          </p>
          <p
            className="text-[10px]"
            style={{ color: "var(--text-muted)" }}
          >
            {monthPct}%
          </p>
        </div>
        <div
          className="rounded-full overflow-hidden"
          style={{ height: 4, background: "rgba(255,255,255,0.06)" }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${monthPct}%`,
              background: `linear-gradient(90deg, ${info.color}88, ${info.color})`,
              transition: "width 0.8s ease",
            }}
          />
        </div>
      </div>

      {/* Prev / next context */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div
          className="rounded-2xl px-3 py-2.5"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
        >
          <p
            className="text-[9px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: "var(--text-muted)" }}
            suppressHydrationWarning
          >
            {isRu ? `← Год ${prevYear}` : `← Year ${prevYear}`}
          </p>
          <p
            className="mt-0.5 text-xs font-medium"
            style={{ color: "var(--text-secondary)" }}
            suppressHydrationWarning
          >
            {isRu ? prevInfo.themeRu : prevInfo.theme}
          </p>
        </div>
        <div
          className="rounded-2xl px-3 py-2.5"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
        >
          <p
            className="text-[9px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: "var(--text-muted)" }}
            suppressHydrationWarning
          >
            {isRu ? `Год ${nextYear} →` : `Year ${nextYear} →`}
          </p>
          <p
            className="mt-0.5 text-xs font-medium"
            style={{ color: "var(--text-secondary)" }}
            suppressHydrationWarning
          >
            {isRu ? nextInfo.themeRu : nextInfo.theme}
          </p>
        </div>
      </div>
    </article>
  );
}
