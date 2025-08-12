import { US_COMMUNITY_PAGINATION_DATA } from '@/components/app/pageCommunity/us/constants'
import { UsRecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/us/recentActivityAndLeaderboardTabs'
import { UserAddressProvider } from '@/components/app/pageReferrals/common/userAddress.context'
import { USAdvocatesLeaderboard } from '@/components/app/pageReferrals/us/leaderboard'
import {
  UsYourDistrictRank,
  UsYourDistrictRankingWrapper,
  UsYourDistrictRankSuspense,
} from '@/components/app/pageReferrals/us/yourDistrictRanking'
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
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

export const PAGE_LEADERBOARD_TITLE = 'Our community'
export const PAGE_LEADERBOARD_DESCRIPTION = `See how our community is taking a stand to safeguard the future of crypto in America.`

const countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE

const urls = getIntlUrls(countryCode)

const TAB_OPTIONS: {
  value: UsRecentActivityAndLeaderboardTabs
  label: string
}[] = [
  {
    value: UsRecentActivityAndLeaderboardTabs.RECENT_ACTIVITY,
    label: 'Recent activity',
  },
  {
    value: UsRecentActivityAndLeaderboardTabs.LEADERBOARD,
    label: 'Top donations',
  },
  {
    value: UsRecentActivityAndLeaderboardTabs.TOP_DISTRICTS,
    label: 'Top districts',
  },
]

export type PageLeaderboardInferredProps =
  | {
      tab: UsRecentActivityAndLeaderboardTabs.LEADERBOARD
      sumDonationsByUser: SumDonationsByUser
      publicRecentActivity: undefined
      leaderboardData: undefined
    }
  | {
      tab: UsRecentActivityAndLeaderboardTabs.RECENT_ACTIVITY
      sumDonationsByUser: undefined
      publicRecentActivity: PublicRecentActivity
      leaderboardData: undefined
    }
  | {
      tab: UsRecentActivityAndLeaderboardTabs.TOP_DISTRICTS
      sumDonationsByUser: undefined
      publicRecentActivity: undefined
      leaderboardData: DistrictRankingEntryWithRank[]
    }

type PageLeaderboardProps = PageLeaderboardInferredProps & {
  offset: number
  pageNum: number
  totalPages?: number
}

export function UsPageCommunity({
  leaderboardData,
  offset,
  pageNum,
  publicRecentActivity,
  sumDonationsByUser,
  tab,
  totalPages = US_COMMUNITY_PAGINATION_DATA[tab].totalPages,
}: PageLeaderboardProps) {
  return (
    <PageLayout className="space-y-7">
      <PageLayout.Title>{PAGE_LEADERBOARD_TITLE}</PageLayout.Title>
      <PageLayout.Subtitle>
        <>
          {PAGE_LEADERBOARD_DESCRIPTION} Donations to{' '}
          <ExternalLink href={'https://www.fec.gov/data/committee/C00835959/'}>
            Fairshake
          </ExternalLink>
          , a pro-crypto Super PAC, are not included on the leaderboard.
        </>
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
        {tab === UsRecentActivityAndLeaderboardTabs.RECENT_ACTIVITY ? (
          pageNum === 1 ? (
            <RecentActivity.DynamicList
              actions={publicRecentActivity}
              countryCode={countryCode}
              pageSize={
                US_COMMUNITY_PAGINATION_DATA[UsRecentActivityAndLeaderboardTabs.RECENT_ACTIVITY]
                  .itemsPerPage
              }
            />
          ) : (
            <>
              {publicRecentActivity.data.map(action => (
                <VariantRecentActivityRow
                  action={action}
                  countryCode={countryCode}
                  key={action.id}
                />
              ))}
            </>
          )
        ) : null}
        {tab === UsRecentActivityAndLeaderboardTabs.LEADERBOARD && (
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
        {tab === UsRecentActivityAndLeaderboardTabs.TOP_DISTRICTS && (
          <>
            <UsYourDistrictRankingWrapper>
              <UsYourDistrictRankSuspense>
                <UserAddressProvider countryCode={countryCode}>
                  <UsYourDistrictRank />
                </UserAddressProvider>
              </UsYourDistrictRankSuspense>
            </UsYourDistrictRankingWrapper>
            <USAdvocatesLeaderboard data={leaderboardData} />
          </>
        )}
      </div>
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
    </PageLayout>
  )
}
