import { Metadata } from 'next'
import { permanentRedirect } from 'next/navigation'

import { StateEventsDialog } from '@/components/app/pageEvents/components/stateEventsDialog'
import { EventsPageDialogDeeplinkLayout } from '@/components/app/pageEvents/eventsPageDialogDeeplinkLayout'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { getIntlUrls } from '@/utils/shared/urls'
import { US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP } from '@/utils/shared/usStateUtils'

type Props = PageProps<{ state: keyof typeof US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP }>

const description =
  'Stand With Crypto hosts events nationwide to organize, activate, and energize the nationwide Crypto community. Check this page for information about upcoming events, including times, dates, and locations, and RSVP to events in your area'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state } = params

  return generateMetadataDetails({
    title: `Events in ${US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP[state.toUpperCase() as keyof typeof US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP]}`,
    description,
  })
}

export default async function StateEventsPageRoot({ params }: Props) {
  const { state, locale } = params
  const intlUrls = getIntlUrls(locale)

  const isStateValid = Object.keys(US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP).includes(
    state.toUpperCase(),
  )

  if (!isStateValid) {
    permanentRedirect(intlUrls.events())
  }

  return (
    <EventsPageDialogDeeplinkLayout pageParams={params}>
      <StateEventsDialog state={state} />
    </EventsPageDialogDeeplinkLayout>
  )
}
