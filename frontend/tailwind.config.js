/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Legacy alias — kept for backward compat
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        // Neutral surface palette — Linear / Stripe inspired
        surface: {
          50:  '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
        },
        // Primary action color — Stripe-style indigo
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        // Secondary accent for gradients
        accent: {
          500: '#7c3aed',
          600: '#6d28d9',
          700: '#5b21b6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        '2xs': '0.6875rem',
      },
      boxShadow: {
        'card': '0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.04)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.06), 0 2px 4px 0 rgb(0 0 0 / 0.04)',
        'soft': '0 2px 8px 0 rgb(0 0 0 / 0.04)',
        'glow': '0 0 32px rgba(99,102,241,0.18)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='0.06'%3E%3Cpath d='M0 0h40v40H0z'/%3E%3C/g%3E%3C/svg%3E\")",
      },
      animation: {
        'slide-up':  'slide-up 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        'fade-in':   'fade-in 0.3s ease-out',
        'shimmer':   'shimmer 2.5s linear infinite',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.22,1,0.36,1) infinite',
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
      },
    },
  },
  plugins: [],
};
