/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        mc: {
          yellow:  '#FFD700',
          purple:  '#5b21b6',
          indigo:  '#4338ca',
          blue:    '#2563eb',
          teal:    '#06b6d4',
          light:   '#ede9fe',
          card:    '#ffffff',
          bg:      '#f5f3ff',
          border:  '#ddd6fe',
          dark:    '#1e1b4b',
          text:    '#1e1b4b',
          muted:   '#6b7280',
        },
      },
      animation: {
        'float':      'float 4s ease-in-out infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'slide-up':   'slideUp 0.5s ease-out',
        'badge-pop':  'badgePop 0.4s cubic-bezier(0.175,0.885,0.32,1.275)',
        'shimmer':    'shimmer 2s infinite',
        'glow':       'glow 2.5s ease-in-out infinite',
      },
      keyframes: {
        float:    { '0%,100%': { transform: 'translateY(0) rotate(0deg)' }, '50%': { transform: 'translateY(-10px) rotate(2deg)' } },
        slideUp:  { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        badgePop: { from: { opacity: '0', transform: 'scale(0.5)' }, to: { opacity: '1', transform: 'scale(1)' } },
        shimmer:  { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        glow:     { '0%,100%': { boxShadow: '0 0 15px rgba(91,33,182,0.4)' }, '50%': { boxShadow: '0 0 35px rgba(91,33,182,0.7)' } },
      },
      fontFamily: {
        display: ['"Nunito"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
