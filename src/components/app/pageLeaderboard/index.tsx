import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/recentActivityAndLeaderboardTabs'
import { COMMUNITY_PAGINATION_DATA } from '@/components/app/pageLeaderboard/constants'
import { DynamicRecentActivity } from '@/components/app/pageLeaderboard/dynamicRecentActivity'
import { VariantRecentActivityRow } from '@/components/app/recentActivityRow/variantRecentActivityRow'
import { SumDonationsByUserRow } from '@/components/app/sumDonationsByUserRow/sumDonationsByUserRow'
import { ExternalLink, InternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { PaginationLinks } from '@/components/ui/paginationLinks'
import { tabListStyles, tabTriggerStyles } from '@/components/ui/tabs/styles'
import type { SumDonationsByUser } from '@/data/aggregations/getSumDonationsByUser'
import type { PublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { SupportedLocale } from '@/utils/shared/supportedLocales'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

export const PAGE_LEADERBOARD_TITLE = 'Our community'
export const PAGE_LEADERBOARD_DESCRIPTION = `See how our community is taking a stand to safeguard the future of crypto in America.`

export type PageLeaderboardInferredProps =
  | {
      tab: RecentActivityAndLeaderboardTabs.LEADERBOARD
      sumDonationsByUser: SumDonationsByUser
      publicRecentActivity: undefined
    }
  | {
      tab: RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY
      sumDonationsByUser: undefined
      publicRecentActivity: PublicRecentActivity
    }

type PageLeaderboardProps = PageLeaderboardInferredProps & {
  locale: SupportedLocale
  offset: number
  pageNum: number
}

export function PageLeaderboard({
  tab,
  locale,
  offset,
  pageNum,
  sumDonationsByUser,
  publicRecentActivity,
}: PageLeaderboardProps) {
  const urls = getIntlUrls(locale)
  const { totalPages } = COMMUNITY_PAGINATION_DATA[tab]
  return (
    <div className="standard-spacing-from-navbar container space-y-7">
      <PageTitle>{PAGE_LEADERBOARD_TITLE}</PageTitle>
      <PageSubTitle>
        {PAGE_LEADERBOARD_DESCRIPTION} Donations to{' '}
        <ExternalLink href={'https://www.fec.gov/data/committee/C00835959/'}>
          Fairshake
        </ExternalLink>
        , a pro-crypto Super PAC, are not included on the leaderboard.
      </PageSubTitle>
      <div className="text-center">
        <div className={cn(tabListStyles, 'mx-auto')}>
          <InternalLink
            className={tabTriggerStyles}
            data-state={
              tab === RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY ? 'active' : undefined
            }
            href={urls.leaderboard({
              tab: RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY,
            })}
          >
            Recent activity
          </InternalLink>
          <InternalLink
            className={tabTriggerStyles}
            data-state={tab === RecentActivityAndLeaderboardTabs.LEADERBOARD ? 'active' : undefined}
            href={urls.leaderboard({
              tab: RecentActivityAndLeaderboardTabs.LEADERBOARD,
            })}
          >
            Top donations
          </InternalLink>
        </div>
      </div>
      <div className="space-y-8 lg:space-y-10">
        {tab === RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY ? (
          pageNum === 1 ? (
            <DynamicRecentActivity actions={publicRecentActivity} />
          ) : (
            <>
              {publicRecentActivity.map(action => (
                <VariantRecentActivityRow action={action} key={action.id} locale={locale} />
              ))}
            </>
          )
        ) : null}
        {tab === RecentActivityAndLeaderboardTabs.LEADERBOARD && (
          <>
            {sumDonationsByUser.map((donor, index) => (
              <SumDonationsByUserRow
                index={offset + index}
                key={index}
                locale={locale}
                sumDonations={donor}
              />
            ))}
          </>
        )}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center">
          <PaginationLinks
            currentPageNumber={pageNum}
            getPageUrl={pageNumber =>
              pageNumber < 1 || pageNumber > totalPages
                ? ''
                : urls.leaderboard({ pageNum: pageNumber, tab })
            }
            totalPages={totalPages}
          />
        </div>
      )}
    </div>
  )
}
