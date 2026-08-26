import type { Config } from 'tailwindcss';

/**
 * Tokens are named after Airbnb's internal palette (Rausch, Hof, Foggy)
 * so workshop attendees can map CSS to the brand language used in design QA.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        rausch: '#FF385C',
        'rausch-dark': '#E31C5F',
        hof: '#222222',
        foggy: '#6A6A6A',
        mute: '#717171',
        line: '#DDDDDD',
        hairline: '#EBEBEB',
        canvas: '#F7F7F7',
        babu: '#00A699',
      },
      fontFamily: {
        sans: [
          'var(--font-circular)',
          'Circular',
          '-apple-system',
          'BlinkMacSystemFont',
          'Roboto',
          'Helvetica Neue',
          'sans-serif',
        ],
      },
      boxShadow: {
        search: '0 1px 2px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)',
        'search-hover': '0 2px 4px rgba(0,0,0,0.18)',
        card: '0 6px 16px rgba(0,0,0,0.12)',
        pill: '0 0 0 1px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.2)',
      },
      maxWidth: {
        listing: '1120px',
        shell: '1760px',
      },
      spacing: {
        header: '80px',
      },
      transitionTimingFunction: {
        airbnb: 'cubic-bezier(0.2, 0, 0, 1)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-800px 0' },
          '100%': { backgroundPosition: '800px 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.4s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
