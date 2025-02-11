import { Metadata } from 'next'

import { BuilderPageLayout, RenderBuilderContent } from '@/components/app/builder'
import { FormattedDatetime } from '@/components/ui/formattedDatetime'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { PageProps } from '@/types'
import { BuilderPageModelIdentifiers } from '@/utils/server/builder/models/page/constants'
import { OLD_PRESS_PAGES_DATE_OVERRIDES } from '@/utils/server/builder/models/page/press/constants'
import { getPageContent, getPageDetails } from '@/utils/server/builder/models/page/utils'
import { getPagePaths } from '@/utils/server/builder/models/page/utils/getPagePaths'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { COUNTRY_CODE_TO_LOCALE } from '@/utils/shared/supportedCountries'

export const dynamic = 'error'
export const dynamicParams = true

const PAGE_PREFIX = '/press/'
const PAGE_MODEL = BuilderPageModelIdentifiers.PRESS

type PressReleasePageProps = PageProps<{
  page: string[]
}>

export default async function Page(props: PressReleasePageProps) {
  const { page, countryCode } = await props.params

  const pathname = PAGE_PREFIX + page?.join('/')

  const content = await getPageContent(PAGE_MODEL, pathname)

  const locale = COUNTRY_CODE_TO_LOCALE[countryCode]

  return (
    <BuilderPageLayout countryCode={countryCode} modelName={PAGE_MODEL} pathname={pathname}>
      <section className="standard-spacing-from-navbar space-y-14">
        <div className="container flex flex-col items-center gap-4">
          {content?.data?.title && (
            <PageTitle className="mb-7 font-sans !text-5xl">{content.data.title}</PageTitle>
          )}
          {content && (
            <PageSubTitle className="text-muted-foreground" size="md">
              <FormattedDatetime
                date={OLD_PRESS_PAGES_DATE_OVERRIDES[content.id] ?? content.createdDate}
                day="numeric"
                locale={locale}
                month="long"
                year="numeric"
              />
            </PageSubTitle>
          )}
        </div>
      </section>

      <section className="container my-8 flex flex-col items-center gap-4">
        <RenderBuilderContent content={content} model={PAGE_MODEL} />
      </section>
    </BuilderPageLayout>
  )
}

export async function generateMetadata(props: PressReleasePageProps): Promise<Metadata> {
  const { page } = await props.params

  const pathname = PAGE_PREFIX + page?.join('/')

  const metadata = await getPageDetails(PAGE_MODEL, pathname)

  return generateMetadataDetails({
    title: metadata.title,
    description: metadata.description,
  })
}

export async function generateStaticParams() {
  const paths = await getPagePaths({
    modelName: PAGE_MODEL,
    limit: 10,
  })

  return paths.map(path => {
    return {
      params: {
        page: path?.replace(PAGE_PREFIX, '').split('/'),
      },
    }
  })
}
