import { GB_RECENT_ACTIVITY_PAGINATION } from '@/components/app/pageCommunity/gb/constants'
import { getGbPageData } from '@/components/app/pageCommunity/gb/getPageData'
import { GbRecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/gb/recentActivityAndLeaderboardTabs'
import { RecentActivity } from '@/components/app/recentActivity'
import { PageLayout } from '@/components/ui/pageLayout'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

type GbPageLeaderboardProps = Awaited<ReturnType<typeof getGbPageData>>

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
            pageSize={GB_RECENT_ACTIVITY_PAGINATION.itemsPerPage}
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
                tab: GbRecentActivityAndLeaderboardTabs.RECENT_ACTIVITY,
              })
            }
            totalPages={totalPages}
          />
        </RecentActivity.Footer>
      </RecentActivity>
    </PageLayout>
  )
}
