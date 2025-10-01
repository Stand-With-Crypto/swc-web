import { HomePageSection } from '@/components/app/pageHome/common/homePageSectionLayout'
import { TopLevelMetrics } from '@/components/app/pageHome/common/topLevelMetrics'
import { HomePageProps } from '@/components/app/pageHome/common/types'
import { RecentActivity } from '@/components/app/recentActivity'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { getServerTranslation } from '@/utils/server/i18n/getServerTranslation'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'
import { getIntlUrls } from '@/utils/shared/urls'

import { EuHero } from './hero'

type EuPageHomeProps = {
  language: SupportedLanguages
} & Pick<HomePageProps, 'topLevelMetrics' | 'recentActivity'>

const countryCode = SupportedCountryCodes.EU

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      communityTitle: 'Our community',
      communitySubtitle:
        'See how our community is taking a stand to safeguard the future of crypto in Australia.',
      viewAll: 'View all',
    },
    de: {
      communityTitle: 'Unsere Community',
      communitySubtitle:
        'Sehen Sie, wie unsere Community sich für die Zukunft von Krypto in der EU stark macht.',
      viewAll: 'Alle anzeigen',
    },
    fr: {
      communityTitle: 'Notre communauté',
      communitySubtitle:
        'Voyez comment notre communauté se mobilise pour protéger le futur de la crypto en Europe.',
      viewAll: 'Voir tout',
    },
  },
})

export async function EuPageHome(props: EuPageHomeProps) {
  const { language, topLevelMetrics, recentActivity } = props

  const { t } = await getServerTranslation(i18nMessages, 'euPageHome', countryCode, language)

  const urls = getIntlUrls(countryCode, { language })

  return (
    <>
      <EuHero language={language} />

      <section className="container">
        <TopLevelMetrics {...topLevelMetrics} disableTooltips useGlobalLabels />
      </section>

      {recentActivity && (
        <HomePageSection>
          <HomePageSection.Title>{t('communityTitle')}</HomePageSection.Title>
          <HomePageSection.Subtitle className="md:hidden">
            {t('communitySubtitle')}
          </HomePageSection.Subtitle>

          <RecentActivity>
            <RecentActivity.List actions={recentActivity} />
            <RecentActivity.Footer>
              <Button asChild variant="secondary">
                <InternalLink href={urls.community()}>{t('viewAll')}</InternalLink>
              </Button>
            </RecentActivity.Footer>
          </RecentActivity>
        </HomePageSection>
      )}
    </>
  )
}
