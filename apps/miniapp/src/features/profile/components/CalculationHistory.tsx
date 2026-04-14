"use client";

import { useEffect, useState } from "react";
import {
  CalculationHistoryEntry,
  getCalculationHistory,
} from "@/features/profile/calculationHistory";

type CalculationHistoryProps = {
  /** Bump this number to trigger a re-read from localStorage */
  refreshKey?: number;
  /** Called when an entry with a stored payload is clicked. */
  onOpenEntry?: (entry: CalculationHistoryEntry) => void;
};

const TYPE_META: Record<string, { icon: string; label: string; color: string }> = {
  numerology: { icon: "✦", label: "Нумерология", color: "#7B5EF8" },
  compatibility: { icon: "♥", label: "Совместимость", color: "#F472B6" },
  horoscope: { icon: "★", label: "Гороскоп", color: "#60A5FA" },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, "0");
  const mins = d.getMinutes().toString().padStart(2, "0");
  return `${day}.${month}.${year} · ${hours}:${mins}`;
}

function formatBirthDate(bd: string): string {
  const parts = bd.split("-");
  if (parts.length === 3) return `${parts[2]}.${parts[1]}.${parts[0]}`;
  return bd;
}

export function CalculationHistory({ refreshKey, onOpenEntry }: CalculationHistoryProps) {
  const [entries, setEntries] = useState<CalculationHistoryEntry[]>([]);

  useEffect(() => {
    setEntries(getCalculationHistory());
  }, [refreshKey]);

  if (entries.length === 0) {
    return null;
  }

  return (
    <article
      className="rounded-[28px] p-6"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
      }}
    >
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.22em]"
        style={{ color: "var(--text-muted)" }}
      >
        История расчётов
      </p>
      <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
        {entries.length} {entries.length === 1 ? "расчёт" : entries.length < 5 ? "расчёта" : "расчётов"}
      </p>

      <ul className="mt-4 space-y-2">
        {entries.map((entry) => {
          const meta = TYPE_META[entry.type] ?? TYPE_META.numerology;
          const nameLabel =
            entry.type === "compatibility" && entry.targetName
              ? `${entry.displayName ?? "—"} + ${entry.targetName}`
              : entry.displayName || "Без имени";

          const isOpenable = Boolean(entry.payload && onOpenEntry);
          return (
            <li
              key={entry.id}
              onClick={isOpenable ? () => onOpenEntry!(entry) : undefined}
              role={isOpenable ? "button" : undefined}
              tabIndex={isOpenable ? 0 : undefined}
              onKeyDown={
                isOpenable
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onOpenEntry!(entry);
                      }
                    }
                  : undefined
              }
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition ${
                isOpenable
                  ? "cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                  : ""
              }`}
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-base"
                style={{
                  background: `${meta.color}18`,
                  border: `1px solid ${meta.color}30`,
                  color: meta.color,
                }}
              >
                {meta.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p
                    className="truncate text-sm font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {nameLabel}
                  </p>
                  {entry.lifePathNumber != null && (
                    <span
                      className="flex-shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                      style={{
                        background: `${meta.color}20`,
                        color: meta.color,
                      }}
                    >
                      LP {entry.lifePathNumber}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-[11px]" style={{ color: "var(--text-muted)" }}>
                  <span>{meta.label}</span>
                  <span>·</span>
                  <span>{formatBirthDate(entry.birthDate)}</span>
                </div>
                <p className="mt-0.5 text-[10px]" style={{ color: "var(--text-muted)", opacity: 0.7 }}>
                  {formatDate(entry.createdAt)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </article>
  );
}
