import React from 'react'
import { flatten, times } from 'lodash-es'
import { Metadata } from 'next'

import { GBGetPageData } from '@/components/app/pageCommunity'
import { GbPageCommunity } from '@/components/app/pageCommunity/gb'
import { GB_RECENT_ACTIVITY_PAGINATION } from '@/components/app/pageCommunity/gb/constants'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

export const revalidate = 30 // 30 seconds
export const dynamic = 'error'
export const dynamicParams = true

type GbCommunityRecentActivityPageProps = PageProps<{ page: string[] }>

export async function generateMetadata(_: GbCommunityRecentActivityPageProps): Promise<Metadata> {
  return generateMetadataDetails({
    title: 'Our community',
    description:
      'See how our community is taking a stand to safeguard the future of crypto in the UK.',
  })
}

export async function generateStaticParams() {
  const { totalPregeneratedPages } = GB_RECENT_ACTIVITY_PAGINATION
  return flatten(times(totalPregeneratedPages).map(i => ({ page: i ? [`${i + 1}`] : [] })))
}

export default async function GbCommunityRecentActivityPage(
  props: GbCommunityRecentActivityPageProps,
) {
  const params = await props.params
  const pageData = await GBGetPageData({
    page: params.page,
  })

  return <GbPageCommunity {...pageData} />
}
