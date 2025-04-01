import { Metadata } from 'next'
import Script from 'next/script'

import { BuilderPageLayout, RenderBuilderContent } from '@/components/app/builder'
import { PageProps } from '@/types'
import { BuilderPageModelIdentifiers } from '@/utils/server/builder/models/page/constants'
import { getPageContent, getPageDetails } from '@/utils/server/builder/models/page/utils'
import { getPagePaths } from '@/utils/server/builder/models/page/utils/getPagePaths'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

export const dynamic = 'error'
export const dynamicParams = true
export const revalidate = 86400 // 1 day

const PAGE_PREFIX = '/content/'
const PAGE_MODEL = BuilderPageModelIdentifiers.CONTENT

type DynamicPageProps = PageProps<{ page: string[] }>

export default async function Page(props: DynamicPageProps) {
  const { page, countryCode } = await props.params

  const pathname = PAGE_PREFIX + page?.join('/')

  const content = await getPageContent(PAGE_MODEL, pathname, countryCode)

  return (
    <>
      <Script src="https://win.newmode.net/assets/main.js" type="module" />
      <BuilderPageLayout countryCode={countryCode} modelName={PAGE_MODEL} pathname={pathname}>
        <RenderBuilderContent content={content} model={PAGE_MODEL} />
      </BuilderPageLayout>
    </>
  )
}

export async function generateMetadata(props: DynamicPageProps): Promise<Metadata> {
  const { page, countryCode } = await props.params

  const pathname = PAGE_PREFIX + page?.join('/')

  const metadata = await getPageDetails(PAGE_MODEL, pathname, countryCode)

  return generateMetadataDetails({
    title: metadata.title,
    description: metadata.description,
  })
}

export async function generateStaticParams() {
  const paths = await getPagePaths({
    pageModelName: PAGE_MODEL,
  })

  return paths.map(path => {
    return {
      params: {
        page: path?.replace(PAGE_PREFIX, '').split('/'),
      },
    }
  })
}
