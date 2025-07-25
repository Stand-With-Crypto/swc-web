import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { StateEventsDialogContent } from '@/components/app/pageEvents/components/stateEventsDialogContent'
import { EventsPageDialogDeeplinkLayout } from '@/components/app/pageEvents/eventsPageDialogDeeplinkLayout'
import { PageProps } from '@/types'
import { getEvents } from '@/utils/server/builder/models/data/events'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import {
  getAUStateNameFromStateCode,
  isValidAUStateCode,
} from '@/utils/shared/stateMappings/auStateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

type Props = PageProps<{ state: string }>

export const dynamic = 'error'

const description =
  'Stand With Crypto hosts events nationwide to organize, activate, and energize the nationwide Crypto community. Check this page for information about upcoming events, including times, dates, and locations, and RSVP to events in your area'

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { state } = params

  return generateMetadataDetails({
    title: `Events in ${getAUStateNameFromStateCode(state)}`,
    description,
  })
}

const countryCode = SupportedCountryCodes.AU

export default async function StateEventsPageRoot(props: Props) {
  const params = await props.params
  const { state } = params

  if (!isValidAUStateCode(state)) {
    notFound()
  }

  const stateCode = state.toUpperCase()

  const events = await getEvents({ countryCode })

  return (
    <EventsPageDialogDeeplinkLayout countryCode={countryCode} events={events}>
      <StateEventsDialogContent
        countryCode={countryCode}
        state={{
          code: stateCode,
          name: getAUStateNameFromStateCode(stateCode),
        }}
      />
    </EventsPageDialogDeeplinkLayout>
  )
}
