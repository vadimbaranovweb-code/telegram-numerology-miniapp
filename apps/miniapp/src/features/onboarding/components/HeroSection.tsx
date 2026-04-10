export function HeroSection() {
  return (
    <section className="overflow-hidden rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_12px_50px_rgba(89,63,31,0.10)] backdrop-blur">
      <div className="mb-6 inline-flex rounded-full bg-stone-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-stone-50">
        Telegram Mini App
      </div>
      <div className="space-y-4">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-amber-700">
          Personal numerology, made modern
        </p>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight text-stone-950">
          Get your first numerology reading in under a minute.
        </h1>
        <p className="max-w-sm text-sm leading-6 text-stone-600">
          Start with your birth date, add your name if you want deeper
          meaning, and preview the core numbers behind your profile.
        </p>
      </div>
    </section>
  );
}
