import { CompatibilityPreviewResponse } from "@/features/compatibility/types";

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
  const eyebrow = isPremium ? "Premium active" : "Unlock complete";
  const title = isPremium
    ? "Premium access is already active."
    : "Premium unlock confirmed.";
  const body = isPremium
    ? "Your premium unlock is still saved in this session, so you can continue with compatibility without reopening checkout."
    : "Your premium unlock is saved, and the next step is to return to compatibility.";

  return (
    <article
      className="rounded-[28px] p-6"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid rgba(52,211,153,0.35)",
        boxShadow: "0 18px 45px rgba(0,0,0,0.5), 0 0 60px rgba(52,211,153,0.06)",
      }}
    >
      {/* Glow */}
      <div
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-8 rounded-full blur-3xl"
        style={{ width: 160, height: 100, background: "rgba(52,211,153,0.12)" }}
      />

      <p
        className="text-[11px] font-semibold uppercase tracking-[0.22em]"
        style={{ color: "var(--accent-green)" }}
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
        >
          {title}
        </h3>
        <p className="text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
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
        >
          What opens next
        </p>
        <h4
          className="mt-2 text-lg font-bold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          {preview.preview.title}
        </h4>
        <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
          Your preview is still here, and the full compatibility reading is the next layer to open.
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
      >
        Return to compatibility
      </button>
    </article>
  );
}
