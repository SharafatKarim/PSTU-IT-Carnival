/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Dark violet/indigo surfaces — lifted off pure black.
        ink: {
          950: '#0c0820',
          900: '#140d31',
          800: '#1b1442',
          700: '#241a54',
          600: '#2f2368',
          500: '#3d2f82',
          400: '#4c3c9c',
        },
        // Light text on dark (slightly violet-tinted neutrals).
        mist: {
          100: '#f5f2ff',
          200: '#ddd6f7',
          300: '#b7abe0',
          400: '#8f83be',
          500: '#6f6499',
        },
        // Violet / purple — primary brand.
        grape: {
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        },
        // Magenta / fuchsia accent.
        magenta: {
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
        },
        // Electric cyan / aqua.
        aqua: {
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
        },
        // Gold / amber highlights.
        gold: {
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      backgroundImage: {
        // Purple -> magenta, the signature button / icon-tile gradient.
        carnival: 'linear-gradient(135deg, #7c3aed 0%, #c026d3 100%)',
        'carnival-soft':
          'linear-gradient(135deg, rgba(124,58,237,0.16) 0%, rgba(192,38,211,0.16) 100%)',
        // Layered neon glows for hero / CTA backgrounds.
        hero: 'radial-gradient(55% 55% at 18% 12%, rgba(124,58,237,0.38) 0%, transparent 60%), radial-gradient(45% 45% at 85% 18%, rgba(34,211,238,0.22) 0%, transparent 60%), radial-gradient(60% 60% at 55% 108%, rgba(192,38,211,0.30) 0%, transparent 62%)',
        // Faint grid overlay.
        grid: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
      },
      boxShadow: {
        'glow-grape': '0 0 44px -10px rgba(124,58,237,0.65)',
        'glow-magenta': '0 0 44px -10px rgba(192,38,211,0.6)',
        'glow-aqua': '0 0 40px -10px rgba(34,211,238,0.55)',
        'glow-gold': '0 0 34px -8px rgba(250,204,21,0.6)',
        card: '0 18px 50px -20px rgba(0,0,0,0.75)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.9s ease-out both',
        float: 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
