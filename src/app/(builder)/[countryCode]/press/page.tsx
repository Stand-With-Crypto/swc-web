import { Metadata } from 'next'

import { BuilderPageLayout, RenderBuilderContent } from '@/components/app/builder'
import { NewsList } from '@/components/app/pagePress/NewsList'
import { PageProps } from '@/types'
import { getNewsList } from '@/utils/server/builder/models/data/news'
import { BuilderPageModelIdentifiers } from '@/utils/server/builder/models/page/constants'
import { getPageContent, getPageDetails } from '@/utils/server/builder/models/page/utils'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

export const dynamic = 'error'
export const revalidate = 21600 // 6 hours

const PAGE_MODEL = BuilderPageModelIdentifiers.PAGE
const PATHNAME = '/press'

export default async function PressPage(props: PageProps) {
  const { countryCode } = await props.params

  const news = await getNewsList({
    countryCode,
  })
  const content = await getPageContent(PAGE_MODEL, PATHNAME, countryCode)

  return (
    <BuilderPageLayout countryCode={countryCode} modelName={PAGE_MODEL} pathname={PATHNAME}>
      <RenderBuilderContent content={content} model={PAGE_MODEL} />
      <NewsList countryCode={countryCode} initialNews={news} />
    </BuilderPageLayout>
  )
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { countryCode } = await props.params

  const metadata = await getPageDetails(PAGE_MODEL, PATHNAME, countryCode)

  return generateMetadataDetails({
    title: metadata.title,
    description: metadata.description,
  })
}
