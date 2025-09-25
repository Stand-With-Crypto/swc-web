import { EuPageEvents } from '@/components/app/pageEvents/eu'
import { getEvents } from '@/utils/server/builder/models/data/events'
import { getServerTranslation } from '@/utils/server/i18n/getServerTranslation'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'

export const dynamic = 'error'

const countryCode = SupportedCountryCodes.EU

export const generateMetadata = async ({
  params,
}: {
  params: { language: SupportedLanguages }
}) => {
  const { language } = await params

  const { t } = await getServerTranslation(
    createI18nMessages({
      defaultMessages: {
        en: {
          title: 'Events',
          description:
            'Stand With Crypto hosts events nationwide to organize, activate, and energize the nationwide Crypto community. Check this page for information about upcoming events, including times, dates, and locations, and RSVP to events in your area',
        },
        de: {
          title: 'Veranstaltungen',
          description:
            'Stand With Crypto veranstaltet landesweit Events, um die landesweite Krypto-Community zu organisieren, zu aktivieren und zu stärken. Auf dieser Seite finden Sie Informationen zu bevorstehenden Events, einschließlich Uhrzeiten, Daten und Veranstaltungsorten. Melden Sie sich hier für Events in Ihrer Nähe an.',
        },
        fr: {
          title: 'Événements',
          description:
            'Stand With Crypto organise des événements dans tout le pays pour organiser, mobiliser et dynamiser la communauté crypto nationale. Consultez cette page pour obtenir des informations sur les événements à venir, y compris les heures, les dates et les lieux, et inscrivez-vous aux événements près de chez vous.',
        },
      },
    }),
    'generateEventsMetadata',
    countryCode,
    language,
  )

  return generateMetadataDetails({
    title: t('title'),
    description: t('description'),
  })
}

export async function generateStaticParams() {
  return [
    { language: SupportedLanguages.EN },
    { language: SupportedLanguages.DE },
    { language: SupportedLanguages.FR },
  ]
}

export default async function EventsPageRoot(props: { params: { language: SupportedLanguages } }) {
  const { language } = await props.params

  const events = await getEvents({ countryCode, language })

  return <EuPageEvents events={events} language={language} />
}
