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
    <article className="rounded-[28px] border border-emerald-200 bg-[linear-gradient(135deg,#effaf1_0%,#dcf4e6_100%)] p-6 text-stone-950 shadow-[0_18px_45px_rgba(38,92,61,0.14)]">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
        {eyebrow}
      </p>
      <div className="mt-3 space-y-2">
        <h3 className="text-3xl font-semibold tracking-tight">{title}</h3>
        <p className="text-sm leading-6 text-stone-700">{body}</p>
      </div>

      <div className="mt-5 rounded-[24px] border border-emerald-300/60 bg-white/70 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
          What opens next
        </p>
        <h4 className="mt-2 text-xl font-semibold tracking-tight text-stone-950">
          {preview.preview.title}
        </h4>
        <p className="mt-2 text-sm leading-6 text-stone-700">
          Your preview is still here, and the full compatibility reading is the next layer to open.
        </p>
        {isPremium ? (
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
            Status: {premiumStatus ?? "premium"}
          </p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onOpenCompatibility}
        className="mt-5 w-full rounded-2xl bg-stone-950 px-4 py-3 text-sm font-semibold text-stone-50 transition hover:bg-stone-800"
      >
        Return to compatibility
      </button>
    </article>
  );
}
