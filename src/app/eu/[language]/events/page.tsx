import { Metadata } from 'next'

import { EUEventsPage } from '@/components/app/pageEvents/eu'
import { getEvents } from '@/utils/server/builder/models/data/events'
import { getServerTranslation } from '@/utils/server/i18n/getServerTranslation'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { I18nMessages } from '@/utils/shared/i18n/types'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedEULanguages } from '@/utils/shared/supportedLocales'

export const dynamic = 'error'

const i18nMessages: I18nMessages = {
  en: {
    title: 'Events',
    description:
      'Stand With Crypto hosts events nationwide to organize, activate, and energize the nationwide Crypto community. Check this page for information about upcoming events, including times, dates, and locations, and RSVP to events in your area',
  },
  de: {
    title: 'Veranstaltungen',
    description:
      'Stand With Crypto veranstaltet landesweit Events, um die Krypto-Community zu organisieren, zu aktivieren und zu stärken. Krypto ist eine wichtige Kraft in unserer Wirtschaft, Politik und Kultur – aber wir müssen den Schwung beibehalten.',
  },
  fr: {
    title: 'Événements',
    description:
      "Stand With Crypto organise des événements à travers le pays pour organiser, activer et dynamiser la communauté crypto. La crypto est une force majeure dans notre économie, notre politique et notre culture – mais nous devons maintenir l'élan.",
  },
}

export const generateMetadata = async (props: {
  params: { language: SupportedEULanguages }
}): Promise<Metadata> => {
  const params = await props.params
  const { language } = params
  const { t } = await getServerTranslation(i18nMessages, 'events', language)

  return generateMetadataDetails({
    title: t('title'),
    description: t('description'),
  })
}

const countryCode = SupportedCountryCodes.EU

export default async function EventsPageRoot(props: {
  params: { language: SupportedEULanguages }
}) {
  const params = await props.params
  const { language } = params

  const events = await getEvents({ countryCode, language })

  return <EUEventsPage events={events} language={language} />
}
