import { Metadata } from 'next'

import { BuilderPageLayout, RenderBuilderContent } from '@/components/app/builder'
import { StaticPagesCTA } from '@/components/app/staticPagesCTA'
import { PageProps } from '@/types'
import { BuilderPageModelIdentifiers } from '@/utils/server/builder/models/page/constants'
import { getPageContent, getPageDetails } from '@/utils/server/builder/models/page/utils'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

export const dynamic = 'error'

const PAGE_MODEL = BuilderPageModelIdentifiers.PAGE
const PATHNAME = '/privacy'

export default async function TermsOfServicePage(props: PageProps) {
  const { locale } = await props.params

  const content = await getPageContent(PAGE_MODEL, PATHNAME)

  return (
    <BuilderPageLayout locale={locale} modelName={PAGE_MODEL} pathname={PATHNAME}>
      <RenderBuilderContent content={content} model={PAGE_MODEL} />
      <div className="container mt-8 flex flex-col items-center">
        <StaticPagesCTA />
      </div>
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
