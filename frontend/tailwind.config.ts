import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#E8652A',
          hover: '#D4541A',
          light: '#FFF0EA',
          muted: '#F5D4C4',
        },
        gold: {
          DEFAULT: '#F5A623',
          light: '#FFF8E6',
        },
        cream: '#FDFAF4',
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'warm-sm': '0 2px 8px rgba(28, 25, 23, 0.06)',
        'warm': '0 4px 20px rgba(28, 25, 23, 0.10)',
        'warm-lg': '0 8px 40px rgba(28, 25, 23, 0.15)',
        'brand': '0 4px 20px rgba(232, 101, 42, 0.35)',
        'brand-lg': '0 8px 32px rgba(232, 101, 42, 0.45)',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        popIn: {
          '0%': { transform: 'scale(0.85)', opacity: '0' },
          '70%': { transform: 'scale(1.05)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseBrand: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(232, 101, 42, 0.5)' },
          '50%': { boxShadow: '0 0 0 10px rgba(232, 101, 42, 0)' },
        },
      },
      animation: {
        'slide-up': 'slideUp 0.4s cubic-bezier(0.32, 0.72, 0, 1)',
        'fade-in': 'fadeIn 0.25s ease-out',
        'pop-in': 'popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'pulse-brand': 'pulseBrand 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;