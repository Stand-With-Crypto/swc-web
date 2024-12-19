import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { EventsPage } from '@/components/app/pageEvents'
import { getEvents } from '@/utils/server/builderIO/swcEvents'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

export const revalidate = 60 // 1 minute
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

export default async function EventsPageRoot() {
  const events = await getEvents()

  if (!events || !events?.length) {
    notFound()
  }

  return <EventsPage events={events} />
}
