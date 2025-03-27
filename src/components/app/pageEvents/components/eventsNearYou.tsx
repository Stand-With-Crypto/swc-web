'use client'

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'

import { EventCard } from '@/components/app/pageEvents/components/eventCard'
import { NoEventsCTA } from '@/components/app/pageEvents/components/noEventsCTA'
import { getUniqueEventKey } from '@/components/app/pageEvents/utils/getUniqueEventKey'
import { GooglePlacesSelect } from '@/components/ui/googlePlacesSelect'
import { PageTitle } from '@/components/ui/pageTitleText'
import { useMutableCurrentUserAddress } from '@/hooks/useCurrentUserAddress'
import { getGBCountryCodeFromName } from '@/utils/shared/gbCountryUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SWCEvents } from '@/utils/shared/zod/getSWCEvents'
import {
  convertGooglePlaceAutoPredictionToAddressSchema,
  GooglePlaceAutocompletePrediction,
} from '@/utils/web/googlePlaceUtils'

interface EventsNearYouProps {
  events: SWCEvents
}

export function EventsNearYou(props: EventsNearYouProps) {
  return (
    <Suspense fallback={null}>
      <SuspenseEventsNearYou {...props} />
    </Suspense>
  )
}

function SuspenseEventsNearYou({ events }: EventsNearYouProps) {
  const { setAddress, address } = useMutableCurrentUserAddress()
  const [userState, setUserState] = useState<string>()

  const onChangeAddress = useCallback(
    async (prediction: GooglePlaceAutocompletePrediction | null) => {
      if (!prediction) {
        setAddress(null)
        return
      }

      const details = await convertGooglePlaceAutoPredictionToAddressSchema(prediction)

      // Google Places API returns the full country name for the UK, so we need to convert it to the country code
      if (details.countryCode.toLowerCase() === SupportedCountryCodes.GB) {
        return setUserState(getGBCountryCodeFromName(details.administrativeAreaLevel1))
      }

      setUserState(details.administrativeAreaLevel1)
    },
    [setAddress],
  )

  useEffect(() => {
    if (address === 'loading') return

    void onChangeAddress(address)
  }, [address, onChangeAddress])

  return (
    <section className="grid w-full items-center gap-4 lg:gap-6">
      <PageTitle as="h3">Events near you</PageTitle>

      <div className="mx-auto w-full max-w-[562px]">
        <GooglePlacesSelect
          className="bg-backgroundAlternate"
          loading={address === 'loading'}
          onChange={setAddress}
          placeholder="Enter your address"
          value={address !== 'loading' ? address : null}
        />
      </div>

      {address ? <FilteredEventsNearUser events={events} userState={userState} /> : null}
    </section>
  )
}

function FilteredEventsNearUser({
  events,
  userState,
}: {
  events: SWCEvents
  userState: string | undefined
}) {
  const filteredEventsNearUser = useMemo(() => {
    return events.filter(event => event.data.state === userState)
  }, [events, userState])

  const hasEvents = filteredEventsNearUser.length > 0

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {hasEvents ? (
        filteredEventsNearUser.map(event => (
          <EventCard event={event.data} key={getUniqueEventKey(event.data)} />
        ))
      ) : (
        <NoEventsCTA initialText="There are no events happening near you at the moment. " />
      )}
    </div>
  )
}
