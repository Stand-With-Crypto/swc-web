import { AuthProviders } from '@/components/app/authProviders'
import { Toaster } from '@/components/ui/toaster'
import '@/globals.css'
import { ORDERED_SUPPORTED_LOCALES } from '@/intl/locales'
import { PageProps } from '@/types'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

export const dynamicParams = false
export const dynamic = 'error'
export async function generateStaticParams() {
  return ORDERED_SUPPORTED_LOCALES.map(locale => ({ locale }))
}

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
    <html lang={params.locale}>
      <body className={inter.className}>
        <main>
          <AuthProviders>{children}</AuthProviders>
        </main>
        <Toaster />
      </body>
    </html>
  )
}
