/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Legacy alias — backward compat
        brand: {
          50:  '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc',
          400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca',
          800: '#3730a3', 900: '#312e81', 950: '#1e1b4b',
        },
        // Neutral surface (zinc-based)
        surface: {
          50:  '#fafafa', 100: '#f4f4f5', 200: '#e4e4e7', 300: '#d4d4d8',
          400: '#a1a1aa', 500: '#71717a', 600: '#52525b', 700: '#3f3f46',
          800: '#27272a', 900: '#18181b', 950: '#09090b',
        },
        // Primary — NextNova electric indigo
        primary: {
          50:  '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc',
          400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca',
          800: '#3730a3', 900: '#312e81', 950: '#1e1b4b',
        },
        // Accent — deep violet/purple for gradient ends
        accent: {
          400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9',
          800: '#5b21b6', 900: '#4c1d95', 950: '#2e1065',
        },
        // NextNova-specific dark UI canvas
        nova: {
          950: '#070a16',  // deepest background
          900: '#0b0f1f',  // primary background
          850: '#101524',  // raised surface
          800: '#161b2c',  // card background
          700: '#1e2438',  // border / muted
          600: '#2a3148',  // hover surface
          500: '#3a4262',  // disabled
          400: '#5a6184',  // muted text
          300: '#8a92b2',  // secondary text
          200: '#b8bfdc',  // primary text muted
          100: '#dee3f5',  // primary text
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: { '2xs': '0.6875rem' },
      boxShadow: {
        'card':       '0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.04)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.06), 0 2px 4px 0 rgb(0 0 0 / 0.04)',
        'soft':       '0 2px 8px 0 rgb(0 0 0 / 0.04)',
        // NextNova premium glows
        'glow':       '0 0 32px rgba(99,102,241,0.18)',
        'glow-lg':    '0 0 64px rgba(99,102,241,0.25)',
        'glow-blue':  '0 0 32px rgba(59,130,246,0.25)',
        'glow-purple':'0 0 32px rgba(168,85,247,0.25)',
        // Dark UI shadows
        'dark-card':  '0 1px 2px 0 rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04) inset',
        'dark-hover': '0 8px 24px 0 rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06) inset',
      },
      borderRadius: { 'xl': '0.75rem', '2xl': '1rem' },
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='0.05'%3E%3Cpath d='M0 0h40v40H0z'/%3E%3C/g%3E%3C/svg%3E\")",
        'nova-radial':  'radial-gradient(ellipse at top, rgba(99,102,241,0.18), transparent 60%), radial-gradient(ellipse at bottom right, rgba(139,92,246,0.15), transparent 50%)',
        'nova-mesh':    'radial-gradient(at 0% 0%, rgba(59,130,246,0.18) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(139,92,246,0.18) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(99,102,241,0.18) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(168,85,247,0.18) 0px, transparent 50%)',
      },
      animation: {
        'slide-up':   'slide-up 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        'fade-in':    'fade-in 0.3s ease-out',
        'shimmer':    'shimmer 2.5s linear infinite',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.22,1,0.36,1) infinite',
        'aurora':     'aurora 16s ease infinite',
        'spin-slow':  'spin 12s linear infinite',
      },
      keyframes: {
        'slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-ring': {
          '0%':   { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(99,102,241,0.35)' },
          '70%':  { transform: 'scale(1)',    boxShadow: '0 0 0 18px rgba(99,102,241,0)' },
          '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(99,102,241,0)' },
        },
        'aurora': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
};
