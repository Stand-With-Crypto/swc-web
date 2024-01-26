import { RecentActivityRow } from '@/components/app/recentActivityRow/recentActivityRow'
import { RecentActivityAndLeaderboardTabs } from '@/components/app/recentActivityAndLeaderboard/recentActivityAndLeaderboardTabs'
import { SumDonationsByUserRow } from '@/components/app/sumDonationsByUserRow/sumDonationsByUserRow'
import { ExternalLink, InternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { PaginationLinks } from '@/components/ui/paginationLinks'
import { tabListStyles, tabTriggerStyles } from '@/components/ui/tabs/styles'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'
import { SupportedLocale } from '@/intl/locales'
import { getDataForPageLeaderboard } from '@/components/app/pageLeaderboard/getData'
import { toBool } from '@/utils/shared/toBool'

export const PAGE_LEADERBOARD_TOTAL_PAGES = 10
export const PAGE_LEADERBOARD_TOTAL_PRE_GENERATED_PAGES = toBool(
  process.env.MINIMIZE_PAGE_PRE_GENERATION,
)
  ? 1
  : PAGE_LEADERBOARD_TOTAL_PAGES
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
      <PageSubTitle>{PAGE_LEADERBOARD_DESCRIPTION}</PageSubTitle>
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
              Donations to{' '}
              <ExternalLink
                href={'https://www.axios.com/2023/12/18/crypto-super-pac-fairshake-2024-elections'}
              >
                Fairshake
              </ExternalLink>
              , a pro-crypto Super PAC, are not included on the leaderboard.
            </p>
            {sumDonationsByUser.map((donor, index) => (
              <SumDonationsByUserRow
                key={index}
                index={offset + index}
                sumDonations={donor}
                locale={locale}
              />
            ))}
          </>
        )}
      </div>
      <div className="flex justify-center">
        <PaginationLinks
          getPageUrl={pageNumber =>
            pageNumber < 1 || pageNumber > PAGE_LEADERBOARD_TOTAL_PAGES
              ? ''
              : urls.leaderboard({ pageNum: pageNumber, tab })
          }
          currentPageNumber={pageNum}
          totalPages={PAGE_LEADERBOARD_TOTAL_PAGES}
        />
      </div>
    </div>
  )
}
