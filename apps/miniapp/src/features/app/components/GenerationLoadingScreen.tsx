"use client";

import { useEffect, useState } from "react";
import { t } from "@/i18n";

export function GenerationLoadingScreen() {
  const messages = t.loading.messages;
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % messages.length);
        setVisible(true);
      }, 300);
    }, 2400);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-16">
      {/* Circular spinner with ✦ center */}
      <div className="relative" style={{ width: 84, height: 84 }}>
        <svg
          width="84"
          height="84"
          viewBox="0 0 84 84"
          fill="none"
          style={{ position: "absolute", inset: 0 }}
        >
          {/* Track */}
          <circle
            cx="42"
            cy="42"
            r="38"
            stroke="var(--border-subtle)"
            strokeWidth="2.5"
          />
          {/* Spinner arc */}
          <circle
            cx="42"
            cy="42"
            r="38"
            stroke="var(--accent-primary)"
            strokeWidth="2.5"
            strokeDasharray="239"
            strokeDashoffset="179"
            strokeLinecap="round"
            style={{
              transformOrigin: "42px 42px",
              animation: "spin 1.4s linear infinite",
            }}
          />
        </svg>
        {/* Center symbol */}
        <div
          className="absolute inset-0 flex items-center justify-center text-2xl select-none"
          style={{ color: "var(--accent-soft)" }}
        >
          ✦
        </div>
      </div>

      {/* Animated message */}
      <p
        className="text-center text-[15px] leading-6 px-4"
        style={{
          color: "var(--text-secondary)",
          transition: "opacity 0.3s ease",
          opacity: visible ? 1 : 0,
          minHeight: "1.5rem",
        }}
      >
        {messages[index]}
      </p>
    </div>
  );
}
