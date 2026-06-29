/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Venezuela flag colors
        vzla: {
          yellow: '#D4A017',
          blue: '#003893',
          red: '#CF142B',
        },
        // Brand chrome — esmerald green as the unified primary action color.
        brand: {
          DEFAULT: '#059669',
          dark: '#047857',
          darker: '#065F46',
          light: '#10B981',
          tint: '#ECFDF5',
        },
        // Functional map-legend colors (one per layer) — kept distinct.
        acopio: '#1D9E75',
        hospital: '#E24B4A',
        emergencia: '#E24B4A',
        personas: '#D4537E',
        infra: '#BA7517',
        necesidades: '#534AB7',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(16,24,40,.06), 0 1px 3px 0 rgba(16,24,40,.10)',
        panel: '0 10px 40px -8px rgba(16,24,40,.25)',
      },
    },
  },
  plugins: [],
}
