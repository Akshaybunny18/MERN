/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
      colors: {
        bg: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
        },
        accent: {
          primary: 'var(--accent-primary)',
          secondary: 'var(--accent-secondary)',
          neon: 'var(--accent-neon)',
        },
        'glass-border': 'var(--glass-border)',
        'glass-bg': 'var(--glass-bg)',
      },
      animation: {
        'float':    'float 6s ease-in-out infinite',
        'fade-in':  'fadeIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'spin':     'spin 0.8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          'from': { opacity: 0, transform: 'translateY(16px)' },
          'to':   { opacity: 1, transform: 'translateY(0)' },
        },
      }
    },
  },
  plugins: [],
}
