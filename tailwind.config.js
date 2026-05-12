/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: '#0b0f19',
        surface: '#111827',
        'surface-light': '#1a2236',
        'surface-hover': '#222d44',
        border: '#2a3450',
        accent: '#00d4aa',
        'accent-dim': '#00a88a',
        'accent-glow': 'rgba(0,212,170,0.12)',
        danger: '#ff4757',
        warning: '#ffb142',
        coral: '#ff6b6b',
        gold: '#ffd43b',
        sky: '#4dabf7',
        text: '#e2e8f0',
        muted: '#64748b',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}