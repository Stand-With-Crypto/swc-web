import { notFound } from 'next/navigation'

import { BuilderPageLayout, RenderBuilderContent } from '@/components/app/builder'
import { PageProps } from '@/types'
import { BuilderPageModelIdentifiers } from '@/utils/server/builder/models/page/constants'
import { getPageContent } from '@/utils/server/builder/models/page/utils'

export const dynamic = 'error'

const PAGE_MODEL = BuilderPageModelIdentifiers.PAGE
const PATHNAME = '/test'

const isProd = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production'

export default async function BuilderTestPage(props: PageProps) {
  const { countryCode } = await props.params

  if (isProd) {
    return notFound()
  }

  const content = await getPageContent(PAGE_MODEL, PATHNAME)

  return (
    <BuilderPageLayout countryCode={countryCode} modelName={PAGE_MODEL} pathname={PATHNAME}>
      <RenderBuilderContent content={content} model={PAGE_MODEL} />
    </BuilderPageLayout>
  )
}
