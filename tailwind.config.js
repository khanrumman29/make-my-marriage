/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F8F6F0',
        surface: {
          DEFAULT: '#FFFFFF',
          soft: '#F1EFE7',
        },
        forest: {
          DEFAULT: '#24483F',
          hover: '#1B3932',
          tint: '#E8EFEB',
          deep: '#18312B',
        },
        gold: {
          DEFAULT: '#B79A62',
          hover: '#9E824E',
          tint: '#F3EBDD',
          light: '#F8F3EA',
        },
        ink: {
          DEFAULT: '#252923',
          light: '#3C4039',
        },
        muted: '#73776F',
        border: {
          DEFAULT: '#E7E4DB',
          dark: '#D5D0C3',
        },
        success: {
          DEFAULT: '#39765A',
          tint: '#E7F2EC',
        },
        warning: {
          DEFAULT: '#A56A2A',
          tint: '#FDF3E7',
        },
        danger: {
          DEFAULT: '#B64C48',
          tint: '#FCEEEC',
        },
        info: {
          DEFAULT: '#466A86',
          tint: '#EBF2F7',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        control: '10px',
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(37, 41, 35, 0.04), 0 1px 2px -1px rgba(37, 41, 35, 0.02)',
        elevated: '0 4px 16px -2px rgba(37, 41, 35, 0.06), 0 2px 4px -2px rgba(37, 41, 35, 0.04)',
      },
    },
  },
  plugins: [],
}
