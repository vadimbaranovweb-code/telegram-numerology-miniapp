import { t } from "@/i18n";
import { CompatibilityPreviewResponse } from "@/features/compatibility/types";

type PremiumPaywallCardProps = {
  preview: CompatibilityPreviewResponse;
  isPremium: boolean;
  premiumStatus: "free" | "premium" | null;
  onContinue: () => void;
  onBack: () => void;
};

export function PremiumPaywallCard({
  preview,
  isPremium,
  premiumStatus,
  onContinue,
  onBack,
}: PremiumPaywallCardProps) {
  if (isPremium) {
    return (
      <article
        className="rounded-[28px] p-6"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid rgba(52,211,153,0.3)",
          boxShadow: "0 18px 45px rgba(0,0,0,0.5)",
        }}
      >
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: "var(--accent-green)" }}
          suppressHydrationWarning
        >
          {t.paywall.premium_label}
        </p>
        <h3
          className="mt-3 text-2xl font-bold tracking-tight"
          style={{ color: "var(--text-primary)" }}
          suppressHydrationWarning
        >
          {t.paywall.premium_title}
        </h3>
        <p
          className="mt-2 text-sm leading-6"
          style={{ color: "var(--text-secondary)" }}
          suppressHydrationWarning
        >
          {t.paywall.premium_body} {premiumStatus ?? "premium"}
        </p>
        <button
          type="button"
          onClick={onContinue}
          className="mt-5 w-full rounded-2xl py-3.5 text-sm font-semibold transition"
          style={{ background: "var(--accent-green)", color: "#0A0A14" }}
          suppressHydrationWarning
        >
          {t.paywall.back_to_compat}
        </button>
      </article>
    );
  }

  return (
    <article
      className="rounded-[28px] p-6"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-glow)",
        boxShadow: "0 18px 45px rgba(0,0,0,0.5), 0 0 60px rgba(123,94,248,0.08)",
      }}
    >
      {/* Glow */}
      <div
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-8 rounded-full blur-3xl"
        style={{ width: 200, height: 120, background: "rgba(123,94,248,0.15)" }}
      />

      <p
        className="text-[11px] font-semibold uppercase tracking-[0.22em]"
        style={{ color: "var(--accent-soft)" }}
        suppressHydrationWarning
      >
        {t.paywall.label}
      </p>

      <h3
        className="mt-3 text-[26px] font-bold tracking-tight"
        style={{ color: "var(--text-primary)" }}
        suppressHydrationWarning
      >
        {t.paywall.title}
      </h3>

      {/* Benefits */}
      <ul className="mt-5 space-y-3">
        {t.paywall.benefits.map((b) => (
          <li key={b} className="flex items-start gap-3">
            <span style={{ color: "var(--accent-primary)", marginTop: 1 }}>✦</span>
            <span
              className="text-sm leading-6"
              style={{ color: "var(--text-secondary)" }}
              suppressHydrationWarning
            >
              {b}
            </span>
          </li>
        ))}
      </ul>

      {/* Price block */}
      <div
        className="mt-5 flex items-center gap-4 rounded-2xl px-5 py-4"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid rgba(123,94,248,0.2)",
        }}
      >
        <div className="flex flex-col items-start">
          <span className="text-[22px] leading-none">⭐</span>
          <span
            className="mt-1 text-[28px] font-bold leading-none"
            style={{ color: "var(--text-primary)" }}
          >
            {preview.paywall.stars_amount ?? 199}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="text-sm leading-5"
            style={{ color: "var(--text-muted)" }}
            suppressHydrationWarning
          >
            {t.paywall.stars} · {t.paywall.one_time}
          </p>
        </div>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={onContinue}
        className="mt-4 w-full rounded-2xl py-3.5 text-sm font-semibold text-white transition active:scale-[0.98]"
        style={{ background: "var(--grad-cta)" }}
        suppressHydrationWarning
      >
        {t.paywall.cta}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="mt-3 w-full rounded-2xl py-3 text-sm transition"
        style={{
          border: "1px solid var(--border-subtle)",
          color: "var(--text-secondary)",
        }}
        suppressHydrationWarning
      >
        {t.paywall.back}
      </button>

      <p
        className="mt-3 text-center text-xs"
        style={{ color: "var(--text-muted)" }}
        suppressHydrationWarning
      >
        {t.paywall.footer}
      </p>
    </article>
  );
}
