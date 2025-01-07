import { Content } from '@builder.io/react'
import { Metadata } from 'next'

import { RenderBuilderContent } from '@/components/app/builder'
import { serverCMS } from '@/utils/server/builder/serverCMS'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

interface PageProps {
  params: {
    page: string[]
  }
}

const PAGE_PREFIX = '/content/'
const PAGE_MODEL_IDENTIFIER = 'content'

export default async function Page(props: PageProps) {
  const params = await props.params

  const content: Content | undefined = await serverCMS
    .get(PAGE_MODEL_IDENTIFIER, {
      userAttributes: {
        urlPath: PAGE_PREFIX + (params?.page?.join('/') || ''),
      },
      // Set prerender to false to return JSON instead of HTML
      prerender: false,
    })
    .toPromise()

  return <RenderBuilderContent content={content} model={PAGE_MODEL_IDENTIFIER} />
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params

  const content: Content | undefined = await serverCMS
    .get(PAGE_MODEL_IDENTIFIER, {
      userAttributes: {
        urlPath: PAGE_PREFIX + (params?.page?.join('/') || ''),
      },
      fields: 'data',
      // Set prerender to false to return JSON instead of HTML
      prerender: false,
    })
    .toPromise()

  if (!content?.data) {
    return {}
  }

  return generateMetadataDetails({
    title: content.data.title,
    description: content.data.description,
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
