import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'rgb(var(--color-border) / <alpha-value>)',
        input: 'rgb(var(--color-input) / <alpha-value>)',
        ring: 'rgb(var(--color-ring) / <alpha-value>)',
        background: 'rgb(var(--color-background) / <alpha-value>)',
        foreground: 'rgb(var(--color-foreground) / <alpha-value>)',
        primary: {
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          foreground: 'rgb(var(--color-primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--color-secondary) / <alpha-value>)',
          foreground: 'rgb(var(--color-secondary-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'rgb(var(--color-destructive) / <alpha-value>)',
          foreground: 'rgb(var(--color-destructive-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'rgb(var(--color-muted) / <alpha-value>)',
          foreground: 'rgb(var(--color-muted-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
          foreground: 'rgb(var(--color-accent-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'rgb(var(--color-popover) / <alpha-value>)',
          foreground: 'rgb(var(--color-popover-foreground) / <alpha-value>)',
        },
        card: {
          DEFAULT: 'rgb(var(--color-card) / <alpha-value>)',
          foreground: 'rgb(var(--color-card-foreground) / <alpha-value>)',
        },
        pokemon: {
          normal: 'rgb(var(--pokemon-normal) / <alpha-value>)',
          fire: 'rgb(var(--pokemon-fire) / <alpha-value>)',
          water: 'rgb(var(--pokemon-water) / <alpha-value>)',
          grass: 'rgb(var(--pokemon-grass) / <alpha-value>)',
          electric: 'rgb(var(--pokemon-electric) / <alpha-value>)',
          ice: 'rgb(var(--pokemon-ice) / <alpha-value>)',
          fighting: 'rgb(var(--pokemon-fighting) / <alpha-value>)',
          poison: 'rgb(var(--pokemon-poison) / <alpha-value>)',
          ground: 'rgb(var(--pokemon-ground) / <alpha-value>)',
          flying: 'rgb(var(--pokemon-flying) / <alpha-value>)',
          psychic: 'rgb(var(--pokemon-psychic) / <alpha-value>)',
          bug: 'rgb(var(--pokemon-bug) / <alpha-value>)',
          rock: 'rgb(var(--pokemon-rock) / <alpha-value>)',
          ghost: 'rgb(var(--pokemon-ghost) / <alpha-value>)',
          dragon: 'rgb(var(--pokemon-dragon) / <alpha-value>)',
          dark: 'rgb(var(--pokemon-dark) / <alpha-value>)',
          steel: 'rgb(var(--pokemon-steel) / <alpha-value>)',
          fairy: 'rgb(var(--pokemon-fairy) / <alpha-value>)',
        },
      },
      borderRadius: {
        none: 'var(--radius-none)',
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius-default)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        full: 'var(--radius-full)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      fontSize: {
        xs: 'var(--text-xs)',
        sm: 'var(--text-sm)',
        base: 'var(--text-base)',
        lg: 'var(--text-lg)',
        xl: 'var(--text-xl)',
        '2xl': 'var(--text-2xl)',
        '3xl': 'var(--text-3xl)',
        '4xl': 'var(--text-4xl)',
        '5xl': 'var(--text-5xl)',
      },
      spacing: {
        '0': 'var(--space-0)',
        '1': 'var(--space-1)',
        '2': 'var(--space-2)',
        '3': 'var(--space-3)',
        '4': 'var(--space-4)',
        '5': 'var(--space-5)',
        '6': 'var(--space-6)',
        '8': 'var(--space-8)',
        '10': 'var(--space-10)',
        '12': 'var(--space-12)',
        '16': 'var(--space-16)',
        '20': 'var(--space-20)',
        '24': 'var(--space-24)',
        '32': 'var(--space-32)',
      },
      animation: {
        'fade-in': 'fadeIn var(--transition-base)',
        'slide-up': 'slideUp var(--transition-slow)',
        'slide-down': 'slideDown var(--transition-slow)',
        'slide-in-right': 'slideInRight var(--transition-base)',
        'slide-in-left': 'slideInLeft var(--transition-base)',
        'scale-in': 'scaleIn var(--transition-fast)',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      transitionDuration: {
        fast: 'var(--transition-fast)',
        base: 'var(--transition-base)',
        slow: 'var(--transition-slow)',
        slower: 'var(--transition-slower)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config