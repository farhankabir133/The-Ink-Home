/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './App.{js,ts,jsx,tsx}',
    './index.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
    './constants/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      colors: {
        'ink-dark': '#1a1a1a',
        'ink-light': '#f8f8f8',
        'ink-accent': '#a38b77',
        'ink-secondary': '#6b7280',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(40px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        scaleReveal: {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.85)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInTop: {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInBottom: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(163,139,119,0)' },
          '50%': { boxShadow: '0 0 30px 8px rgba(163,139,119,0.4)' },
        },
        rotateInFade: {
          '0%': { opacity: '0', transform: 'rotate(-12deg) scale(0.9)' },
          '100%': { opacity: '1', transform: 'rotate(0) scale(1)' },
        },
        blurIn: {
          '0%': { opacity: '0', filter: 'blur(10px)' },
          '100%': { opacity: '1', filter: 'blur(0)' },
        },
        revealClip: {
          '0%': { clipPath: 'inset(0 100% 0 0)', opacity: '1' },
          '100%': { clipPath: 'inset(0 0% 0 0)', opacity: '1' },
        },
        slideReveal: {
          '0%': { transform: 'scaleX(0)', transformOrigin: 'left' },
          '100%': { transform: 'scaleX(1)', transformOrigin: 'left' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.5' },
        },
        ping: {
          '75%, 100%': { transform: 'scale(2)', opacity: '0' },
        },
      },
      animation: {
        fadeInUp: 'fadeInUp 0.7s cubic-bezier(0.23, 1, 0.320, 1) forwards',
        scaleIn: 'scaleIn 0.6s cubic-bezier(0.23, 1, 0.320, 1) forwards',
        scaleReveal: 'scaleReveal 0.6s cubic-bezier(0.23, 1, 0.320, 1) forwards',
        bounceIn: 'bounceIn 0.7s cubic-bezier(0.23, 1, 0.320, 1) forwards',
        marquee: 'marquee 40s linear infinite',
        slideInLeft: 'slideInLeft 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
        slideInRight: 'slideInRight 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
        slideInTop: 'slideInTop 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        slideInBottom: 'slideInBottom 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        glowPulse: 'glowPulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        rotateInFade: 'rotateInFade 0.7s cubic-bezier(0.23, 1, 0.320, 1) forwards',
        blurIn: 'blurIn 0.8s ease-out forwards',
        revealClip: 'revealClip 0.8s cubic-bezier(0.16,1,0.3,1) forwards',
        slideReveal: 'slideReveal 0.6s ease-out forwards',
        countUp: 'countUp 0.6s cubic-bezier(0.23, 1, 0.320, 1) forwards',
        shimmer: 'shimmer 2s linear infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        ping: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
