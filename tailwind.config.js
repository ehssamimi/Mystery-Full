/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0f0f23',
          light: '#1a1a2e',
          lighter: '#16213e',
        },
        accent: {
          DEFAULT: '#6c5ce7',
          glow: '#a29bfe',
          bright: '#c9c5ff',
        },
      },
      boxShadow: {
        glow: '0 0 20px rgba(108, 92, 231, 0.5)',
        'glow-lg': '0 0 30px rgba(108, 92, 231, 0.5), 0 0 60px rgba(162, 155, 254, 0.8)',
      },
      animation: {
        'pulse-glow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};

