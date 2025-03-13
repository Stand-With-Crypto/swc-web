import { Metadata } from 'next'

import { BuilderPageLayout, RenderBuilderContent } from '@/components/app/builder'
import {
  BuilderPageModelIdentifiers,
  InternationalBuilderPageModel,
} from '@/utils/server/builder/models/page/constants'
import { getPageContent, getPageDetails } from '@/utils/server/builder/models/page/utils'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export const dynamic = 'error'
export const revalidate = 86400 // 1 day

const countryCode = SupportedCountryCodes.GB
const PAGE_MODEL: InternationalBuilderPageModel = `${BuilderPageModelIdentifiers.PAGE}-${countryCode}`
const PATHNAME = '/gb/about'

export default async function AboutPage() {
  const content = await getPageContent(PAGE_MODEL, PATHNAME)

  return (
    <BuilderPageLayout countryCode={countryCode} modelName={PAGE_MODEL} pathname={PATHNAME}>
      <RenderBuilderContent content={content} model={PAGE_MODEL} />
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
