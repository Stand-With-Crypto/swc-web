import { Metadata } from 'next'

import { EventsPage } from '@/components/app/pageEvents'
import { getEvents } from '@/utils/server/builder/models/data/events'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

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

const countryCode = SupportedCountryCodes.CA

export default async function EventsPageRoot() {
  const events = await getEvents({ countryCode })

  return <EventsPage events={events} showMap={false} />
}
