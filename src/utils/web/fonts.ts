import { Open_Sans, Raleway } from 'next/font/google'

export const raleway = Raleway({ subsets: ['latin'], variable: '--font-raleway' })
const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-open-sans',
})

export const fontClassName = [raleway.variable, openSans.variable].join(' ')
