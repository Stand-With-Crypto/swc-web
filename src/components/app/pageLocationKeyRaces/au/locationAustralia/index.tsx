'use client'

import { AUKeyRaces } from '@/components/app/pageLocationKeyRaces/au/locationAustralia/keyRaces'
import { AUKeyRacesStates } from '@/components/app/pageLocationKeyRaces/au/locationAustralia/keyRacesStates'
import { auOrganizePeople } from '@/components/app/pageLocationKeyRaces/au/locationAustralia/organizePeople'
import { LocationRaces } from '@/components/app/pageLocationKeyRaces/common'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const countryCode = SupportedCountryCodes.AU

export function LocationAustralia({
  countAdvocates,
  groups,
}: {
  countAdvocates: number
  groups: Awaited<ReturnType<typeof auOrganizePeople>>
}) {
  return (
    <LocationRaces countAdvocates={countAdvocates} countryCode={countryCode}>
      <LocationRaces.KeyRaces>
        <AUKeyRaces groups={groups} />
      </LocationRaces.KeyRaces>
      <LocationRaces.KeyRacesStates countryCode={countryCode}>
        <AUKeyRacesStates />
      </LocationRaces.KeyRacesStates>
    </LocationRaces>
  )
}
