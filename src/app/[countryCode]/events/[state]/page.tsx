import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { StateEventsDialogContent } from '@/components/app/pageEvents/components/stateEventsDialogContent'
import { EventsPageDialogDeeplinkLayout } from '@/components/app/pageEvents/eventsPageDialogDeeplinkLayout'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { US_STATE_CODE_TO_DISPLAY_NAME_MAP } from '@/utils/shared/stateMappings/usStateUtils'

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
