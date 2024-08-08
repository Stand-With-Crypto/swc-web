import { Metadata } from 'next'
import { permanentRedirect } from 'next/navigation'

import { StateEventsDialog } from '@/components/app/pageEvents/components/state-events-dialog'
import { EventsPageDialogDeeplinkLayout } from '@/components/app/pageEvents/eventsPageDialogDeeplinkLayout'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { getIntlUrls } from '@/utils/shared/urls'
import { US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP } from '@/utils/shared/usStateUtils'

type Props = PageProps<{ state: keyof typeof US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP }>

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

export default async function EventsPageRoot({ params }: Props) {
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
