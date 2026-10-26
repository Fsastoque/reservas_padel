/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#08252B',
        court: '#0E4C5C',
        surface: '#F3F7F6',
        line: '#D9E4E1',
        ball: '#D7F25C',
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'system-ui', 'sans-serif'],
        sans: ['Barlow', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        court: '0 18px 40px -28px rgba(8, 37, 43, 0.55)',
      },
    },
  },
  plugins: [],
};
