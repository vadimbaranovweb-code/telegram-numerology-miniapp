export function BootstrapScreen() {
  return (
    <section className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_12px_50px_rgba(89,63,31,0.10)] backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
        Loading
      </p>
      <div className="mt-3 space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-950">
          Restoring your profile
        </h1>
        <p className="text-sm leading-6 text-stone-600">
          We are checking whether your reading and home progress are already
          available on this device.
        </p>
      </div>
    </section>
  );
}
