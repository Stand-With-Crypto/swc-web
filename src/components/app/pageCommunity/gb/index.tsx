import { RECENT_ACTIVITY_PAGINATION } from '@/components/app/pageCommunity/common/constants'
import { getPageData } from '@/components/app/pageCommunity/common/getPageData'
import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/us/recentActivityAndLeaderboardTabs'
import { RecentActivity } from '@/components/app/recentActivity'
import { PageLayout } from '@/components/ui/pageLayout'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

type GbPageLeaderboardProps = Awaited<ReturnType<typeof getPageData>>

const countryCode = SupportedCountryCodes.GB
const urls = getIntlUrls(countryCode)

export function GbPageCommunity({
  pageNum,
  publicRecentActivity,
  totalPages,
}: GbPageLeaderboardProps) {
  return (
    <PageLayout>
      <PageLayout.Title>Our community</PageLayout.Title>
      <PageLayout.Subtitle>
        See how the community is taking a stand to safeguard the future of crypto in the UK.
      </PageLayout.Subtitle>

      <RecentActivity>
        {pageNum === 1 ? (
          <RecentActivity.DynamicList
            actions={publicRecentActivity}
            countryCode={countryCode}
            pageSize={RECENT_ACTIVITY_PAGINATION.itemsPerPage}
          />
        ) : (
          <RecentActivity.List actions={publicRecentActivity} />
        )}
        <RecentActivity.Footer className="flex justify-center">
          <RecentActivity.Pagination
            currentPageNumber={pageNum}
            getPageUrl={pageNumber =>
              urls.leaderboard({
                pageNum: pageNumber,
                tab: RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY,
              })
            }
            totalPages={totalPages}
          />
        </RecentActivity.Footer>
      </RecentActivity>
    </PageLayout>
  )
}
