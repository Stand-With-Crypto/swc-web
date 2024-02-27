import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

export const revalidate = SECONDS_DURATION.SECOND * 30
export const dynamic = 'error'
export const dynamicParams = true

type Props = PageProps<{ slug: string }>

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params
  const title = `Live event ${slug}`

  return generateMetadataDetails({
    title,
  })
}

export default async function LiveEventPage({ params }: Props) {
  const { slug } = params
  if (!slug) {
    notFound()
  }

  return <div>Hello world</div>
}
