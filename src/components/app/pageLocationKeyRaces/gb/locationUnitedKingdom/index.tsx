'use client'

import { LocationRaces } from '@/components/app/pageLocationKeyRaces/common'
import { GBKeyRaces } from '@/components/app/pageLocationKeyRaces/gb/locationUnitedKingdom/keyRaces'
import { GBKeyRacesStates } from '@/components/app/pageLocationKeyRaces/gb/locationUnitedKingdom/keyRacesStates'
import { gbOrganizePeople } from '@/components/app/pageLocationKeyRaces/gb/locationUnitedKingdom/organizePeople'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const countryCode = SupportedCountryCodes.GB

export function LocationUnitedKingdom({
  countAdvocates,
  groups,
}: {
  countAdvocates: number
  groups: Awaited<ReturnType<typeof gbOrganizePeople>>
}) {
  return (
    <LocationRaces countAdvocates={countAdvocates} countryCode={countryCode}>
      <LocationRaces.KeyRaces>
        <GBKeyRaces groups={groups} />
      </LocationRaces.KeyRaces>
      <LocationRaces.KeyRacesStates>
        <GBKeyRacesStates />
      </LocationRaces.KeyRacesStates>
    </LocationRaces>
  )
}
