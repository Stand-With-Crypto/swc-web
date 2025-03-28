'use client'

import { LocationRaces } from '@/components/app/pageLocationKeyRaces/common'
import { GBKeyRaces } from '@/components/app/pageLocationKeyRaces/gb/locationUnitedKingdom/keyRaces'
import { GBKeyRacesStates } from '@/components/app/pageLocationKeyRaces/gb/locationUnitedKingdom/keyRacesStates'
import { organizePeopleGB } from '@/components/app/pageLocationKeyRaces/gb/locationUnitedKingdom/organizePeople'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export function LocationUnitedKingdom({
  countAdvocates,
  countryCode,
  groups,
}: {
  countAdvocates: number
  countryCode: SupportedCountryCodes.GB
  groups: Awaited<ReturnType<typeof organizePeopleGB>>
}) {
  return (
    <LocationRaces countAdvocates={countAdvocates} countryCode={countryCode}>
      <LocationRaces.KeyRaces>
        <GBKeyRaces countryCode={countryCode} groups={groups} />
      </LocationRaces.KeyRaces>
      <LocationRaces.KeyRacesStates countryCode={countryCode}>
        <GBKeyRacesStates countryCode={countryCode} />
      </LocationRaces.KeyRacesStates>
    </LocationRaces>
  )
}
