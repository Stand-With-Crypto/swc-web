import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { EventDialogContent } from '@/components/app/pageEvents/components/eventDialogContent'
import { EventsPageDialogDeeplinkLayout } from '@/components/app/pageEvents/eventsPageDialogDeeplinkLayout'
import { PageProps } from '@/types'
import { getEvent } from '@/utils/server/builderIO/swcEvent'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { SECONDS_DURATION } from '@/utils/shared/seconds'
import { US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP } from '@/utils/shared/usStateUtils'

type Props = PageProps<{
  state: keyof typeof US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP
  eventSlug: string
}>

export const revalidate = SECONDS_DURATION.MINUTE
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

export default async function EventDetailsPageRoot({ params }: Props) {
  const { state, eventSlug } = params

  const event = await getEvent(eventSlug, state)

  const isStateValid = Object.keys(US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP).includes(
    state.toUpperCase(),
  )

  if (!isStateValid || !event) {
    notFound()
  }

  return (
    <EventsPageDialogDeeplinkLayout pageParams={params}>
      <EventDialogContent event={event.data} />
    </EventsPageDialogDeeplinkLayout>
  )
}
