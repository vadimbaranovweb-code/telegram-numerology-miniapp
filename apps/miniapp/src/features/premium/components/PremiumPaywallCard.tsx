import { CompatibilityPreviewResponse } from "@/features/compatibility/types";

type PremiumPaywallCardProps = {
  preview: CompatibilityPreviewResponse;
  isPremium: boolean;
  premiumStatus: "free" | "premium" | null;
  onContinue: () => void;
  onBack: () => void;
};

const BENEFITS = [
  "Full compatibility analysis with deeper cards",
  "Where tension will show up between you",
  "What makes this bond last long-term",
  "Saved to your profile for later",
];

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
        >
          Premium active
        </p>
        <h3
          className="mt-3 text-2xl font-bold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          Your unlock is already active.
        </h3>
        <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
          Status: {premiumStatus ?? "premium"}
        </p>
        <button
          type="button"
          onClick={onContinue}
          className="mt-5 w-full rounded-2xl py-3.5 text-sm font-semibold transition"
          style={{ background: "var(--accent-green)", color: "#0A0A14" }}
        >
          Back to compatibility
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
      >
        Premium unlock
      </p>

      <h3
        className="mt-3 text-[26px] font-bold tracking-tight"
        style={{ color: "var(--text-primary)" }}
      >
        Unlock the full picture.
      </h3>

      {/* Benefits */}
      <ul className="mt-5 space-y-3">
        {BENEFITS.map((b) => (
          <li key={b} className="flex items-start gap-3">
            <span style={{ color: "var(--accent-primary)", marginTop: 1 }}>✦</span>
            <span className="text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
              {b}
            </span>
          </li>
        ))}
      </ul>

      {/* Price block */}
      <div
        className="mt-5 rounded-2xl px-5 py-4"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid rgba(123,94,248,0.2)",
        }}
      >
        <div className="flex items-baseline gap-2">
          <span className="text-[32px] font-bold" style={{ color: "var(--text-primary)" }}>
            ⭐ {preview.paywall.price_local ?? 350}
          </span>
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>Stars</span>
        </div>
        <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
          One-time unlock · less than a coffee
        </p>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={onContinue}
        className="mt-4 w-full rounded-2xl py-3.5 text-sm font-semibold text-white transition active:scale-[0.98]"
        style={{ background: "var(--grad-cta)" }}
      >
        Unlock Full Reading
      </button>

      <button
        type="button"
        onClick={onBack}
        className="mt-3 w-full rounded-2xl py-3 text-sm transition"
        style={{
          border: "1px solid var(--border-subtle)",
          color: "var(--text-secondary)",
        }}
      >
        Back to preview
      </button>

      <p className="mt-3 text-center text-xs" style={{ color: "var(--text-muted)" }}>
        Paid via Telegram Stars · Instant access
      </p>
    </article>
  );
}
