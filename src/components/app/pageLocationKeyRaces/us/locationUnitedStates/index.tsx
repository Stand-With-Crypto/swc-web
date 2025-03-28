'use client'

import { LocationRaces } from '@/components/app/pageLocationKeyRaces/common'
import { USKeyRaces } from '@/components/app/pageLocationKeyRaces/us/locationUnitedStates/keyRaces'
import { USKeyRacesStates } from '@/components/app/pageLocationKeyRaces/us/locationUnitedStates/keyRacesStates'
import { organizePeople } from '@/components/app/pageLocationKeyRaces/us/locationUnitedStates/organizePeople'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export function LocationUnitedStates({
  countAdvocates,
  countryCode,
  groups,
}: {
  countAdvocates: number
  countryCode: SupportedCountryCodes.US
  groups: Awaited<ReturnType<typeof organizePeople>>
}) {
  return (
    <LocationRaces countAdvocates={countAdvocates} countryCode={countryCode}>
      <LocationRaces.VoterGuideInput countryCode={countryCode} />
      <LocationRaces.KeyRaces>
        <USKeyRaces countryCode={countryCode} groups={groups} />
      </LocationRaces.KeyRaces>
      <LocationRaces.KeyRacesStates countryCode={countryCode}>
        <USKeyRacesStates countryCode={countryCode} isGovernorRace />
      </LocationRaces.KeyRacesStates>
      <LocationRaces.PacFooter />
    </LocationRaces>
  )
}
