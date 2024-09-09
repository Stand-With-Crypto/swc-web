import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { StateEventsDialogContent } from '@/components/app/pageEvents/components/stateEventsDialogContent'
import { EventsPageDialogDeeplinkLayout } from '@/components/app/pageEvents/eventsPageDialogDeeplinkLayout'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { SECONDS_DURATION } from '@/utils/shared/seconds'
import { US_STATE_CODE_TO_DISPLAY_NAME_MAP } from '@/utils/shared/usStateUtils'

type Props = PageProps<{ state: keyof typeof US_STATE_CODE_TO_DISPLAY_NAME_MAP }>

export const revalidate = SECONDS_DURATION.MINUTE
export const dynamic = 'error'

const description =
  'Stand With Crypto hosts events nationwide to organize, activate, and energize the nationwide Crypto community. Check this page for information about upcoming events, including times, dates, and locations, and RSVP to events in your area'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state } = params

  return generateMetadataDetails({
    title: `Events in ${US_STATE_CODE_TO_DISPLAY_NAME_MAP[state.toUpperCase() as keyof typeof US_STATE_CODE_TO_DISPLAY_NAME_MAP]}`,
    description,
  })
}

export default async function StateEventsPageRoot({ params }: Props) {
  const { state } = params

  const isStateValid = Object.keys(US_STATE_CODE_TO_DISPLAY_NAME_MAP).includes(state.toUpperCase())

  if (!isStateValid) {
    notFound()
  }

  return (
    <EventsPageDialogDeeplinkLayout pageParams={params}>
      <StateEventsDialogContent state={state} />
    </EventsPageDialogDeeplinkLayout>
  )
}
