import { Metadata } from 'next'

import { RenderBuilderContent } from '@/components/app/builder'
import { PageProps } from '@/types'
import { serverCMS } from '@/utils/server/builder/serverCMS'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { contentPageModel } from '@/utils/server/builder/models/page'
import { BuilderPageLayout } from '@/components/app/builderPageLayout'

export const dynamic = 'error'
export const dynamicParams = true

type DynamicPageProps = PageProps<{ page: string[] }>

export default async function Page(props: DynamicPageProps) {
  const { locale, page } = await props.params

  const pathname = page?.join('/')

  const content = await contentPageModel.getPageContent(pathname)

  return (
    <BuilderPageLayout pageModel={contentPageModel} locale={locale} pathname={pathname}>
      <RenderBuilderContent content={content} model={contentPageModel.modelName} />
    </BuilderPageLayout>
  )
}

export async function generateMetadata(props: DynamicPageProps): Promise<Metadata> {
  const { page } = await props.params

  const metadata = await contentPageModel.getPageMetadata(page?.join('/'))

  return generateMetadataDetails({
    title: metadata.title,
    description: metadata.description,
  })
}

export async function generateStaticParams() {
  const paths = await serverCMS
    .getAll(contentPageModel.modelName, { options: { noTargeting: true } })
    .then(res => res.map(({ data }) => data?.url))

  return paths.map((path: string) => {
    return {
      params: {
        page: path.replace(contentPageModel.routePrefix, '').split('/'),
      },
    }
  })
}
