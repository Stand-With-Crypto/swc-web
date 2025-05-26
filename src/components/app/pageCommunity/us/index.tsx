import { COMMUNITY_PAGINATION_DATA } from '@/components/app/pageCommunity/common/constants'
import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/us/recentActivityAndLeaderboardTabs'
import { DistrictsLeaderboard } from '@/components/app/pageReferrals/districtsLeaderboard'
import { YourDistrictRank } from '@/components/app/pageReferrals/yourDistrictRank'
import { RecentActivity } from '@/components/app/recentActivity'
import { VariantRecentActivityRow } from '@/components/app/recentActivityRow/variantRecentActivityRow'
import { SumDonationsByUserRow } from '@/components/app/sumDonationsByUserRow/sumDonationsByUserRow'
import { ExternalLink, InternalLink } from '@/components/ui/link'
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
import type { SumDonationsByUser } from '@/data/aggregations/getSumDonationsByUser'
import type { PublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { DistrictRankingEntryWithRank } from '@/utils/server/districtRankings/upsertRankings'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

export const PAGE_LEADERBOARD_TITLE = 'Our community'
export const PAGE_LEADERBOARD_DESCRIPTION = `See how our community is taking a stand to safeguard the future of crypto in America.`

const TAB_OPTIONS: {
  value: RecentActivityAndLeaderboardTabs
  label: string
}[] = [
  {
    value: RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY,
    label: 'Recent activity',
  },
  {
    value: RecentActivityAndLeaderboardTabs.LEADERBOARD,
    label: 'Top donations',
  },
  {
    value: RecentActivityAndLeaderboardTabs.TOP_DISTRICTS,
    label: 'Top districts',
  },
]

export type PageLeaderboardInferredProps =
  | {
      tab: RecentActivityAndLeaderboardTabs.LEADERBOARD
      sumDonationsByUser: SumDonationsByUser
      publicRecentActivity: undefined
      leaderboardData: undefined
    }
  | {
      tab: RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY
      sumDonationsByUser: undefined
      publicRecentActivity: PublicRecentActivity
      leaderboardData: undefined
    }
  | {
      tab: RecentActivityAndLeaderboardTabs.TOP_DISTRICTS
      sumDonationsByUser: undefined
      publicRecentActivity: undefined
      leaderboardData: DistrictRankingEntryWithRank[]
    }

type PageLeaderboardProps = PageLeaderboardInferredProps & {
  countryCode: SupportedCountryCodes
  offset: number
  pageNum: number
  stateCode?: string
  totalPages?: number
}

export function UsPageCommunity({
  tab,
  countryCode,
  offset,
  pageNum,
  sumDonationsByUser,
  publicRecentActivity,
  leaderboardData,
  stateCode,
  totalPages: totalPagesAfterFiltering,
}: PageLeaderboardProps) {
  const urls = getIntlUrls(countryCode)
  const totalPages = totalPagesAfterFiltering || COMMUNITY_PAGINATION_DATA[tab].totalPages

  return (
    <PageLayout className="space-y-7">
      <PageLayout.Title>{PAGE_LEADERBOARD_TITLE}</PageLayout.Title>
      <PageLayout.Subtitle>
        {PAGE_LEADERBOARD_DESCRIPTION} Donations to{' '}
        <ExternalLink href={'https://www.fec.gov/data/committee/C00835959/'}>
          Fairshake
        </ExternalLink>
        , a pro-crypto Super PAC, are not included on the leaderboard.
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
                    href={urls.leaderboard({
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
                href={urls.leaderboard({
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
        {tab === RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY ? (
          pageNum === 1 ? (
            <RecentActivity.DynamicList
              actions={publicRecentActivity}
              countryCode={countryCode}
              pageSize={
                COMMUNITY_PAGINATION_DATA[RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY]
                  .itemsPerPage
              }
            />
          ) : (
            <>
              {publicRecentActivity.map(action => (
                <VariantRecentActivityRow
                  action={action}
                  countryCode={countryCode}
                  key={action.id}
                />
              ))}
            </>
          )
        ) : null}
        {tab === RecentActivityAndLeaderboardTabs.LEADERBOARD && (
          <>
            {sumDonationsByUser.map((donor, index) => (
              <SumDonationsByUserRow
                countryCode={countryCode}
                index={offset + index}
                key={index}
                sumDonations={donor}
              />
            ))}
          </>
        )}
        {tab === RecentActivityAndLeaderboardTabs.TOP_DISTRICTS && (
          <>
            <YourDistrictRank />
            <DistrictsLeaderboard countryCode={countryCode} data={leaderboardData} />
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
                : urls.leaderboard({ pageNum: pageNumber, tab, stateCode })
            }
            totalPages={totalPages}
          />
        </div>
      )}
    </PageLayout>
  )
}
