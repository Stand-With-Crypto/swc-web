import { Metadata } from 'next'

import NotFound from '@/app/not-found'
import { EventsPage } from '@/components/app/pageEvents'
import { getEvents } from '@/utils/server/builderIO/swc-events'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

export const dynamic = 'force-static'

const title = 'Events'
const description =
  'Stand With Crypto hosts events nationwide to organize, activate, and energize the nationwide Crypto community. Check this page for information about upcoming events, including times, dates, and locations, and RSVP to events in your area'

export const metadata: Metadata = {
  ...generateMetadataDetails({
    title,
    description,
  }),
}

export default async function EventsPageRoot() {
  const events = await getEvents()

  if (!events || !events?.length) {
    return NotFound()
  }

  return <EventsPage events={events!} />
}
