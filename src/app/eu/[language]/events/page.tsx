import { Metadata } from 'next'

import { EuPageEvents } from '@/components/app/pageEvents/eu'
import { getEvents } from '@/utils/server/builder/models/data/events'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'

export const dynamic = 'error'

const title = 'Events'
const description =
  'Stand With Crypto hosts events nationwide to organize, activate, and energize the nationwide Crypto community. Check this page for information about upcoming events, including times, dates, and locations, and RSVP to events in your area'

export const metadata: Metadata = {
  ...generateMetadataDetails({
    title,
    description,
  }),
}

const countryCode = SupportedCountryCodes.EU

export default async function EventsPageRoot(props: { params: { language: SupportedLanguages } }) {
  const { language } = await props.params

  const events = await getEvents({ countryCode, language })

  console.log('events', events)

  return <EuPageEvents events={events} language={language} />
}
