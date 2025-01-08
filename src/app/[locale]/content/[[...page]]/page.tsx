import { Metadata } from 'next'

import { RenderBuilderContent } from '@/components/app/builder'
import { PageProps } from '@/types'
import {
  PAGE_MODEL_IDENTIFIER,
  PAGE_PREFIX,
} from '@/utils/server/builder/models/page/dynamicContent/constants'
import { getDynamicPageContent } from '@/utils/server/builder/models/page/dynamicContent/content'
import { serverCMS } from '@/utils/server/builder/serverCMS'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

export const dynamic = 'error'
export const dynamicParams = true

type DynamicPageProps = PageProps<{ page: string[] }>

export default async function Page(props: DynamicPageProps) {
  const params = await props.params

  const content = await getDynamicPageContent(params?.page?.join('/'))

  return <RenderBuilderContent content={content} model={PAGE_MODEL_IDENTIFIER} />
}

export async function generateMetadata(props: DynamicPageProps): Promise<Metadata> {
  const params = await props.params

  const content = await getDynamicPageContent(params?.page?.join('/'))

  return generateMetadataDetails({
    title: content?.data.title,
    description: content?.data.description,
  })
}

export async function generateStaticParams() {
  const paths = await serverCMS
    .getAll(PAGE_MODEL_IDENTIFIER, { options: { noTargeting: true } })
    .then(res => res.map(({ data }) => data?.url))

  return paths.map((path: string) => {
    return {
      params: {
        page: path.replace(PAGE_PREFIX, '').split('/'),
      },
    }
  })
}
