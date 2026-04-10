"use client";

import { useEffect, useRef, useCallback } from "react";

const ITEM_H = 44;
const VISIBLE = 5;
const PAD = 2; // items above/below center

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const CUR_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CUR_YEAR - 1939 }, (_, i) => 1940 + i);

type DateValue = { day: number; month: number; year: number };

type ColProps = {
  items: (number | string)[];
  value: number | string;
  onChange: (v: number | string) => void;
  width?: string;
};

function DrumColumn({ items, value, onChange, width = "flex-1" }: ColProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const scrollEndTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastValueRef = useRef(value);

  const indexOfValue = useCallback(
    (v: number | string) => {
      const i = items.indexOf(v);
      return i < 0 ? 0 : i;
    },
    [items],
  );

  // Scroll to selected value
  const scrollToIndex = useCallback((index: number, smooth = false) => {
    const el = containerRef.current;
    if (!el) return;
    const target = index * ITEM_H;
    if (smooth) {
      el.scrollTo({ top: target, behavior: "smooth" });
    } else {
      el.scrollTop = target;
    }
  }, []);

  // On mount: scroll to current value
  useEffect(() => {
    scrollToIndex(indexOfValue(value));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // When value changes externally
  useEffect(() => {
    if (lastValueRef.current !== value) {
      lastValueRef.current = value;
      if (!isDragging.current) {
        scrollToIndex(indexOfValue(value), true);
      }
    }
  }, [value, indexOfValue, scrollToIndex]);

  function handleScroll() {
    isDragging.current = true;
    if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
    scrollEndTimer.current = setTimeout(() => {
      isDragging.current = false;
      const el = containerRef.current;
      if (!el) return;
      const index = Math.round(el.scrollTop / ITEM_H);
      const clamped = Math.max(0, Math.min(items.length - 1, index));
      const newVal = items[clamped];
      scrollToIndex(clamped, true);
      if (newVal !== lastValueRef.current) {
        lastValueRef.current = newVal;
        onChange(newVal);
      }
    }, 120);
  }

  return (
    <div className={`relative ${width} overflow-hidden`} style={{ height: ITEM_H * VISIBLE }}>
      {/* Fade top */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10"
        style={{
          height: ITEM_H * PAD,
          background: "linear-gradient(to bottom, #111128 20%, transparent)",
        }}
      />
      {/* Fade bottom */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
        style={{
          height: ITEM_H * PAD,
          background: "linear-gradient(to top, #111128 20%, transparent)",
        }}
      />
      {/* Center highlight bar */}
      <div
        className="pointer-events-none absolute inset-x-0 z-10"
        style={{
          top: ITEM_H * PAD,
          height: ITEM_H,
          borderTop: "1px solid rgba(255,255,255,0.12)",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
        }}
      />
      {/* Scrollable list */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="drum-col h-full overflow-y-scroll"
        style={{ scrollSnapType: "y mandatory" }}
      >
        {/* Padding top */}
        <div style={{ height: ITEM_H * PAD }} />
        {items.map((item) => (
          <div
            key={item}
            style={{
              height: ITEM_H,
              scrollSnapAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              fontWeight: 600,
              color: "var(--text-primary)",
              cursor: "pointer",
            }}
            onClick={() => {
              const idx = items.indexOf(item);
              scrollToIndex(idx, true);
              lastValueRef.current = item;
              onChange(item);
            }}
          >
            {typeof item === "number" && item < 10 ? `0${item}` : String(item)}
          </div>
        ))}
        {/* Padding bottom */}
        <div style={{ height: ITEM_H * PAD }} />
      </div>
    </div>
  );
}

type DrumDatePickerProps = {
  value: string; // "YYYY-MM-DD" or ""
  onChange: (value: string) => void;
};

export function DrumDatePicker({ value, onChange }: DrumDatePickerProps) {
  // Parse value to { day, month, year }
  const parsed = parseDate(value);
  const day = parsed?.day ?? 1;
  const month = parsed?.month ?? 1;
  const year = parsed?.year ?? 2000;

  function emit(d: number, m: number, y: number) {
    const dd = String(d).padStart(2, "0");
    const mm = String(m).padStart(2, "0");
    onChange(`${y}-${mm}-${dd}`);
  }

  return (
    <div
      className="flex w-full gap-1 rounded-2xl px-4 py-2"
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      {/* Day */}
      <DrumColumn
        items={DAYS}
        value={day}
        onChange={(v) => emit(v as number, month, year)}
        width="w-[60px]"
      />

      {/* Divider */}
      <div className="flex items-center px-1 text-[var(--text-muted)] text-lg font-light select-none">
        /
      </div>

      {/* Month */}
      <DrumColumn
        items={MONTHS}
        value={MONTHS[month - 1]}
        onChange={(v) => emit(day, MONTHS.indexOf(v as string) + 1, year)}
        width="w-[64px]"
      />

      {/* Divider */}
      <div className="flex items-center px-1 text-[var(--text-muted)] text-lg font-light select-none">
        /
      </div>

      {/* Year */}
      <DrumColumn
        items={YEARS}
        value={year}
        onChange={(v) => emit(day, month, v as number)}
        width="flex-1"
      />
    </div>
  );
}

function parseDate(value: string): DateValue | null {
  if (!value || value.length < 10) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return { year: y, month: m, day: d };
}
