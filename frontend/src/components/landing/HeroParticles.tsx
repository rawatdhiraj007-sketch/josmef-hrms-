'use client';

import { useMemo } from 'react';

interface HeroParticlesProps {
  /** How many particles to render. Default 18. Keep small for perf. */
  count?: number;
  /** Optional className for the wrapper */
  className?: string;
}

/**
 * Decorative floating particle field for the hero section.
 *
 * - Pure CSS keyframe animation (no JS frame loop, no canvas, no deps)
 * - Each particle has random size / position / delay / duration
 * - Honors prefers-reduced-motion via the global keyframe rule
 * - Marked aria-hidden — purely decorative
 *
 * Bundle cost: ~0 KB beyond the component shell.
 */
export default function HeroParticles({ count = 18, className = '' }: HeroParticlesProps) {
  // Generate stable positions ONCE per mount so they don't shift on re-render.
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      // Deterministic-ish pseudo-random based on index — avoids hydration mismatch.
      const seed = (i * 9301 + 49297) % 233280;
      const rand = (max: number, offset = 0) => offset + ((seed * (i + 1)) % max);
      return {
        id: i,
        left: rand(95, 2),               // 2-97 %
        top: rand(85, 5),                // 5-90 %
        size: 3 + (i % 4) * 2,           // 3, 5, 7, 9 px
        delay: -(i * 0.7) % 8,           // stagger
        duration: 9 + (i % 5) * 2,       // 9-17 s
        hue: i % 3 === 0
          ? 'bg-primary-400/60'          // blue
          : i % 3 === 1
            ? 'bg-accent-400/60'         // violet
            : 'bg-cyan-300/50',          // cyan
      };
    });
  }, [count]);

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {particles.map((p) => (
        <span
          key={p.id}
          className={`nn-particle absolute rounded-full ${p.hue}`}
          style={{
            left:   `${p.left}%`,
            top:    `${p.top}%`,
            width:  p.size,
            height: p.size,
            animation: `nn-particle-float ${p.duration}s ease-in-out ${p.delay}s infinite`,
            filter: 'blur(0.5px)',
            boxShadow: `0 0 ${p.size * 2}px currentColor`,
          }}
        />
      ))}
    </div>
  );
}
