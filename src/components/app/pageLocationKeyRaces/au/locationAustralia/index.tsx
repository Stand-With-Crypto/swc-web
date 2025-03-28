'use client'

import { AUKeyRaces } from '@/components/app/pageLocationKeyRaces/au/locationAustralia/keyRaces'
import { AUKeyRacesStates } from '@/components/app/pageLocationKeyRaces/au/locationAustralia/keyRacesStates'
import { organizePeopleAU } from '@/components/app/pageLocationKeyRaces/au/locationAustralia/organizePeople'
import { LocationRaces } from '@/components/app/pageLocationKeyRaces/common'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export function LocationAustralia({
  countAdvocates,
  countryCode,
  groups,
}: {
  countAdvocates: number
  countryCode: SupportedCountryCodes.AU
  groups: Awaited<ReturnType<typeof organizePeopleAU>>
}) {
  return (
    <LocationRaces countAdvocates={countAdvocates} countryCode={countryCode}>
      <LocationRaces.KeyRaces>
        <AUKeyRaces countryCode={countryCode} groups={groups} />
      </LocationRaces.KeyRaces>
      <LocationRaces.KeyRacesStates countryCode={countryCode}>
        <AUKeyRacesStates countryCode={countryCode} />
      </LocationRaces.KeyRacesStates>
    </LocationRaces>
  )
}
