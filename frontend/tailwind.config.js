/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#f6f8fb',
        panel: '#ffffff',
        border: '#e5e7eb',
        ink: '#111827',
        muted: '#6b7280',
      },
      boxShadow: {
        panel: '0 10px 30px rgba(15, 23, 42, 0.06)',
      },
      borderRadius: {
        panel: '14px',
      },
    },
  },
  plugins: [],
};
