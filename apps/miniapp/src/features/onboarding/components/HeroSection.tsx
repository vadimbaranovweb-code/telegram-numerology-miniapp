import { t } from "@/i18n";

export function HeroSection() {
  return (
    <section className="relative flex flex-col items-center pt-10 pb-2 text-center">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 rounded-full blur-3xl"
        style={{
          width: 280,
          height: 280,
          background: "rgba(123,94,248,0.18)",
        }}
      />

      {/* Symbol orb */}
      <div
        className="relative mb-7 flex h-[88px] w-[88px] items-center justify-center rounded-full"
        style={{
          background: "radial-gradient(circle at 40% 35%, rgba(192,132,252,0.22), rgba(123,94,248,0.08))",
          border: "1px solid rgba(123,94,248,0.35)",
          boxShadow: "0 0 32px rgba(123,94,248,0.2)",
        }}
      >
        <span className="text-[42px] select-none leading-none" style={{ color: "#C084FC" }}>
          ✦
        </span>
      </div>

      {/* Headline */}
      <h1
        className="text-[30px] font-bold leading-tight tracking-tight max-w-[280px]"
        style={{ color: "var(--text-primary)" }}
        suppressHydrationWarning
      >
        {t.hero.title}
      </h1>

      {/* Sub */}
      <p
        className="mt-3 max-w-[260px] text-sm leading-6"
        style={{ color: "var(--text-secondary)" }}
        suppressHydrationWarning
      >
        {t.hero.subtitle}
      </p>
    </section>
  );
}
