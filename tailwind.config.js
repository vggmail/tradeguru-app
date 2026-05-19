/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        tv: {
          bg:       'rgb(var(--tv-bg) / <alpha-value>)',
          surface:  'rgb(var(--tv-surface) / <alpha-value>)',
          surface2: 'rgb(var(--tv-surface2) / <alpha-value>)',
          border:   'rgb(var(--tv-border) / <alpha-value>)',
          hover:    'rgb(var(--tv-hover) / <alpha-value>)',
          blue:     'rgb(var(--tv-blue) / <alpha-value>)',
          'blue-hover': '#1e53e5',
          green:    'rgb(var(--tv-green) / <alpha-value>)',
          red:      'rgb(var(--tv-red) / <alpha-value>)',
          yellow:   'rgb(var(--tv-yellow) / <alpha-value>)',
          purple:   '#9c27b0',
          orange:   '#ff9800',
          text:     'rgb(var(--tv-text) / <alpha-value>)',
          muted:    'rgb(var(--tv-muted) / <alpha-value>)',
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
