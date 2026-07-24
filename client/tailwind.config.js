/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4fb',
          100: '#d9e2f3',
          200: '#b3c5e7',
          300: '#7d9bd2',
          400: '#4f76b8',
          500: '#2f5a99',
          600: '#1f3f73',
          700: '#172e55',
          800: '#0f1f3b',
          900: '#0a1428',
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
        'pstu-gradient':
          'linear-gradient(135deg, #0a1428 0%, #1f3f73 50%, #2f5a99 100%)',
      },
    },
  },
  plugins: [],
};
