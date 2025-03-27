import { Metadata } from 'next'

import { EventsPage } from '@/components/app/pageEvents'
import { PageProps } from '@/types'
import { getEvents } from '@/utils/server/builder/models/data/events'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

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

export default async function EventsPageRoot(props: PageProps) {
  const { countryCode } = await props.params

  const events = await getEvents({ countryCode })

  return <EventsPage events={events} />
}
