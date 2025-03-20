import { Metadata } from 'next'

import { BuilderPageLayout, RenderBuilderContent } from '@/components/app/builder'
import { PartnerGrid } from '@/components/app/pagePartners/partnerGrid'
import { PageProps } from '@/types'
import { getPartners } from '@/utils/server/builder/models/data/partners'
import { BuilderPageModelIdentifiers } from '@/utils/server/builder/models/page/constants'
import { getPageContent, getPageDetails } from '@/utils/server/builder/models/page/utils'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

export const dynamic = 'error'
export const revalidate = 86400 // 1 day

const PAGE_MODEL = BuilderPageModelIdentifiers.PAGE
const PATHNAME = '/partners'

export default async function PartnersPage(props: PageProps) {
  const { countryCode } = await props.params

  const content = await getPageContent(PAGE_MODEL, PATHNAME, countryCode)
  const partners = await getPartners({ countryCode })

  return (
    <BuilderPageLayout countryCode={countryCode} modelName={PAGE_MODEL} pathname={PATHNAME}>
      <RenderBuilderContent content={content} model={PAGE_MODEL} />
      <div className="standard-spacing-from-navbar container space-y-20">
        <PartnerGrid partners={partners} />
      </div>
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
