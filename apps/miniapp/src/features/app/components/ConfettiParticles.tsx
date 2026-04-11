// CSS-only confetti — no library, no Math.random() to avoid hydration mismatch.
// Pre-defined positions for 24 particles.

const COLORS = [
  "#7B5EF8", "#C084FC", "#60A5FA", "#34D399",
  "#F472B6", "#F59E0B", "#A78BFA", "#38BDF8",
];

type Particle = {
  left: string;
  color: string;
  delay: string;
  duration: string;
  size: number;
  rotate: string;
};

// Fixed set — no random, no hydration issues
const PARTICLES: Particle[] = [
  { left: "5%",  color: COLORS[0], delay: "0s",    duration: "2.2s", size: 7,  rotate: "0deg" },
  { left: "12%", color: COLORS[1], delay: "0.15s", duration: "2.5s", size: 5,  rotate: "45deg" },
  { left: "20%", color: COLORS[2], delay: "0.05s", duration: "2.1s", size: 8,  rotate: "90deg" },
  { left: "28%", color: COLORS[3], delay: "0.3s",  duration: "2.4s", size: 6,  rotate: "135deg" },
  { left: "36%", color: COLORS[4], delay: "0.1s",  duration: "2.3s", size: 7,  rotate: "20deg" },
  { left: "44%", color: COLORS[5], delay: "0.25s", duration: "2.6s", size: 5,  rotate: "60deg" },
  { left: "52%", color: COLORS[6], delay: "0s",    duration: "2.0s", size: 9,  rotate: "180deg" },
  { left: "60%", color: COLORS[7], delay: "0.2s",  duration: "2.2s", size: 6,  rotate: "240deg" },
  { left: "68%", color: COLORS[0], delay: "0.08s", duration: "2.4s", size: 7,  rotate: "300deg" },
  { left: "76%", color: COLORS[1], delay: "0.35s", duration: "2.1s", size: 5,  rotate: "15deg" },
  { left: "84%", color: COLORS[2], delay: "0.12s", duration: "2.5s", size: 8,  rotate: "75deg" },
  { left: "92%", color: COLORS[3], delay: "0.22s", duration: "2.3s", size: 6,  rotate: "120deg" },
  { left: "8%",  color: COLORS[4], delay: "0.4s",  duration: "2.6s", size: 5,  rotate: "200deg" },
  { left: "17%", color: COLORS[5], delay: "0.18s", duration: "2.2s", size: 7,  rotate: "260deg" },
  { left: "25%", color: COLORS[6], delay: "0.28s", duration: "2.0s", size: 6,  rotate: "330deg" },
  { left: "33%", color: COLORS[7], delay: "0.06s", duration: "2.4s", size: 9,  rotate: "45deg" },
  { left: "41%", color: COLORS[0], delay: "0.32s", duration: "2.5s", size: 5,  rotate: "90deg" },
  { left: "49%", color: COLORS[1], delay: "0.14s", duration: "2.1s", size: 7,  rotate: "150deg" },
  { left: "57%", color: COLORS[2], delay: "0.24s", duration: "2.3s", size: 6,  rotate: "210deg" },
  { left: "65%", color: COLORS[3], delay: "0.02s", duration: "2.6s", size: 8,  rotate: "270deg" },
  { left: "73%", color: COLORS[4], delay: "0.38s", duration: "2.2s", size: 5,  rotate: "315deg" },
  { left: "81%", color: COLORS[5], delay: "0.16s", duration: "2.4s", size: 7,  rotate: "30deg" },
  { left: "89%", color: COLORS[6], delay: "0.26s", duration: "2.0s", size: 6,  rotate: "100deg" },
  { left: "96%", color: COLORS[7], delay: "0.42s", duration: "2.5s", size: 9,  rotate: "170deg" },
];

export function ConfettiParticles() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden"
      style={{ height: 360 }}
      aria-hidden="true"
    >
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.left,
            top: 0,
            width: p.size,
            height: p.size,
            borderRadius: i % 3 === 0 ? "50%" : "2px",
            background: p.color,
            transform: `rotate(${p.rotate})`,
            animation: `confetti-fall ${p.duration} ${p.delay} ease-in forwards`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}
