import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { PageProps } from '../../types'

// TODO replace with font we want
const inter = Inter({ subsets: ['latin'] })

// TODO expand this metadata
export const metadata: Metadata = {
  title: 'Stand With Crypto Alliance',
  description:
    'Stand with Crypto Alliance is a non-profit organization dedicated to uniting global crypto advocates',
}

export default function RootLayout({
  children,
  params,
}: PageProps & { children: React.ReactNode }) {
  return (
    <html lang={params.lang}>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
