import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { StateEventsDialogContent } from '@/components/app/pageEvents/components/stateEventsDialogContent'
import { EventsPageDialogDeeplinkLayout } from '@/components/app/pageEvents/ca/eventsPageDialogDeeplinkLayout'
import { PageProps } from '@/types'
import { getEvents } from '@/utils/server/builder/models/data/events'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import {
  getCAProvinceOrTerritoryNameFromCode,
  isValidCAProvinceOrTerritoryCode,
} from '@/utils/shared/stateMappings/caProvinceUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

type Props = PageProps<{ state: string }>

export const dynamic = 'error'

const description =
  'Stand With Crypto hosts events nationwide to organize, activate, and energize the nationwide Crypto community. Check this page for information about upcoming events, including times, dates, and locations, and RSVP to events in your area'

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { state } = params

  return generateMetadataDetails({
    title: `Events in ${getCAProvinceOrTerritoryNameFromCode(state)}`,
    description,
  })
}

const countryCode = SupportedCountryCodes.CA

export default async function StateEventsPageRoot(props: Props) {
  const params = await props.params
  const { state } = params

  if (!isValidCAProvinceOrTerritoryCode(state)) {
    notFound()
  }

  const stateCode = state.toUpperCase()

  const events = await getEvents({ countryCode })

  return (
    <EventsPageDialogDeeplinkLayout events={events}>
      <StateEventsDialogContent
        countryCode={countryCode}
        state={{
          code: stateCode,
          name: getCAProvinceOrTerritoryNameFromCode(stateCode),
        }}
      />
    </EventsPageDialogDeeplinkLayout>
  )
}
