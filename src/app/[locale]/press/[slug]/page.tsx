import { Metadata } from 'next'

import { MOCK_PRESS_CONTENT } from '@/app/[locale]/press/mock'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { toBool } from '@/utils/shared/toBool'
import { PageProps } from '@/types'
import { PagePressRelease } from '@/components/app/pagePress/pressRelease'
import { notFound } from 'next/navigation'

export const dynamic = 'error'
export const dynamicParams = toBool(process.env.MINIMIZE_PAGE_PRE_GENERATION)

type PressReleasePageProps = PageProps<{
  slug: string
}>

export async function generateMetadata({ params }: PressReleasePageProps): Promise<Metadata> {
  const currentArticle = MOCK_PRESS_CONTENT.find(article => article.link === `/${params.slug}`)

  const title = `${currentArticle?.publication}: ${currentArticle?.heading}`
  const description = currentArticle?.heading

  return generateMetadataDetails({
    title,
    description,
  })
}

export default async function PressRelease({ params }: PressReleasePageProps) {
  const currentArticle = MOCK_PRESS_CONTENT.find(article => article.link === `/${params.slug}`)

  if (!currentArticle) {
    notFound()
  }

  return <PagePressRelease pressContent={currentArticle} />
}
