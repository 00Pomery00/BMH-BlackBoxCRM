module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        violet: {
          50: '#f7f0fb',
          100: '#f1e6f7',
          200: '#e6d1f0',
          300: '#d0aee3',
          400: '#b77adf',
          500: '#7b1fa2',
          600: '#6d178f',
          700: '#5e0f86',
          800: '#4a0d66',
          900: '#3a0a4d',
        },
        accent: 'var(--accent)',
        primary: 'var(--primary)',
        success: 'var(--success)',
        danger: 'var(--danger)',
        muted: 'var(--muted)'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto'],
      }
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
}
