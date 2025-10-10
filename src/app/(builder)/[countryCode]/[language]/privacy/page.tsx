import { Metadata } from 'next'

import { BuilderPageLayout, RenderBuilderContent } from '@/components/app/builder'
import { PageProps } from '@/types'
import { BuilderPageModelIdentifiers } from '@/utils/server/builder/models/page/constants'
import { getPageContent, getPageDetails } from '@/utils/server/builder/models/page/utils'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'

export const dynamic = 'error'
export const revalidate = 86400 // 1 day

const PAGE_MODEL = BuilderPageModelIdentifiers.PAGE
const PATHNAME = '/privacy'

export default async function PrivacyPage(props: PageProps) {
  const { countryCode } = await props.params

  const content = await getPageContent(PAGE_MODEL, PATHNAME, countryCode)

  return (
    <BuilderPageLayout countryCode={countryCode} modelName={PAGE_MODEL} pathname={PATHNAME}>
      <RenderBuilderContent content={content} model={PAGE_MODEL} />
    </BuilderPageLayout>
  )
}

export async function generateMetadata(
  props: PageProps<{ language: SupportedLanguages }>,
): Promise<Metadata> {
  const { countryCode, language } = await props.params

  const metadata = await getPageDetails(PAGE_MODEL, PATHNAME, countryCode, language)

  return generateMetadataDetails({
    title: metadata.title,
    description: metadata.description,
  })
}
