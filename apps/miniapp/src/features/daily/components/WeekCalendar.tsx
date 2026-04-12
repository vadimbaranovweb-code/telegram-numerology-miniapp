"use client";

const DAY_NAMES = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

type WeekCalendarProps = {
  /** Currently selected date in ISO format (YYYY-MM-DD). Defaults to today. */
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
};

function getWeekDays(today: Date): { label: string; date: string; dayNum: number; isToday: boolean }[] {
  const dayOfWeek = today.getDay(); // 0=Sun
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    return {
      label: DAY_NAMES[i],
      date: iso,
      dayNum: d.getDate(),
      isToday: iso === today.toISOString().slice(0, 10),
    };
  });
}

export function WeekCalendar({ selectedDate, onSelectDate }: WeekCalendarProps) {
  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const selected = selectedDate ?? todayIso;
  const days = getWeekDays(today);

  // Month name for header
  const monthNames = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
  ];
  const monthLabel = monthNames[today.getMonth()];
  const year = today.getFullYear();

  return (
    <div
      className="rounded-[20px] px-4 py-3"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      {/* Month header */}
      <p
        className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: "var(--text-muted)" }}
      >
        {monthLabel} {year}
      </p>

      {/* Day cells */}
      <div className="flex justify-between gap-1">
        {days.map((day) => {
          const isSelected = day.date === selected;
          const isPast = day.date < todayIso;

          return (
            <button
              key={day.date}
              type="button"
              onClick={() => onSelectDate?.(day.date)}
              className="flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 transition-all duration-150"
              style={{
                background: isSelected
                  ? "rgba(123, 94, 248, 0.15)"
                  : "transparent",
                opacity: isPast && !isSelected ? 0.45 : 1,
              }}
            >
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.08em]"
                style={{
                  color: isSelected ? "var(--accent-soft)" : "var(--text-muted)",
                }}
              >
                {day.label}
              </span>
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
                style={{
                  background: day.isToday && isSelected
                    ? "var(--accent-soft)"
                    : day.isToday
                      ? "rgba(123, 94, 248, 0.1)"
                      : "transparent",
                  color: day.isToday && isSelected
                    ? "#fff"
                    : isSelected
                      ? "var(--accent-soft)"
                      : "var(--text-primary)",
                }}
              >
                {day.dayNum}
              </span>
              {/* Dot indicator for today */}
              {day.isToday && (
                <div
                  className="h-1 w-1 rounded-full"
                  style={{ background: "var(--accent-soft)" }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
