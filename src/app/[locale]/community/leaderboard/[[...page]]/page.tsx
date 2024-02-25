import { flatten, times } from 'lodash-es'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { z } from 'zod'

import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/recentActivityAndLeaderboardTabs'
import {
  PAGE_LEADERBOARD_DESCRIPTION,
  PAGE_LEADERBOARD_TITLE,
  PageLeaderboard,
  PageLeaderboardInferredProps,
} from '@/components/app/pageLeaderboard'
import {
  PAGE_LEADERBOARD_ITEMS_PER_PAGE,
  PAGE_LEADERBOARD_TOTAL_PRE_GENERATED_PAGES,
} from '@/components/app/pageLeaderboard/constants'
import { getSumDonationsByUser } from '@/data/aggregations/getSumDonationsByUser'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

export const revalidate = SECONDS_DURATION.MINUTE * 30
export const dynamic = 'error'
export const dynamicParams = true

type Props = PageProps<{ page: string[] }>

export async function generateMetadata(_props: Props): Promise<Metadata> {
  return generateMetadataDetails({
    title: PAGE_LEADERBOARD_TITLE,
    description: PAGE_LEADERBOARD_DESCRIPTION,
  })
}

const pageValidator = z.string().pipe(z.coerce.number().int().gte(1).lte(50))
const validatePageNum = ([page]: (string | undefined)[]) => {
  if (!page) {
    return 1
  }
  const val = pageValidator.safeParse(page)
  if (val.success) {
    return val.data
  }
  return null
}

// pre-generate the first 10 pages. If people want to go further, we'll generate them on the fly
export async function generateStaticParams() {
  return flatten(
    times(PAGE_LEADERBOARD_TOTAL_PRE_GENERATED_PAGES).map(i => ({ page: i ? [`${i + 1}`] : [] })),
  )
}

export default async function CommunityLeaderboardPage({ params }: Props) {
  const { locale, page } = params
  const pageNum = validatePageNum(page ?? [])
  if (!pageNum) {
    notFound()
  }
  const offset = (pageNum - 1) * PAGE_LEADERBOARD_ITEMS_PER_PAGE

  const sumDonationsByUser = await getSumDonationsByUser({
    limit: PAGE_LEADERBOARD_ITEMS_PER_PAGE,
    offset,
  })

  const dataProps: PageLeaderboardInferredProps = {
    tab: RecentActivityAndLeaderboardTabs.LEADERBOARD,
    sumDonationsByUser,
    publicRecentActivity: undefined,
  }

  return <PageLeaderboard {...dataProps} locale={locale} offset={offset} pageNum={pageNum} />
}
