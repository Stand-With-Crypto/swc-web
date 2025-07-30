import { US_STATE_SPECIFIC_COMMUNITY_PAGINATION_DATA } from '@/components/app/pageCommunity/us/constants'
import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/us/recentActivityAndLeaderboardTabs'
import { USAdvocatesLeaderboard } from '@/components/app/pageReferrals/us/leaderboard'
import {
  UsYourDistrictRank,
  UsYourDistrictRankSuspense,
} from '@/components/app/pageReferrals/us/yourDistrictRanking'
import { UserAddressProvider } from '@/components/app/pageReferrals/userAddress.context'
import { RecentActivity } from '@/components/app/recentActivity'
import { VariantRecentActivityRow } from '@/components/app/recentActivityRow/variantRecentActivityRow'
import { PageLayout } from '@/components/ui/pageLayout'
import { PaginationLinks } from '@/components/ui/paginationLinks'
import type { PublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { DistrictRankingEntryWithRank } from '@/utils/server/districtRankings/upsertRankings'
import { getStateNameResolver } from '@/utils/shared/stateUtils'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

const countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE

const urls = getIntlUrls(countryCode)

const stateNameResolver = getStateNameResolver(countryCode)

export type PageStateSpecificCommunityInferredProps =
  | {
      tab: RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY
      publicRecentActivity: PublicRecentActivity
      leaderboardData: undefined
    }
  | {
      tab: RecentActivityAndLeaderboardTabs.TOP_DISTRICTS
      publicRecentActivity: undefined
      leaderboardData: DistrictRankingEntryWithRank[]
    }

type PageStateSpecificCommunityProps = PageStateSpecificCommunityInferredProps & {
  offset: number
  pageNum: number
  stateCode: string
  totalPages: number
}

export function UsStateSpecificCommunityPage({
  leaderboardData,
  pageNum,
  publicRecentActivity,
  stateCode,
  tab,
  totalPages,
}: PageStateSpecificCommunityProps) {
  const stateDisplayName = stateNameResolver(stateCode)
  return (
    <PageLayout className="space-y-7">
      <PageLayout.Title>
        {tab === RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY
          ? 'Recent activity'
          : `Top ${stateDisplayName} districts`}
      </PageLayout.Title>
      <PageLayout.Subtitle>
        {tab === RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY
          ? `See what actions people in ${stateDisplayName} are taking`
          : `See which congressional districts in ${stateDisplayName} have the most advocates.`}
      </PageLayout.Subtitle>

      <div className="space-y-8 lg:space-y-10">
        {tab === RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY ? (
          pageNum === 1 ? (
            <RecentActivity.DynamicList
              actions={publicRecentActivity}
              countryCode={countryCode}
              pageSize={
                US_STATE_SPECIFIC_COMMUNITY_PAGINATION_DATA[
                  RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY
                ].itemsPerPage
              }
              stateCode={stateCode}
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
        {tab === RecentActivityAndLeaderboardTabs.TOP_DISTRICTS && (
          <>
            <UsYourDistrictRankSuspense>
              <UserAddressProvider countryCode={countryCode} filterByAdministrativeArea>
                <UsYourDistrictRank />
              </UserAddressProvider>
            </UsYourDistrictRankSuspense>
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
              return urls.communityStateSpecific({ pageNum: pageNumber, tab, stateCode })
            }}
            totalPages={totalPages}
          />
        </div>
      )}
    </PageLayout>
  )
}
