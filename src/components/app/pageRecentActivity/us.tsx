import { COMMUNITY_PAGINATION_DATA } from '@/components/app/pageCommunity/common/constants'
import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/us/recentActivityAndLeaderboardTabs'
import { Content } from '@/components/app/pageRecentActivity/common/content'
import { Header } from '@/components/app/pageRecentActivity/common/header'
import { Layout } from '@/components/app/pageRecentActivity/common/layout'
import { PublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { getStateNameResolver } from '@/utils/shared/stateUtils'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

const RECENT_ACTIVITY_TITLE = 'Recent activity'

interface UsPageRecentActivityProps {
  pageNumber: number
  publicRecentActivity: PublicRecentActivity
  stateCode: string
  totalPages: number
}

const countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE

const urls = getIntlUrls(countryCode)

const stateNameResolver = getStateNameResolver(countryCode)

export function UsPageRecentActivity({
  pageNumber,
  publicRecentActivity,
  stateCode,
  totalPages,
}: UsPageRecentActivityProps) {
  const stateName = stateNameResolver(stateCode)

  return (
    <Layout>
      <Header.Title>{RECENT_ACTIVITY_TITLE}</Header.Title>
      <Header.SubTitle>See what actions people in {stateName} are taking</Header.SubTitle>

      {pageNumber === 1 ? (
        <Content.DynamicList
          actions={publicRecentActivity}
          countryCode={countryCode}
          pageSize={
            COMMUNITY_PAGINATION_DATA[RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY].itemsPerPage
          }
          stateCode={stateCode}
        />
      ) : (
        <>
          {publicRecentActivity.data.map(action => (
            <Content.VariantRecentActivityRow
              action={action}
              countryCode={countryCode}
              key={action.id}
            />
          ))}
        </>
      )}

      {totalPages > 1 && (
        <Content.Pagination
          currentPageNumber={pageNumber}
          getPageUrl={targetPageNumber =>
            urls.recentActivity({ pageNumber: targetPageNumber, stateCode })
          }
          totalPages={totalPages}
        />
      )}
    </Layout>
  )
}
