import { RecentActivityRow } from '@/components/app/recentActivityRow/recentActivityRow'
import { RecentActivityAndLeaderboardTabs } from '@/components/app/recentActivityAndLeaderboard/recentActivityAndLeaderboardTabs'
import { SumDonationsByUserRow } from '@/components/app/sumDonationsByUserRow/sumDonationsByUserRow'
import { InternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { PaginationLinks } from '@/components/ui/paginationLinks'
import { tabListStyles, tabTriggerStyles } from '@/components/ui/tabs/styles'
import { getSumDonationsByUser } from '@/data/aggregations/getSumDonationsByUser'
import { getSumDonationsRankForUser } from '@/data/aggregations/getSumDonationsRankForUser'
import { getPublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { PageProps } from '@/types'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'
import _ from 'lodash'
import { notFound } from 'next/navigation'
import { z } from 'zod'
import { Metadata } from 'next'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { getUserSessionIdOnAppRouter } from '@/utils/server/serverUserSessionId'
import { getExistingUserAndMethodOfMatch } from '@/utils/server/getExistingUserAndMethodOfMatch'

export const revalidate = 0
export const dynamic = 'auto'
export const dynamicParams = true

type Props = PageProps<{ page: string[] }>

const title = 'Our community'
const description =
  'See how our community is taking a stand to safeguard the future of crypto in America.'
export async function generateMetadata(_props: Props): Promise<Metadata> {
  return generateMetadataDetails({
    title,
    description,
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

// TODO determine if we need to dynamically generate this or if we're comfortable just supporting a hardcoded amount
const TOTAL_PAGES = process.env.SPEED_UP_LOCAL_BUILDS ? 1 : 10

// // pre-generate the first 10 pages. If people want to go further, we'll generate them on the fly
export async function generateStaticParams() {
  return _.flatten(
    _.times(TOTAL_PAGES).map(i =>
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
  const urls = getIntlUrls(locale)
  const pageNum = validatePageNum(page || [])
  const tab = validateTab(page || [])
  if (!pageNum || !tab) {
    notFound()
  }
  const { user } = await getExistingUserAndMethodOfMatch()

  const offset = (pageNum - 1) * 20
  const [actions, sumDonationsByUser, currentUserRank] = await Promise.all([
    getPublicRecentActivity({ limit: 20, offset }),
    getSumDonationsByUser({ limit: 20, offset }),
    !!user && getSumDonationsRankForUser({ userId: user.id, limit: 20 }),
  ])
  const isCurrentUserInTop20 = currentUserRank && currentUserRank.rank <= 20
  const shouldShowCurrentUserRow = pageNum === 1 && currentUserRank && currentUserRank.rank > 20

  return (
    <div className="container space-y-7">
      <PageTitle as="h3">{title}</PageTitle>
      <PageSubTitle as="h4">{description}</PageSubTitle>
      <div className="text-center">
        <div className={cn(tabListStyles, 'mx-auto')}>
          <InternalLink
            className={tabTriggerStyles}
            data-state={
              tab === RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY ? 'active' : undefined
            }
            href={urls.leaderboard({
              pageNum,
              tab: RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY,
            })}
          >
            Recent activity
          </InternalLink>
          <InternalLink
            className={tabTriggerStyles}
            data-state={tab === RecentActivityAndLeaderboardTabs.LEADERBOARD ? 'active' : undefined}
            href={urls.leaderboard({ pageNum, tab: RecentActivityAndLeaderboardTabs.LEADERBOARD })}
          >
            Top donations
          </InternalLink>
        </div>
      </div>
      <div className="mx-auto w-full max-w-2xl space-y-7">
        {tab === RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY && (
          <>
            <div className="mt-2 h-7" />
            {actions.map(action => (
              <RecentActivityRow locale={locale} action={action} key={action.id} />
            ))}
          </>
        )}
        {tab === RecentActivityAndLeaderboardTabs.LEADERBOARD && (
          <>
            <p className="mt-2 h-7 text-center text-xs text-gray-500">
              Donations are from FairShake and Stand With Crypto
            </p>
            {sumDonationsByUser.map((donor, index) => (
              <SumDonationsByUserRow
                key={index}
                index={offset + index}
                sumDonations={donor}
                locale={locale}
                highlight={!!user && donor.user.id === user.id} // Highlight if it's the logged-in user
              />
            ))}
            {shouldShowCurrentUserRow && (
              <>
                <div className="align-center flex justify-center text-sm opacity-50">{`${
                  Number(currentUserRank.rank) - 1
                } donors ahead of you`}</div>
                <SumDonationsByUserRow
                  key="currentUser"
                  index={Number(currentUserRank.rank) - 1}
                  sumDonations={{ totalAmountUsd: currentUserRank.totalAmountUsd, user }}
                  locale={locale}
                  highlight={true}
                />
              </>
            )}
          </>
        )}
      </div>
      <div className="flex justify-center">
        <PaginationLinks
          getPageUrl={pageNumber =>
            pageNumber < 1 || pageNumber > TOTAL_PAGES
              ? ''
              : urls.leaderboard({ pageNum: pageNumber, tab })
          }
          currentPageNumber={pageNum}
          totalPages={TOTAL_PAGES}
        />
      </div>
    </div>
  )
}
