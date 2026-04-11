import { t } from "@/i18n";

export function BootstrapScreen() {
  return (
    <section
      className="rounded-[28px] p-6"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
      }}
    >
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.22em]"
        style={{ color: "var(--text-muted)" }}
        suppressHydrationWarning
      >
        {t.bootstrap.label}
      </p>
      <div className="mt-4 space-y-2">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--text-primary)" }}
          suppressHydrationWarning
        >
          {t.bootstrap.title}
        </h1>
        <p
          className="text-sm leading-6"
          style={{ color: "var(--text-secondary)" }}
          suppressHydrationWarning
        >
          {t.bootstrap.body}
        </p>
      </div>
      {/* Animated dot indicator */}
      <div className="mt-5 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-1.5 w-1.5 rounded-full"
            style={{
              background: "var(--accent-primary)",
              animation: `pulse-dot 1.4s ease-in-out ${i * 0.22}s infinite`,
            }}
          />
        ))}
      </div>
    </section>
  );
}
