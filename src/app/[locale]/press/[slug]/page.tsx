import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { MOCK_PRESS_CONTENT } from '@/components/app/pagePress/mock'
import { PagePressRelease } from '@/components/app/pagePress/pressRelease'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { toBool } from '@/utils/shared/toBool'

export const dynamic = 'error'
export const dynamicParams = toBool(process.env.MINIMIZE_PAGE_PRE_GENERATION)

type PressReleasePageProps = PageProps<{
  slug: string
}>

export async function generateMetadata({ params }: PressReleasePageProps): Promise<Metadata> {
  const currentArticle = MOCK_PRESS_CONTENT.find(article => article.link === `/${params.slug}`)

  if (currentArticle) {
    return generateMetadataDetails({
      title: `${currentArticle?.publication}: ${currentArticle?.heading}`,
      description: currentArticle?.heading,
    })
  }

  const title = 'Press Release'

  return generateMetadataDetails({
    title,
  })
}

export default async function PressRelease({ params }: PressReleasePageProps) {
  const currentArticle = MOCK_PRESS_CONTENT.find(article => article.link === `/${params.slug}`)

  if (!currentArticle) {
    notFound()
  }

  return <PagePressRelease pressContent={currentArticle} />
}
