import { TopLevelClientLogic } from '@/app/[locale]/topLevelClientLogic'
import { Footer } from '@/components/app/footer'
import { Navbar } from '@/components/app/navbar'
import { FullHeight } from '@/components/ui/fullHeight'
import { Toaster } from '@/components/ui/toaster'
import { ORDERED_SUPPORTED_LOCALES } from '@/intl/locales'
import { PageProps } from '@/types'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { notFound } from 'next/navigation'
import NextTopLoader from 'nextjs-toploader'

// we want dynamicParams to be false for this top level layout, but we also want to ensure that subpages can have dynamic params
// Next.js doesn't allow this so we allow dynamic params in the config here, and then trigger a notFound in the layout if one is passed
// export const dynamicParams = false
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

export default function Layout({ children, params }: PageProps & { children: React.ReactNode }) {
  const { locale } = params
  if (!ORDERED_SUPPORTED_LOCALES.includes(locale)) {
    notFound()
  }
  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextTopLoader />
        <TopLevelClientLogic>
          <FullHeight.Container>
            <FullHeight.Content>
              <Navbar {...{ locale }} />
              <main>{children}</main>
            </FullHeight.Content>
            <Footer {...{ locale }} />
          </FullHeight.Container>
        </TopLevelClientLogic>
        <Toaster />
      </body>
    </html>
  )
}
