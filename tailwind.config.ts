import type { Config } from 'tailwindcss';
export default { content: ['./src/**/*.{ts,tsx}'], theme: { extend: { colors: { ink: '#23352c', sage: '#718776', blush: '#e6b5a8', butter: '#f3ead9', moss: '#3c5948' }, fontFamily: { display: ['Georgia', 'serif'], sans: ['Arial', 'sans-serif'] } } }, plugins: [] } satisfies Config;
