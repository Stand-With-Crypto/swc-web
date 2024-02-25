import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/recentActivityAndLeaderboardTabs'
import { DynamicRecentActivity } from '@/components/app/pageLeaderboard/dynamicRecentActivity'
import { getDataForPageLeaderboard } from '@/components/app/pageLeaderboard/getData'
import { VariantRecentActivityRow } from '@/components/app/recentActivityRow/variantRecentActivityRow'
import { SumDonationsByUserRow } from '@/components/app/sumDonationsByUserRow/sumDonationsByUserRow'
import { ExternalLink, InternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { PaginationLinks } from '@/components/ui/paginationLinks'
import { tabListStyles, tabTriggerStyles } from '@/components/ui/tabs/styles'
import { SupportedLocale } from '@/intl/locales'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

import { PAGE_LEADERBOARD_TOTAL_PAGES } from './constants'

export const PAGE_LEADERBOARD_TITLE = 'Our community'
export const PAGE_LEADERBOARD_DESCRIPTION = `See how our community is taking a stand to safeguard the future of crypto in America.`

export function PageLeaderboard({
  tab,
  locale,
  offset,
  pageNum,
  actions,
  sumDonationsByUser,
}: {
  tab: RecentActivityAndLeaderboardTabs
  locale: SupportedLocale
  offset: number
  pageNum: number
} & Awaited<ReturnType<typeof getDataForPageLeaderboard>>) {
  const urls = getIntlUrls(locale)
  return (
    <div className="container space-y-7">
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
            <DynamicRecentActivity actions={actions} />
          ) : (
            <>
              {actions.map(action => (
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
      <div className="flex justify-center">
        <PaginationLinks
          currentPageNumber={pageNum}
          getPageUrl={pageNumber =>
            pageNumber < 1 || pageNumber > PAGE_LEADERBOARD_TOTAL_PAGES
              ? ''
              : urls.leaderboard({ pageNum: pageNumber, tab })
          }
          totalPages={PAGE_LEADERBOARD_TOTAL_PAGES}
        />
      </div>
    </div>
  )
}
