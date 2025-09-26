import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(240 10% 4%)',
        foreground: 'hsl(210 40% 98%)',
        primary: {
          DEFAULT: '#ec4899',
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: '#8b5cf6',
          foreground: '#ffffff',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
