import { Metadata } from 'next'

import { RenderBuilderContent } from '@/components/app/builder'
import { PageProps } from '@/types'
import { getDynamicPageContent, PAGE_PREFIX } from '@/utils/server/builder/models/page/content'
import { PageModelIdentifiers } from '@/utils/server/builder/models/page/uniqueIdentifiers'
import { serverCMS } from '@/utils/server/builder/serverCMS'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

export const dynamic = 'error'
export const dynamicParams = true

type DynamicPageProps = PageProps<{ page: string[] }>

export default async function Page(props: DynamicPageProps) {
  const { page } = await props.params

  const content = await getDynamicPageContent(page)

  return <RenderBuilderContent content={content} model={PageModelIdentifiers.CONTENT} type="page" />
}

export async function generateMetadata(props: DynamicPageProps): Promise<Metadata> {
  const { page } = await props.params

  const content = await getDynamicPageContent(page)

  return generateMetadataDetails({
    title: content?.data?.title,
    description: content?.data?.description,
  })
}

export async function generateStaticParams() {
  const paths = await serverCMS
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
