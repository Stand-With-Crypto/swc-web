import { Footer } from '@/components/app/footer'
import { Navbar } from '@/components/app/navbar'
import { SupportedLocale } from '@/intl/locales'
import { PageModel } from '@/utils/server/builder/models/page/PageModel'

export async function BuilderPageLayout({
  pageModel,
  children,
  locale,
  pathname,
}: {
  pageModel: PageModel
  children: React.ReactNode
  locale: SupportedLocale
  pathname: string
}) {
  const details = await pageModel.getPageMetadata(pathname)

  return (
    <>
      {details.hasNavbar && <Navbar locale={locale} />}
      {children}
      {details.hasFooter && <Footer locale={locale} />}
    </>
  )
}
