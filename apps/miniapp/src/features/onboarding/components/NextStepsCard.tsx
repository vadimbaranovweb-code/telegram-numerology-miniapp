export function NextStepsCard() {
  const items = [
    {
      icon: "✦",
      title: "Персональный расклад",
      body: "5 карточек по дате рождения — Жизненный путь, Сила, Слепое пятно и другие.",
    },
    {
      icon: "◈",
      title: "Ежедневные инсайты",
      body: "Персональный сигнал на каждый день, привязанный к твоему текущему циклу.",
    },
    {
      icon: "♥",
      title: "Совместимость",
      body: "Анализ энергий с партнёром, другом или коллегой — с расширенным раскладом.",
    },
  ];

  return (
    <article
      className="rounded-[24px] p-5"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
      }}
    >
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.22em]"
        style={{ color: "var(--text-muted)" }}
      >
        Что тебя ждёт
      </p>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.title} className="flex items-start gap-3">
            <span
              className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-sm"
              style={{
                background: "rgba(123,94,248,0.12)",
                border: "1px solid rgba(123,94,248,0.2)",
                color: "var(--accent-soft)",
              }}
            >
              {item.icon}
            </span>
            <div>
              <p
                className="text-sm font-semibold leading-5"
                style={{ color: "var(--text-primary)" }}
              >
                {item.title}
              </p>
              <p
                className="mt-0.5 text-xs leading-5"
                style={{ color: "var(--text-secondary)" }}
              >
                {item.body}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}
