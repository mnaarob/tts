export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F7F8FA',
        ink: '#111111',
        muted: '#5C6370',
        line: '#E4E6EB',
        crimson: {
          DEFAULT: '#C8102E',
          hover: '#A50D25',
        },
        charcoal: '#1A1C1F',
        pin: '#14b8a6',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Syne', '"DM Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
      },
      letterSpacing: {
        brand: '-0.04em',
      },
    },
  },
};
