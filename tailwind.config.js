/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 18px 60px rgba(20, 28, 38, 0.14)',
        glass: '0 20px 70px rgba(15, 23, 42, 0.18)',
        card: '0 30px 90px rgba(15, 23, 42, 0.28)',
        action: '0 18px 45px rgba(15, 23, 42, 0.16)',
      },
    },
  },
  plugins: [],
};
