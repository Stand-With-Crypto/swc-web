import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import sanitizeHtml from 'sanitize-html'

import { EventDialogContent } from '@/components/app/pageEvents/components/eventDialogContent'
import { EventsPageDialogDeeplinkLayout } from '@/components/app/pageEvents/eventsPageDialogDeeplinkLayout'
import { PageProps } from '@/types'
import { getEvent, getEvents } from '@/utils/server/builder/models/data/events'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { isValidUSStateCode, US_STATE_CODE_TO_DISPLAY_NAME_MAP } from '@/utils/shared/usStateUtils'

type Props = PageProps<{
  state: keyof typeof US_STATE_CODE_TO_DISPLAY_NAME_MAP
  eventSlug: string
}>

export const dynamic = 'error'

const title = 'Event'
const description =
  'Stand With Crypto hosts events nationwide to organize, activate, and energize the nationwide Crypto community. Check this page for information about upcoming events, including times, dates, and locations, and RSVP to events in your area'

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { state, eventSlug, countryCode } = params

  const event = await getEvent({ eventSlug, state, countryCode })

  if (!event) {
    return generateMetadataDetails({
      title: title,
      description,
    })
  }

  return generateMetadataDetails({
    title: `${event.data.name} - ${title}`,
    description: sanitizeHtml(event.data.formattedDescription),
    ogImage: {
      url: event.data.image,
    },
  })
}

export default async function EventDetailsPageRoot(props: Props) {
  const params = await props.params
  const { state, eventSlug, countryCode } = params

  const event = await getEvent({ eventSlug, state, countryCode })

  if (!isValidUSStateCode(state) || !event) {
    notFound()
  }

  const events = await getEvents({ countryCode })

  return (
    <EventsPageDialogDeeplinkLayout countryCode={countryCode} events={events}>
      <EventDialogContent event={event.data} />
    </EventsPageDialogDeeplinkLayout>
  )
}
