/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#1E90FF',
          deep: '#0B3D91',
          light: '#60AFFF',
        },
        bg: {
          DEFAULT: '#0a0a0a',
          card: '#111827',
          hover: '#1a2235',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #1E90FF 0%, #0B3D91 100%)',
        'gradient-card': 'linear-gradient(145deg, rgba(30,144,255,0.08) 0%, rgba(11,61,145,0.04) 100%)',
      },
      borderRadius: {
        card: '1rem',
        button: '0.75rem',
      },
      boxShadow: {
        glow: '0 0 24px rgba(30,144,255,0.25), 0 4px 24px rgba(0,0,0,0.4)',
        button: '0 4px 16px rgba(30,144,255,0.35)',
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out forwards',
      },
    },
  },
  plugins: [],
}
