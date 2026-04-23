/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#534AB7',
          hover: '#6158d1',
          muted: '#3b3490',
        },
        ink: {
          950: '#0a0a0b',
          900: '#101012',
          800: '#17171b',
          700: '#22222a',
          400: '#8a8a93',
          300: '#b8b8c0',
          100: '#ededf0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      container: {
        center: true,
        padding: '1.25rem',
        screens: {
          '2xl': '1200px',
        },
      },
    },
  },
  plugins: [],
};
