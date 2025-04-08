/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist Sans', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
      colors: {
        kocAltBlue: {
          DEFAULT: '#152C4E'
        },
        // Knights of Columbus colors
        kocBlue: {
          DEFAULT: '#003DA5',
          50: '#E6F0FF',
          100: '#CCE0FF',
          200: '#99C2FF',
          300: '#66A3FF',
          400: '#3385FF',
          500: '#0066FF',
          600: '#0052CC',
          700: '#003DA5', // Primary KoC blue
          800: '#002966',
          900: '#001433',
        },
        kocRed: {
          DEFAULT: '#D80000',
          50: '#FFE6E6',
          100: '#FFCCCC',
          200: '#FF9999',
          300: '#FF6666',
          400: '#FF3333',
          500: '#FF0000',
          600: '#D80000', // Primary KoC red
          700: '#A50000',
          800: '#730000',
          900: '#400000',
        },
        kocGold: {
          DEFAULT: '#FFD100',
          50: '#FFFCE6',
          100: '#FFF9CC',
          200: '#FFF399',
          300: '#FFED66',
          400: '#FFE733',
          500: '#FFD100', // Primary KoC gold
          600: '#D6AF00',
          700: '#AD8D00',
          800: '#846C00',
          900: '#5B4A00',
        },
      },
    },
  },
  plugins: [],
};