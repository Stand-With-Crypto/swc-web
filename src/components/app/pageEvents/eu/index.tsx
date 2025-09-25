import { AllUpcomingEvents } from '@/components/app/pageEvents/common/allUpcomingEvents'
import { EventsIntro } from '@/components/app/pageEvents/common/eventsIntro'
import { EventsNearYou } from '@/components/app/pageEvents/common/eventsNearYou'
import { FeaturedPastEvents } from '@/components/app/pageEvents/common/featuredPastEvents'
import { PromotedEvents } from '@/components/app/pageEvents/common/promotedEvents'
import { EventsPageProps } from '@/components/app/pageEvents/common/types'
import { EventsPageWrapper } from '@/components/app/pageEvents/common/wrapper'
import { getFeaturedPastEvents } from '@/components/app/pageEvents/utils/getFeaturedPastEvents'
import { getFutureEvents } from '@/components/app/pageEvents/utils/getFutureEvents'
import { getPromotedEvents } from '@/components/app/pageEvents/utils/getPromotedEvents'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { getServerTranslation } from '@/utils/server/i18n/getServerTranslation'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'

const countryCode = SupportedCountryCodes.EU

const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      title: 'Events',
      subtitle:
        'Stand With Crypto Alliance is dedicated to engaging and empowering the crypto community both online and at real-world events. Crypto is a major force in our economy, our politics, and our culture – but we need to keep up the momentum.',
    },
    de: {
      title: 'Veranstaltungen',
      subtitle:
        'Die Stand With Crypto Alliance hat es sich zur Aufgabe gemacht, die Kryptogemeinschaft sowohl online als auch bei realen Veranstaltungen zu engagieren und zu stärken. Krypto ist eine wichtige Kraft in unserer Wirtschaft, unserer Politik und unserer Kultur – aber wir müssen die Dynamik aufrechterhalten.',
    },
    fr: {
      title: 'Événements',
      subtitle:
        'La Stand With Crypto Alliance est dédiée à engager et à faire progresser la communauté crypto à la fois en ligne et lors de réalisations physiques. Le crypto est une force majeure dans notre économie, notre politique et notre culture – mais nous devons maintenir la dynamique.',
    },
  },
})

export async function EuPageEvents({
  events,
  isDeepLink,
  language,
}: EventsPageProps & { language: SupportedLanguages }) {
  const { t } = await getServerTranslation(i18nMessages, 'events', countryCode, language)

  const futureEvents = getFutureEvents(events)
  const promotedEvents = getPromotedEvents(futureEvents)
  const featuredPastEvents = getFeaturedPastEvents(events)

  return (
    <EventsPageWrapper isDeepLink={isDeepLink}>
      <EventsIntro>
        <PageTitle>{t('title')}</PageTitle>
        <PageSubTitle>{t('subtitle')}</PageSubTitle>
      </EventsIntro>
      {promotedEvents && promotedEvents.length > 0 && (
        <PromotedEvents countryCode={countryCode} events={promotedEvents} />
      )}

      <EventsNearYou events={futureEvents ?? []} />

      {futureEvents && futureEvents.length > 0 && (
        <AllUpcomingEvents countryCode={countryCode} events={futureEvents} showMap={false} />
      )}

      {featuredPastEvents && featuredPastEvents.length > 0 && (
        <FeaturedPastEvents
          countryCode={countryCode}
          events={featuredPastEvents}
          language={language}
        />
      )}
    </EventsPageWrapper>
  )
}
