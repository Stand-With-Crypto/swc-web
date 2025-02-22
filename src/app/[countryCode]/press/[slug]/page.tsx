import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { MOCK_PRESS_CONTENT } from '@/components/app/pagePress/mock'
import { PagePressRelease } from '@/components/app/pagePress/pressRelease'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

export const dynamic = 'error'
export const dynamicParams = true

type PressReleasePageProps = PageProps<{
  slug: string
}>

export async function generateMetadata(props: PressReleasePageProps): Promise<Metadata> {
  const params = await props.params
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

export async function generateStaticParams() {
  return MOCK_PRESS_CONTENT.map(currentArticle => {
    return {
      slug: currentArticle.link.slice(1),
    }
  })
}

export default async function PressRelease(props: PressReleasePageProps) {
  const params = await props.params
  const currentArticle = MOCK_PRESS_CONTENT.find(article => article.link === `/${params.slug}`)

  if (!currentArticle) {
    notFound()
  }

  return <PagePressRelease pressContent={currentArticle} />
}
