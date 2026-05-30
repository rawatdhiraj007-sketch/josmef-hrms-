/**
 * Color utilities for runtime theming.
 *
 * Given a single hex color (e.g. #4f46e5), generates a full 50→900 shade
 * scale by interpolating toward white (lighter shades) and black (darker).
 *
 * Used by Theme Studio to swap the entire app palette from one chosen color.
 */

export interface RGB { r: number; g: number; b: number }

export function hexToRgb(hex: string): RGB | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  return m
    ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
    : null;
}

export function rgbToHex({ r, g, b }: RGB): string {
  const h = (n: number) => n.toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

/** Mix two RGB colors. ratio 0 = a, ratio 1 = b */
function mix(a: RGB, b: RGB, ratio: number): RGB {
  return {
    r: Math.round(a.r + (b.r - a.r) * ratio),
    g: Math.round(a.g + (b.g - a.g) * ratio),
    b: Math.round(a.b + (b.b - a.b) * ratio),
  };
}

const WHITE: RGB = { r: 255, g: 255, b: 255 };
const BLACK: RGB = { r: 0,   g: 0,   b: 0   };

/**
 * Generate a Tailwind-style 50→900 shade scale from a single base color.
 * The base color anchors at shade 500. Lighter shades blend toward white,
 * darker shades blend toward black with a slight saturation preserve.
 *
 * Returns an object { '50': RGB, '100': RGB, ..., '900': RGB }
 */
export function generateShades(baseHex: string): Record<string, RGB> {
  const base = hexToRgb(baseHex) ?? { r: 99, g: 102, b: 241 };
  return {
    '50':  mix(base, WHITE, 0.92),
    '100': mix(base, WHITE, 0.82),
    '200': mix(base, WHITE, 0.66),
    '300': mix(base, WHITE, 0.46),
    '400': mix(base, WHITE, 0.22),
    '500': base,
    '600': mix(base, BLACK, 0.10),
    '700': mix(base, BLACK, 0.22),
    '800': mix(base, BLACK, 0.36),
    '900': mix(base, BLACK, 0.50),
  };
}

/**
 * Format an RGB object as " R G B " (Tailwind-CSS-var compatible).
 * Used like `--accent-500: 99 102 241;` so it can be used as
 * `rgb(var(--accent-500))` or `rgb(var(--accent-500) / 0.5)`.
 */
export function rgbToCssVar(rgb: RGB): string {
  return `${rgb.r} ${rgb.g} ${rgb.b}`;
}

/**
 * Apply a full primary + accent palette to the document root.
 * Writes --accent-50 through --accent-900 (used by .bg-accent etc.)
 * and --primary-50 through --primary-900 (future-proof).
 */
export function applyColorPalette(primaryHex: string, accentHex: string): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const accentShades  = generateShades(accentHex);
  const primaryShades = generateShades(primaryHex);

  for (const [shade, rgb] of Object.entries(accentShades)) {
    root.style.setProperty(`--accent-${shade}`,  rgbToCssVar(rgb));
  }
  for (const [shade, rgb] of Object.entries(primaryShades)) {
    root.style.setProperty(`--primary-${shade}`, rgbToCssVar(rgb));
  }
}

/** Strip all applied custom color overrides — reverts to stylesheet defaults. */
export function resetColorPalette(): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  for (const shade of ['50','100','200','300','400','500','600','700','800','900']) {
    root.style.removeProperty(`--accent-${shade}`);
    root.style.removeProperty(`--primary-${shade}`);
  }
}

/**
 * Map a custom theme's density choice to the valid useTheme density values.
 * (Theme Studio has 3 levels including "cozy"; useTheme only has 2.)
 */
export function mapDensityForUseTheme(density: 'compact' | 'comfortable' | 'cozy'): 'compact' | 'comfortable' {
  return density === 'compact' ? 'compact' : 'comfortable';
}
