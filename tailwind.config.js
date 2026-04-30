/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 18px 52px rgba(20, 28, 38, 0.10)',
        glass: '0 20px 64px rgba(15, 23, 42, 0.14)',
        card: '0 24px 70px rgba(15, 23, 42, 0.16), 0 8px 24px rgba(15, 23, 42, 0.08)',
        action: '0 14px 34px rgba(15, 23, 42, 0.12)',
      },
    },
  },
  plugins: [],
};
