import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { StateEventsDialogContent } from '@/components/app/pageEvents/components/stateEventsDialogContent'
import { EventsPageDialogDeeplinkLayout } from '@/components/app/pageEvents/eventsPageDialogDeeplinkLayout'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import {
  getUSStateNameFromStateCode,
  US_STATE_CODE_TO_DISPLAY_NAME_MAP,
  isValidUSStateCode,
} from '@/utils/shared/usStateUtils'
import { getEvents } from '@/utils/server/builder/models/data/events'

type Props = PageProps<{ state: keyof typeof US_STATE_CODE_TO_DISPLAY_NAME_MAP }>

export const dynamic = 'error'

const description =
  'Stand With Crypto hosts events nationwide to organize, activate, and energize the nationwide Crypto community. Check this page for information about upcoming events, including times, dates, and locations, and RSVP to events in your area'

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { state } = params

  return generateMetadataDetails({
    title: `Events in ${US_STATE_CODE_TO_DISPLAY_NAME_MAP[state.toUpperCase() as keyof typeof US_STATE_CODE_TO_DISPLAY_NAME_MAP]}`,
    description,
  })
}

export default async function StateEventsPageRoot(props: Props) {
  const params = await props.params
  const { state, countryCode } = params

  if (!isValidUSStateCode(state)) {
    notFound()
  }

  const stateCode = state.toUpperCase()

  const events = await getEvents({ countryCode })

  return (
    <EventsPageDialogDeeplinkLayout countryCode={countryCode} events={events}>
      <StateEventsDialogContent
        state={{
          code: stateCode,
          name: getUSStateNameFromStateCode(stateCode),
        }}
        countryCode={countryCode}
      />
    </EventsPageDialogDeeplinkLayout>
  )
}
