/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#09090B',
        surface: {
          DEFAULT: '#111114',
          raised: '#16161A',
          sunken: '#0C0C0F',
        },
        hairline: 'rgba(255,255,255,0.08)',
        ink: {
          DEFAULT: '#FFFFFF',
          muted: '#A1A1AA',
          faint: '#71717A',
        },
        accent: {
          blue: '#3B82F6',
          purple: '#A855F7',
          cyan: '#22D3EE',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E',
        },
      },
      borderRadius: {
        card: '16px',
        pill: '999px',
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        // Headings on the landing page; the workspace stays on Inter throughout.
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        float: '0 8px 32px -8px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
        lift: '0 24px 64px -16px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.06)',
        'glow-blue': '0 0 24px -4px rgba(59,130,246,0.45)',
        'glow-purple': '0 0 24px -4px rgba(168,85,247,0.45)',
        'glow-emerald': '0 0 24px -4px rgba(16,185,129,0.45)',
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(135deg, #3B82F6 0%, #A855F7 50%, #22D3EE 100%)',
        'gradient-hairline':
          'linear-gradient(135deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.03) 50%, rgba(255,255,255,0.10) 100%)',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '70%': { transform: 'scale(1.6)', opacity: '0' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'gradient-pan': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'dash-flow': {
          to: { strokeDashoffset: '-20' },
        },
        'caret-blink': {
          '0%, 70%, 100%': { opacity: '1' },
          '20%, 50%': { opacity: '0' },
        },
        // -50% lands the duplicated half exactly where the first began, so the
        // marquee loop is seamless.
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.4,0,0.6,1) infinite',
        float: 'float 8s ease-in-out infinite',
        'gradient-pan': 'gradient-pan 6s ease infinite',
        'dash-flow': 'dash-flow 0.6s linear infinite',
        'caret-blink': 'caret-blink 1.2s step-end infinite',
        marquee: 'marquee 34s linear infinite',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}
