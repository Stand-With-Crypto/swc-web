'use client'

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'

import { EventCard } from '@/components/app/pageEvents/common/eventCard'
import { NoEventsCTA } from '@/components/app/pageEvents/common/noEventsCTA'
import { getUniqueEventKey } from '@/components/app/pageEvents/utils/getUniqueEventKey'
import { GooglePlacesSelect } from '@/components/ui/googlePlacesSelect'
import { PageTitle } from '@/components/ui/pageTitleText'
import { useMutableCurrentUserAddress } from '@/hooks/useCurrentUserAddress'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { getGBCountryCodeFromName } from '@/utils/shared/stateMappings/gbCountryUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SWCEvents } from '@/utils/shared/zod/getSWCEvents'
import {
  convertGooglePlaceAutoPredictionToAddressSchema,
  GooglePlaceAutocompletePrediction,
} from '@/utils/web/googlePlaceUtils'
import { useTranslation } from '@/utils/web/i18n/useTranslation'

interface EventsNearYouProps {
  events: SWCEvents
}

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      title: 'Events near you',
      enterYourAddress: 'Enter your address',
      noEvents: 'There are no events happening near you at the moment. ',
    },
    fr: {
      title: 'Événements près de vous',
      enterYourAddress: 'Entrez votre adresse',
      noEvents: "Il n'y a pas d'événements à proximité à ce moment. ",
    },
    de: {
      title: 'Veranstaltungen in deiner Nähe',
      enterYourAddress: 'Gib deine Adresse ein',
      noEvents: 'Es gibt momentan keine Veranstaltungen in deiner Nähe. ',
    },
  },
})

export function EventsNearYou(props: EventsNearYouProps) {
  return (
    <Suspense fallback={null}>
      <SuspenseEventsNearYou {...props} />
    </Suspense>
  )
}

function SuspenseEventsNearYou({ events }: EventsNearYouProps) {
  const { t } = useTranslation(i18nMessages, 'events')

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
      <PageTitle as="h3">{t('title')}</PageTitle>

      <div className="mx-auto w-full max-w-[562px]">
        <GooglePlacesSelect
          className="bg-backgroundAlternate"
          loading={address === 'loading'}
          onChange={setAddress}
          placeholder={t('enterYourAddress')}
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
  const { t } = useTranslation(i18nMessages, 'events')

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
        <NoEventsCTA initialText={t('noEvents')} />
      )}
    </div>
  )
}
