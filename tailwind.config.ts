import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1rem', md: '2rem' },
      screens: {
        '2xl': '1086px',
      },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-satoshi)'],
        mono: ['var(--font-open-sans)'],
      },
      // https://tailwindcss.com/docs/customizing-colors default colors
      colors: {
        // shadcn-added variables
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        backgroundAlternate: 'hsl(var(--background-alternate))',
        foreground: 'hsl(var(--foreground))',
        'primary-cta': {
          DEFAULT: 'hsl(var(--primary-cta))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        fontcolor: {
          DEFAULT: 'hsl(var(--foreground))',
          muted: 'hsl(var(--muted-foreground))', // gray-400
        },
        // swc-added variables
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'ping-small': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '75%, 100%': { transform: 'scale(1.2)', opacity: '0' },
        },
        bubble: {
          '0%': { transform: 'scale(0.5)' },
          '70%': { transform: 'scale(1.25)' },
          '90%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'ping-small': 'ping-small 1s cubic-bezier(0, 0, 0.2, 1) infinite',
        bubble: 'bubble 0.5s ease-out',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}

export default config
