/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        charcoal: '#121212',
        gain: '#10B981',
        loss: '#F43F5E',
      },
      boxShadow: {
        glass: '0 1px 2px 0 rgba(255,255,255,0.06) inset, 0 8px 32px rgba(0,0,0,0.35)'
      },
    },
  },
  plugins: [],
}
