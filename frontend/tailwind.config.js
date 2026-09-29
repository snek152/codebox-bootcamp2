/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      keyframes: {
        'level-up-pulse': {
          '0%': { transform: 'scale(1)' },
          '30%': { transform: 'scale(1.08)' },
          '60%': { transform: 'scale(0.98)' },
          '100%': { transform: 'scale(1)' },
        },
        'card-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'level-up-pulse': 'level-up-pulse 0.6s ease-in-out',
        'card-in': 'card-in 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
