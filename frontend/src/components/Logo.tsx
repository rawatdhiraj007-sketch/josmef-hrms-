'use client';

import Image from 'next/image';
import { BRAND } from '@/lib/brand';

/**
 * Path to the official NextNova logo PNG (mark + wordmark lockup).
 * Asset lives at /public/branding/nextnova-logo.png.
 * Dimensions: 1536 × 1024 → 3:2 aspect ratio · transparent background.
 */
const LOGO_SRC = '/branding/nextnova-logo.png';
const LOGO_NATIVE_W = 1536;
const LOGO_NATIVE_H = 1024;
const LOGO_RATIO = LOGO_NATIVE_W / LOGO_NATIVE_H; // 1.5

/** Mobile minimum width — enforced via min-width style. */
const MIN_WIDTH_MOBILE = 100;

interface LogoProps {
  /**
   * Width in pixels — PREFERRED API. Drives both dimensions
   * (height = width / 1.5). Aspect ratio always preserved.
   */
  width?: number;
  /**
   * Height in pixels — legacy API. Used when `width` is not
   * provided. Width derives from native 3:2 aspect ratio.
   * Default: 32 px (≈ 48 px wide).
   */
  size?: number;
  /**
   * Collapsed mode — renders just the minimal SVG N mark
   * (no wordmark). Used in tight spots like a collapsed sidebar.
   * `width` (or `size`) becomes the SQUARE side length.
   * Equivalent to legacy `showText={false}`.
   */
  collapsed?: boolean;
  /** Legacy alias for `!collapsed`. */
  showText?: boolean;
  /** Adds an ambient glow halo behind the mark. */
  glow?: boolean;
  /** Extra classes on the wrapper. */
  className?: string;

  /**
   * Cosmetic-only — preserved for backward compatibility with
   * existing call sites. The PNG already encodes its own colors
   * so this is a no-op for the lockup view.
   */
  variant?: 'light' | 'dark' | 'auto';

  /**
   * Backward-compat shims for older call sites — accepted but unused.
   * The wordmark now lives inside the PNG, so per-call-site text
   * styling is moot.
   */
  textClassName?: string;
  taglineClassName?: string;
}

/**
 * Official NextNova logo — single source of truth across the app.
 *
 * Two render modes:
 *
 *   1. Default — full lockup PNG (mark + wordmark)
 *      <Logo width={180} />          // 180w × 120h
 *      <Logo size={42} />            // 42h × 63w (legacy height-based)
 *
 *   2. Collapsed — minimal square SVG N mark (no wordmark)
 *      <Logo collapsed width={40} /> // 40 × 40
 *
 * The lockup uses next/image (optimized, responsive srcset).
 * The collapsed mark uses an inline SVG (no network round-trip,
 * scales perfectly at tiny sizes).
 *
 * Mobile safety:
 *   - Lockup enforces a minimum 100px width via inline style so the
 *     logo never becomes illegible on narrow screens.
 *   - Aspect ratio locked at 3:2 — never stretches or crops.
 *
 * Source asset: /public/branding/nextnova-logo.png
 * Edit the file to update the logo. Do NOT edit colors here.
 */
export default function Logo({
  width,
  size = 32,
  collapsed,
  showText,
  glow = false,
  className = '',
  variant: _variant = 'auto',
  textClassName: _textClassName,
  taglineClassName: _taglineClassName,
}: LogoProps) {
  // Resolve mode: `collapsed` wins, then legacy `showText={false}`,
  // otherwise full lockup.
  const isCollapsed = collapsed === true || showText === false;

  // ── Collapsed mark — square SVG N ──
  if (isCollapsed) {
    const side = width ?? size; // square either way
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center ${className}`}
        style={{
          width: side,
          height: side,
          filter: glow ? `drop-shadow(0 0 12px rgba(59,130,246,0.45))` : undefined,
        }}
        aria-label={BRAND.name}
        role="img"
      >
        <MarkSvg />
      </span>
    );
  }

  // ── Full lockup ──
  // If `width` provided it drives. Otherwise derive from height (`size`).
  const renderedWidth = width ?? Math.round(size * LOGO_RATIO);
  const renderedHeight = Math.round(renderedWidth / LOGO_RATIO);

  return (
    <span
      className={`inline-flex shrink-0 ${className}`}
      style={{
        width: renderedWidth,
        height: renderedHeight,
        // Enforced mobile floor: never below MIN_WIDTH_MOBILE px wide.
        minWidth: Math.min(MIN_WIDTH_MOBILE, renderedWidth),
        filter: glow ? `drop-shadow(0 0 14px rgba(99,102,241,0.35))` : undefined,
      }}
    >
      <Image
        src={LOGO_SRC}
        alt={BRAND.name}
        width={LOGO_NATIVE_W}
        height={LOGO_NATIVE_H}
        priority
        sizes={`${renderedWidth}px`}
        className="w-full h-full object-contain select-none"
        draggable={false}
      />
    </span>
  );
}

/**
 * Minimal mark for collapsed contexts (no room for the wordmark).
 * Inspired by the official lockup's ribbon-N silhouette.
 */
function MarkSvg() {
  return (
    <svg
      viewBox="0 0 40 40"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="nnMarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#06B6D4" />
          <stop offset="50%"  stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <path
        d="M8 32 L8 8 L14 8 L14 22 L26 8 L32 8 L32 32 L26 32 L26 18 L14 32 Z"
        fill="url(#nnMarkGrad)"
      />
    </svg>
  );
}
