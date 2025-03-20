import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { BuilderPageLayout, RenderBuilderContent } from '@/components/app/builder'
import { PageProps } from '@/types'
import { BuilderPageModelIdentifiers } from '@/utils/server/builder/models/page/constants'
import { getPageContent, getPageDetails } from '@/utils/server/builder/models/page/utils'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

export const dynamic = 'error'
export const revalidate = 3600 // 1 hour

const PAGE_MODEL = BuilderPageModelIdentifiers.PAGE
const PATHNAME = '/builder/test'

export default async function BuilderTestPage(props: PageProps) {
  if (NEXT_PUBLIC_ENVIRONMENT === 'production') {
    return notFound()
  }

  const { countryCode } = await props.params

  const content = await getPageContent(PAGE_MODEL, PATHNAME, countryCode)

  return (
    <BuilderPageLayout countryCode={countryCode} modelName={PAGE_MODEL} pathname={PATHNAME}>
      <RenderBuilderContent content={content} model={PAGE_MODEL} />
    </BuilderPageLayout>
  )
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { countryCode } = await props.params

  const metadata = await getPageDetails(PAGE_MODEL, PATHNAME, countryCode)

  return generateMetadataDetails({
    title: metadata.title,
    description: metadata.description,
  })
}
