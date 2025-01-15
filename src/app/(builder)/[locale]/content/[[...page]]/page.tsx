import { Metadata } from 'next'

import { RenderBuilderContent } from '@/components/app/builder'
import { BuilderPageLayout } from '@/components/app/builderPageLayout'
import { PageProps } from '@/types'
import { builderSDKClient } from '@/utils/server/builder'
import { PageModelIdentifiers } from '@/utils/server/builder/models/page/constants'
import { getDynamicPageContent, PAGE_PREFIX } from '@/utils/server/builder/models/page/content'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

export const dynamic = 'error'
export const dynamicParams = true

type DynamicPageProps = PageProps<{ page: string[] }>

export default async function Page(props: DynamicPageProps) {
  const { page, locale } = await props.params

  const pathname = PAGE_PREFIX + page?.join('/')

  const content = await getDynamicPageContent(pathname)

  return (
    <BuilderPageLayout locale={locale} pathname={pathname}>
      <RenderBuilderContent content={content} model={PageModelIdentifiers.CONTENT} type="page" />
    </BuilderPageLayout>
  )
}

export async function generateMetadata(props: DynamicPageProps): Promise<Metadata> {
  const { page } = await props.params

  const pathname = PAGE_PREFIX + page?.join('/')

  const content = await getDynamicPageContent(pathname)

  return generateMetadataDetails({
    title: content?.data?.title,
    description: content?.data?.description,
  })
}

export async function generateStaticParams() {
  const paths = await builderSDKClient
    .getAll(PageModelIdentifiers.CONTENT, { options: { noTargeting: true } })
    .then(res => res.map(({ data }) => data?.url))

  return paths.map((path: string) => {
    return {
      params: {
        page: path.replace(PAGE_PREFIX, '').split('/'),
      },
    }
  })
}
