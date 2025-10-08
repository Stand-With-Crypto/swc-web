import { EU_RECENT_ACTIVITY_PAGINATION } from '@/components/app/pageCommunity/eu/constants'
import { EuRecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/eu/recentActivityAndLeaderboardTabs'
import { RecentActivity } from '@/components/app/recentActivity'
import { PageLayout } from '@/components/ui/pageLayout'
import { PublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { getStaticTranslation } from '@/utils/server/i18n/getStaticTranslation'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'
import { getIntlUrls } from '@/utils/shared/urls'

const countryCode = SupportedCountryCodes.EU

export interface PageLeaderboardInferredProps {
  publicRecentActivity: PublicRecentActivity
}

type EuPageLeaderboardProps = PageLeaderboardInferredProps & {
  offset: number
  pageNum: number
  language?: SupportedLanguages
  totalPages?: number
}

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      title: 'Our community',
      subtitle:
        'See how the community is taking a stand to safeguard the future of crypto in European Union.',
    },
    de: {
      title: 'Unsere Community',
      subtitle:
        'Sehen Sie, wie die Community sich einsetzt, um die Zukunft von Krypto in der Europäischen Union zu schützen.',
    },
    fr: {
      title: 'Notre communauté',
      subtitle:
        "Découvrez comment la communauté se mobilise pour protéger l'avenir de la crypto dans l'Union européenne.",
    },
  },
})

export function EuPageCommunity({
  pageNum,
  publicRecentActivity,
  totalPages = 1,
  language = SupportedLanguages.EN,
}: EuPageLeaderboardProps) {
  const urls = getIntlUrls(countryCode, { language })

  const { t } = getStaticTranslation(i18nMessages, language, countryCode)

  return (
    <PageLayout>
      <PageLayout.Title>{t('title')}</PageLayout.Title>
      <PageLayout.Subtitle>{t('subtitle')}</PageLayout.Subtitle>

      <div className="space-y-8 lg:space-y-10">
        <RecentActivity>
          {pageNum === 1 ? (
            <RecentActivity.DynamicList
              actions={publicRecentActivity}
              countryCode={countryCode}
              pageSize={EU_RECENT_ACTIVITY_PAGINATION.itemsPerPage}
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
                  tab: EuRecentActivityAndLeaderboardTabs.RECENT_ACTIVITY,
                })
              }
              totalPages={totalPages}
            />
          </RecentActivity.Footer>
        </RecentActivity>
      </div>
    </PageLayout>
  )
}
