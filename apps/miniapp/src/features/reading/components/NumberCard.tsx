export function NumberCard({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">
        {value ?? "—"}
      </p>
    </div>
  );
}
