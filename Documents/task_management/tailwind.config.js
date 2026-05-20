/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        syne: ['Syne', 'sans-serif'],
      },
      colors: {
        ink:     '#0d0d0f',
        surface: '#f4f1ec',
        accent:  '#e85d2f',
        accent2: '#2f7de8',
        accent3: '#2ec47a',
        warn:    '#f5a623',
        muted:   '#9a9690',
        border:  '#e2ddd8',
      },
      animation: {
        'fade-up':    'fadeUp .3s ease both',
        'slide-left': 'slideLeft .5s cubic-bezier(.16,1,.3,1) both',
      },
      keyframes: {
        fadeUp:    { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'none' } },
        slideLeft: { from: { opacity: 0, transform: 'translateX(-18px)' }, to: { opacity: 1, transform: 'none' } },
      },
    },
  },
  plugins: [],
};