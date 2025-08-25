import type { TailwindConfig } from '@react-email/components'

export const tailwindConfig: TailwindConfig = {
  theme: {
    extend: {
      container: {
        center: true,
      },
      colors: {
        border: '#e2e8f0',
        input: '#e2e8f0',
        ring: '#020817',
        background: '#ffffff',
        backgroundAlternate: '#edeff2',
        foreground: {
          DEFAULT: '#020817',
          muted: '#5B616E',
        },
        'primary-cta': {
          DEFAULT: '#6200ff',
          foreground: '#f8fafc',
        },
        primary: {
          DEFAULT: '#0f172a',
          foreground: '#f8fafc',
        },
        secondary: {
          DEFAULT: '#f1f5f9',
          foreground: '#0f172a',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#f8fafc',
        },
        muted: {
          DEFAULT: '#f1f5f9',
          foreground: '#94a3b8',
        },
        accent: {
          DEFAULT: '#f1f5f9',
          foreground: '#0f172a',
        },
        popover: {
          DEFAULT: '#ffffff',
          foreground: '#020817',
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#020817',
        },
        fontcolor: {
          DEFAULT: '#020817',
          secondary: '#667085',
          muted: '#94a3b8',
        },
        'purple-dark': {
          DEFAULT: '#13003B',
          foreground: '#f8fafc',
        },
        'purple-light': {
          DEFAULT: '#E2D0FF',
          foreground: '#020817',
        },
      },
      borderRadius: {
        xl: '16px',
        lg: '8px',
        md: '6px',
        sm: '4px',
      },
    },
    // https://react.email/docs/components/tailwind#tailwind-configuration-with-px-instead-of-rem
    fontSize: {
      xs: ['12px', { lineHeight: '16px' }],
      sm: ['14px', { lineHeight: '20px' }],
      base: ['15px', { lineHeight: '24px' }],
      lg: ['18px', { lineHeight: '28px' }],
      xl: ['20px', { lineHeight: '28px' }],
      '2xl': ['24px', { lineHeight: '32px' }],
      '3xl': ['30px', { lineHeight: '36px' }],
      '4xl': ['36px', { lineHeight: '36px' }],
      '5xl': ['48px', { lineHeight: '1' }],
      '6xl': ['60px', { lineHeight: '1' }],
      '7xl': ['72px', { lineHeight: '1' }],
      '8xl': ['96px', { lineHeight: '1' }],
      '9xl': ['144px', { lineHeight: '1' }],
    },
    spacing: {
      px: '1px',
      0: '0',
      0.5: '2px',
      1: '4px',
      1.5: '6px',
      2: '8px',
      2.5: '10px',
      3: '12px',
      3.5: '14px',
      4: '16px',
      5: '20px',
      6: '24px',
      7: '28px',
      8: '32px',
      9: '36px',
      10: '40px',
      11: '44px',
      12: '48px',
      14: '56px',
      16: '64px',
      20: '80px',
      24: '96px',
      28: '112px',
      32: '128px',
      36: '144px',
      40: '160px',
      44: '176px',
      48: '192px',
      52: '208px',
      56: '224px',
      60: '240px',
      64: '256px',
      72: '288px',
      80: '320px',
      96: '384px',
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require('@tailwindcss/aspect-ratio')],
}
