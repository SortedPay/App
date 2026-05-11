/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Sorted brand palette — exact match to marketing site
        paper: '#F6F2E9',
        'paper-elevated': '#FFFCF5',
        'paper-deep': '#EFEADD',
        ink: '#0E0E18',
        'ink-soft': '#2A2A38',
        'ink-muted': '#6B6B7A',
        'ink-faint': '#B8B5AC',
        line: '#E5E0D2',
        'line-soft': '#EDE8DA',
        lime: '#C8F154',
        'lime-deep': '#A8D426',
        'lime-soft': '#ECF8C7',
        coral: '#FF5A4E',
        'coral-soft': '#FFE4E0',
        sky: '#5BB7FF',
        'sky-soft': '#D6ECFF',
        plum: '#6B4EFF',
        butter: '#FFD66B',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', '"SF Mono"', 'Consolas', 'monospace'],
        numeric: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.05em',
        tighter: '-0.04em',
        tight: '-0.025em',
        wider: '0.04em',
        widest: '0.08em',
        mono: '0.1em',
      },
      boxShadow: {
        'ink-sm': '0 3px 0 #0E0E18',
        'ink': '0 4px 0 #0E0E18',
        'ink-md': '0 6px 0 #0E0E18',
        'ink-lg': '0 10px 0 #0E0E18',
        'ink-xl': '0 12px 0 #0E0E18',
        'lime-sm': '0 3px 0 #C8F154',
        'lime': '0 4px 0 #C8F154',
      },
      borderRadius: {
        '2xl': '14px',
        '3xl': '22px',
        '4xl': '32px',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.94)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        drift: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.15)', opacity: '0.8' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 600ms cubic-bezier(0.16, 1, 0.3, 1) both',
        scaleIn: 'scaleIn 400ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
        drift: 'drift 5s ease-in-out infinite',
        pulse: 'pulse 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
