'use client';

import Image from 'next/image';
import { BRAND } from '@/lib/brand';

/**
 * Path to the official NextNova logo PNG (mark + wordmark lockup).
 * Asset lives at /public/branding/nextnova-logo.png.
 * Dimensions: 1536 × 1024 → 3:2 aspect ratio · transparent background.
 *
 * The PNG has the dark navy "NextNova" wordmark baked into the raster.
 * It renders perfectly on light backgrounds (variant="dark"), but on
 * dark backgrounds the text disappears. For dark surfaces we render a
 * second mode (variant="light") that uses our SVG mark + live HTML
 * text in white. See <SvgLockupLight /> below.
 */
const LOGO_SRC = '/branding/nextnova-logo.png';
const LOGO_NATIVE_W = 1536;
const LOGO_NATIVE_H = 1024;
const LOGO_RATIO = LOGO_NATIVE_W / LOGO_NATIVE_H; // 1.5

/** Mobile minimum width — enforced via min-width style. */
const MIN_WIDTH_MOBILE = 100;

export type LogoVariant = 'light' | 'dark';

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
   * Collapsed mode — renders just the minimal SVG N mark (no wordmark).
   * Used in tight spots like a collapsed sidebar.
   */
  collapsed?: boolean;
  /** Legacy alias for `!collapsed`. */
  showText?: boolean;
  /** Adds an ambient glow halo behind the mark. */
  glow?: boolean;
  /** Extra classes on the wrapper. */
  className?: string;

  /**
   * Background mode the logo will sit on.
   *
   *   "dark"  (default) — official PNG lockup (gradient symbol +
   *                       DARK navy wordmark). Designed for light
   *                       backgrounds: landing, login, portal, white
   *                       cards, etc.
   *
   *   "light"           — SVG mark + WHITE "NextNova" wordmark.
   *                       Designed for dark backgrounds: sidebar,
   *                       splash, any dark-themed surface.
   */
  variant?: LogoVariant;

  /** Backward-compat shims for older call sites. Accepted but unused. */
  textClassName?: string;
  taglineClassName?: string;
}

/**
 * Official NextNova logo — single source of truth across the app.
 *
 * Render modes:
 *
 *   1. variant="dark" (default) — full PNG lockup. Best on light bg.
 *      <Logo width={180} />                          // PNG, dark text
 *
 *   2. variant="light"          — SVG mark + white HTML text.
 *      <Logo width={150} variant="light" />          // for dark bg
 *
 *   3. collapsed                — square SVG N mark only (no text).
 *      <Logo collapsed width={40} />                 // tight spaces
 *
 * Mobile safety:
 *   - Lockup enforces min-width 100px so it never becomes illegible.
 *   - Aspect ratio locked at 3:2 — never stretches or crops.
 *
 * Source asset: /public/branding/nextnova-logo.png
 * Edit the file to update the official logo. Do NOT edit colors here.
 */
export default function Logo({
  width,
  size = 32,
  collapsed,
  showText,
  glow = false,
  className = '',
  variant = 'dark',
  textClassName: _textClassName,
  taglineClassName: _taglineClassName,
}: LogoProps) {
  const isCollapsed = collapsed === true || showText === false;

  // ── Collapsed mark — square SVG N (same in both variants) ──
  if (isCollapsed) {
    const side = width ?? size;
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

  // Resolve dimensions
  const renderedWidth = width ?? Math.round(size * LOGO_RATIO);
  const renderedHeight = Math.round(renderedWidth / LOGO_RATIO);

  // ── variant="light" — SVG mark + white wordmark ──
  if (variant === 'light') {
    return (
      <SvgLockupLight
        width={renderedWidth}
        height={renderedHeight}
        glow={glow}
        className={className}
      />
    );
  }

  // ── variant="dark" (default) — official PNG lockup ──
  return (
    <span
      className={`inline-flex shrink-0 ${className}`}
      style={{
        width: renderedWidth,
        height: renderedHeight,
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
 * Light-variant lockup — for use on dark surfaces (sidebar, dark hero, etc.)
 *
 * Composition:
 *   [SVG gradient N mark]   NextNova
 *      ~ container height   white, bold, tracking-tight
 *
 * The SVG mark uses the same cyan→blue→violet gradient as the official
 * PNG mark. The wordmark is rendered as live HTML text in white — fully
 * legible against any dark background and matches the proportions of
 * the official PNG lockup (mark sits at ~33% of total width).
 */
function SvgLockupLight({
  width, height, glow, className,
}: { width: number; height: number; glow?: boolean; className: string }) {
  const markSize = Math.round(height * 0.95);
  const fontSize = Math.round(height * 0.50);
  const gap      = Math.round(height * 0.12);

  return (
    <span
      className={`inline-flex shrink-0 items-center ${className}`}
      style={{
        width,
        height,
        gap,
        minWidth: Math.min(MIN_WIDTH_MOBILE, width),
        filter: glow ? `drop-shadow(0 0 14px rgba(99,102,241,0.45))` : undefined,
      }}
      aria-label={BRAND.name}
      role="img"
    >
      <span
        className="flex-shrink-0 inline-flex"
        style={{ width: markSize, height: markSize }}
      >
        <MarkSvg />
      </span>
      <span
        className="font-bold tracking-tight text-white whitespace-nowrap leading-none select-none"
        style={{ fontSize }}
      >
        {BRAND.name}
      </span>
    </span>
  );
}

/**
 * Minimal mark for collapsed contexts and the light-variant lockup.
 * Inline SVG with the official cyan→blue→violet ribbon gradient.
 * Scales perfectly at any size.
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
