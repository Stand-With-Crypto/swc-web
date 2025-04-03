'use client'

import { LocationRaces } from '@/components/app/pageLocationKeyRaces/common'
import { USKeyRaces } from '@/components/app/pageLocationKeyRaces/us/locationUnitedStates/keyRaces'
import { USKeyRacesStates } from '@/components/app/pageLocationKeyRaces/us/locationUnitedStates/keyRacesStates'
import { organizePeople } from '@/components/app/pageLocationKeyRaces/us/locationUnitedStates/organizePeople'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'

const countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE

export function LocationUnitedStates({
  countAdvocates,
  groups,
}: {
  countAdvocates: number
  groups: Awaited<ReturnType<typeof organizePeople>>
}) {
  return (
    <LocationRaces countAdvocates={countAdvocates} countryCode={countryCode}>
      <LocationRaces.KeyRaces>
        <USKeyRaces groups={groups} />
      </LocationRaces.KeyRaces>
      <LocationRaces.VoterGuideInput countryCode={countryCode} />
      <LocationRaces.KeyRacesStates>
        <USKeyRacesStates />
      </LocationRaces.KeyRacesStates>
      <LocationRaces.PacFooter />
    </LocationRaces>
  )
}
