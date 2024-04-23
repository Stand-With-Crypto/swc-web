import { Open_Sans } from 'next/font/google'
import localFont from 'next/font/local'

export const satoshiFont = localFont({
  src: [
    { path: '../../../public/fonts/Satoshi-Bold.ttf', weight: '700', style: 'normal' },
    { path: '../../../public/fonts/Satoshi-BoldItalic.ttf', weight: '700', style: 'italic' },
  ],
  variable: '--font-satoshi',
})

export const openSansFont = Open_Sans({
  subsets: ['latin'],
  variable: '--font-open-sans',
})

export const fontClassName = [satoshiFont.variable, openSansFont.variable].join(' ')
