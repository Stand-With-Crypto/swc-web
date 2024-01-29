import {
  PAGE_LEADERBOARD_DESCRIPTION,
  PAGE_LEADERBOARD_TITLE,
  PAGE_LEADERBOARD_TOTAL_PRE_GENERATED_PAGES,
  PageLeaderboard,
} from '@/components/app/pageLeaderboard'
import { getDataForPageLeaderboard } from '@/components/app/pageLeaderboard/getData'
import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/recentActivityAndLeaderboardTabs'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import _ from 'lodash'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { z } from 'zod'

export const revalidate = 5
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
const validateTab = ([_page, tab]: (string | undefined)[]) => {
  if (!tab) {
    return RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY
  }
  if (tab === RecentActivityAndLeaderboardTabs.LEADERBOARD) {
    return RecentActivityAndLeaderboardTabs.LEADERBOARD
  }
  return null
}

// // pre-generate the first 10 pages. If people want to go further, we'll generate them on the fly
export async function generateStaticParams() {
  return _.flatten(
    _.times(PAGE_LEADERBOARD_TOTAL_PRE_GENERATED_PAGES).map(i =>
      Object.values(RecentActivityAndLeaderboardTabs).map(tab => {
        const tabPath = tab === RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY ? '' : tab
        if (i) {
          return { page: tabPath ? [`${i + 1}`, tabPath] : [`${i + 1}`] }
        }
        return { page: tabPath ? [`${i + 1}`, tabPath] : [] }
      }),
    ),
  )
}

export default async function Leaderboard({ params }: Props) {
  const { locale, page } = params
  const pageNum = validatePageNum(page || [])
  const tab = validateTab(page || [])
  if (!pageNum || !tab) {
    notFound()
  }
  const offset = (pageNum - 1) * 20
  const { actions, sumDonationsByUser } = await getDataForPageLeaderboard(offset)
  return <PageLeaderboard {...{ tab, actions, locale, sumDonationsByUser, offset, pageNum }} />
}
