/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        tv: {
          bg:       '#131722',
          surface:  '#1e222d',
          surface2: '#2a2e39',
          border:   '#2a2e39',
          hover:    '#363a45',
          blue:     '#2962ff',
          'blue-hover': '#1e53e5',
          green:    '#26a69a',
          red:      '#ef5350',
          yellow:   '#f7b500',
          purple:   '#9c27b0',
          orange:   '#ff9800',
          text:     '#d1d4dc',
          muted:    '#787b86',
          subtle:   '#b2b5be',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #2962ff44' },
          '100%': { boxShadow: '0 0 20px #2962ff88, 0 0 40px #2962ff33' },
        },
      },
    },
  },
  plugins: [],
}
