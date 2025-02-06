import { Metadata } from 'next'

import { BuilderPageLayout, RenderBuilderContent } from '@/components/app/builder'
import { MOCK_PRESS_CONTENT } from '@/components/app/pagePress/mock'
import { PagePress } from '@/components/app/pagePress/press'
import { PageProps } from '@/types'
import { getAllNews } from '@/utils/server/builder/models/data/news'
import { BuilderPageModelIdentifiers } from '@/utils/server/builder/models/page/constants'
import { getPageContent, getPageDetails } from '@/utils/server/builder/models/page/utils'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

export const dynamic = 'error'

const PAGE_MODEL = BuilderPageModelIdentifiers.PAGE
const PATHNAME = '/press'

export default async function PressPage(props: PageProps) {
  const { countryCode } = await props.params

  const news = await getAllNews()
  const content = await getPageContent(PAGE_MODEL, PATHNAME)

  const pressContent = MOCK_PRESS_CONTENT.sort((a, b) => {
    return new Date(b.dateHeading).getTime() - new Date(a.dateHeading).getTime()
  })

  return (
    <BuilderPageLayout countryCode={countryCode} modelName={PAGE_MODEL} pathname={PATHNAME}>
      <RenderBuilderContent content={content} model={PAGE_MODEL} />

      <PagePress pressContent={pressContent} />
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
