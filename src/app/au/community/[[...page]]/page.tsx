import React from 'react'
import { flatten, times } from 'lodash-es'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { RecentActivity } from '@/components/app/pageHome/common/recentActivity'
import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/us/recentActivityAndLeaderboardTabs'
import { COMMUNITY_PAGINATION_DATA } from '@/components/app/pageLeaderboard/constants'
import { validatePageNum } from '@/components/app/pageLeaderboard/pageValidator'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { getPublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

const countryCode = SupportedCountryCodes.AU
const urls = getIntlUrls(countryCode)

export const revalidate = 30 // 30 seconds
export const dynamic = 'error'
export const dynamicParams = true

type AuCommunityRecentActivityPageProps = PageProps<{ page: string[] }>

export async function generateMetadata(_: AuCommunityRecentActivityPageProps): Promise<Metadata> {
  return generateMetadataDetails({
    title: 'Our community',
    description:
      'See how our community is taking a stand to safeguard the future of crypto in Australia.',
  })
}

export async function generateStaticParams() {
  const { totalPregeneratedPages } =
    COMMUNITY_PAGINATION_DATA[RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY]
  return flatten(times(totalPregeneratedPages).map(i => ({ page: i ? [`${i + 1}`] : [] })))
}

export default async function AuCommunityRecentActivityPage(
  props: AuCommunityRecentActivityPageProps,
) {
  const params = await props.params
  const { itemsPerPage } =
    COMMUNITY_PAGINATION_DATA[RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY]

  const { page } = params
  const pageNum = validatePageNum(page ?? [])
  if (!pageNum) {
    notFound()
  }
  const offset = (pageNum - 1) * itemsPerPage

  const publicRecentActivity = await getPublicRecentActivity({
    limit: itemsPerPage,
    offset,
    countryCode,
  })

  return (
    <div className="container">
      <RecentActivity>
        <RecentActivity.Title>
          People in <span className="text-primary-cta">Australia</span> are fighting for crypto
        </RecentActivity.Title>
        <RecentActivity.Subtitle>
          See how the community is taking a stand to safeguard the future of crypto in Australia.
        </RecentActivity.Subtitle>

        <RecentActivity.List actions={publicRecentActivity} />
        <RecentActivity.Footer>
          <Button asChild variant="secondary">
            <InternalLink href={urls.leaderboard()}>View all</InternalLink>
          </Button>
        </RecentActivity.Footer>
      </RecentActivity>
    </div>
  )
}
