import { RenderBuilderContent } from '@/components/app/builder'
import { builderSDKClient } from '@/utils/server/builder'
import { SectionModelIdentifiers } from '@/utils/server/builder/models/section/constants'
import { SupportedLocale } from '@/utils/shared/supportedLocales'

export async function BuilderPageLayout({
  children,
  locale,
  pathname,
}: {
  children: React.ReactNode
  locale: SupportedLocale
  pathname: string
}) {
  const navbarContent = await builderSDKClient
    .get(SectionModelIdentifiers.NAVBAR, {
      userAttributes: {
        urlPath: pathname,
      },
      prerender: false,
    })
    .toPromise()

  const footerContent = await builderSDKClient
    .get(SectionModelIdentifiers.FOOTER, {
      userAttributes: {
        urlPath: pathname,
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
