/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  'var(--brand-50,  #fff0f3)',
          100: 'var(--brand-100, #ffdde4)',
          200: 'var(--brand-200, #ffc0cb)',
          400: 'var(--brand-400, #f06292)',
          500: 'var(--brand-500, #e91e63)',
          600: 'var(--brand-600, #c2185b)',
          700: 'var(--brand-700, #ad1457)',
        },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      boxShadow: {
        card: '0 1px 4px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)',
      },
      animation: {
        'slide-up': 'slideUp 0.25s ease-out',
        'fade-in':  'fadeIn 0.2s ease-out',
        shimmer:    'shimmer 1.5s infinite',
      },
      keyframes: {
        slideUp:  { '0%': { transform:'translateY(8px)', opacity:'0' }, '100%': { transform:'translateY(0)', opacity:'1' } },
        fadeIn:   { '0%': { opacity:'0' }, '100%': { opacity:'1' } },
        shimmer:  { '0%': { backgroundPosition:'-200% 0' }, '100%': { backgroundPosition:'200% 0' } },
      },
    },
  },
  plugins: [],
}
