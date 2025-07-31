import { AU_RECENT_ACTIVITY_PAGINATION } from '@/components/app/pageCommunity/au/constants'
import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/au/recentActivityAndLeaderboardTabs'
import { AuAdvocatesLeaderboard } from '@/components/app/pageReferrals/au/leaderboard'
import {
  AuYourDivisionRank,
  AuYourDivisionRankSuspense,
} from '@/components/app/pageReferrals/au/yourDivisionRanking'
import { UserAddressProvider } from '@/components/app/pageReferrals/common/userAddress.context'
import { RecentActivity } from '@/components/app/recentActivity'
import { InternalLink } from '@/components/ui/link'
import { PageLayout } from '@/components/ui/pageLayout'
import { PaginationLinks } from '@/components/ui/paginationLinks'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { tabListStyles, tabTriggerStyles } from '@/components/ui/tabs/styles'
import { PublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { DistrictRankingEntryWithRank } from '@/utils/server/districtRankings/upsertRankings'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

const countryCode = SupportedCountryCodes.AU
const urls = getIntlUrls(countryCode)

export type PageLeaderboardInferredProps =
  | {
      tab: RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY
      publicRecentActivity: PublicRecentActivity
      leaderboardData: undefined
    }
  | {
      tab: RecentActivityAndLeaderboardTabs.TOP_DIVISIONS
      publicRecentActivity: undefined
      leaderboardData: DistrictRankingEntryWithRank[]
    }

const TAB_OPTIONS: {
  value: RecentActivityAndLeaderboardTabs
  label: string
}[] = [
  {
    value: RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY,
    label: 'Recent activity',
  },
  {
    value: RecentActivityAndLeaderboardTabs.TOP_DIVISIONS,
    label: 'Top divisions',
  },
]

type AuPageLeaderboardProps = PageLeaderboardInferredProps & {
  offset: number
  pageNum: number
  totalPages?: number
}

export function AuPageCommunity({
  pageNum,
  publicRecentActivity,
  totalPages = 1,
  tab,
  leaderboardData,
}: AuPageLeaderboardProps) {
  return (
    <PageLayout>
      <PageLayout.Title>Our community</PageLayout.Title>
      <PageLayout.Subtitle>
        See how the community is taking a stand to safeguard the future of crypto in Australia.
      </PageLayout.Subtitle>

      <div className="text-center">
        {/* Mobile: Select */}
        <div className="sm:hidden">
          <Select value={tab}>
            <SelectTrigger className="mx-auto mb-10 min-h-14 w-full rounded-full bg-secondary px-4 text-base font-semibold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl font-bold">
              <SelectItem
                className="pl-4 text-muted-foreground opacity-100"
                disabled
                value={'first'}
              >
                Select View
              </SelectItem>
              {TAB_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  <InternalLink
                    className={cn(tabTriggerStyles, 'px-0')}
                    href={urls.community({
                      tab: option.value,
                    })}
                  >
                    {option.label}
                  </InternalLink>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Desktop: TabsList */}
        <div className="mb-8 hidden text-center sm:mb-4 sm:block">
          <div className={cn(tabListStyles, 'mx-auto')}>
            {TAB_OPTIONS.map(option => (
              <InternalLink
                className={tabTriggerStyles}
                data-state={tab === option.value ? 'active' : undefined}
                href={urls.community({
                  tab: option.value,
                })}
                key={option.value}
              >
                {option.label}
              </InternalLink>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-8 lg:space-y-10">
        {tab === RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY && (
          <RecentActivity>
            {pageNum === 1 ? (
              <RecentActivity.DynamicList
                actions={publicRecentActivity}
                countryCode={countryCode}
                pageSize={AU_RECENT_ACTIVITY_PAGINATION.itemsPerPage}
              />
            ) : (
              <RecentActivity.List actions={publicRecentActivity} />
            )}
            <RecentActivity.Footer className="flex justify-center">
              <RecentActivity.Pagination
                currentPageNumber={pageNum}
                getPageUrl={pageNumber =>
                  urls.community({
                    pageNum: pageNumber,
                    tab: RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY,
                  })
                }
                totalPages={totalPages}
              />
            </RecentActivity.Footer>
          </RecentActivity>
        )}

        {tab === RecentActivityAndLeaderboardTabs.TOP_DIVISIONS && leaderboardData && (
          <>
            <AuYourDivisionRankSuspense>
              <UserAddressProvider countryCode={countryCode}>
                <AuYourDivisionRank />
              </UserAddressProvider>
            </AuYourDivisionRankSuspense>
            <AuAdvocatesLeaderboard data={leaderboardData} />
            {totalPages > 1 && (
              <div className="flex justify-center">
                <PaginationLinks
                  currentPageNumber={pageNum}
                  getPageUrl={pageNumber => {
                    if (pageNumber < 1 || pageNumber > totalPages) {
                      return ''
                    }

                    return urls.community({ pageNum: pageNumber, tab })
                  }}
                  totalPages={totalPages}
                />
              </div>
            )}
          </>
        )}
      </div>
    </PageLayout>
  )
}
