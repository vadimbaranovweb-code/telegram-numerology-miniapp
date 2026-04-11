import { t } from "@/i18n";
import { CompatibilityPreviewResponse } from "@/features/compatibility/types";
import { ConfettiParticles } from "@/features/app/components/ConfettiParticles";

type PurchaseSuccessCardProps = {
  preview: CompatibilityPreviewResponse;
  isPremium: boolean;
  premiumStatus: "free" | "premium" | null;
  onOpenCompatibility: () => void;
};

export function PurchaseSuccessCard({
  preview,
  isPremium,
  premiumStatus,
  onOpenCompatibility,
}: PurchaseSuccessCardProps) {
  const eyebrow = isPremium ? t.success.label_active : t.success.label_new;
  const title   = isPremium ? t.success.title_active : t.success.title_new;
  const body    = isPremium ? t.success.body_active  : t.success.body_new;

  return (
    <article
      className="relative rounded-[28px] p-6 overflow-hidden"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid rgba(52,211,153,0.35)",
        boxShadow: "0 18px 45px rgba(0,0,0,0.5), 0 0 60px rgba(52,211,153,0.06)",
      }}
    >
      {/* Confetti */}
      <ConfettiParticles />

      {/* Glow */}
      <div
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-8 rounded-full blur-3xl"
        style={{ width: 160, height: 100, background: "rgba(52,211,153,0.12)" }}
      />

      <p
        className="text-[11px] font-semibold uppercase tracking-[0.22em]"
        style={{ color: "var(--accent-green)" }}
        suppressHydrationWarning
      >
        {eyebrow}
      </p>

      {/* Big checkmark */}
      <div className="mt-4 flex justify-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full text-3xl"
          style={{
            background: "rgba(52,211,153,0.12)",
            border: "1px solid rgba(52,211,153,0.3)",
          }}
        >
          ✓
        </div>
      </div>

      <div className="mt-5 space-y-2 text-center">
        <h3
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--text-primary)" }}
          suppressHydrationWarning
        >
          {title}
        </h3>
        <p
          className="text-sm leading-6"
          style={{ color: "var(--text-secondary)" }}
          suppressHydrationWarning
        >
          {body}
        </p>
      </div>

      {/* Preview recap */}
      <div
        className="mt-6 rounded-2xl p-5"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid rgba(52,211,153,0.15)",
        }}
      >
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: "var(--accent-green)" }}
          suppressHydrationWarning
        >
          {t.success.what_next}
        </p>
        <h4
          className="mt-2 text-lg font-bold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          {preview.preview.title}
        </h4>
        <p
          className="mt-2 text-sm leading-6"
          style={{ color: "var(--text-secondary)" }}
          suppressHydrationWarning
        >
          {t.success.preview_body}
        </p>
        {isPremium ? (
          <p
            className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: "var(--accent-green)" }}
          >
            Status: {premiumStatus ?? "premium"}
          </p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onOpenCompatibility}
        className="mt-5 w-full rounded-2xl py-3.5 text-sm font-semibold transition active:scale-[0.98]"
        style={{ background: "var(--grad-cta)", color: "#fff" }}
        suppressHydrationWarning
      >
        {t.success.cta}
      </button>
    </article>
  );
}
