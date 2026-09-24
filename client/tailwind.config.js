/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    fontFamily: {
      sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
    },
    extend: {
      colors: {
        brand: {
          bg: '#F8F7F0',
          card: '#FFFFFF',
          text: '#13201A',
          muted: '#66736C',
          border: '#E2E5DF',
        },
        primary: {
          lighter: '#DDF1E5',
          light: '#CFE5D5',
          main: '#0B5D3B',
          dark: '#06452C',
          darker: '#032B1B',
        },
        orangeAccent: {
          DEFAULT: '#FF6B1A',
          hover: '#E55A0F',
          light: '#FFE4D2',
        },
        sage: {
          light: '#DDF1E5',
          DEFAULT: '#CFE5D5',
          dark: '#93BBA0',
        },
        lavender: {
          light: '#F3EFFF',
          DEFAULT: '#E9E3FF',
          dark: '#7C67E6',
        },
        darkPill: {
          DEFAULT: '#0B5D3B',
          hover: '#06452C',
        },
        pastel: {
          pink: '#FCE7F3',
          pinkDark: '#FBCFE8',
          peach: '#FFE4E6',
          peachLight: '#FFF1F2',
          cream: '#F8F7F0',
          creamLight: '#FCFBF7',
          mint: '#DDF1E5',
          mintDark: '#0B5D3B',
          blue: '#E0F2FE',
          blueDark: '#0369A1',
          rose: '#FFE5D9',
        },
        gray: {
          50: '#F8F7F0',
          100: '#F1F0E9',
          200: '#E2E5DF',
          300: '#C5C9C3',
          400: '#9BA29B',
          500: '#66736C',
          600: '#48554E',
          700: '#313C36',
          800: '#1F2823',
          900: '#13201A',
        },
        success: { main: '#0B5D3B', dark: '#06452C', light: '#DDF1E5' },
        warning: { main: '#FF6B1A', dark: '#C44C09', light: '#FFE4D2' },
        error: { main: '#E53E3E', dark: '#9B1C1C', light: '#FED7D7' },
        info: { main: '#3182CE', dark: '#1A365D', light: '#EBF8FF' },
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '32px',
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(11, 93, 59, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        soft: '0 10px 30px -5px rgba(19, 32, 26, 0.06)',
        dropdown: '0 10px 25px -5px rgba(19, 32, 26, 0.1), 0 0 1px 1px rgba(226, 229, 223, 0.8)',
        dialog: '0 20px 40px -10px rgba(19, 32, 26, 0.15)',
      },
      width: {
        sidebar: '280px',
        'sidebar-collapsed': '88px',
      }
    },
  },
  plugins: [],
}
