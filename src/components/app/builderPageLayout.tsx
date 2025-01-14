import { RenderBuilderContent } from '@/components/app/builder'
import { SupportedLocale } from '@/intl/locales'
import { SectionModelIdentifiers } from '@/utils/server/builder/models/section/uniqueIdentifiers'
import { serverCMS } from '@/utils/server/builder/serverCMS'

export async function BuilderPageLayout({
  children,
  locale,
}: {
  children: React.ReactNode
  locale: SupportedLocale
}) {
  // console.log('getUserAttributes ---', serverCMS.getUserAttributes())

  const navbarContent = await serverCMS
    .get(SectionModelIdentifiers.NAVBAR, {
      userAttributes: {
        // TODO: add path
      },
      prerender: false,
    })
    .toPromise()

  const footerContent = await serverCMS
    .get(SectionModelIdentifiers.FOOTER, {
      userAttributes: {
        // TODO: add path
      },
      prerender: false,
    })
    .toPromise()

  return (
    <>
      <RenderBuilderContent
        content={navbarContent}
        data={{ locale }}
        model={SectionModelIdentifiers.NAVBAR}
        type="section"
      />
      {children}
      <RenderBuilderContent
        content={footerContent}
        data={{ locale }}
        model={SectionModelIdentifiers.FOOTER}
        type="section"
      />
    </>
  )
}
