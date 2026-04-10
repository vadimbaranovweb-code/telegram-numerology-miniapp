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
  const eyebrow = isPremium ? "Premium active" : "Premium unlock";
  const title = isPremium
    ? "This compatibility unlock is already active."
    : "Unlock the full compatibility reading.";
  const body = isPremium
    ? "Your session already has premium access, so you can go straight back to the compatibility preview."
    : "Take the next step after the preview and unlock the deeper compatibility reading.";
  const ctaLabel = isPremium ? "Back to compatibility" : "Continue to unlock";

  return (
    <article className="rounded-[28px] border border-stone-900 bg-stone-950 p-6 text-stone-50 shadow-[0_18px_45px_rgba(34,24,14,0.28)]">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">
        {eyebrow}
      </p>
      <div className="mt-3 space-y-2">
        <h3 className="text-3xl font-semibold tracking-tight">{title}</h3>
        <p className="text-sm leading-6 text-stone-300">
          {body}
        </p>
      </div>

      <div className="mt-5 rounded-[24px] border border-stone-800 bg-stone-900/70 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
          {isPremium ? "Current status" : "Included now"}
        </p>
        {isPremium ? (
          <div className="mt-3 space-y-2 text-sm leading-6 text-stone-200">
            <p>Premium is already unlocked for this session.</p>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
              Status: {premiumStatus ?? "premium"}
            </p>
          </div>
        ) : (
          <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-200">
            <li>Full compatibility reading with deeper cards</li>
            <li>More detail on emotional friction and long-term fit</li>
            <li>A clearer next step after the preview</li>
          </ul>
        )}
      </div>

      {!isPremium ? (
        <div className="mt-4 rounded-[24px] border border-amber-300/30 bg-amber-300/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
            Price
          </p>
          <p className="mt-2 text-3xl font-semibold text-stone-50">
            {preview.paywall.price_local} {preview.paywall.currency}
          </p>
        </div>
      ) : null}

      <div className="mt-5 grid gap-3">
        <button
          type="button"
          onClick={onContinue}
          className={
            isPremium
              ? "w-full rounded-2xl bg-emerald-300 px-4 py-3 text-sm font-semibold text-stone-950 transition hover:bg-emerald-200"
              : "w-full rounded-2xl bg-amber-300 px-4 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-200"
          }
        >
          {ctaLabel}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="w-full rounded-2xl border border-stone-700 px-4 py-3 text-sm font-semibold text-stone-100 transition hover:border-stone-500"
        >
          Back to preview
        </button>
      </div>
    </article>
  );
}
