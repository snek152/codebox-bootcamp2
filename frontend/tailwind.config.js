/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist Variable', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono Variable', 'ui-monospace', 'monospace'],
      },
      transitionTimingFunction: {
        fluid: 'cubic-bezier(0.32,0.72,0,1)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)', filter: 'blur(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)', filter: 'blur(0)' },
        },
        'ring-pulse': {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(2.6)', opacity: '0' },
        },
        'orb-drift': {
          '0%': { transform: 'translate(0,0) scale(1)' },
          '50%': { transform: 'translate(3%,-4%) scale(1.08)' },
          '100%': { transform: 'translate(0,0) scale(1)' },
        },
        'trace-scroll': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 900ms cubic-bezier(0.32,0.72,0,1) both',
        'ring-pulse': 'ring-pulse 900ms cubic-bezier(0.32,0.72,0,1)',
        'orb-drift': 'orb-drift 22s cubic-bezier(0.32,0.72,0,1) infinite',
        'orb-drift-slow': 'orb-drift 32s cubic-bezier(0.32,0.72,0,1) infinite',
        'trace-scroll': 'trace-scroll 8s linear infinite',
      },
    },
  },
  plugins: [],
}
