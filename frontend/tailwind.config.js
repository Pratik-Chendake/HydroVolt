/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Deep obsidian blacks
        black: '#000000',
        obsidian: {
          950: '#020408',
          900: '#050811',
          850: '#090E1A',
          800: '#0E1626',
          700: '#18233C',
          600: '#25355A',
        },
        navy: {
          950: '#050811',
          900: '#080D1A',
          850: '#0C1326',
          800: '#101B36',
          750: '#18274C',
          700: '#203260',
          600: '#2C4480',
        },
        // Cyber Blue Palette
        cyber: {
          blue: '#0070F3',
          cyan: '#00D2FF',
          sky: '#38BDF8',
          royal: '#1D4ED8',
          dark: '#0B2559',
        },
        // Neon Rose Cyberpunk Palette
        neon: {
          rose: '#FF007F',
          pink: '#FF1493',
          fuchsia: '#D946EF',
          light: '#FF66B2',
          hot: '#FF2A85',
          deep: '#99004C',
        },
        brand: {
          cyan: '#00D2FF',
          aqua: '#00F5D4',
          teal: '#20B2AA',
          emerald: '#10B981',
          electric: '#0070F3',
          rose: '#FF007F',
          danger: '#EF4444',
          warning: '#F59E0B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'liquid-glass': '0 12px 40px 0 rgba(0, 0, 0, 0.65), inset 0 1px 1px 0 rgba(255, 255, 255, 0.16), inset 0 -1px 2px 0 rgba(0, 0, 0, 0.5)',
        'liquid-glow-rose': '0 0 35px -5px rgba(255, 0, 127, 0.45), inset 0 1px 1px 0 rgba(255, 255, 255, 0.25)',
        'liquid-glow-blue': '0 0 35px -5px rgba(0, 210, 255, 0.45), inset 0 1px 1px 0 rgba(255, 255, 255, 0.25)',
        'neomorph-convex': '8px 8px 18px rgba(0,0,0,0.8), -5px -5px 14px rgba(255,255,255,0.03)',
        'neomorph-concave': 'inset 4px 4px 10px rgba(0,0,0,0.85), inset -3px -3px 8px rgba(255,255,255,0.04)',
        'clay-card': 'inset 0 -4px 8px rgba(0,0,0,0.6), inset 0 3px 6px rgba(255,255,255,0.18), 0 12px 28px rgba(0,0,0,0.7)',
        'spatial-float': '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 30px -5px rgba(0, 112, 243, 0.2)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-rose': 'pulse-rose 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-blue': 'pulse-blue 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'liquid-sheen': 'liquid-sheen 6s ease-in-out infinite',
        'float-spatial': 'float-spatial 4s ease-in-out infinite',
        'ripple': 'ripple 1.5s ease-out infinite',
      },
      keyframes: {
        'pulse-rose': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 25px 2px rgba(255, 0, 127, 0.6)' },
          '50%': { opacity: '0.6', boxShadow: '0 0 10px 0px rgba(255, 0, 127, 0.2)' },
        },
        'pulse-blue': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 25px 2px rgba(0, 210, 255, 0.6)' },
          '50%': { opacity: '0.6', boxShadow: '0 0 10px 0px rgba(0, 210, 255, 0.2)' },
        },
        'liquid-sheen': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'float-spatial': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        ripple: {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
