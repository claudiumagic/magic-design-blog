import { useEffect, useRef, useState } from "react";

const MIN_DISTANCE = 16;
const BASE_SPEED = 0.014;
const SCROLL_DAMPING = 0.45;

export default function BackgroundLines() {
  const circlesRef = useRef([]);
  const scrollRef = useRef(0);
  const [ready, setReady] = useState(false);

  /* ============================
     SCROLL – calmare mișcare
     ============================ */
  useEffect(() => {
    const onScroll = () => {
      scrollRef.current = Math.min(window.scrollY / 600, 1);
      setReady(true); // 🔥 la primul scroll activăm sistemul complet
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ============================
     AȘTEPTĂM LAYOUT-UL
     ============================ */
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setReady(true);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  /* ============================
     ANIMAȚIE
     ============================ */
  useEffect(() => {
    if (!ready) return;

    let raf;
    const layout =
      document.querySelector(".layout-root") || document.body;
    const height = Math.max(layout.scrollHeight, window.innerHeight);

    const circles = circlesRef.current.map((c) => ({
      ...c,
      vx: (Math.random() - 0.5) * BASE_SPEED,
      vy: (Math.random() - 0.5) * BASE_SPEED
    }));

    const animate = () => {
      const damping = 1 - scrollRef.current * SCROLL_DAMPING;

      circles.forEach((c, i) => {
        c.x += c.vx * damping;
        c.y += c.vy * damping;

        c.vx += (Math.random() - 0.5) * 0.0005;
        c.vy += (Math.random() - 0.5) * 0.0005;

        c.vx = Math.max(-0.035, Math.min(0.035, c.vx));
        c.vy = Math.max(-0.035, Math.min(0.035, c.vy));

        // evitare suprapuneri
        circles.forEach((o, j) => {
          if (i === j) return;
          const dx = c.x - o.x;
          const dy = c.y - o.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = c.r + o.r + MIN_DISTANCE;
          if (dist < minDist && dist > 0) {
            const push = (minDist - dist) / dist * 0.015;
            c.x += dx * push;
            c.y += dy * push;
          }
        });

        if (c.x < -300) c.x = 1900;
        if (c.x > 1900) c.x = -300;
        if (c.y < -300) c.y = height + 300;
        if (c.y > height + 300) c.y = -300;

        c.el.setAttribute("cx", c.x);
        c.el.setAttribute("cy", c.y);
      });

      raf = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(raf);
  }, [ready]);

  /* ============================
     GENERARE – DENSITATE MICĂ LA START
     ============================ */

  const layoutHeight =
    document.querySelector(".layout-root")?.scrollHeight || window.innerHeight;

  const circles = [];
  const cols = ready ? 6 : 4; // 🔥 mai puține la start
  const rows = ready ? 8 : 5;

  const cellW = 1600 / cols;
  const cellH = layoutHeight / rows;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      circles.push({
        x: x * cellW + cellW / 2,
        y: y * cellH + cellH / 2,
        r: 90 + Math.random() * 160
      });
    }
  }

  return (
    <svg
      className="bg-circles"
      viewBox={`0 0 1600 ${layoutHeight}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {circles.map((c, i) => (
        <circle
          key={i}
          ref={(el) =>
            (circlesRef.current[i] = {
              el,
              x: c.x,
              y: c.y,
              r: c.r
            })
          }
          cx={c.x}
          cy={c.y}
          r={c.r}
          fill="none"
          stroke="var(--circle-stroke)"
          strokeWidth="1"
          opacity="0.12"
        />
      ))}
    </svg>
  );
}
