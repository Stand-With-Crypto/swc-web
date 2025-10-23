import { HomePageSection } from '@/components/app/pageHome/common/homePageSectionLayout'
import * as TopLevelMetrics from '@/components/app/pageHome/common/topLevelMetrics'
import { HomePageProps } from '@/components/app/pageHome/common/types'
import { RecentActivity } from '@/components/app/recentActivity'
import { UserActionGridCTAs } from '@/components/app/userActionGridCTAs'
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
      getInvolvedTitle: 'Get involved',
      getInvolvedSubtitle: "The future of crypto is in your hands. Here's how you can help.",
      communitySubtitle:
        'See how our community is taking a stand to safeguard the future of crypto in Europe.',
      viewAll: 'View all',
      globalCryptoAdvocates: 'Global crypto advocates',
      globalPolicymakerContacts: 'Global policymaker contacts',
    },
    de: {
      communityTitle: 'Unsere Community',
      getInvolvedTitle: 'Machen Sie mit',
      getInvolvedSubtitle: 'Die Zukunft von Krypto liegt in Ihren Händen. So können Sie helfen.',
      communitySubtitle:
        'Sehen Sie, wie unsere Community sich für die Zukunft von Krypto in der EU stark macht.',
      viewAll: 'Alle anzeigen',
      globalCryptoAdvocates: 'Globale Krypto-Befürworter',
      globalPolicymakerContacts: 'Globale politische Entscheidungsträger kontaktiert',
    },
    fr: {
      communityTitle: 'Notre communauté',
      getInvolvedTitle: 'Participez',
      getInvolvedSubtitle:
        "L'avenir de la crypto est entre vos mains. Voici comment vous pouvez aider.",
      communitySubtitle:
        'Voyez comment notre communauté se mobilise pour protéger le futur de la crypto en Europe.',
      viewAll: 'Voir tout',
      globalCryptoAdvocates: 'Défenseurs mondiaux de la crypto',
      globalPolicymakerContacts: 'Contacts avec les décideurs politiques mondiaux',
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
        <TopLevelMetrics.Root countryCode={countryCode}>
          <TopLevelMetrics.Split>
            <TopLevelMetrics.Card
              countryCode={countryCode}
              img="/advocacyToolkit/shield.png"
              imgAlt={t('globalCryptoAdvocates')}
              label={t('globalCryptoAdvocates')}
              value={topLevelMetrics.countUsers.total}
            />
            <TopLevelMetrics.Card
              countryCode={countryCode}
              img="/actionTypeIcons/email.png"
              imgAlt={t('globalPolicymakerContacts')}
              label={t('globalPolicymakerContacts')}
              value={
                topLevelMetrics.countPolicymakerContacts.countUserActionCalls +
                topLevelMetrics.countPolicymakerContacts.countUserActionEmailRecipients +
                topLevelMetrics.countPolicymakerContacts.hardcodedCountSum
              }
            />
          </TopLevelMetrics.Split>
        </TopLevelMetrics.Root>
      </section>

      {recentActivity && recentActivity.count > 0 && (
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

      <HomePageSection>
        <HomePageSection.Title>{t('getInvolvedTitle')}</HomePageSection.Title>
        <HomePageSection.Subtitle>{t('getInvolvedSubtitle')}</HomePageSection.Subtitle>

        <UserActionGridCTAs />
      </HomePageSection>
    </>
  )
}
