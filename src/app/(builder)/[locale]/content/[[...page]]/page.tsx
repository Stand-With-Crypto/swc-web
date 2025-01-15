import { Metadata } from 'next'

import { RenderBuilderContent } from '@/components/app/builder'
import { BuilderPageLayout } from '@/components/app/builderPageLayout'
import { PageProps } from '@/types'
import { builderSDKClient } from '@/utils/server/builder'
import { BuilderPageModelIdentifiers } from '@/utils/server/builder/models/page/constants'
import { getPageContent, getPageDetails } from '@/utils/server/builder/models/page/utils'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

export const dynamic = 'error'
export const dynamicParams = true

const PAGE_PREFIX = '/content/'
const PAGE_MODEL = BuilderPageModelIdentifiers.CONTENT

type DynamicPageProps = PageProps<{ page: string[] }>

export default async function Page(props: DynamicPageProps) {
  const { page, locale } = await props.params

  const pathname = PAGE_PREFIX + page?.join('/')

  const content = await getPageContent(PAGE_MODEL, pathname)

  return (
    <BuilderPageLayout locale={locale} modelName={PAGE_MODEL} pathname={pathname}>
      <RenderBuilderContent content={content} model={PAGE_MODEL} />
    </BuilderPageLayout>
  )
}

export async function generateMetadata(props: DynamicPageProps): Promise<Metadata> {
  const { page } = await props.params

  const pathname = PAGE_PREFIX + page?.join('/')

  const metadata = await getPageDetails(PAGE_MODEL, pathname)

  return generateMetadataDetails({
    title: metadata.title,
    description: metadata.description,
  })
}

export async function generateStaticParams() {
  const paths = await builderSDKClient
    .getAll(PAGE_MODEL, { options: { noTargeting: true } })
    .then(res => res.map(({ data }) => data?.url))

  return paths.map((path: string) => {
    return {
      params: {
        page: path.replace(PAGE_PREFIX, '').split('/'),
      },
    }
  })
}
