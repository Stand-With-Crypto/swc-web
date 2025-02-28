import { notFound } from 'next/navigation'

import { BuilderPageLayout, RenderBuilderContent } from '@/components/app/builder'
import { PageProps } from '@/types'
import { BuilderPageModelIdentifiers } from '@/utils/server/builder/models/page/constants'
import { getPageContent } from '@/utils/server/builder/models/page/utils'

export const dynamic = 'error'

const PAGE_MODEL = BuilderPageModelIdentifiers.PAGE
const PATHNAME = '/builder/test'

const isProd = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production'

export default async function BuilderTestPage(props: PageProps) {
  const { countryCode } = await props.params

  if (isProd) {
    return notFound()
  }

  const content = await getPageContent(PAGE_MODEL, PATHNAME, countryCode)

  return (
    <BuilderPageLayout countryCode={countryCode} modelName={PAGE_MODEL} pathname={PATHNAME}>
      <RenderBuilderContent content={content} countryCode={countryCode} model={PAGE_MODEL} />
    </BuilderPageLayout>
  )
}
