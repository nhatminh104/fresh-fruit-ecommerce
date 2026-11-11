/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EAF5E8',
          100: '#D5EBD2',
          200: '#ABDAA5',
          500: '#2E7D32',
          600: '#256729',
          700: '#1B5E20',
          800: '#144618',
          900: '#0E3111',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          subtle: '#F8FAF7',
          muted: '#F1F5F0',
          border: '#E5EAE5',
        },
        ink: {
          DEFAULT: '#263238',
          muted: '#647067',
          light: '#94A398',
        },
        accent: {
          DEFAULT: '#F59E0B',
          hover: '#D97706',
          light: '#FEF3C7',
        },
        // Compatibility aliases with new brand colors:
        forest: '#1B5E20',
        leaf: '#2E7D32',
        cream: '#FFFFFF',
        'cream-alt': '#F8FAF7',
        orange: '#F59E0B',
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        display: ['DM Serif Display', 'serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
        card: '0 4px 20px -2px rgba(46, 125, 50, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        elevated: '0 12px 32px -4px rgba(46, 125, 50, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.06)',
      }
    }
  },
  plugins: []
};
