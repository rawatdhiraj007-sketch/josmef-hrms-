'use client';

import Image from 'next/image';
import { BRAND } from '@/lib/brand';

/**
 * Path to the official NextNova logo PNG (mark + wordmark lockup).
 * Asset lives at /public/branding/nextnova-logo.png.
 * Dimensions: 1536 × 1024, transparent background, 3:2 aspect ratio.
 */
const LOGO_SRC = '/branding/nextnova-logo.png';
const LOGO_NATIVE_W = 1536;
const LOGO_NATIVE_H = 1024;

interface LogoProps {
  /**
   * Height in pixels. Width is derived automatically from the
   * native 3:2 aspect ratio so the lockup never distorts.
   * Default: 32px.
   */
  size?: number;
  /**
   * When false, falls back to a minimal SVG mark (no wordmark) —
   * useful for very tight spots like a collapsed sidebar.
   * Default: true (renders the full PNG lockup).
   */
  showText?: boolean;
  /** Extra classes on the logo image (e.g. opacity tweaks). */
  className?: string;
  /**
   * Adds an ambient glow halo behind the mark (good for dark
   * surfaces). Default: false.
   */
  glow?: boolean;
  /**
   * Cosmetic-only — preserved for backward compatibility with
   * existing call sites. The official PNG already encodes its own
   * color treatment, so this is a no-op for the lockup view.
   * Still applied to the SVG-mark fallback so dark/light tints work.
   */
  variant?: 'light' | 'dark' | 'auto';

  /**
   * Backward-compat shim — older call sites passed text-related
   * className props. The official lockup already includes the
   * wordmark inside the PNG, so the separate text was removed.
   * These remain accepted but unused.
   */
  textClassName?: string;
  taglineClassName?: string;
}

/**
 * Official NextNova logo.
 *
 * - Default: full lockup (mark + wordmark) loaded from
 *   /branding/nextnova-logo.png via next/image (optimized + lazy).
 * - showText=false: minimal SVG mark only — used in the collapsed
 *   sidebar where there's no room for the wordmark.
 * - Aspect ratio is locked to the native 3:2 so the logo never
 *   stretches or crops.
 * - Transparent background preserved in the source PNG.
 *
 * Edit the source file at /public/branding/nextnova-logo.png to
 * update the logo. Do not edit colors / shape here.
 */
export default function Logo({
  size = 32,
  showText = true,
  className = '',
  glow = false,
  variant: _variant = 'auto',
  textClassName: _textClassName,
  taglineClassName: _taglineClassName,
}: LogoProps) {
  // Mark-only fallback for ultra-tight spots (collapsed sidebar).
  if (!showText) {
    return (
      <span
        className={`inline-flex shrink-0 ${className}`}
        style={{
          width: size,
          height: size,
          filter: glow ? `drop-shadow(0 0 12px rgba(99,102,241,0.45))` : undefined,
        }}
        aria-label={BRAND.name}
        role="img"
      >
        <MarkSvg />
      </span>
    );
  }

  // Default: full lockup PNG.
  // Width derived from native aspect ratio so the image never warps.
  const renderedWidth = Math.round(size * (LOGO_NATIVE_W / LOGO_NATIVE_H));

  return (
    <span
      className={`inline-flex shrink-0 ${className}`}
      style={{
        height: size,
        width: renderedWidth,
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
 * Minimal mark used when there's no room for the wordmark
 * (e.g. collapsed sidebar). A simple ribbon-style N inspired by
 * the official lockup, in a single gradient.
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
      {/* Stylized N — left stroke, diagonal, right stroke */}
      <path
        d="M8 32 L8 8 L14 8 L14 22 L26 8 L32 8 L32 32 L26 32 L26 18 L14 32 Z"
        fill="url(#nnMarkGrad)"
      />
    </svg>
  );
}
