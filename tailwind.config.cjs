/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./views/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    { pattern: /bg-(red|emerald|amber|yellow|slate|blue|fuchsia)-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /text-(red|emerald|amber|yellow|slate|blue|fuchsia)-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /border-(red|emerald|amber|yellow|slate|blue|fuchsia)-(50|100|200|300|400|500|600|700|800|900)/ }
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ef4444',
        secondary: '#0f172a',
        accent: '#f59e0b',
        background: '#f8fafc',
        surface: '#ffffff',
        'surface-container-high': '#f1f5f9',
        'on-surface': '#0f172a',
        'on-surface-variant': '#64748b'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Inter', 'sans-serif']
      },
      fontSize: {
        'display-xl': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '900' }],
        'headline-md': ['1.5rem', { lineHeight: '1.4', fontWeight: '700' }],
        'title-sm': ['0.875rem', { lineHeight: '1.4', fontWeight: '700' }],
        'body-lg': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['0.75rem', { lineHeight: '1.5', fontWeight: '500' }]
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 20px rgba(239, 68, 68, 0.15)'
      }
    },
  },
  plugins: [],
}
