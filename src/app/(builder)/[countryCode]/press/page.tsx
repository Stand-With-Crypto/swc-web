import { Metadata } from 'next'

import { BuilderPageLayout, RenderBuilderContent } from '@/components/app/builder'
import { NewsList } from '@/components/app/pagePress/NewsList'
import { PageProps } from '@/types'
import { getNewsList } from '@/utils/server/builder/models/data/news'
import { BuilderPageModelIdentifiers } from '@/utils/server/builder/models/page/constants'
import { getPageContent, getPageDetails } from '@/utils/server/builder/models/page/utils'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { COUNTRY_CODE_TO_LOCALE } from '@/utils/shared/supportedCountries'

export const dynamic = 'error'

const PAGE_MODEL = BuilderPageModelIdentifiers.PAGE
const PATHNAME = '/press'

export default async function PressPage(props: PageProps) {
  const { countryCode } = await props.params

  const news = await getNewsList()
  const content = await getPageContent(PAGE_MODEL, PATHNAME)

  const locale = COUNTRY_CODE_TO_LOCALE[countryCode]

  return (
    <BuilderPageLayout countryCode={countryCode} modelName={PAGE_MODEL} pathname={PATHNAME}>
      <RenderBuilderContent content={content} model={PAGE_MODEL} />
      <NewsList initialNews={news} locale={locale} />
    </BuilderPageLayout>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const metadata = await getPageDetails(PAGE_MODEL, PATHNAME)

  return generateMetadataDetails({
    title: metadata.title,
    description: metadata.description,
  })
}
