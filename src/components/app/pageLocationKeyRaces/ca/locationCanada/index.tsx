'use client'

import { CAKeyRaces } from '@/components/app/pageLocationKeyRaces/ca/locationCanada/keyRaces'
import { CAKeyRacesStates } from '@/components/app/pageLocationKeyRaces/ca/locationCanada/keyRacesStates'
import { organizePeopleCA } from '@/components/app/pageLocationKeyRaces/ca/locationCanada/organizePeople'
import { LocationRaces } from '@/components/app/pageLocationKeyRaces/common'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export function LocationCanada({
  countAdvocates,
  countryCode,
  groups,
}: {
  countAdvocates: number
  countryCode: SupportedCountryCodes.CA
  groups: Awaited<ReturnType<typeof organizePeopleCA>>
}) {
  return (
    <LocationRaces countAdvocates={countAdvocates} countryCode={countryCode}>
      <LocationRaces.KeyRaces>
        <CAKeyRaces countryCode={countryCode} groups={groups} />
      </LocationRaces.KeyRaces>
      <LocationRaces.KeyRacesStates countryCode={countryCode}>
        <CAKeyRacesStates countryCode={countryCode} />
      </LocationRaces.KeyRacesStates>
    </LocationRaces>
  )
}
