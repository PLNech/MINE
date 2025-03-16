import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          light: '#f4e4bc',
          DEFAULT: '#e4d5b7',
          dark: '#d4c5a7'
        }
      },
      keyframes: {
        'slide-in': {
          '0%': { 
            transform: 'translateY(-1rem)',
            opacity: '0'
          },
          '100%': { 
            transform: 'translateY(0)',
            opacity: '1'
          }
        }
      },
      animation: {
        'slide-in': 'slide-in 0.3s ease-out forwards'
      }
    },
  },
  plugins: [],
};

export default config; 