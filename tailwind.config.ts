import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#09111f',
        mist: '#8ba4c6',
        glow: '#84ccff',
      },
      boxShadow: {
        panel: '0 24px 80px rgba(8, 19, 38, 0.28)',
      },
    },
  },
  plugins: [],
} satisfies Config;
