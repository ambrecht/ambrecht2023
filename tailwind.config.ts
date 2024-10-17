module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'blue-400': '#4f8bfb',
        'blue-500': '#0051ff',
        'gray-400': '#9ca3af',
        'gray-800': '#2e2e2e',
        'gray-700': '#3f3f3f',
      },
    },
  },
  plugins: [],
};
