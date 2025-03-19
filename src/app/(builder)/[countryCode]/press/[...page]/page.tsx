import { Metadata } from 'next'

import { BuilderPageLayout, RenderBuilderContent } from '@/components/app/builder'
import { PageProps } from '@/types'
import { BuilderPageModelIdentifiers } from '@/utils/server/builder/models/page/constants'
import { getPageContent, getPageDetails } from '@/utils/server/builder/models/page/utils'
import { getPagePaths } from '@/utils/server/builder/models/page/utils/getPagePaths'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { ORDERED_SUPPORTED_COUNTRIES } from '@/utils/shared/supportedCountries'

export const dynamic = 'error'
export const dynamicParams = true
export const revalidate = 86400 // 1 day

const PAGE_PREFIX = '/press/'
const PAGE_MODEL = BuilderPageModelIdentifiers.PRESS

type PressReleasePageProps = PageProps<{
  page: string[]
}>

export default async function Page(props: PressReleasePageProps) {
  const { page, countryCode } = await props.params

  const pathname = PAGE_PREFIX + page?.join('/')

  const content = await getPageContent(PAGE_MODEL, pathname, countryCode)

  return (
    <BuilderPageLayout countryCode={countryCode} modelName={PAGE_MODEL} pathname={pathname}>
      <RenderBuilderContent content={content} countryCode={countryCode} model={PAGE_MODEL} />
    </BuilderPageLayout>
  )
}

export async function generateMetadata(props: PressReleasePageProps): Promise<Metadata> {
  const { page, countryCode } = await props.params

  const pathname = PAGE_PREFIX + page?.join('/')

  const metadata = await getPageDetails(PAGE_MODEL, pathname, countryCode)

  return generateMetadataDetails({
    title: metadata.title,
    description: metadata.description,
  })
}

export async function generateStaticParams() {
  const countryPagePathsPromises = ORDERED_SUPPORTED_COUNTRIES.map(countryCode =>
    getPagePaths({
      pageModelName: PAGE_MODEL,
      limit: 10,
      countryCode,
    }),
  )

  const countryPagePaths = await Promise.all(countryPagePathsPromises)

  console.log(countryPagePaths.flat())

  return countryPagePaths.flat().map(path => {
    return {
      params: {
        page: path?.replace(PAGE_PREFIX, '').split('/'),
      },
    }
  })
}
