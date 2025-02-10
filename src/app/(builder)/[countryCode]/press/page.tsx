import { Metadata } from 'next'

import { BuilderPageLayout, RenderBuilderContent } from '@/components/app/builder'
import { PagePress, PressContent } from '@/components/app/pagePress/press'
import { PageProps } from '@/types'
import { builderSDKClient } from '@/utils/server/builder'
import { getAllNews, isInternalNews } from '@/utils/server/builder/models/data/news'
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

  const pressContentPromises = news
    .map<Promise<PressContent | undefined>>(async ({ data, createdDate }) => {
      if (isInternalNews(data)) {
        const { id, model } = data.pressPage

        const pressPage = await builderSDKClient
          .getContent(model, {
            entry: id,
            limit: 1,
          })
          .then(res => {
            const pressPageContent = res?.[0]

            if (!pressPageContent || !pressPageContent.data) {
              return
            }

            return pressPageContent
          })
          .catch(_err => {
            // TODO: Handle error
            return
          })

        if (!pressPage?.data) {
          return
        }

        return {
          dateHeading: new Date(createdDate),
          source: pressPage.data.source,
          title: pressPage.data.title,
          url: pressPage.data.url,
        }
      }

      const { title, url, source } = data

      return {
        dateHeading: new Date(createdDate),
        source,
        title,
        url,
      }
    })
    .filter(Boolean) as Promise<PressContent>[]

  const pressContent = await Promise.all(pressContentPromises)

  return (
    <BuilderPageLayout countryCode={countryCode} modelName={PAGE_MODEL} pathname={PATHNAME}>
      <RenderBuilderContent content={content} model={PAGE_MODEL} />

      {pressContent && <PagePress pressContent={pressContent} />}
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
