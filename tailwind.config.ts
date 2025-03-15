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
    },
  },
  plugins: [],
};

export default config; 