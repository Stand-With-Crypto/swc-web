import { Metadata } from 'next'

import { BuilderPageLayout, RenderBuilderContent } from '@/components/app/builder'
import { PageBills } from '@/components/app/pageBills'
import { getAllBills } from '@/data/bills/getAllBills'
import { PageProps } from '@/types'
import { BuilderPageModelIdentifiers } from '@/utils/server/builder/models/page/constants'
import { getPageContent, getPageDetails } from '@/utils/server/builder/models/page/utils'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'

export const revalidate = 60 // 1 minute
export const dynamic = 'error'

const PAGE_MODEL = BuilderPageModelIdentifiers.PAGE
const PATHNAME = '/bills'

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { countryCode } = await props.params

  const metadata = await getPageDetails(PAGE_MODEL, PATHNAME, countryCode)

  return generateMetadataDetails({
    title: metadata.title,
    description: metadata.description,
  })
}

export default async function BillsPage(props: PageProps) {
  const { countryCode } = await props.params

  const results = await getAllBills(DEFAULT_SUPPORTED_COUNTRY_CODE)

  const content = await getPageContent(PAGE_MODEL, PATHNAME, countryCode)

  return (
    <BuilderPageLayout countryCode={countryCode} modelName={PAGE_MODEL} pathname={PATHNAME}>
      <RenderBuilderContent content={content} model={PAGE_MODEL} />
      <PageBills bills={results} countryCode={(await props.params).countryCode} />
    </BuilderPageLayout>
  )
}
