import { Footer } from '@/components/app/footer'
import { Navbar } from '@/components/app/navbar'
import { BuilderPageModelIdentifiers } from '@/utils/server/builder/models/page/constants'
import { getPageDetails } from '@/utils/server/builder/models/page/utils'
import { SupportedLocale } from '@/utils/shared/supportedLocales'

export async function BuilderPageLayout({
  children,
  locale,
  pathname,
  modelName,
}: {
  children: React.ReactNode
  locale: SupportedLocale
  pathname: string
  modelName: BuilderPageModelIdentifiers
}) {
  const pageMetadata = await getPageDetails(modelName, pathname)

  return (
    <>
      {pageMetadata.hasNavbar && <Navbar locale={locale} />}
      {children}
      {pageMetadata.hasFooter && <Footer locale={locale} />}
    </>
  )
}
