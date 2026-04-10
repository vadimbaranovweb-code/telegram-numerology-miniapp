export function NumberCard({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-1"
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.2em]"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </p>
      <p
        className="text-[42px] font-bold leading-none tracking-tight"
        style={{ color: "var(--text-primary)" }}
      >
        {value ?? "—"}
      </p>
    </div>
  );
}
